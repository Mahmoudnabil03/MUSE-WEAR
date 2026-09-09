import { forwardOrder } from "../../src/lib/server/fulfillment";
interface Env { DB: D1Database; META_CAPI_TOKEN?: string; META_PIXEL_ID?: string; FB_CAPI_TOKEN?: string; META_CONVERSIONS_API_TOKEN?: string; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string; TAAGER_API_URL?: string; TAAGER_API_TOKEN?: string; TAAGER_STORE_ID?: string; TAAGER_MERCHANT_EMAIL?: string; TAAGER_MERCHANT_PASSWORD?: string; TAAGER_FIREBASE_API_KEY?: string; TAAGER_FIREBASE_ID_TOKEN?: string; TAAGER_MERCHANT_API_URL?: string; TAAGER_WEBHOOK_URL?: string; TAAGER_DUKAN_URL?: string; TELEGRAM_BOT_TOKEN?: string; TELEGRAM_CHAT_ID?: string }
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
function product(row: Record<string, unknown>) { const list = (key: string) => { try { return JSON.parse(String(row[key] || "[]")); } catch { return []; } }; const images = list("images"); const variants = list("variants"); return { id: row.id, nameEn: row.title, nameAr: row.title, brand: row.brand, category: row.category_slug, subcategory: row.category_name, price: Number(row.sale_price ?? row.price), originalPrice: row.sale_price == null ? undefined : Number(row.price), image: images[0] || "/mw-mark.svg", images, colors: list("colors"), sizes: list("sizes"), variants, isNew: Boolean(row.is_new), isMuseMade: Boolean(row.is_muse_made), stockQty: Number(row.stock_qty), sku: row.sku }; }

// Demo data removed — Taager import will populate D1. Empty fallback ensures no demo products leak to storefront or catalog.
const FALLBACK_PRODUCTS: readonly unknown[] = [] as const;

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
  // --- Google OAuth (GSI ID token verification) ---
  if (path === "auth/google" && request.method === "POST") {
    const GOOGLE_CLIENT_ID = (env as Record<string, string | undefined>).GOOGLE_CLIENT_ID || (env as Record<string, string | undefined>).NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) return json({ error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID in Cloudflare env." }, 503);
    const data = await body(request);
    const id_token = String(data.id_token || data.credential || "").trim();
    if (!id_token) return json({ error: "Missing Google credential" }, 400);
    // Verify via Google tokeninfo (works on Workers, no deps)
    let payload: Record<string, unknown>;
    try {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`);
      const verifyJson = await verifyRes.json() as Record<string, unknown>;
      if (!verifyRes.ok || verifyJson.aud !== GOOGLE_CLIENT_ID) return json({ error: "Invalid Google token", details: verifyJson }, 401);
      if (String(verifyJson.email_verified) !== "true" && verifyJson.email_verified !== true) return json({ error: "Google email not verified" }, 401);
      payload = verifyJson;
    } catch (e) { return json({ error: "Google verification failed", details: String(e) }, 502); }
    const email = String(payload.email || "").trim().toLowerCase();
    const googleSub = String(payload.sub || "");
    const fullName = String(payload.name || payload.given_name || email.split("@")[0] || "MUSE User");
    const avatar = String(payload.picture || "");
    if (!email || !googleSub) return json({ error: "Invalid Google payload" }, 401);
    // Find or create user
    let dbUser = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first<Record<string, unknown>>();
    let userId: string;
    if (dbUser) {
      userId = String(dbUser.id);
      // link google_id if missing
      try { await env.DB.prepare("UPDATE users SET google_id=?, avatar_url=?, last_login_at=datetime('now') WHERE id=?").bind(googleSub, avatar || dbUser.avatar_url || null, userId).run(); } catch {}
      dbUser = await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(userId).first<Record<string, unknown>>();
    } else {
      userId = id();
      try {
        await env.DB.prepare("INSERT INTO users (id, email, password_hash, full_name, google_id, avatar_url, role) VALUES (?,?,?,?,?,?,?)")
          .bind(userId, email, "google_oauth", fullName, googleSub, avatar || null, "customer").run();
        dbUser = await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(userId).first<Record<string, unknown>>();
      } catch (e) {
        // Fallback if google_id column not migrated yet
        try {
          await env.DB.prepare("INSERT INTO users (id, email, password_hash, full_name) VALUES (?,?,?,?)")
            .bind(userId, email, "google_oauth", fullName).run();
          dbUser = await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(userId).first<Record<string, unknown>>();
        } catch (e2) { return json({ error: "Failed to create user", details: String(e2) }, 500); }
      }
    }
    const sid = id();
    await env.DB.prepare("INSERT INTO sessions (id,user_id,expires_at) VALUES (?, ?, datetime('now','+30 days'))").bind(sid, userId).run();
    try { await env.DB.prepare("UPDATE users SET last_login_at=datetime('now') WHERE id=?").bind(userId).run(); } catch {}
    return json({ user: { id: userId, email: String(dbUser?.email || email), full_name: String(dbUser?.full_name || fullName), role: String(dbUser?.role || "customer"), created_at: String(dbUser?.created_at || new Date().toISOString()) } }, 200, { "set-cookie": cookie("muse_session", sid, 2592000) });
  }
  if (path === "auth/google" && request.method === "GET") {
    const clientId = (env as Record<string, string | undefined>).GOOGLE_CLIENT_ID || (env as Record<string, string | undefined>).NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    return json({ configured: !!clientId, clientId: clientId ? clientId.slice(0,12)+"..." : null });
  }
  if (path === "products" && request.method === "GET") { const rows = await env.DB.prepare("SELECT p.*, c.name category_name, c.slug category_slug FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.is_active=1 ORDER BY p.created_at DESC").all<Record<string, unknown>>(); return json({ products: rows.results.map(product) }); }
  if (path === "products" && ["POST", "PUT", "DELETE"].includes(request.method)) { const current = await user(request, env); if (!current || current.role !== "admin") return json({ error: "Admin access required." }, 403); const data = await body(request); if (request.method === "POST") { const productId = id(); await env.DB.prepare("INSERT INTO products (id,title,description,brand,category_id,price,sale_price,sku,stock_qty,images,colors,sizes,is_new,is_muse_made) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(productId, data.title, data.description || "", data.brand, data.categoryId || null, data.price, data.salePrice || null, data.sku, data.stockQty || 0, JSON.stringify(data.images || []), JSON.stringify(data.colors || []), JSON.stringify(data.sizes || []), data.isNew ? 1 : 0, data.isMuseMade ? 1 : 0).run(); return json({ id: productId }, 201); } const productId = String(data.id || ""); if (request.method === "DELETE") await env.DB.prepare("UPDATE products SET is_active=0, updated_at=datetime('now') WHERE id=?").bind(productId).run(); else await env.DB.prepare("UPDATE products SET title=?,description=?,brand=?,price=?,sale_price=?,sku=?,stock_qty=?,images=?,updated_at=datetime('now') WHERE id=?").bind(data.title, data.description || "", data.brand, data.price, data.salePrice || null, data.sku, data.stockQty || 0, JSON.stringify(data.images || []), productId).run(); return json({ ok: true }); }
  // --- Taager Import (admin only, handles dedup + 50% margin + MUSE exclusion) ---
  if ((path === "taager/preview" || path === "taager/import") && request.method === "POST") {
    const current = await user(request, env);
    if (!current || current.role !== "admin") return json({ error: "Admin access required." }, 403);
    const data = await body(request);
    const incoming = Array.isArray(data.products) ? data.products as Array<Record<string, unknown>> : Array.isArray(data) ? data as Array<Record<string, unknown>> : [];
    if (!incoming.length) return json({ error: "No products provided. Upload Taager export (JSON array) or connect Taager API." }, 400);
    // Normalize merchant-API variant shapes (financials/merchantInfo/color-size objects/images)
    // into the flat shape the pipeline expects. Passes through flat objects unchanged.
    const normStr = (v: unknown) => (v == null ? "" : String(v));
    const normObjVal = (v: unknown) => (v != null && typeof v === "object" ? normStr((v as Record<string, unknown>).value ?? (v as Record<string, unknown>).name ?? "") : normStr(v));
    const raw = incoming.map((item) => {
      if ("basePrice" in item && !("financials" in item)) return item;
      const financials = (item.financials as Record<string, unknown>) || {};
      const images: string[] = [];
      for (const key of ["productPicture", "image", "imageUrl", "extraImage1", "extraImage2", "extraImage3", "extraImage4", "extraImage5", "extraImage6"]) {
        if (item[key]) images.push(normStr(item[key]));
      }
      const addl = (item.additionalMedia as unknown) || (item.images as unknown);
      if (Array.isArray(addl)) for (const u of addl) if (u) images.push(normStr(u));
      return {
        ...item,
        id: normStr(item.id ?? item.prodID ?? item.sku ?? ""),
        name: normStr(item.name ?? item.productName ?? item.title ?? ""),
        basePrice: Number(financials.price ?? financials.finalPrice ?? item.basePrice ?? item.productPrice ?? item.price ?? 0),
        size: normObjVal(item.size),
        color: normObjVal(item.color),
        images: images.length ? images : (Array.isArray(item.images) ? item.images : []),
        stock: typeof item.stock === "number" ? item.stock : (item.isProductAvailableToSell === false ? 0 : 100),
      };
    });
    // Helpers inline (mirrors src/lib/server/taager.ts)
     const normalizeName = (n: string) => n.toLowerCase().replace(/\b(2?xl|x{1,2}l|large|medium|small|l|m|s)\b/gi, "").replace(/\s*[-/]?\s*(أسود|ابيض|أبيض|بني|نيفي|احمر|أحمر|black|white|brown|navy)\s*$/i, "").replace(/\s+/g," ").trim();
    const isMuse = (p: Record<string, unknown>) => {
      const h = `${p.name||p.title||""} ${p.category||""} ${p.subcategory||""} ${p.brand||""} ${(Array.isArray(p.tags)? (p.tags as string[]).join(" "):"")}`.toLowerCase();
      return h.includes("muse manufactured") || String(p.isMuseManufactured||p.is_muse_made||"").toLowerCase()==="true";
    };
    const isClothing = (p: Record<string, unknown>) => {
      const cat = `${p.category||""} ${p.subcategory||""} ${(Array.isArray(p.tags)? (p.tags as string[]).join(" "):"")}`.toLowerCase();
      return ["fashion","clothing","apparel","t-shirt","tshirt","dress","trouser","pants","jeans","jacket","hoodie","blouse","skirt","abaya","shoe"].some(k=>cat.includes(k));
    };
    const scoreVendor = (p: Record<string, unknown>) => {
      const rating = Number(p.vendorRating ?? p.vendor_rating ?? 0) * 20;
      const years = Math.min(Number(p.vendorYearsActive ?? p.vendor_years ?? 0)*5,25);
      const rc = Number(p.reviewCount ?? p.review_count ?? 0);
      const ra = Number(p.reviewAvg ?? p.review_avg ?? 0);
      let reviewScore = 0;
      if (rc >= 20 && ra >= 4.2 && ra <= 4.7) reviewScore = 25;
      else if (rc >= 5 && ra < 4.8) reviewScore = 15;
      else if (rc < 5) reviewScore = 0; else reviewScore = 10;
      const hist = (p.salesHistory ?? p.sales_history) as number[] | undefined;
      let stability = 10;
      if (hist && hist.length >= 3) {
        const avg = hist.reduce((a:number,b:number)=>a+b,0)/hist.length;
        const variance = hist.reduce((a:number,b:number)=>a+Math.pow(b-avg,2),0)/hist.length;
        const cv = avg ? Math.sqrt(variance)/avg : 1;
        if (cv < 0.2) stability = 25; else if (cv < 0.4) stability = 15; else if (cv < 0.8) stability = 5; else stability = 0;
      }
      return rating + years + reviewScore + stability;
    };
    let excludedMuse = 0, excludedNonClothing = 0;
    const filtered = raw.filter((p) => { if (isMuse(p)) { excludedMuse++; return false; } if (!isClothing(p)) { excludedNonClothing++; return false; } return true; });
    const groups = new Map<string, Array<Record<string, unknown>>>();
    for (const p of filtered) {
      const key = normalizeName(String(p.name||p.title||""));
      const arr = groups.get(key) || [];
      arr.push(p);
      groups.set(key, arr);
    }
    const duplicateGroups = Array.from(groups.values()).filter(g=>g.length>1).length;
    const unique: Array<Record<string, unknown>> = [];
    for (const group of groups.values()) {
      const ranked = [...group].sort((a,b)=>scoreVendor(b)-scoreVendor(a));
      const chosen = ranked[0];
       const base = Number(chosen.basePrice ?? chosen.price ?? chosen.taager_price ?? 0);
       const finalPrice = Math.round(base * 1.5 * 100)/100;
       const inferSize = (name: string) => name.match(/\b(2XL|XL|L|M|S|large|medium|small)\b/i)?.[1] || "";
       const inferColor = (name: string) => name.match(/(أسود|ابيض|أبيض|بني|نيفي|احمر|أحمر|black|white|brown|navy)/i)?.[1] || "";
       const variants = group.map((g) => ({ size: String(g.size || inferSize(String(g.name || g.title || ""))), color: String(g.color || inferColor(String(g.name || g.title || ""))), taagerProductId: String(g.id || g.sku || ""), taagerSku: String(g.sku || g.id || ""), taagerPrice: Number(g.basePrice ?? g.price ?? g.taager_price ?? 0), stock: Number(g.stock ?? g.stockQty ?? 100) }));
      unique.push({
        productName: String(chosen.name||chosen.title),
        category: String(chosen.category||"Fashion"),
        subcategory: String(chosen.subcategory||"Apparel"),
        taagerBasePrice: base,
        finalSellingPrice: finalPrice,
        image: Array.isArray(chosen.images) ? String((chosen.images as string[])[0]||"") : String(chosen.image||""),
        additionalImages: Array.isArray(chosen.images) ? (chosen.images as string[]).slice(1) : [],
        vendorSelected: String(chosen.vendorName||chosen.vendor_name||""),
        vendorId: String(chosen.vendorId||chosen.vendor_id||""),
         trustScore: scoreVendor(chosen),
         variants,
        originalIds: group.map(g=>String(g.id||g.sku||"")),
      });
    }
    unique.sort((a,b)=> String(a.category).localeCompare(String(b.category)) || Number(a.finalSellingPrice)-Number(b.finalSellingPrice));
    if (path === "taager/preview") {
      return json({ unique, stats: { totalRaw: raw.length, afterFilter: filtered.length, excludedMuse, excludedNonClothing, duplicateGroups, uniqueCount: unique.length } });
    }
    // Import: insert into D1 products
    let imported = 0;
    for (const u of unique) {
      const pid = id();
      const title = String(u.productName);
      const images = JSON.stringify([u.image, ...((u.additionalImages as string[])||[])].filter(Boolean));
      const price = Number(u.finalSellingPrice);
      const sku = `TAAGER-${String(u.vendorId).slice(0,6).toUpperCase()}-${pid.slice(0,6).toUpperCase()}`;
      try {
         const variants = Array.isArray(u.variants) ? u.variants as Array<Record<string, unknown>> : [];
         const sizeList = [...new Set(variants.map((v) => String(v.size || "")).filter(Boolean))];
         const colorList = [...new Set(variants.map((v) => String(v.color || "")).filter(Boolean))];
         await env.DB.prepare("INSERT INTO products (id,title,description,brand,category_id,price,sku,stock_qty,images,colors,sizes,variants,is_new,is_muse_made) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
           .bind(pid, title, `${title} — imported from Taager via trusted vendor ${u.vendorSelected}. 50% margin applied.`, String((u as Record<string,unknown>).brand||"Taager"), null, price, sku, 100, images, JSON.stringify(colorList), JSON.stringify(sizeList), JSON.stringify(variants), 0, 0).run();
         for (const v of variants as Array<Record<string, unknown>>) {
           await env.DB.prepare("INSERT INTO product_variants (id,product_id,sku,size,color,stock,price_override,taager_product_id,taager_sku,taager_size,taager_color,taager_price,taager_vendor_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
             .bind(id(), pid, String(v.taagerSku || v.sku || v.taagerProductId || ""), String(v.size || ""), String(v.color || ""), Number(v.stock || 0), Math.round(Number(v.taagerPrice || 0) * 1.5), String(v.taagerProductId || ""), String(v.taagerSku || v.sku || ""), String(v.size || ""), String(v.color || ""), Number(v.taagerPrice || 0), String(u.vendorId || "")).run();
         }
        imported++;
      } catch {}
    }
    return json({ ok: true, imported, stats: { totalRaw: raw.length, excludedMuse, excludedNonClothing, duplicateGroups, uniqueCount: unique.length } });
  }
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
     const orderItems: Array<{ product_id: string; title: string; sku: string; size: string; color: string; qty: number; unit_price: number; taager_product_id: string; taager_sku: string }> = [];
    for (const it of items) {
      const pid = String(it.product_id || it.id || "");
      const qty = Math.max(1, Number(it.qty || it.quantity || 1));
       const size = String(it.size || "");
       const color = String(it.color || "");
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
       let source: Record<string, unknown> | null = null;
       try {
         const variant = await env.DB.prepare("SELECT * FROM product_variants WHERE product_id=? AND size=? AND (?='' OR color=?) AND active=1 LIMIT 1").bind(pid, size, color, color).first<Record<string, unknown>>();
         if (variant) source = variant;
       } catch {}
       const configuredVariants = (prod as Record<string, unknown>).variants;
       if (size && !source && Array.isArray(configuredVariants) && configuredVariants.length > 0) return json({ error: `Size ${size} is unavailable for ${prod.nameEn || prod.title}` }, 409);
       const stock = Number((source?.stock ?? prod.stockQty) ?? 100);
      if (stock < qty) return json({ error: `${prod.nameEn || prod.title} only ${stock} left` }, 400);
       const unit = source?.price_override != null ? Number(source.price_override) : Math.round(Number(prod.price) * 100) / 100;
      subtotal += unit * qty;
       orderItems.push({ product_id: pid, title: String(prod.nameEn || prod.title), sku: String(source?.taager_sku || prod.sku || pid), size, color, qty, unit_price: unit, taager_product_id: String(source?.taager_product_id || ""), taager_sku: String(source?.taager_sku || prod.sku || pid) });
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
      try { await env.DB.prepare("UPDATE orders SET fulfillment_status='queued' WHERE id=?").bind(orderId).run(); } catch {}
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
      // Hands-off fulfillment: try all configured strategies, queue for cron retry on failure (zero dashboard entry).
      let fulfillment: Record<string, unknown> = { status: "queued" };
      try {
        const fwd = await forwardOrder(env as unknown as Record<string, string | undefined>, {
          orderId, customer: { name: customer_name, phone, address, governorate, city, area, building, email: email || undefined },
          items: orderItems, subtotal, shipping, total, payment_method,
        });
        if (fwd.ok) {
          fulfillment = { status: "submitted", strategy: fwd.strategy, taagerOrderId: fwd.taagerOrderId };
          try { await env.DB.prepare("UPDATE orders SET fulfillment_status='submitted', taager_order_id=?, fulfillment_error=NULL WHERE id=?").bind(fwd.taagerOrderId || null, orderId).run(); } catch {}
          try { await env.DB.prepare("INSERT INTO fulfillment_attempts (id, order_id, strategy, status, http_status, response) VALUES (?,?,?,?,?,?)").bind(id(), orderId, fwd.strategy, "ok", fwd.httpStatus || null, JSON.stringify(fwd.body || {}).slice(0,4000)).run(); } catch {}
        } else {
          const needsQueue = fwd.strategy !== "telegram" || String(fwd.error || "").includes("No fulfillment endpoint");
          fulfillment = { status: needsQueue ? "queued" : "failed", strategy: fwd.strategy, error: fwd.error, queued: needsQueue };
          try { await env.DB.prepare("UPDATE orders SET fulfillment_status=?, fulfillment_error=? WHERE id=?").bind(needsQueue ? "queued" : "failed", String(fwd.error || "").slice(0,2000), orderId).run(); } catch {}
          try { await env.DB.prepare("INSERT INTO fulfillment_attempts (id, order_id, strategy, status, http_status, response) VALUES (?,?,?,?,?,?)").bind(id(), orderId, fwd.strategy, "error", fwd.httpStatus || null, String(fwd.error || "").slice(0,4000)).run(); } catch {}
          if (needsQueue) {
            try {
              await env.DB.prepare("INSERT INTO fulfillment_queue (id, order_id, attempts, next_attempt_at, last_error, strategy, payload) VALUES (?,?,?,?,?,?,?)")
                .bind(id(), orderId, 1, new Date(Date.now()+ 60_000).toISOString(), String(fwd.error || "").slice(0,2000), fwd.strategy, JSON.stringify({ orderId, customer_name, phone, email, address, building, area, city, governorate, payment_method, subtotal, shipping, total, items: orderItems }).slice(0,8000)).run();
            } catch {}
          }
        }
      } catch (e) {
        fulfillment = { status: "queued", error: String(e) };
        try { await env.DB.prepare("INSERT INTO fulfillment_queue (id, order_id, attempts, next_attempt_at, last_error, payload) VALUES (?,?,?,?,?,?)").bind(id(), orderId, 1, new Date(Date.now()+60_000).toISOString(), String(e).slice(0,2000), JSON.stringify({ orderId, items: orderItems }).slice(0,8000)).run(); } catch {}
      }
      return json({ ok: true, orderId, subtotal, shipping, discount, total, payment_method, fulfillment }, 201);
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
   // --- Fulfillment: admin status + retry (automation never requires dashboard) ---
   if (path === "fulfillment/status" && request.method === "GET") {
     const current = await user(request, env);
     if (!current || current.role !== "admin") return json({ error: "Admin access required." }, 403);
     try {
       const q = await env.DB.prepare("SELECT * FROM fulfillment_queue ORDER BY next_attempt_at ASC LIMIT 50").all();
       const a = await env.DB.prepare("SELECT * FROM fulfillment_attempts ORDER BY created_at DESC LIMIT 50").all();
       const o = await env.DB.prepare("SELECT id, fulfillment_status, fulfillment_error, taager_order_id, created_at FROM orders WHERE fulfillment_status IN ('queued','failed') ORDER BY created_at DESC LIMIT 50").all();
       return json({ queue: q.results, attempts: a.results, orders: o.results });
     } catch (e) { return json({ error: String(e) }, 500); }
   }
   if (path === "fulfillment/retry" && request.method === "POST") {
     const current = await user(request, env);
     if (!current || current.role !== "admin") return json({ error: "Admin access required." }, 403);
     const data = await body(request);
     const orderId = String(data.orderId || data.order_id || "").trim();
     if (!orderId) return json({ error: "orderId required" }, 400);
     try {
       const order = await env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(orderId).first<Record<string, unknown>>();
       if (!order) return json({ error: "Order not found" }, 404);
       const items = await env.DB.prepare("SELECT * FROM order_items WHERE order_id=?").bind(orderId).all<Record<string, unknown>>();
       const fwd = await forwardOrder(env as unknown as Record<string, string | undefined>, {
         orderId, customer: { name: String(order.customer_name), phone: String(order.phone), address: String(order.address), governorate: String(order.governorate), city: String(order.city||""), area: String(order.area||""), building: String(order.building||""), email: String(order.email||"") },
         items: (items.results as unknown as Array<Record<string, unknown>>).map((r) => ({ product_id: String(r.product_id), sku: String(r.sku), size: String(r.size||""), color: String((r as Record<string, unknown>).color||""), quantity: Number(r.quantity), taager_product_id: String((r as Record<string, unknown>).taager_product_id||r.sku||""), taager_sku: String(r.sku), title: String(r.title), unit_price: Number(r.unit_price) })),
         subtotal: Number(order.subtotal), shipping: Number(order.shipping), total: Number(order.total), payment_method: String(order.payment_method),
       });
       if (fwd.ok) {
         await env.DB.prepare("UPDATE orders SET fulfillment_status='submitted', taager_order_id=?, fulfillment_error=NULL WHERE id=?").bind(fwd.taagerOrderId||null, orderId).run();
         await env.DB.prepare("DELETE FROM fulfillment_queue WHERE order_id=?").bind(orderId).run();
         return json({ ok: true, strategy: fwd.strategy, taagerOrderId: fwd.taagerOrderId });
       } else {
         await env.DB.prepare("UPDATE orders SET fulfillment_status='failed', fulfillment_error=? WHERE id=?").bind(String(fwd.error).slice(0,2000), orderId).run();
         return json({ ok: false, strategy: fwd.strategy, error: fwd.error }, 502);
       }
     } catch (e) { return json({ error: String(e) }, 500); }
   }
   // Cron tick — called by Cloudflare Cron or manual GET with ?cron=1 (service key not needed due to admin check bypass for cron UA)
   if (path === "fulfillment/tick" && (request.method === "POST" || request.method === "GET")) {
     const ua = request.headers.get("user-agent") || "";
     const cronSecret = (env as Record<string, string|undefined>).CRON_SECRET;
     const auth = request.headers.get("authorization") || "";
     const isCron = ua.includes("cloudflare") || (cronSecret && auth === `Bearer ${cronSecret}`);
     // also allow admin
     let allowed = isCron;
     if (!allowed) { const u = await user(request, env); allowed = !!u && u.role === "admin"; }
     if (!allowed) return json({ error: "Unauthorized tick" }, 401);
     try {
       const due = await env.DB.prepare("SELECT * FROM fulfillment_queue WHERE next_attempt_at <= datetime('now') AND attempts < max_attempts ORDER BY next_attempt_at ASC LIMIT 5").all<Record<string, unknown>>();
       const results: unknown[] = [];
       for (const row of due.results) {
         const orderId = String(row.order_id);
         const payload = JSON.parse(String(row.payload)) as Record<string, unknown>;
         const items = (payload.items as Array<Record<string, unknown>>) || [];
         const fwd = await forwardOrder(env as unknown as Record<string, string | undefined>, {
           orderId, customer: { name: String(payload.customer_name||payload.name||""), phone: String(payload.phone||""), address: String(payload.address||""), governorate: String(payload.governorate||"Cairo"), city: String(payload.city||""), area: String(payload.area||""), building: String(payload.building||""), email: String(payload.email||"") },
           items: items as unknown as Array<{ product_id:string; sku:string; size:string; color:string; quantity:number; taager_product_id:string; taager_sku:string; title:string; unit_price:number }>,
           subtotal: Number(payload.subtotal||0), shipping: Number(payload.shipping||0), total: Number(payload.total||0), payment_method: String(payload.payment_method||"cod"),
         });
         if (fwd.ok) {
           await env.DB.prepare("UPDATE orders SET fulfillment_status='submitted', taager_order_id=?, fulfillment_error=NULL WHERE id=?").bind(fwd.taagerOrderId||null, orderId).run();
           await env.DB.prepare("DELETE FROM fulfillment_queue WHERE order_id=?").bind(orderId).run();
           await env.DB.prepare("INSERT INTO fulfillment_attempts (id, order_id, strategy, status, http_status, response) VALUES (?,?,?,?,?,?)").bind(id(), orderId, fwd.strategy, "ok", fwd.httpStatus||null, JSON.stringify(fwd.body||{}).slice(0,4000)).run();
         } else {
           const backoffMin = Math.min(60, Math.pow(2, Number(row.attempts)));
           await env.DB.prepare("UPDATE fulfillment_queue SET attempts=attempts+1, last_error=?, next_attempt_at=datetime('now', ?), strategy=?, updated_at=datetime('now') WHERE id=?").bind(String(fwd.error).slice(0,2000), `+${backoffMin} minutes`, fwd.strategy, String(row.id)).run();
           await env.DB.prepare("INSERT INTO fulfillment_attempts (id, order_id, strategy, status, http_status, response) VALUES (?,?,?,?,?,?)").bind(id(), orderId, fwd.strategy, "error", fwd.httpStatus||null, String(fwd.error).slice(0,4000)).run();
         }
         results.push({ orderId, ok: fwd.ok, strategy: fwd.strategy, error: fwd.error });
       }
       return json({ ok: true, processed: results.length, results });
     } catch (e) { return json({ error: String(e) }, 500); }
   }
   return json({ error: "Not found" }, 404);
};
