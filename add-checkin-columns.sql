-- Tambahkan kolom check-in pada tabel invitations di Supabase
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;
