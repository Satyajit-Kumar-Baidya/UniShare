-- ============================================================
-- UniShare Database Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                        TEXT PRIMARY KEY,
  name                      TEXT NOT NULL,
  email                     TEXT UNIQUE NOT NULL,
  password_hash             TEXT NOT NULL DEFAULT '',
  role                      TEXT NOT NULL DEFAULT 'user',
  avatar                    TEXT,
  phone                     TEXT,
  address                   TEXT,
  bio                       TEXT,
  university                TEXT,
  major                     TEXT,
  graduation_year           TEXT,
  uiu_email                 TEXT,
  uiu_id_number             TEXT,
  uiu_id_image              TEXT,
  verification_status       TEXT NOT NULL DEFAULT 'unverified',
  verification_note         TEXT,
  verification_submitted_at TEXT,
  verification_reviewed_at  TEXT,
  joined_date               TEXT,
  created_at                TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS marketplace_items (
  id          TEXT PRIMARY KEY,
  seller_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('sell','share','barter')),
  price       REAL DEFAULT 0,
  exchange_for TEXT,
  condition   TEXT,
  category    TEXT,
  description TEXT,
  image_url   TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscription_groups (
  id             TEXT PRIMARY KEY,
  owner_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service        TEXT NOT NULL,
  type           TEXT NOT NULL CHECK(type IN ('share','sublet')),
  total_price    REAL NOT NULL,
  total_spots    INTEGER NOT NULL DEFAULT 1,
  description    TEXT,
  duration_months INTEGER,
  icon           TEXT DEFAULT 'Users',
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_members (
  id         TEXT PRIMARY KEY,
  group_id   TEXT NOT NULL REFERENCES subscription_groups(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id   TEXT NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  added_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id           TEXT PRIMARY KEY,
  buyer_id     TEXT NOT NULL REFERENCES users(id),
  total_amount REAL NOT NULL,
  fee          REAL NOT NULL,
  status       TEXT NOT NULL DEFAULT 'paid',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id                TEXT PRIMARY KEY,
  order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id           TEXT NOT NULL REFERENCES marketplace_items(id),
  price_at_purchase REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id  TEXT NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  sender_id   TEXT NOT NULL REFERENCES users(id),
  receiver_id TEXT NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  reply_to    TEXT REFERENCES messages(id),
  read        INTEGER NOT NULL DEFAULT 0,
  edited_at   TEXT,
  deleted_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS message_reactions (
  id          TEXT PRIMARY KEY,
  message_id  TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS notifications (
  id           TEXT PRIMARY KEY,
  recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         INTEGER NOT NULL DEFAULT 0,
  link_url     TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uiu_email      TEXT,
  uiu_id_number  TEXT,
  uiu_id_image   TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  admin_note     TEXT,
  submitted_at   TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at    TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  seller_id   TEXT NOT NULL REFERENCES users(id),
  item_id     TEXT REFERENCES marketplace_items(id),
  rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
