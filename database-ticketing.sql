-- =====================================================
-- MIGRASI DATABASE: Sistem Tiket Digital Teater Dekik
-- =====================================================
-- Jalankan SQL ini di Supabase SQL Editor setelah
-- database-v2.sql sudah aktif.
-- =====================================================

-- 1. Tabel Kategori/Jenis Tiket per Event
CREATE TABLE public.ticket_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,                          -- e.g. "Presale", "Reguler", "VIP"
  description TEXT,                            -- Deskripsi benefit tiket
  price INTEGER NOT NULL DEFAULT 0,            -- Harga dalam IDR (0 = gratis)
  quota INTEGER NOT NULL DEFAULT 0,            -- Total kapasitas tiket
  available_quota INTEGER NOT NULL DEFAULT 0,  -- Sisa tiket tersedia
  max_per_order INTEGER NOT NULL DEFAULT 5,    -- Maks pembelian per transaksi
  sales_start TIMESTAMP WITH TIME ZONE,        -- Waktu mulai penjualan
  sales_end TIMESTAMP WITH TIME ZONE,          -- Waktu tutup penjualan
  is_active BOOLEAN DEFAULT true,              -- Toggle buka/tutup penjualan
  sort_order INTEGER DEFAULT 0,                -- Urutan tampil di halaman
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Pesanan (Order)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,            -- e.g. "ORD-202609-XXXX"
  event_id UUID REFERENCES public.events(id) NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT NOT NULL,                    -- Nomor WhatsApp pembeli
  total_amount INTEGER NOT NULL DEFAULT 0,      -- Total pembayaran (IDR)
  payment_method TEXT NOT NULL DEFAULT 'manual_transfer',
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'expired', 'rejected')),
  payment_proof_url TEXT,                       -- URL bukti transfer di Supabase Storage
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Batas waktu pembayaran
  paid_at TIMESTAMP WITH TIME ZONE,             -- Waktu pembayaran dikonfirmasi
  rejected_reason TEXT,                         -- Alasan penolakan (opsional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Tiket Individual (satu tiket per penonton)
CREATE TABLE public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_tier_id UUID REFERENCES public.ticket_tiers(id) NOT NULL,
  ticket_code TEXT NOT NULL UNIQUE,             -- e.g. "TIK-DEKIK-A1B2C"
  qr_code_hash TEXT NOT NULL UNIQUE,            -- Token unik untuk QR scanner
  attendee_name TEXT NOT NULL,                  -- Nama pemegang tiket
  is_checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- FUNGSI ATOMIK: Pengurangan Kuota Tiket
-- Mencegah race condition / overselling
-- =====================================================
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
  -- Lock baris tier agar tidak ada transaksi lain yang mengubah bersamaan
  SELECT available_quota INTO v_available
  FROM public.ticket_tiers
  WHERE id = p_tier_id
  FOR UPDATE;

  IF v_available IS NULL THEN
    RAISE EXCEPTION 'Kategori tiket tidak ditemukan';
  END IF;

  IF v_available < p_quantity THEN
    RETURN false; -- Kuota tidak cukup
  END IF;

  UPDATE public.ticket_tiers
  SET available_quota = available_quota - p_quantity
  WHERE id = p_tier_id;

  RETURN true;
END;
$$;

-- =====================================================
-- FUNGSI: Kembalikan Kuota saat Pesanan Kedaluwarsa/Ditolak
-- =====================================================
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

-- =====================================================
-- FUNGSI: Auto-expire pesanan yang melewati batas waktu
-- Dipanggil via Supabase CRON atau Edge Function
-- =====================================================
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
    -- Kembalikan kuota tiket
    PERFORM public.restore_quota(v_order.id);
    
    -- Update status ke expired
    UPDATE public.orders
    SET payment_status = 'expired'
    WHERE id = v_order.id;
    
    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN v_expired_count;
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Aktifkan RLS
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- TICKET_TIERS: Publik bisa baca tier aktif, Admin bisa semua
CREATE POLICY "Public read active tiers"
  ON public.ticket_tiers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full ticket_tiers"
  ON public.ticket_tiers FOR ALL
  USING (auth.role() = 'authenticated');

-- ORDERS: Publik bisa buat pesanan baru & baca pesanan sendiri via order_number
CREATE POLICY "Public insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read own order"
  ON public.orders FOR SELECT
  USING (true);

CREATE POLICY "Public update own pending order"
  ON public.orders FOR UPDATE
  USING (payment_status = 'pending');

CREATE POLICY "Admin full orders"
  ON public.orders FOR ALL
  USING (auth.role() = 'authenticated');

-- TICKETS: Publik bisa buat tiket baru & baca tiket di pesanannya
CREATE POLICY "Public insert tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read tickets"
  ON public.tickets FOR SELECT
  USING (true);

CREATE POLICY "Admin full tickets"
  ON public.tickets FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- INDEXES untuk performa query
-- =====================================================
CREATE INDEX idx_ticket_tiers_event ON public.ticket_tiers(event_id);
CREATE INDEX idx_orders_event ON public.orders(event_id);
CREATE INDEX idx_orders_status ON public.orders(payment_status);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_expires ON public.orders(expires_at) WHERE payment_status = 'pending';
CREATE INDEX idx_tickets_order ON public.tickets(order_id);
CREATE INDEX idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX idx_tickets_qr ON public.tickets(qr_code_hash);
CREATE INDEX idx_tickets_checkin ON public.tickets(is_checked_in) WHERE is_checked_in = false;
