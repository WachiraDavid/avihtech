-- Properties
CREATE TABLE properties (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT    NOT NULL UNIQUE,
    title         TEXT    NOT NULL,
    description   TEXT    NOT NULL DEFAULT '',
    location      TEXT    NOT NULL DEFAULT '',
    price         INTEGER,                       -- KES, NULL = "Request Quote"
    listing_type  TEXT    NOT NULL DEFAULT 'sale'        CHECK (listing_type IN ('sale', 'rent')),
    property_type TEXT    NOT NULL DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial', 'land')),
    beds          INTEGER,
    baths         INTEGER,
    size          TEXT    NOT NULL DEFAULT '',   -- free text, e.g. "1 acre" or "120 sqm"
    tags          TEXT    NOT NULL DEFAULT '[]', -- JSON array of feature labels
    featured      INTEGER NOT NULL DEFAULT 0,
    published     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_properties_listing ON properties (published, featured, created_at DESC);

CREATE TABLE property_images (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    url         TEXT    NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0      -- position 0 is the cover photo
);
CREATE INDEX idx_property_images_property ON property_images (property_id, position);

-- Blog posts
CREATE TABLE posts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    slug         TEXT    NOT NULL UNIQUE,
    title        TEXT    NOT NULL,
    excerpt      TEXT    NOT NULL DEFAULT '',
    content      TEXT    NOT NULL DEFAULT '',   -- sanitized HTML
    cover_image  TEXT    NOT NULL DEFAULT '',
    category     TEXT    NOT NULL DEFAULT 'Market Analysis',
    read_minutes INTEGER NOT NULL DEFAULT 1,
    published    INTEGER NOT NULL DEFAULT 1,
    published_at TEXT    NOT NULL DEFAULT (datetime('now')),
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_posts_listing ON posts (published, published_at DESC);
