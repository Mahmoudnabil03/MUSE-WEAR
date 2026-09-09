-- 0004_fulfillment_queue.sql — queue for hands-off Taager fulfillment (Worker/cron automation)
-- No manual dashboard entry: orders retry via automation; last_error + attempts kept for observability.

-- Extend orders if missing cols (safe via ALTER ADD, ignored if exists)
-- fulfillment_status: queued | submitted | failed
-- taager_order_id, fulfillment_error already added in 0002/0003 — ensure.

-- Dedicated retry queue (survives Pages Functions restarts, readable by cron Worker)
CREATE TABLE IF NOT EXISTS fulfillment_queue (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 12,
  next_attempt_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_error TEXT,
  strategy TEXT, -- 'taager_api' | 'merchant_api' | 'dukan_storefront' | 'webhook' | 'telegram'
  payload TEXT NOT NULL, -- JSON snapshot of order + items
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fulfillment_queue_next ON fulfillment_queue(next_attempt_at, attempts);
CREATE INDEX IF NOT EXISTS idx_fulfillment_queue_order ON fulfillment_queue(order_id);

-- Fulfillment attempt log
CREATE TABLE IF NOT EXISTS fulfillment_attempts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  strategy TEXT NOT NULL,
  status TEXT NOT NULL, -- ok | error
  http_status INTEGER,
  response TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fulfillment_attempts_order ON fulfillment_attempts(order_id, created_at);
