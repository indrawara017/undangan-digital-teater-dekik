-- 1. Create the guests table
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
  ai_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on the table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the guests table
-- Allow anyone to read the guest data (needed for the magic link)
CREATE POLICY "Allow public read access" 
  ON public.guests FOR SELECT 
  USING (true);

-- Allow anyone to update the RSVP status (needed when alumni click the RSVP button)
CREATE POLICY "Allow public update for RSVP" 
  ON public.guests FOR UPDATE 
  USING (true);

-- 4. Create a public storage bucket for our assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true);

-- 5. Create storage policies for the assets bucket
-- Allow public to read the assets (so the images show up on the website)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'assets' );

-- Note: We will handle upload permissions later via the admin dashboard auth.
