/**
 * Taager / Dukan API client.
 *
 * VERIFIED against the live Taager Dukan storefront API on 2026-10-19.
 *
 *   API base   : https://api.dukan.shop/api
 *   Store key  : Origin / Referer header (the connected storefront domain)
 *   Auth       : Taager store API key (format TK-...) in the `apiKey` body field
 *
 * The legacy WooCommerce gateway (woocommerce-api-gw.api.taager.com) no longer
 * resolves, and merchant.api.taager.com uses merchant Basic auth (not the store
 * API key), so neither is used here. Everything below was confirmed against the
 * running service.
 */

export type TaagerEnv = {
  TAAGER_DUKAN_API_URL?: string; // default https://api.dukan.shop/api
  TAAGER_DUKAN_ORIGIN?: string; // default https://muse-wear.pages.dev
  TAAGER_API_TOKEN?: string; // TK-... store API key
  TAAGER_STORE_COUNTRY?: string; // ISO-3166 alpha-2, default EG
  TAAGER_STORE_LANGUAGE?: string; // default en
};

export const DEFAULT_TAAGER_API_URL = "https://api.dukan.shop/api";
export const DEFAULT_TAAGER_ORIGIN = "https://muse-wear.pages.dev";

export type TaagerProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  images: Array<{ original: string; thumbnail: string; medium: string }>;
  videos: unknown[];
  price: Record<string, { price: number; compareToPrice: number | null; label: string | null; isHidden: boolean }>;
  rating: number;
  noOfReviews: number;
  slug: string;
  featured: boolean;
  onSale: boolean;
};

export type TaagerProvince = { id: string; name: string; hierarchyLabel: string; shippingRevenue: number };
export type TaagerZone = { id: string; name: string; provinceId: string };
export type TaagerDistrict = { id: string; name: string; zoneId?: string; provinceId?: string };

export type TaagerOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type TaagerOrderDeliveryInfo = {
  name: string;
  email: string | null;
  phone: string;
  address: string;
  provinceId: string;
  zoneId: string | null;
  districtId: string | null;
  notes: string | null;
  saudiNationalAddress: string | null;
  countryIsoCode2: string | null;
};

export type CreateOrderInput = {
  items: TaagerOrderItem[];
  subtotal: number;
  codFee?: number;
  total: number;
  deliveryInfo: TaagerOrderDeliveryInfo;
  isPrePayment?: boolean;
  redirectionUrl?: string;
  metadata?: Record<string, unknown>;
};

export class TaagerApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "TaagerApiError";
    this.status = status;
    this.body = body;
  }
}

function base(env: TaagerEnv): string {
  return (env.TAAGER_DUKAN_API_URL || DEFAULT_TAAGER_API_URL).replace(/\/+$/, "");
}

function origin(env: TaagerEnv): string {
  return (env.TAAGER_DUKAN_ORIGIN || DEFAULT_TAAGER_ORIGIN).replace(/\/+$/, "");
}

function requestHeaders(env: TaagerEnv, extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Origin: origin(env),
    Referer: `${origin(env)}/`,
    ...extra,
  };
}

function country(env: TaagerEnv): string {
  return (env.TAAGER_STORE_COUNTRY || "EG").toUpperCase();
}

function language(env: TaagerEnv): string {
  return (env.TAAGER_STORE_LANGUAGE || "en").toLowerCase();
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text.slice(0, 2000);
  }
}

async function request<T>(env: TaagerEnv, path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${base(env)}${path}`;
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new TaagerApiError(`Taager network error: ${String(e)}`, 0, null);
  }
  const body = await parse(res);
  if (!res.ok) {
    const msg =
      (body as Record<string, unknown>)?.message ||
      (body as Record<string, unknown>)?.error ||
      `Taager HTTP ${res.status}`;
    throw new TaagerApiError(String(msg), res.status, body);
  }
  return body as T;
}

/** GET /storefront/products — public catalog for the connected store. */
export async function listProducts(
  env: TaagerEnv,
  opts: { page?: number; pageSize?: number; category?: string; featured?: boolean } = {}
): Promise<{ products: TaagerProduct[]; pagination: { page: number; pageSize: number; hasNext: boolean; totalElements: number; totalPages: number } }> {
  const p = new URLSearchParams();
  p.set("page", String(opts.page ?? 1));
  p.set("pageSize", String(opts.pageSize ?? 30));
  if (opts.category) p.set("category", opts.category);
  if (typeof opts.featured === "boolean") p.set("featured", String(opts.featured));
  return request(env, `/storefront/products?${p.toString()}`, {
    method: "GET",
    headers: requestHeaders(env),
    cache: "no-store",
  });
}

/** GET /provinces?countryCode=&language= */
export async function getProvinces(env: TaagerEnv): Promise<TaagerProvince[]> {
  const p = new URLSearchParams({ countryCode: country(env), language: language(env) });
  return request(env, `/provinces?${p.toString()}`, { method: "GET", headers: requestHeaders(env) });
}

/** GET /provinces/{provinceId}/zones */
export async function getZones(env: TaagerEnv, provinceId: string): Promise<TaagerZone[]> {
  const p = new URLSearchParams({ countryCode: country(env), language: language(env) });
  return request(env, `/provinces/${encodeURIComponent(provinceId)}/zones?${p.toString()}`, {
    method: "GET",
    headers: requestHeaders(env),
  });
}

/** GET /provinces/{provinceId}/zones/{zoneId}/districts */
export async function getDistricts(env: TaagerEnv, provinceId: string, zoneId: string): Promise<TaagerDistrict[]> {
  const p = new URLSearchParams({ countryCode: country(env), language: language(env) });
  return request(
    env,
    `/provinces/${encodeURIComponent(provinceId)}/zones/${encodeURIComponent(zoneId)}/districts?${p.toString()}`,
    { method: "GET", headers: requestHeaders(env) }
  );
}

/** GET /products/{slug}/cross-sells */
export async function getProductCrossSells(env: TaagerEnv, slug: string): Promise<unknown> {
  return request(env, `/products/${encodeURIComponent(slug)}/cross-sells`, {
    method: "GET",
    headers: requestHeaders(env),
  });
}

/** POST /orders — creates an order in the connected Taager store. */
export async function createOrder(
  env: TaagerEnv,
  input: CreateOrderInput
): Promise<{ orderId?: string; paymentLink?: string; status?: string; raw: unknown }> {
  const apiKey = env.TAAGER_API_TOKEN?.trim();
  if (!apiKey) throw new TaagerApiError("TAAGER_API_TOKEN (TK-...) is not configured", 0, null);
  const payload = {
    items: input.items,
    subtotal: input.subtotal,
    codFee: input.codFee ?? 0,
    total: input.total,
    deliveryInfo: input.deliveryInfo,
    apiKey,
    isPrePayment: Boolean(input.isPrePayment),
    redirectionUrl: input.redirectionUrl ?? `${origin(env)}/thank-you?redirect=payment`,
    metadata: input.metadata ?? {},
  };
  const body = await request<Record<string, unknown>>(env, "/orders", {
    method: "POST",
    headers: requestHeaders(env),
    body: JSON.stringify(payload),
  });
  return {
    orderId: String(body.orderId ?? body.id ?? ""),
    paymentLink: body.paymentLink ? String(body.paymentLink) : undefined,
    status: body.status ? String(body.status) : undefined,
    raw: body,
  };
}

/** PUT /orders/{orderId}/cross-sell */
export async function updateOrderWithCrossSelling(
  env: TaagerEnv,
  orderId: string,
  products: string[]
): Promise<unknown> {
  const apiKey = env.TAAGER_API_TOKEN?.trim();
  if (!apiKey) throw new TaagerApiError("TAAGER_API_TOKEN (TK-...) is not configured", 0, null);
  return request(env, `/orders/${encodeURIComponent(orderId)}/cross-sell`, {
    method: "PUT",
    headers: requestHeaders(env),
    body: JSON.stringify({ orderId, products, apiKey }),
  });
}

/**
 * Connection check. Fetches one page of the catalog and reports the credential
 * state without mutating anything.
 */
export async function checkConnection(env: TaagerEnv): Promise<{
  ok: boolean;
  apiUrl: string;
  origin: string;
  tokenConfigured: boolean;
  productCount?: number;
  sampleProduct?: string;
  error?: string;
}> {
  const tokenConfigured = Boolean(env.TAAGER_API_TOKEN?.trim());
  try {
    const page = await listProducts(env, { page: 1, pageSize: 1 });
    const first = page.products?.[0];
    return {
      ok: true,
      apiUrl: base(env),
      origin: origin(env),
      tokenConfigured,
      productCount: page.pagination?.totalElements,
      sampleProduct: first ? `${first.id} — ${first.name}` : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      apiUrl: base(env),
      origin: origin(env),
      tokenConfigured,
      error: e instanceof TaagerApiError ? `${e.message} (HTTP ${e.status})` : String(e),
    };
  }
}

/** Best unit price for a product across quantity tiers. */
export function bestPrice(product: TaagerProduct): number {
  const tiers = Object.values(product.price || {});
  if (!tiers.length) return 0;
  return Math.min(...tiers.map((t) => Number(t.price) || 0));
}

/**
 * Map a live storefront product into the flat shape the MUSE-WEAR import
 * pipeline expects (basePrice / images[] / id / name / category / stock).
 */
export function toTaagerRaw(p: TaagerProduct): Record<string, unknown> {
  const images = (p.images || []).map((i) => i.original || i.medium || i.thumbnail).filter(Boolean);
  return {
    id: p.id,
    sku: p.id,
    name: p.name,
    title: p.name,
    category: p.category || "Fashion",
    subcategory: p.category || "Apparel",
    basePrice: bestPrice(p),
    price: bestPrice(p),
    images,
    image: images[0] || "",
    stock: 100,
    vendorId: "taager",
    vendorName: "Taager",
    slug: p.slug,
    isMuseManufactured: false,
  };
}

/**
 * English governorate -> Taager province id mapping. Taager's province ids are
 * Arabic names; orders must send the exact id or the order is rejected.
 */
const PROVINCE_EN_AR: Record<string, string> = {
  cairo: "القاهرة",
  giza: "الجيزة",
  alexandria: "الأسكندرية",
  "alexandria ": "الأسكندرية",
  dakahlia: "الدقهلية",
  sharqia: "الشرقية",
  qalyubia: "القليوبية",
  kafr_el_sheikh: "كفر الشيخ",
  monufia: "المنوفية",
  beheira: "البحيرة",
  gharbia: "الغربية",
  menia: "منيا",
  beni_suef: "بني سويف",
  fayoum: "الفيوم",
  asyut: "اسيوط",
  sohag: "سوهاج",
  qena: "قنا",
  luxor: "الأقصر",
  aswan: "أسوان",
  red_sea: "البحر الأحمر - الغردقة",
  "red_sea_ghardaqa": "البحر الأحمر - الغردقة",
  matrouh: "مطروح",
  north_sinai: "شمال سيناء",
  south_sinai: "جنوب سيناء",
  port_said: "بور سعيد",
  ismailia: "الاسماعيلية",
  suez: "سويس",
  damietta: "دمياط",
};

/** Resolve a governorate (English or Arabic) to a Taager province id. */
export function toProvinceId(governorate: string): string {
  const raw = String(governorate || "").trim();
  if (!raw) return "";
  // Already an Arabic id (Taager returns Arabic ids).
  if (/[\u0600-\u06FF]/.test(raw)) return raw;
  const key = raw.toLowerCase().replace(/[\s\-]+/g, "_");
  return PROVINCE_EN_AR[key] || raw;
}
