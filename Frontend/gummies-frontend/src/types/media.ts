export interface Media {
  id: string
  file_name: string
  original_name: string
  mime_type: string
  size_bytes: number
  storage_driver: 'local' | 'minio'
  storage_key: string
  url: string
  alt_text: string | null
  uploaded_by: string | null
  created_at: string
}
