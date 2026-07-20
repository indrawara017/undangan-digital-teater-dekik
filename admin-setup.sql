-- 1. Kebijakan agar Admin (yang sudah login) bisa Menambah, Mengubah, dan Menghapus data tamu
CREATE POLICY "Allow authenticated full access to guests" 
  ON public.guests FOR ALL 
  USING (auth.role() = 'authenticated');

-- 2. Kebijakan agar Admin bisa Mengunggah/Mengganti gambar di bucket 'assets'
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated updates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated deletes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );
