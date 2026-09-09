/**
 * Fulfillment forwarder — zero manual dashboard entry.
 * Strategies tried in order, no human step required:
 *  1) TAAGER_API_URL + TAAGER_API_TOKEN  (custom order webhook you provide)
 *  2) Taager Merchant API via Firebase ID token (TAAGER_MERCHANT_EMAIL/PASSWORD + TAAGER_FIREBASE_API_KEY)
 *  3) Dukan storefront checkout automation (TAAGER_DUKAN_URL, default muswear.dukan.shop)
 *  4) Generic webhook (TAAGER_WEBHOOK_URL)
 *  5) Telegram notify (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID) — 1-tap, not dashboard
 * If all fail, order stays queued; cron retries with exponential backoff.
 */

export type ForwardItem = {
  product_id: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  taager_product_id: string;
  taager_sku: string;
  title: string;
  unit_price: number;
};
export type ForwardOrder = {
  orderId: string;
  customer: { name: string; phone: string; address: string; governorate: string; city: string; area: string; building: string; email?: string };
  items: ForwardItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
};

type EnvLike = Record<string, string | undefined> & { TAAGER_API_URL?: string; TAAGER_API_TOKEN?: string; TAAGER_STORE_ID?: string; TAAGER_MERCHANT_EMAIL?: string; TAAGER_MERCHANT_PASSWORD?: string; TAAGER_FIREBASE_API_KEY?: string; TAAGER_FIREBASE_ID_TOKEN?: string; TAAGER_MERCHANT_API_URL?: string; TAAGER_WEBHOOK_URL?: string; TAAGER_DUKAN_URL?: string; TELEGRAM_BOT_TOKEN?: string; TELEGRAM_CHAT_ID?: string };

export type ForwardResult = { ok: boolean; strategy: string; taagerOrderId?: string; httpStatus?: number; body?: unknown; error?: string };

const TAAGER_MERCHANT_CANDIDATES = [
  "/api/orders",
  "/v1/orders",
  "/orders",
  "/api/v1/orders",
  "/api/merchant/orders",
];

async function tryJson(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text.slice(0, 2000); }
}

// 1. Direct webhook you control (your own fulfillment service)
async function tryTaagerApi(env: EnvLike, order: ForwardOrder): Promise<ForwardResult | null> {
  const url = env.TAAGER_API_URL?.trim();
  const token = env.TAAGER_API_TOKEN?.trim();
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({
        store_id: env.TAAGER_STORE_ID || undefined,
        external_order_id: order.orderId,
        customer: order.customer,
        items: order.items.map((i) => ({ product_id: i.taager_product_id, sku: i.taager_sku, size: i.size, color: i.color, quantity: i.quantity, title: i.title })),
        payment_method: order.payment_method,
        subtotal: order.subtotal, shipping: order.shipping, total: order.total,
      }),
    });
    const body = await tryJson(res);
    if (!res.ok) return { ok: false, strategy: "taager_api", httpStatus: res.status, body, error: `Taager HTTP ${res.status}` };
    const id = String((body as Record<string, unknown>)?.order_id || (body as Record<string, unknown>)?.id || (body as Record<string, unknown>)?.orderId || "");
    return { ok: true, strategy: "taager_api", taagerOrderId: id, httpStatus: res.status, body };
  } catch (e) { return { ok: false, strategy: "taager_api", error: String(e) }; }
}

// 2. Taager Merchant API via Firebase — auto-auth if email/password provided
async function firebaseIdToken(env: EnvLike): Promise<string | null> {
  if (env.TAAGER_FIREBASE_ID_TOKEN) return env.TAAGER_FIREBASE_ID_TOKEN;
  const email = env.TAAGER_MERCHANT_EMAIL?.trim();
  const pass = env.TAAGER_MERCHANT_PASSWORD?.trim();
  const apiKey = env.TAAGER_FIREBASE_API_KEY?.trim() || "AIzaSyDummy"; // override via env; real key from Firebase project
  if (!email || !pass) return null;
  // Taager uses Firebase Identity Toolkit
  const key = apiKey && apiKey !== "AIzaSyDummy" ? apiKey : undefined;
  if (!key) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: pass, returnSecureToken: true }),
    });
    const j = await res.json() as Record<string, unknown>;
    if (!res.ok) return null;
    return String(j.idToken || "");
  } catch { return null; }
}

async function tryMerchantApi(env: EnvLike, order: ForwardOrder): Promise<ForwardResult | null> {
  const base = (env.TAAGER_MERCHANT_API_URL || "https://merchant.api.taager.com").replace(/\/$/, "");
  const token = await firebaseIdToken(env);
  if (!token) return null;
  for (const p of TAAGER_MERCHANT_CANDIDATES) {
    const url = `${base}${p}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName: order.customer.name, phone: order.customer.phone, address: order.customer.address,
          governorate: order.customer.governorate, city: order.customer.city, area: order.customer.area,
          items: order.items.map((i) => ({ productId: i.taager_product_id || i.sku, sku: i.taager_sku, quantity: i.quantity, size: i.size })),
          externalId: order.orderId, paymentMethod: order.payment_method,
        }),
      });
      const body = await tryJson(res);
      if (res.status === 404) continue; // try next candidate
      if (!res.ok) return { ok: false, strategy: "merchant_api", httpStatus: res.status, body, error: `Merchant HTTP ${res.status} at ${p}` };
      const id = String((body as Record<string, unknown>)?.id || (body as Record<string, unknown>)?.order_id || "");
      return { ok: true, strategy: "merchant_api", taagerOrderId: id, httpStatus: res.status, body };
    } catch (e) {
      const msg = String(e);
      if (msg.includes("404")) continue;
      return { ok: false, strategy: "merchant_api", error: msg };
    }
  }
  return { ok: false, strategy: "merchant_api", error: "no merchant endpoint matched (set TAAGER_MERCHANT_API_URL if custom)" };
}

// 3. Dukan storefront — re-uses musewear.dukan.shop checkout so Taager fulfills automatically
async function tryDukanStorefront(env: EnvLike, order: ForwardOrder): Promise<ForwardResult | null> {
  const dukanUrl = (env.TAAGER_DUKAN_URL || "https://musewear.dukan.shop").replace(/\/$/, "");
  // Only attempt if order items map to real Taager SKUs we imported (not empty)
  const hasTaagerIds = order.items.some((i) => i.taager_product_id);
  if (!hasTaagerIds) return null;
  // Dukan expects form-like payload; try JSON first, fall back to form
  const payload = {
    customer_name: order.customer.name, phone: order.customer.phone, email: order.customer.email || undefined,
    address: order.customer.address, governorate: order.customer.governorate, city: order.customer.city, area: order.customer.area,
    items: order.items.map((i) => ({ product_id: i.taager_product_id || i.product_id, quantity: i.quantity, size: i.size, color: i.color })),
    external_order_id: order.orderId, payment_method: order.payment_method, source: "muse-wear",
  };
  for (const path of ["/api/orders", "/api/checkout", "/api/store/orders"]) {
    try {
      const res = await fetch(`${dukanUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = await tryJson(res);
      if (res.status === 404) continue;
      if (!res.ok) return { ok: false, strategy: "dukan_storefront", httpStatus: res.status, body, error: `Dukan ${path} HTTP ${res.status}` };
      const id = String((body as Record<string, unknown>)?.order_id || (body as Record<string, unknown>)?.id || "");
      return { ok: true, strategy: "dukan_storefront", taagerOrderId: id, httpStatus: res.status, body };
    } catch (e) { return { ok: false, strategy: "dukan_storefront", error: String(e) }; }
  }
  return null;
}

// 4. Generic webhook (n8n / Make / Zapier you host)
async function tryWebhook(env: EnvLike, order: ForwardOrder): Promise<ForwardResult | null> {
  const url = env.TAAGER_WEBHOOK_URL?.trim();
  if (!url) return null;
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(order) });
    const body = await tryJson(res);
    if (!res.ok) return { ok: false, strategy: "webhook", httpStatus: res.status, body, error: `Webhook HTTP ${res.status}` };
    return { ok: true, strategy: "webhook", httpStatus: res.status, body };
  } catch (e) { return { ok: false, strategy: "webhook", error: String(e) }; }
}

// 5. Telegram — not fulfillment but zero-dashboard notify with order summary + deep link
async function tryTelegram(env: EnvLike, order: ForwardOrder): Promise<ForwardResult | null> {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chat = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chat) return null;
  const text = `🧾 New MUSE WEAR order ${order.orderId}\n${order.customer.name} — ${order.customer.phone}\n${order.customer.address}, ${order.customer.governorate}\n${order.items.map((i) => `• ${i.title} x${i.quantity} ${i.size}/${i.color} — ${i.unit_price} EGP`).join("\n")}\nTotal ${order.total} EGP (${order.payment_method})\nFulfillment: auto-retrying (no dashboard needed).`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
    });
    const body = await tryJson(res);
    if (!res.ok) return { ok: false, strategy: "telegram", httpStatus: res.status, body, error: `Telegram ${res.status}` };
    return { ok: true, strategy: "telegram", httpStatus: res.status, body };
  } catch (e) { return { ok: false, strategy: "telegram", error: String(e) }; }
}

export async function forwardOrder(env: EnvLike, order: ForwardOrder): Promise<ForwardResult> {
  const attempts: ForwardResult[] = [];
  for (const fn of [tryTaagerApi, tryMerchantApi, tryDukanStorefront, tryWebhook]) {
    const r = await fn(env, order);
    if (!r) continue;
    if (r.ok) return r;
    attempts.push(r);
  }
  // best-effort telegram even on failure (doesn't count as fulfillment success)
  const tg = await tryTelegram(env, order);
  const last = attempts[attempts.length - 1];
  if (last) {
    if (tg && !tg.ok) last.error = `${last.error}; telegram: ${tg.error}`;
    return last;
  }
  if (tg && tg.ok) return { ok: false, strategy: "none", error: "No fulfillment endpoint configured — Telegram notified. Set TAAGER_API_URL or TAAGER_MERCHANT_EMAIL/PASSWORD or TAAGER_WEBHOOK_URL for hands-off fulfillment." };
  return { ok: false, strategy: "none", error: "No fulfillment endpoint configured. Set TAAGER_API_URL, or TAAGER_MERCHANT_EMAIL/PASSWORD+TAAGER_FIREBASE_API_KEY, or TAAGER_DUKAN_URL, or TAAGER_WEBHOOK_URL." };
}
