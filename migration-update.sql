-- ==============================================================================
-- MIGRASI PEMBARUAN: SISTEM E-TIKET ONLINE & YOUTUBE URL
-- ==============================================================================
-- Gunakan skrip ini jika database Teater Dekik Anda sudah berjalan sebelumnya.
-- Skrip ini HANYA menambahkan fitur baru (tanpa menyentuh skema storage),
-- sehingga DIJAMIN BEBAS dari error "deadlock detected".
-- ==============================================================================

-- 1. Tambah Kolom youtube_url pada Tabel Events (jika belum ada)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 2. Tabel Ticket Tiers (Kategori & Kuota Tiket per Pementasan)
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  quota INTEGER NOT NULL DEFAULT 0,
  available_quota INTEGER NOT NULL DEFAULT 0,
  max_per_order INTEGER NOT NULL DEFAULT 5,
  sales_start TIMESTAMP WITH TIME ZONE,
  sales_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Orders (Transaksi Pemesanan Tiket Online)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  event_id UUID REFERENCES public.events(id) NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT NOT NULL,
  total_amount INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'manual_transfer',
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'expired', 'rejected')),
  payment_proof_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Tickets (E-Tiket Penonton dengan QR Code Unik)
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_tier_id UUID REFERENCES public.ticket_tiers(id) NOT NULL,
  ticket_code TEXT NOT NULL UNIQUE,
  qr_code_hash TEXT NOT NULL UNIQUE,
  attendee_name TEXT NOT NULL,
  is_checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Stored Procedures (Fungsi Atomik Transaksi)
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
  SELECT available_quota INTO v_available
  FROM public.ticket_tiers
  WHERE id = p_tier_id
  FOR UPDATE;

  IF v_available IS NULL THEN
    RAISE EXCEPTION 'Kategori tiket tidak ditemukan';
  END IF;

  IF v_available < p_quantity THEN
    RETURN false;
  END IF;

  UPDATE public.ticket_tiers
  SET available_quota = available_quota - p_quantity
  WHERE id = p_tier_id;

  RETURN true;
END;
$$;

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
    PERFORM public.restore_quota(v_order.id);
    
    UPDATE public.orders
    SET payment_status = 'expired'
    WHERE id = v_order.id;
    
    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN v_expired_count;
END;
$$;

-- 6. Row Level Security (RLS)
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 6.1 Kebijakan Akses Publik
DROP POLICY IF EXISTS "Public read active tiers" ON public.ticket_tiers;
CREATE POLICY "Public read active tiers" ON public.ticket_tiers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read own order" ON public.orders;
CREATE POLICY "Public read own order" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public update own pending order" ON public.orders;
CREATE POLICY "Public update own pending order" ON public.orders FOR UPDATE USING (payment_status = 'pending');

DROP POLICY IF EXISTS "Public insert tickets" ON public.tickets;
CREATE POLICY "Public insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read tickets" ON public.tickets;
CREATE POLICY "Public read tickets" ON public.tickets FOR SELECT USING (true);

-- 6.2 Kebijakan Akses Admin
DROP POLICY IF EXISTS "Admin full ticket_tiers" ON public.ticket_tiers;
CREATE POLICY "Admin full ticket_tiers" ON public.ticket_tiers FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full orders" ON public.orders;
CREATE POLICY "Admin full orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full tickets" ON public.tickets;
CREATE POLICY "Admin full tickets" ON public.tickets FOR ALL USING (auth.role() = 'authenticated');

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON public.ticket_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_expires ON public.orders(expires_at) WHERE payment_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_tickets_order ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON public.tickets(qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_tickets_checkin ON public.tickets(is_checked_in) WHERE is_checked_in = false;
