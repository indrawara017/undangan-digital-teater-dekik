-- Jalankan skrip ini di SQL Editor Supabase Anda untuk menambahkan kolom kategori

ALTER TABLE public.guests 
ADD COLUMN category TEXT DEFAULT 'Umum';

-- (Opsional) Jika Anda sebelumnya sudah membuat kolom whatsapp, biarkan saja.
-- Jika belum, Anda juga bisa menjalankannya:
-- ALTER TABLE public.guests ADD COLUMN whatsapp TEXT;
