-- MUSE WEAR commerce upgrades: variants, shipping, discounts, reviews, order lifecycle
PRAGMA foreign_keys = ON;

-- Extend products with rich catalogue fields (additive, nullable)
ALTER TABLE products ADD COLUMN material TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN care TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN fit TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN seo_title TEXT;
ALTER TABLE products ADD COLUMN seo_description TEXT;
ALTER TABLE products ADD COLUMN slug TEXT;
ALTER TABLE products ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN bestseller INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN variants TEXT NOT NULL DEFAULT '[]';

-- Variant-level inventory (JSON fallback in products.variants also kept for export speed)
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  size TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_override INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS variants_product_idx ON product_variants(product_id);

-- Shipping zones per governorate (admin-configurable)
CREATE TABLE IF NOT EXISTS shipping_zones (
  id TEXT PRIMARY KEY,
  governorate TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL DEFAULT 59,
  free_threshold INTEGER NOT NULL DEFAULT 999,
  delivery_days TEXT NOT NULL DEFAULT '1-2 days',
  active INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO shipping_zones (id, governorate, price, free_threshold, delivery_days, active) VALUES
  ('ship-cairo', 'Cairo', 59, 999, '1-2 days', 1),
  ('ship-alex', 'Alexandria', 59, 999, '1-2 days', 1),
  ('ship-giza', 'Giza', 59, 999, '1-2 days', 1),
  ('ship-other', 'Other', 75, 1499, '2-4 days', 1);

-- Discounts / coupon codes
CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed','free_shipping')),
  value INTEGER NOT NULL DEFAULT 0,
  min_order INTEGER NOT NULL DEFAULT 0,
  max_discount INTEGER,
  starts_at TEXT,
  ends_at TEXT,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO discounts (id, code, type, value, min_order, active) VALUES
  ('disc-welcome10', 'WELCOME10', 'percent', 10, 500, 1),
  ('disc-sale20', 'SALE20', 'percent', 20, 0, 1);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  size_purchased TEXT,
  fit_feedback TEXT CHECK (fit_feedback IN ('small','true','large') OR fit_feedback IS NULL),
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(product_id, created_at DESC);

-- Addresses (for customer accounts)
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  governorate TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  street TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  apartment TEXT,
  phone TEXT NOT NULL DEFAULT '',
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Orders: allow guest (user_id nullable), expand status, add email/city/area etc
-- SQLite cannot alter CHECK directly, so recreate via new table approach if needed.
-- For additive compatibility, we keep existing CHECK but add new columns and allow NULL user_id via new table.
-- Create orders_v2 and migrate if orders has NOT NULL user_id
CREATE TABLE IF NOT EXISTS orders_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested','returned','refunded')),
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  apartment TEXT,
  area TEXT,
  city TEXT,
  governorate TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod','paymob')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping INTEGER NOT NULL CHECK (shipping >= 0),
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL CHECK (total >= 0),
  coupon_code TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Migrate existing orders if any
INSERT OR IGNORE INTO orders_v2 (id, user_id, status, customer_name, phone, address, governorate, payment_method, subtotal, shipping, total, created_at, updated_at)
  SELECT id, user_id, 
    CASE WHEN status='pending' THEN 'pending' WHEN status='confirmed' THEN 'confirmed' WHEN status='shipped' THEN 'shipped' WHEN status='delivered' THEN 'delivered' WHEN status='cancelled' THEN 'cancelled' ELSE 'pending' END,
    customer_name, phone, address, governorate, payment_method, subtotal, shipping, total, created_at, updated_at FROM orders;
DROP TABLE IF EXISTS orders;
ALTER TABLE orders_v2 RENAME TO orders;
CREATE INDEX IF NOT EXISTS orders_user_idx2 ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Update products slug where missing (lowercase title)
UPDATE products SET slug = lower(replace(replace(title,' ', '-'),'''','')) WHERE slug IS NULL;
