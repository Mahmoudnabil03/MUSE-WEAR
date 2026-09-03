interface Env { DB: D1Database; META_CAPI_TOKEN?: string; META_PIXEL_ID?: string; FB_CAPI_TOKEN?: string; META_CONVERSIONS_API_TOKEN?: string }
interface D1Database { prepare(sql: string): D1PreparedStatement }
interface D1PreparedStatement { bind(...values: unknown[]): D1PreparedStatement; first<T = unknown>(): Promise<T | null>; all<T = unknown>(): Promise<{ results: T[] }>; run(): Promise<unknown> }
interface PagesContext { request: Request; env: Env; params: Record<string, string | string[] | undefined> }
interface AppUser { id: string; email: string; full_name: string; role: "customer" | "employee" | "admin"; created_at: string }

const json = (data: unknown, status = 200, extraHeaders: Record<string, string> = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...extraHeaders } });
const id = () => crypto.randomUUID();
const cookie = (name: string, value: string, maxAge: number) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const parseCookies = (request: Request) => Object.fromEntries((request.headers.get("cookie") || "").split(";").map((part) => part.trim().split("=")).filter(([key, value]) => key && value));

function b64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function unb64(value: string) { return Uint8Array.from(atob(value), (char) => char.charCodeAt(0)); }
function buffer(bytes: Uint8Array) { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer; }
async function hash(password: string) { const salt = crypto.getRandomValues(new Uint8Array(16)); const key = await crypto.subtle.importKey("raw", buffer(new TextEncoder().encode(password)), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: buffer(salt), iterations: 100000, hash: "SHA-256" }, key, 256); return `pbkdf2_sha256$100000$${b64(salt)}$${b64(new Uint8Array(bits))}`; }
async function verify(password: string, stored: string) { const [scheme, count, salt, expected] = stored.split("$"); if (scheme !== "pbkdf2_sha256" || !count || !salt || !expected) return false; const key = await crypto.subtle.importKey("raw", buffer(new TextEncoder().encode(password)), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: buffer(unb64(salt)), iterations: Number(count), hash: "SHA-256" }, key, 256); return b64(new Uint8Array(bits)) === expected; }
async function user(request: Request, env: Env) { const session = parseCookies(request).muse_session; if (!session) return null; return env.DB.prepare("SELECT u.id, u.email, u.full_name, u.role, u.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at > datetime('now')").bind(session).first<AppUser>(); }
async function body(request: Request) { try { return await request.json() as Record<string, unknown>; } catch { return {}; } }
function product(row: Record<string, unknown>) { const list = (key: string) => { try { return JSON.parse(String(row[key] || "[]")); } catch { return []; } }; const images = list("images"); return { id: row.id, nameEn: row.title, nameAr: row.title, brand: row.brand, category: row.category_slug, subcategory: row.category_name, price: Number(row.sale_price ?? row.price), originalPrice: row.sale_price == null ? undefined : Number(row.price), image: images[0] || "/mw-mark.svg", images, colors: list("colors"), sizes: list("sizes"), isNew: Boolean(row.is_new), isMuseMade: Boolean(row.is_muse_made), stockQty: Number(row.stock_qty), sku: row.sku }; }

// Static fallback catalog (mirrors src/lib/products.ts) for when D1 is empty / cold-start
const FALLBACK_PRODUCTS = [
  { id: "mw-001", nameEn: "MUSE Oversized Heavy Tee - Black", brand: "MUSE WEAR", category: "men", subcategory: "T-Shirts", price: 899, originalPrice: 1199, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "mw-002", nameEn: "MUSE Tailored Cargo Pants", brand: "MUSE WEAR", category: "men", subcategory: "Pants", price: 1499, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "mw-003", nameEn: "Satin Wrap Dress - Emerald", brand: "MUSE WEAR", category: "women", subcategory: "Dresses", price: 1899, originalPrice: 2499, image: "https://images.unsplash.com/photo-1515372039744-f1fd71e2d06a?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1515372039744-f1fd71e2d06a?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "mw-004", nameEn: "Cropped Bomber Jacket", brand: "MUSE WEAR", category: "women", subcategory: "Jackets", price: 2199, image: "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "br-001", nameEn: "Nike Air Max 270 - White/Black", brand: "Nike", category: "men", subcategory: "Shoes", price: 4299, originalPrice: 5499, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "br-002", nameEn: "Adidas Originals Hoodie", brand: "Adidas", category: "women", subcategory: "Hoodies", price: 1799, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "acc-001", nameEn: "MUSE Leather Crossbody Bag", brand: "MUSE WEAR", category: "accessories", subcategory: "Bags", price: 1299, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "acc-002", nameEn: "Chunky Gold Hoops Set", brand: "MUSE WEAR", category: "accessories", subcategory: "Jewelry", price: 499, originalPrice: 699, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "br-003", nameEn: "Puma RS-X - Multicolor", brand: "Puma", category: "men", subcategory: "Shoes", price: 3599, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "mw-005", nameEn: "MUSE Linen Co-ord Set - Sand", brand: "MUSE WEAR", category: "women", subcategory: "Co-ords", price: 2499, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "acc-003", nameEn: "Unisex Cap - MW Embroidery", brand: "MUSE WEAR", category: "accessories", subcategory: "Caps", price: 399, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
  { id: "br-004", nameEn: "Levi's 501 Straight Jeans", brand: "Levi's", category: "men", subcategory: "Jeans", price: 1999, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60", images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60"], availability: "in stock" },
] as const;

function csvEscape(v: string): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function toCatalogRows(items: Array<Record<string, unknown>>, origin: string) {
  return items.map((p) => {
    const id = String(p.id);
    const title = String(p.nameEn || p.title || id);
    const priceNum = Number(p.price || 0);
    const origNum = p.originalPrice != null ? Number(p.originalPrice) : undefined;
    const price = `${priceNum.toFixed(2)} EGP`;
    const sale_price = origNum && origNum > priceNum ? `${priceNum.toFixed(2)} EGP` : "";
    const orig_price = origNum && origNum > priceNum ? `${origNum.toFixed(2)} EGP` : price;
    return {
      id,
      title,
      description: `${title} - ${String(p.brand || "MUSE WEAR")} ${String(p.subcategory || p.category || "")}. Ships across Egypt, 14-day returns.`,
      availability: String(p.availability || (Number(p.stockQty) === 0 ? "out of stock" : "in stock")),
      condition: "new",
      price: sale_price ? orig_price : price,
      sale_price: sale_price || "",
      link: `${origin}/product/${id}`,
      image_link: String(p.image || p.image_link || ""),
      additional_image_link: Array.isArray(p.images) ? (p.images as string[]).slice(1).join(",") : "",
      brand: String(p.brand || "MUSE WEAR"),
      product_type: `${String(p.category || "")} > ${String(p.subcategory || "")}`,
      inventory: String(p.stockQty ?? 100),
    };
  });
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const onRequest = async ({ request, env, params }: PagesContext) => {
  const path = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");
  // --- Meta Catalog Feed (public, for Commerce Manager to pull) ---
  // Supports: /api/catalog/feed, /api/catalog.csv, /api/feed, /api/meta/catalog, /api/meta/catalog.csv
  if (["catalog/feed", "catalog.csv", "feed", "feed.csv", "meta/catalog", "meta/catalog.csv", "catalog"].includes(path) && request.method === "GET") {
    const url = new URL(request.url);
    const format = (url.searchParams.get("format") || "").toLowerCase();
    const origin = url.origin; // https://muse-wear.pages.dev
    let items: Array<Record<string, unknown>> = [];
    try {
      const rows = await env.DB.prepare("SELECT p.*, c.name category_name, c.slug category_slug FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.is_active=1 ORDER BY p.created_at DESC").all<Record<string, unknown>>();
      if (rows.results.length) items = rows.results.map(product) as unknown as Array<Record<string, unknown>>;
    } catch {}
    if (!items.length) items = FALLBACK_PRODUCTS as unknown as Array<Record<string, unknown>>;
    const rows = toCatalogRows(items, origin);
    if (format === "json") {
      return new Response(JSON.stringify({ products: rows }, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600", "access-control-allow-origin": "*" } });
    }
    // CSV for Meta Catalog (RFC4180)
    const headers = ["id","title","description","availability","condition","price","sale_price","link","image_link","additional_image_link","brand","product_type","inventory"];
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => csvEscape(String((r as Record<string,string>)[h] || ""))).join(","))].join("\n");
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "public, max-age=3600", "access-control-allow-origin": "*", "content-disposition": `inline; filename="muse-wear-catalog.csv"` } });
  }
  // --- Meta Conversions API (server-side, token never exposed to browser) ---
  if (path === "meta/capi" && request.method === "POST") {
    const capiToken = (env as Record<string, string | undefined>).META_CAPI_TOKEN || (env as Record<string, string | undefined>).META_CONVERSIONS_API_TOKEN || (env as Record<string, string | undefined>).FB_CAPI_TOKEN;
    if (!capiToken) return json({ error: "Conversions API token not configured. Set META_CAPI_TOKEN in Cloudflare Pages env." }, 503);
    const pixelId = (env as Record<string, string | undefined>).META_PIXEL_ID || "1407537767984552";
    const data = await body(request);
    const eventName = String((data.eventName as string) || (data.event_name as string) || "").trim();
    if (!eventName) return json({ error: "eventName required" }, 400);
    const eventId = String((data.eventId as string) || (data.event_id as string) || crypto.randomUUID());
    const eventTime = Number((data.eventTime as number) || (data.event_time as number) || Math.floor(Date.now() / 1000));
    const eventSourceUrl = String((data.eventSourceUrl as string) || (data.event_source_url as string) || request.headers.get("referer") || request.headers.get("origin") || "");
    const customData = (data.customData as Record<string, unknown>) || (data.custom_data as Record<string, unknown>) || {};
    const rawUserData = (data.userData as Record<string, unknown>) || (data.user_data as Record<string, unknown>) || {};
    const cookies = parseCookies(request);
    const clientIp = request.headers.get("cf-connecting-ip") || (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const clientUa = request.headers.get("user-agent") || "";
    const fbc = String((rawUserData.fbc as string) || cookies._fbc || "");
    const fbp = String((rawUserData.fbp as string) || cookies._fbp || "");
    const userData: Record<string, unknown> = {};
    if (clientIp) userData.client_ip_address = clientIp;
    if (clientUa) userData.client_user_agent = clientUa;
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;
    // Hash PII if provided (em, ph) — never send raw
    const emRaw = (rawUserData.em as string) || (rawUserData.email as string) || "";
    if (emRaw) userData.em = [await sha256Hex(emRaw)];
    const phRaw = String((rawUserData.ph as string) || (rawUserData.phone as string) || "").replace(/\D/g, "");
    if (phRaw) userData.ph = [await sha256Hex(phRaw)];
    const externalId = String((rawUserData.external_id as string) || "");
    if (externalId) userData.external_id = [await sha256Hex(externalId)];
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          event_source_url: eventSourceUrl || undefined,
          action_source: "website",
          user_data: userData,
          custom_data: Object.keys(customData).length ? customData : undefined,
        },
      ],
      ...(typeof data.testEventCode === "string" && data.testEventCode ? { test_event_code: data.testEventCode } : {}),
      ...(typeof data.test_event_code === "string" && data.test_event_code ? { test_event_code: data.test_event_code } : {}),
    };
    try {
      const fbRes = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${encodeURIComponent(capiToken)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const fbJson = await fbRes.json().catch(() => ({}));
      if (!fbRes.ok) return json({ error: "Meta API error", details: fbJson }, fbRes.status);
      return json({ ok: true, meta: fbJson });
    } catch (e) {
      return json({ error: "Failed to forward to Meta", details: String(e) }, 502);
    }
  }
  if (path === "meta/capi" && request.method === "GET") return json({ ok: true, hint: "POST {eventName, customData} to this endpoint. Server holds META_CAPI_TOKEN." });
  if (path === "auth/me" && request.method === "GET") return json({ user: await user(request, env) });
  if (path === "auth/logout" && request.method === "POST") { const session = parseCookies(request).muse_session; if (session) await env.DB.prepare("DELETE FROM sessions WHERE id=?").bind(session).run(); return new Response(null, { status: 204, headers: { "set-cookie": cookie("muse_session", "", 0) } }); }
  if (path === "auth/signup" && request.method === "POST") { const data = await body(request); const email = String(data.email || "").trim().toLowerCase(); const name = String(data.fullName || "").trim(); const password = String(data.password || ""); if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return json({ error: "Enter a name, valid email, and password with 8+ characters, a capital letter, and a number." }, 400); const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first<{ id: string }>(); if (existing) return json({ error: "Email already registered." }, 409); try { const uid = id(); await env.DB.prepare("INSERT INTO users (id,email,password_hash,full_name) VALUES (?,?,?,?)").bind(uid, email, await hash(password), name).run(); const sid = id(); await env.DB.prepare("INSERT INTO sessions (id,user_id,expires_at) VALUES (?, ?, datetime('now','+30 days'))").bind(sid, uid).run(); return json({ user: { id: uid, email, full_name: name, role: "customer" } }, 201, { "set-cookie": cookie("muse_session", sid, 2592000) }); } catch (error) { console.error("signup failed", String(error)); return json({ error: "Unable to create account right now." }, 500); } }
  if (path === "auth/login" && request.method === "POST") { const data = await body(request); const found = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(String(data.email || "").trim().toLowerCase()).first<Record<string, unknown>>(); let valid = false; try { valid = Boolean(found && await verify(String(data.password || ""), String(found.password_hash))); } catch { valid = false; } if (!valid) return json({ error: "Invalid email or password." }, 401); const sid = id(); await env.DB.prepare("INSERT INTO sessions (id,user_id,expires_at) VALUES (?, ?, datetime('now','+30 days'))").bind(sid, found!.id).run(); await env.DB.prepare("UPDATE users SET last_login_at=datetime('now') WHERE id=?").bind(found!.id).run(); return json({ user: { id: found!.id, email: found!.email, full_name: found!.full_name, role: found!.role, created_at: found!.created_at } }, 200, { "set-cookie": cookie("muse_session", sid, 2592000) }); }
  if (path === "products" && request.method === "GET") { const rows = await env.DB.prepare("SELECT p.*, c.name category_name, c.slug category_slug FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.is_active=1 ORDER BY p.created_at DESC").all<Record<string, unknown>>(); return json({ products: rows.results.map(product) }); }
  if (path === "products" && ["POST", "PUT", "DELETE"].includes(request.method)) { const current = await user(request, env); if (!current || current.role !== "admin") return json({ error: "Admin access required." }, 403); const data = await body(request); if (request.method === "POST") { const productId = id(); await env.DB.prepare("INSERT INTO products (id,title,description,brand,category_id,price,sale_price,sku,stock_qty,images,colors,sizes,is_new,is_muse_made) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(productId, data.title, data.description || "", data.brand, data.categoryId || null, data.price, data.salePrice || null, data.sku, data.stockQty || 0, JSON.stringify(data.images || []), JSON.stringify(data.colors || []), JSON.stringify(data.sizes || []), data.isNew ? 1 : 0, data.isMuseMade ? 1 : 0).run(); return json({ id: productId }, 201); } const productId = String(data.id || ""); if (request.method === "DELETE") await env.DB.prepare("UPDATE products SET is_active=0, updated_at=datetime('now') WHERE id=?").bind(productId).run(); else await env.DB.prepare("UPDATE products SET title=?,description=?,brand=?,price=?,sale_price=?,sku=?,stock_qty=?,images=?,updated_at=datetime('now') WHERE id=?").bind(data.title, data.description || "", data.brand, data.price, data.salePrice || null, data.sku, data.stockQty || 0, JSON.stringify(data.images || []), productId).run(); return json({ ok: true }); }
  // --- Shipping zones (public) ---
  if (path === "shipping" && request.method === "GET") {
    try {
      const rows = await env.DB.prepare("SELECT * FROM shipping_zones WHERE active=1 ORDER BY governorate").all();
      if (rows.results.length) return json({ zones: rows.results });
    } catch {}
    // Fallback if table not migrated yet
    return json({ zones: [
      { governorate: "Cairo", price: 59, free_threshold: 999, delivery_days: "1-2 days" },
      { governorate: "Alexandria", price: 59, free_threshold: 999, delivery_days: "1-2 days" },
      { governorate: "Giza", price: 59, free_threshold: 999, delivery_days: "1-2 days" },
      { governorate: "Other", price: 75, free_threshold: 1499, delivery_days: "2-4 days" },
    ]});
  }
  // --- Discount validation ---
  if (path === "discounts/validate" && request.method === "POST") {
    const data = await body(request);
    const code = String(data.code || "").trim().toUpperCase();
    const subtotal = Number(data.subtotal || 0);
    if (!code) return json({ valid: false, error: "Enter code" }, 400);
    try {
      const disc = await env.DB.prepare("SELECT * FROM discounts WHERE code=? AND active=1").bind(code).first<Record<string, unknown>>();
      if (!disc) return json({ valid: false, error: "Invalid code" });
      if (disc.ends_at && new Date(String(disc.ends_at)) < new Date()) return json({ valid: false, error: "Expired" });
      if (disc.starts_at && new Date(String(disc.starts_at)) > new Date()) return json({ valid: false, error: "Not yet active" });
      if (disc.usage_limit && Number(disc.used_count) >= Number(disc.usage_limit)) return json({ valid: false, error: "Usage limit reached" });
      if (subtotal < Number(disc.min_order || 0)) return json({ valid: false, error: `Min order ${disc.min_order} EGP` });
      let amount = 0;
      if (disc.type === "percent") amount = Math.min(Math.round(subtotal * Number(disc.value) / 100), Number(disc.max_discount || 999999));
      else if (disc.type === "fixed") amount = Number(disc.value);
      else if (disc.type === "free_shipping") amount = 0;
      return json({ valid: true, discount: { code: disc.code, type: disc.type, value: disc.value, amount, free_shipping: disc.type === "free_shipping" } });
    } catch { return json({ valid: false, error: "Invalid code" }); }
  }
  // --- Orders ---
  if (path === "orders" && request.method === "POST") {
    const data = await body(request);
    const items = Array.isArray(data.items) ? data.items as Array<Record<string, unknown>> : [];
    const customer_name = String(data.customer_name || data.name || "").trim();
    const phone = String(data.phone || "").trim().replace(/\s/g,"");
    const email = String(data.email || "").trim();
    const address = String(data.address || "").trim();
    const governorate = String(data.governorate || "Cairo").trim();
    const city = String(data.city || "").trim();
    const area = String(data.area || "").trim();
    const building = String(data.building || "").trim();
    const payment_method = String(data.payment_method || data.method || "cod").toLowerCase();
    const coupon_code = String(data.coupon_code || data.coupon || "").trim().toUpperCase() || null;
    if (!customer_name || !phone || !address) return json({ error: "Name, phone, address required" }, 400);
    if (!/^01[0-2,5][0-9]{8}$/.test(phone)) return json({ error: "Invalid Egyptian phone" }, 400);
    if (!items.length) return json({ error: "Cart empty" }, 400);
    if (!["cod","paymob"].includes(payment_method)) return json({ error: "Invalid payment method" }, 400);
    // Revalidate products/prices & stock
    let subtotal = 0;
    const orderItems: Array<{ product_id: string; title: string; sku: string; size: string; qty: number; unit_price: number }> = [];
    for (const it of items) {
      const pid = String(it.product_id || it.id || "");
      const qty = Math.max(1, Number(it.qty || it.quantity || 1));
      const size = String(it.size || "");
      // Try DB first, fallback to FALLBACK_PRODUCTS
      let prod: Record<string, unknown> | null = null;
      try {
        const row = await env.DB.prepare("SELECT p.*, c.name category_name, c.slug category_slug FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=? AND p.is_active=1").bind(pid).first<Record<string, unknown>>();
        if (row) prod = product(row) as unknown as Record<string, unknown>;
      } catch {}
      if (!prod) {
        const fb = (FALLBACK_PRODUCTS as unknown as Array<Record<string, unknown>>).find((p) => String(p.id) === pid);
        if (fb) prod = { ...fb, price: Number(fb.price), stockQty: 100 } as Record<string, unknown>;
      }
      if (!prod) return json({ error: `Product ${pid} not found` }, 400);
      const stock = Number((prod.stockQty as number) ?? 100);
      if (stock < qty) return json({ error: `${prod.nameEn || prod.title} only ${stock} left` }, 400);
      const unit = Number(prod.price);
      subtotal += unit * qty;
      orderItems.push({ product_id: pid, title: String(prod.nameEn || prod.title), sku: String(prod.sku || pid), size, qty, unit_price: unit });
    }
    // Shipping
    let shipping = 59;
    let freeThreshold = 999;
    try {
      const zone = await env.DB.prepare("SELECT * FROM shipping_zones WHERE governorate=? AND active=1").bind(governorate).first<Record<string, unknown>>();
      if (zone) { shipping = Number(zone.price); freeThreshold = Number(zone.free_threshold); }
      else {
        const other = await env.DB.prepare("SELECT * FROM shipping_zones WHERE governorate='Other' AND active=1").bind().first<Record<string, unknown>>();
        if (other) { shipping = Number(other.price); freeThreshold = Number(other.free_threshold); }
      }
    } catch {}
    if (subtotal >= freeThreshold) shipping = 0;
    // Discount
    let discount = 0;
    let freeShipping = false;
    if (coupon_code) {
      try {
        const disc = await env.DB.prepare("SELECT * FROM discounts WHERE code=? AND active=1").bind(coupon_code).first<Record<string, unknown>>();
        if (disc) {
          if (subtotal >= Number(disc.min_order || 0)) {
            if (disc.type === "percent") discount = Math.min(Math.round(subtotal * Number(disc.value)/100), Number(disc.max_discount || 999999));
            else if (disc.type === "fixed") discount = Number(disc.value);
            else if (disc.type === "free_shipping") freeShipping = true;
          }
        }
      } catch {}
      if (freeShipping) shipping = 0;
    }
    const total = Math.max(0, subtotal + shipping - discount);
    const currentUser = await user(request, env);
    const orderId = `MW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    try {
      await env.DB.prepare("INSERT INTO orders (id, user_id, status, customer_name, email, phone, address, building, floor, apartment, area, city, governorate, payment_method, payment_status, subtotal, shipping, discount, total, coupon_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .bind(orderId, currentUser?.id || null, "pending", customer_name, email || null, phone, address, building || null, String(data.floor||"")||null, String(data.apartment||"")||null, area||null, city||null, governorate, payment_method, payment_method==="cod"?"pending":"pending", subtotal, shipping, discount, total, coupon_code).run();
      for (const oi of orderItems) {
        await env.DB.prepare("INSERT INTO order_items (id, order_id, product_id, title, sku, size, quantity, unit_price) VALUES (?,?,?,?,?,?,?,?)")
          .bind(id(), orderId, oi.product_id, oi.title, oi.sku, oi.size, oi.qty, oi.unit_price).run();
      }
      if (coupon_code && discount>0) {
        try { await env.DB.prepare("UPDATE discounts SET used_count = used_count + 1 WHERE code=?").bind(coupon_code).run(); } catch {}
      }
    } catch (e) {
      // If orders table not migrated yet (old schema without new cols), fallback to old schema
      try {
        await env.DB.prepare("INSERT INTO orders (id, user_id, status, customer_name, phone, address, governorate, payment_method, subtotal, shipping, total) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
          .bind(orderId, currentUser?.id || "guest", "pending", customer_name, phone, address, governorate, payment_method, subtotal, shipping, total).run();
        for (const oi of orderItems) {
          await env.DB.prepare("INSERT INTO order_items (id, order_id, product_id, title, sku, size, quantity, unit_price) VALUES (?,?,?,?,?,?,?,?)")
            .bind(id(), orderId, oi.product_id, oi.title, oi.sku, oi.size, oi.qty, oi.unit_price).run();
        }
      } catch (e2) { return json({ error: "Failed to create order", details: String(e2) }, 500); }
    }
    return json({ ok: true, orderId, subtotal, shipping, discount, total, payment_method }, 201);
  }
  if (path === "orders/track" && request.method === "GET") {
    const url = new URL(request.url);
    const orderId = String(url.searchParams.get("orderId") || url.searchParams.get("id") || "").trim();
    const phone = String(url.searchParams.get("phone") || "").trim();
    if (!orderId || !phone) return json({ error: "Order ID and phone required" }, 400);
    try {
      const order = await env.DB.prepare("SELECT * FROM orders WHERE id=? AND phone=?").bind(orderId, phone).first<Record<string, unknown>>();
      if (!order) return json({ error: "Order not found" }, 404);
      const items = await env.DB.prepare("SELECT * FROM order_items WHERE order_id=?").bind(orderId).all();
      return json({ order, items: items.results });
    } catch { return json({ error: "Lookup failed" }, 500); }
  }
  if (path.startsWith("orders/") && request.method === "GET") {
    const orderId = path.split("/")[1];
    if (orderId && orderId !== "track") {
      const current = await user(request, env);
      if (!current) return json({ error: "Login required" }, 401);
      try {
        const order = await env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(orderId).first<Record<string, unknown>>();
        if (!order) return json({ error: "Not found" }, 404);
        if (String(order.user_id) !== current.id && current.role !== "admin") return json({ error: "Forbidden" }, 403);
        const items = await env.DB.prepare("SELECT * FROM order_items WHERE order_id=?").bind(orderId).all();
        return json({ order, items: items.results });
      } catch { return json({ error: "Failed" }, 500); }
    }
  }
  // --- Reviews ---
  if (path === "reviews" && request.method === "GET") {
    const url = new URL(request.url);
    const pid = String(url.searchParams.get("productId") || url.searchParams.get("product_id") || "");
    if (!pid) return json({ reviews: [] });
    try {
      const rows = await env.DB.prepare("SELECT r.*, u.full_name as author FROM reviews r LEFT JOIN users u ON u.id=r.user_id WHERE r.product_id=? ORDER BY r.created_at DESC LIMIT 50").bind(pid).all();
      return json({ reviews: rows.results });
    } catch { return json({ reviews: [] }); }
  }
  if (path === "reviews" && request.method === "POST") {
    const current = await user(request, env);
    if (!current) return json({ error: "Login required" }, 401);
    const data = await body(request);
    const pid = String(data.product_id || data.productId || "");
    const rating = Number(data.rating || 0);
    const comment = String(data.comment || "").trim();
    if (!pid || rating < 1 || rating > 5) return json({ error: "Rating 1-5 required" }, 400);
    try {
      await env.DB.prepare("INSERT INTO reviews (id, product_id, user_id, rating, comment, size_purchased, fit_feedback, verified) VALUES (?,?,?,?,?,?,?,0)")
        .bind(id(), pid, current.id, rating, comment, String(data.size_purchased||""), String(data.fit_feedback||"")).run();
      return json({ ok: true }, 201);
    } catch { return json({ error: "Failed" }, 500); }
  }
  if (path === "timeclock" && request.method === "GET") { const current = await user(request, env); if (!current || current.role === "customer") return json({ error: "Employee access required." }, 403); const rows = await env.DB.prepare("SELECT * FROM timesheets WHERE user_id=? ORDER BY clock_in DESC LIMIT 30").bind(current.id).all(); return json({ entries: rows.results }); }
  if (path === "timeclock" && request.method === "POST") { const current = await user(request, env); if (!current || current.role === "customer") return json({ error: "Employee access required." }, 403); const open = await env.DB.prepare("SELECT id FROM timesheets WHERE user_id=? AND clock_out IS NULL").bind(current.id).first<{ id: string }>(); if (open) await env.DB.prepare("UPDATE timesheets SET clock_out=datetime('now') WHERE id=?").bind(open.id).run(); else await env.DB.prepare("INSERT INTO timesheets (id,user_id,clock_in) VALUES (?, ?, datetime('now'))").bind(id(), current.id).run(); return json({ ok: true }); }
  return json({ error: "Not found" }, 404);
};
