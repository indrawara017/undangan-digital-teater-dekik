-- Jalankan skrip ini di SQL Editor Supabase Anda untuk menambahkan kolom gmaps_url ke tabel events

ALTER TABLE public.events 
ADD COLUMN gmaps_url TEXT;
