-- Storage-agnostic media abstraction. `storage_driver` + `storage_key` let a
-- future MinIO/S3 provider be plugged in without changing any business logic
-- that references media by id.
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_driver TEXT NOT NULL DEFAULT 'local' CHECK (storage_driver IN ('local', 'minio')),
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  uploaded_by UUID REFERENCES admins (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_storage_driver ON media (storage_driver);
