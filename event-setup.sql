-- 1. Membuat tabel events
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Mengaktifkan RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan publik bisa melihat event
CREATE POLICY "Allow public read access for events" 
  ON public.events FOR SELECT USING (true);

-- 4. Kebijakan admin bisa mengelola event
CREATE POLICY "Allow authenticated full access to events" 
  ON public.events FOR ALL USING (auth.role() = 'authenticated');

-- 5. Menambahkan relasi event ke tamu
ALTER TABLE public.guests ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
