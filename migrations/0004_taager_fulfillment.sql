-- Taager fulfillment mappings. A single storefront product may map each
-- customer size/color to a different Taager product or SKU.
ALTER TABLE product_variants ADD COLUMN taager_product_id TEXT;
ALTER TABLE product_variants ADD COLUMN taager_sku TEXT;
ALTER TABLE product_variants ADD COLUMN taager_size TEXT NOT NULL DEFAULT '';
ALTER TABLE product_variants ADD COLUMN taager_color TEXT NOT NULL DEFAULT '';
ALTER TABLE product_variants ADD COLUMN taager_price INTEGER;
ALTER TABLE product_variants ADD COLUMN taager_vendor_id TEXT;
ALTER TABLE product_variants ADD COLUMN active INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS variants_taager_lookup_idx
  ON product_variants(product_id, size, color, active);

ALTER TABLE orders ADD COLUMN fulfillment_status TEXT NOT NULL DEFAULT 'not_submitted';
ALTER TABLE orders ADD COLUMN taager_order_id TEXT;
ALTER TABLE orders ADD COLUMN fulfillment_error TEXT;
