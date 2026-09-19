-- Run this in the Supabase SQL editor after migration-merchandise.sql.
-- The legacy image_url remains the primary/cover image for backwards compatibility.
ALTER TABLE public.merchandise
  ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.merchandise
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND image_urls = '[]'::jsonb;
