-- Hapus tabel lama agar kita bisa membangun ulang dengan relasi yang benar
DROP TABLE IF EXISTS public.invitations;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- 1. Tabel Master Tamu (Database Alumni Seumur Hidup)
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ai_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Master Event
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Relasi (Penyatuan Tamu & Event sekaligus menyimpan status RSVP)
CREATE TABLE public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(guest_id, event_id) -- Memastikan 1 tamu hanya diundang 1 kali per event
);

-- Aktifkan RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Kebijakan Publik (Untuk pengunjung melihat undangan)
CREATE POLICY "Public read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read invitations" ON public.invitations FOR SELECT USING (true);
CREATE POLICY "Public update RSVP" ON public.invitations FOR UPDATE USING (true);

-- Kebijakan Admin (Untuk dashboard)
CREATE POLICY "Admin full guests" ON public.guests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full events" ON public.events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full invitations" ON public.invitations FOR ALL USING (auth.role() = 'authenticated');
