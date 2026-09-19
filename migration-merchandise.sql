-- =====================================================
-- MIGRASI DATABASE: Modul Merchandise Teater Dekik
-- =====================================================
-- Jalankan skrip ini di Supabase SQL Editor untuk membuat
-- tabel dan hak akses merchandise resmi Teater Dekik.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.merchandise (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Umum',
  image_url TEXT,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

-- Hak Akses Publik (Melihat Katalog)
DROP POLICY IF EXISTS "Public read merchandise" ON public.merchandise;
CREATE POLICY "Public read merchandise" 
ON public.merchandise 
FOR SELECT 
USING (true);

-- Hak Akses Admin (Kelola Produk)
DROP POLICY IF EXISTS "Admin full merchandise" ON public.merchandise;
CREATE POLICY "Admin full merchandise" 
ON public.merchandise 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Indeks untuk Performa Query
CREATE INDEX IF NOT EXISTS idx_merchandise_event ON public.merchandise(event_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_active ON public.merchandise(is_active);
CREATE INDEX IF NOT EXISTS idx_merchandise_featured ON public.merchandise(is_featured);
