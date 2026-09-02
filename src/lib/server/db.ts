import "server-only";

export type D1Database = {
  prepare(query: string): {
    bind(...values: unknown[]): { first<T = unknown>(column?: string): Promise<T | null>; all<T = unknown>(): Promise<{ results: T[] }>; run(): Promise<unknown> };
  };
};

export type AppEnv = { DB?: D1Database };

export function requireDb(env: AppEnv | undefined) {
  if (!env?.DB) throw new Error("D1 binding DB is not configured");
  return env.DB;
}

export function jsonArray(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try { return JSON.parse(value) as string[]; } catch { return []; }
}

export function publicProduct(row: Record<string, unknown>) {
  return {
    id: String(row.id), nameEn: String(row.title), nameAr: String(row.title),
    brand: String(row.brand), category: String(row.category_slug || ""),
    subcategory: String(row.category_name || ""), price: Number(row.sale_price ?? row.price),
    originalPrice: row.sale_price == null ? undefined : Number(row.price),
    image: jsonArray(row.images)[0] || "/mw-mark.svg", images: jsonArray(row.images),
    colors: jsonArray(row.colors), sizes: jsonArray(row.sizes),
    isNew: Boolean(row.is_new), isMuseMade: Boolean(row.is_muse_made),
    stockQty: Number(row.stock_qty), sku: String(row.sku),
  };
}
