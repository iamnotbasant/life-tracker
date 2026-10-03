-- Database Schema for Life Tracker (Neon Postgres)

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS days (
  date TEXT PRIMARY KEY,           -- 'YYYY-MM-DD'
  data JSONB NOT NULL,            -- full DayData object
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weight_history (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weight_kg DOUBLE PRECISION NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_history_date ON weight_history(date);
