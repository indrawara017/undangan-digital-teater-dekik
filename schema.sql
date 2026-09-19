-- ==============================================================================
-- SKEMA DATABASE TERPADU: TEATER DEKIK (PORTAL RESMI, UNDANGAN & E-TIKET)
-- ==============================================================================
-- File ini merupakan gabungan terpadu dari seluruh skrip migrasi database:
-- - database-setup.sql
-- - database-v2.sql
-- - event-setup.sql
-- - admin-setup.sql
-- - add-category.sql
-- - add-gmaps.sql
-- - add-creator.sql
-- - add-audio-settings.sql
-- - add-checkin-columns.sql
-- - database-ticketing.sql
--
-- CARA PENGGUNAAN:
-- Salin seluruh isi file ini dan jalankan di SQL Editor pada Dashboard Supabase Anda.
-- Skrip ini dirancang IDEMPOTEN (aman dijalankan pada database baru maupun yang sudah ada).
-- ==============================================================================

-- 0. EKSTENSI POSTGRESQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. STORAGE BUCKET: ASSETS (Jalankan terpisah jika terjadi deadlock)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Catatan: Jika database Anda sudah berjalan aktif, lewati blok storage.objects
-- di bawah ini untuk menghindari konflik 'deadlock' dengan daemon Storage Supabase.
DO $$
BEGIN
  -- Storage Policies (Hanya jika belum ada)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read assets'
  ) THEN
    CREATE POLICY "Allow public read assets"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated uploads'
  ) THEN
    CREATE POLICY "Allow authenticated uploads"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'assets' AND 
        auth.role() = 'authenticated'
      );
  END IF;
END $$;


-- ==============================================================================
-- 2. TABEL: EVENTS (Pementasan / Panggung)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  creator TEXT,
  date TEXT,
  location TEXT,
  gmaps_url TEXT,
  description TEXT,
  is_audio_enabled BOOLEAN DEFAULT true,
  audio_url TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan seluruh kolom teranyar tersedia jika tabel sudah ada sebelumnya
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS creator TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gmaps_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_audio_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS spotify_url TEXT;


-- ==============================================================================
-- 3. TABEL: GUESTS (Daftar Tamu Undangan / Alumni)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'Umum',
  whatsapp TEXT,
  ai_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom kategori & whatsapp ada
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Umum';
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS ai_message TEXT;


-- ==============================================================================
-- 4. TABEL: INVITATIONS (Relasi Undangan per Event & RSVP Tamu)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(guest_id, event_id)
);

-- Pastikan kolom check-in ada
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;


-- ==============================================================================
-- 5. TABEL: MEMBERS (Anggota / Cast & Crew Komunitas Teater Dekik)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 6. TABEL: TICKET_TIERS (Kategori & Kuota Tiket per Pementasan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,                          -- e.g. "Presale", "Reguler", "VIP"
  description TEXT,                            -- Benefit kategori tiket
  price INTEGER NOT NULL DEFAULT 0,            -- Harga (IDR, 0 = gratis)
  quota INTEGER NOT NULL DEFAULT 0,            -- Total kapasitas tiket
  available_quota INTEGER NOT NULL DEFAULT 0,  -- Sisa tiket tersedia
  max_per_order INTEGER NOT NULL DEFAULT 5,    -- Batas pembelian per checkout
  sales_start TIMESTAMP WITH TIME ZONE,        -- Waktu mulai penjualan
  sales_end TIMESTAMP WITH TIME ZONE,          -- Waktu tutup penjualan
  is_active BOOLEAN DEFAULT true,              -- Status buka/tutup penjualan
  sort_order INTEGER DEFAULT 0,                -- Urutan tampil di katalog
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 7. TABEL: ORDERS (Transaksi Pemesanan Tiket Online)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,            -- Format: ORD-YYMM-XXXX
  event_id UUID REFERENCES public.events(id) NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT NOT NULL,                    -- Nomor WhatsApp pembeli
  total_amount INTEGER NOT NULL DEFAULT 0,      -- Total nominal pembayaran
  payment_method TEXT NOT NULL DEFAULT 'manual_transfer',
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'expired', 'rejected')),
  payment_proof_url TEXT,                       -- Bukti transfer di storage
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Waktu batas bayar
  paid_at TIMESTAMP WITH TIME ZONE,             -- Waktu konfirmasi pembayaran
  rejected_reason TEXT,                         -- Alasan penolakan jika ditolak
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 8. TABEL: TICKETS (E-Tiket Penonton dengan QR Code Unik)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_tier_id UUID REFERENCES public.ticket_tiers(id) NOT NULL,
  ticket_code TEXT NOT NULL UNIQUE,             -- e.g. "TIK-DEKIK-XXXXX"
  qr_code_hash TEXT NOT NULL UNIQUE,            -- Token unik scanner pintu masuk
  attendee_name TEXT NOT NULL,                  -- Nama penonton pemegang tiket
  is_checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 8.5 TABEL: MERCHANDISE (Official Merchandise Teater Dekik)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.merchandise (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Umum',
  image_url TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 9. FUNGSI DATABASE (STORED PROCEDURES)
-- ==============================================================================

-- 9.1 Pengurangan Kuota Tiket secara Atomik (Mencegah Race Condition / Overselling)
CREATE OR REPLACE FUNCTION public.decrease_quota_atomic(
  p_tier_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Row-level lock pada kategori tiket
  SELECT available_quota INTO v_available
  FROM public.ticket_tiers
  WHERE id = p_tier_id
  FOR UPDATE;

  IF v_available IS NULL THEN
    RAISE EXCEPTION 'Kategori tiket tidak ditemukan';
  END IF;

  IF v_available < p_quantity THEN
    RETURN false; -- Kuota tidak mencukupi
  END IF;

  UPDATE public.ticket_tiers
  SET available_quota = available_quota - p_quantity
  WHERE id = p_tier_id;

  RETURN true;
END;
$$;


-- 9.2 Pengembalian Kuota Tiket saat Pesanan Kedaluwarsa atau Ditolak
CREATE OR REPLACE FUNCTION public.restore_quota(
  p_order_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ticket_tiers tt
  SET available_quota = tt.available_quota + sub.cnt
  FROM (
    SELECT ticket_tier_id, COUNT(*)::INTEGER as cnt
    FROM public.tickets
    WHERE order_id = p_order_id
    GROUP BY ticket_tier_id
  ) sub
  WHERE tt.id = sub.ticket_tier_id;
END;
$$;


-- 9.3 Otomatisasi Kedaluwarsa Pesanan yang Melebihi Batas Waktu Bayar
CREATE OR REPLACE FUNCTION public.expire_pending_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_order RECORD;
BEGIN
  FOR v_order IN
    SELECT id FROM public.orders
    WHERE payment_status = 'pending'
      AND expires_at < now()
  LOOP
    -- Pulihkan kuota tiket kembali ke tier
    PERFORM public.restore_quota(v_order.id);
    
    -- Tandai status pesanan sebagai expired
    UPDATE public.orders
    SET payment_status = 'expired'
    WHERE id = v_order.id;
    
    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN v_expired_count;
END;
$$;


-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES
-- ==============================================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 10.1 Kebijakan Publik (Akses Publik / Frontend Pengunjung)
-- Events: Publik bisa melihat semua jadwal panggung
DROP POLICY IF EXISTS "Public read events" ON public.events;
DROP POLICY IF EXISTS "Allow public read access for events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

-- Guests: Publik bisa membaca data tamu untuk halaman undangan personal
DROP POLICY IF EXISTS "Public read guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public read access" ON public.guests;
CREATE POLICY "Public read guests" ON public.guests FOR SELECT USING (true);

-- Invitations: Publik bisa membaca undangan & memperbarui status RSVP
DROP POLICY IF EXISTS "Public read invitations" ON public.invitations;
CREATE POLICY "Public read invitations" ON public.invitations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update RSVP" ON public.invitations;
DROP POLICY IF EXISTS "Allow public update for RSVP" ON public.invitations;
CREATE POLICY "Public update RSVP" ON public.invitations FOR UPDATE USING (true);

-- Members: Publik bisa membaca daftar anggota komunitas & pengurus
DROP POLICY IF EXISTS "Public read members" ON public.members;
CREATE POLICY "Public read members" ON public.members FOR SELECT USING (true);

-- Ticket Tiers: Publik membaca tiket yang berstatus aktif
DROP POLICY IF EXISTS "Public read active tiers" ON public.ticket_tiers;
CREATE POLICY "Public read active tiers" ON public.ticket_tiers FOR SELECT USING (is_active = true);

-- Orders: Publik membuat pesanan baru, melihat pesanan sendiri, dan upload bukti bayar
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read own order" ON public.orders;
CREATE POLICY "Public read own order" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update own pending order" ON public.orders;
CREATE POLICY "Public update own pending order" ON public.orders FOR UPDATE USING (payment_status = 'pending');

-- Tickets: Publik membuat tiket saat checkout dan melihat tiket di pesanannya
DROP POLICY IF EXISTS "Public insert tickets" ON public.tickets;
CREATE POLICY "Public insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read tickets" ON public.tickets;
CREATE POLICY "Public read tickets" ON public.tickets FOR SELECT USING (true);


-- 10.2 Kebijakan Admin (Hak Akses Penuh bagi Admin Terautentikasi)
DROP POLICY IF EXISTS "Admin full events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated full access to events" ON public.events;
CREATE POLICY "Admin full events" ON public.events FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full guests" ON public.guests;
DROP POLICY IF EXISTS "Allow authenticated full access to guests" ON public.guests;
CREATE POLICY "Admin full guests" ON public.guests FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full invitations" ON public.invitations;
CREATE POLICY "Admin full invitations" ON public.invitations FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full members" ON public.members;
CREATE POLICY "Admin full members" ON public.members FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full ticket_tiers" ON public.ticket_tiers;
CREATE POLICY "Admin full ticket_tiers" ON public.ticket_tiers FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full orders" ON public.orders;
CREATE POLICY "Admin full orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full tickets" ON public.tickets;
CREATE POLICY "Admin full tickets" ON public.tickets FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read merchandise" ON public.merchandise;
CREATE POLICY "Public read merchandise" ON public.merchandise FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full merchandise" ON public.merchandise;
CREATE POLICY "Admin full merchandise" ON public.merchandise FOR ALL USING (auth.role() = 'authenticated');


-- ==============================================================================
-- 11. INDEXES (Optimasi Kinerja Query Database)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_guests_slug ON public.guests(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_guest ON public.invitations(guest_id);
CREATE INDEX IF NOT EXISTS idx_invitations_event ON public.invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON public.ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_expires ON public.orders(expires_at) WHERE payment_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_tickets_order ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON public.tickets(qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_tickets_checkin ON public.tickets(is_checked_in) WHERE is_checked_in = false;
CREATE INDEX IF NOT EXISTS idx_merchandise_event ON public.merchandise(event_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_active ON public.merchandise(is_active);
CREATE INDEX IF NOT EXISTS idx_merchandise_featured ON public.merchandise(is_featured);
