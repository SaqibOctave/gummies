-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Generic trigger function to keep updated_at columns current.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
