-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Idempotent: safe to re-run.

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recipes (
  id              TEXT        PRIMARY KEY,
  title           TEXT        NOT NULL,
  yield_servings  INTEGER     NOT NULL,
  image_path      TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id                   SERIAL      PRIMARY KEY,
  recipe_id            TEXT        NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  sort_order           INTEGER     NOT NULL,
  -- Raw text is immutable: set on seed, never modified
  raw_text             TEXT        NOT NULL,
  -- Parsed fields (populated by client after parseIngredient)
  quantity             NUMERIC,
  unit                 TEXT,
  grams                NUMERIC,
  phrase               TEXT,
  -- Match results (populated by local pipeline or AI)
  matched_fdc_id       INTEGER,
  matched_description  TEXT,
  confidence           TEXT        CHECK (confidence IN ('high', 'medium', 'low', 'unmatched')),
  match_source         TEXT        CHECK (match_source IN ('manual', 'word-overlap', 'ai')),
  reviewed             BOOLEAN     NOT NULL DEFAULT FALSE,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recipe_id, sort_order)
);

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id                   SERIAL      PRIMARY KEY,
  recipe_id            TEXT,                    -- null for ad-hoc Estimate page calls
  ingredient_raw_text  TEXT,
  phrase               TEXT,
  matched_fdc_id       INTEGER,
  confidence           TEXT,
  input_tokens         INTEGER     NOT NULL,
  output_tokens        INTEGER     NOT NULL,
  cost_usd             NUMERIC(12, 8) NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Singleton budget row — always id = 1
CREATE TABLE IF NOT EXISTS ai_budget (
  id               INTEGER        PRIMARY KEY DEFAULT 1,
  total_spent_usd  NUMERIC(12, 8) NOT NULL DEFAULT 0,
  limit_usd        NUMERIC(12, 8) NOT NULL DEFAULT 10,
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT singleton CHECK (id = 1)
);

-- ── Seed data ─────────────────────────────────────────────────────────────────

INSERT INTO ai_budget (id, total_spent_usd, limit_usd)
VALUES (1, 0, 10)
ON CONFLICT (id) DO NOTHING;

-- ── Functions ─────────────────────────────────────────────────────────────────

-- Atomically increments budget spend and returns the new total.
-- Called via db.rpc("add_budget_spent", { amount_usd: ... })
CREATE OR REPLACE FUNCTION add_budget_spent(amount_usd NUMERIC)
RETURNS NUMERIC LANGUAGE plpgsql AS $$
DECLARE
  new_total NUMERIC;
BEGIN
  UPDATE ai_budget
  SET    total_spent_usd = total_spent_usd + amount_usd,
         updated_at      = NOW()
  WHERE  id = 1
  RETURNING total_spent_usd INTO new_total;
  RETURN new_total;
END;
$$;

-- Auto-update updated_at on recipe_ingredients rows
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recipe_ingredients_updated_at ON recipe_ingredients;
CREATE TRIGGER recipe_ingredients_updated_at
  BEFORE UPDATE ON recipe_ingredients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
