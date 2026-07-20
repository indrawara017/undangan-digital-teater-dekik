-- Menambahkan kolom creator (Karya) ke tabel events
ALTER TABLE events ADD COLUMN IF NOT EXISTS creator TEXT;
