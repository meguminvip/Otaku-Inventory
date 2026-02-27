/**
 * Authors: h_ypi and A.R.O.N.A
 */

CREATE TABLE IF NOT EXISTS goods_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price INTEGER,
  release_date TEXT,
  preorder_start TEXT,
  preorder_end TEXT,
  category TEXT,
  manufacturer TEXT,
  product_url TEXT UNIQUE,
  image_url TEXT,
  description TEXT,
  source_site TEXT,
  is_limited INTEGER DEFAULT 0,
  is_available INTEGER DEFAULT 1,
  stock_status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  scraped_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_source_site ON goods_items(source_site);
CREATE INDEX IF NOT EXISTS idx_category ON goods_items(category);
CREATE INDEX IF NOT EXISTS idx_created_at ON goods_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_url ON goods_items(product_url);

CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goods_id INTEGER,
  notification_type TEXT,
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT,
  FOREIGN KEY (goods_id) REFERENCES goods_items(id)
);
