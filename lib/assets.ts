/**
 * Utilitas Terpusat untuk URL Aset Supabase Storage Teater Dekik.
 * 
 * Standar Struktur Penyimpanan (Bucket: 'assets'):
 * - Poster panggung:       {eventId}/design.jpg
 * - Visual background:     {eventId}/background.jpg
 * - Desain tiket:          {eventId}/ticket.jpg
 * - Soundtrack panggung:   {eventId}/music.mp3
 * - Logo panggung:         {eventId}/logos/{fileName}
 * - Sponsor panggung:      {eventId}/sponsors/{fileName}
 * - Foto pemeran/cast:     {eventId}/cast/{fileName}
 * - Metadata peran cast:   {eventId}/event_cast.json
 * 
 * Dengan utilitas ini, seluruh halaman (Admin, Undangan Tamu, Portal Publik,
 * Detail Event, Beranda, Katalog Pementasan) menggunakan sumber yang seragam
 * sehingga poster pementasan TIDAK perlu diunggah 2 kali.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

/**
 * Mengambil URL publik poster pementasan.
 * Mengacu ke file 'design.jpg' di folder event terkait.
 */
export function getEventPosterUrl(eventId: string, cacheBust?: number | string): string {
  if (!eventId) return '';
  const url = `${SUPABASE_URL}/storage/v1/object/public/assets/${eventId}/design.jpg`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}

/**
 * Mengambil URL publik untuk aset umum pementasan (design.jpg, background.jpg, ticket.jpg, dsb).
 */
export function getEventAssetUrl(eventId: string, fileName: string, cacheBust?: number | string): string {
  if (!eventId || !fileName) return '';
  const url = `${SUPABASE_URL}/storage/v1/object/public/assets/${eventId}/${fileName}`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}

/**
 * Mengambil URL publik gambar background pementasan.
 */
export function getEventBackgroundUrl(eventId: string, cacheBust?: number | string): string {
  if (!eventId) return '';
  const url = `${SUPABASE_URL}/storage/v1/object/public/assets/${eventId}/background.jpg`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}

/**
 * Mengambil URL publik gambar desain tiket pementasan.
 */
export function getEventTicketUrl(eventId: string, cacheBust?: number | string): string {
  if (!eventId) return '';
  const url = `${SUPABASE_URL}/storage/v1/object/public/assets/${eventId}/ticket.jpg`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}

/**
 * Mengambil URL publik untuk sponsor pementasan.
 */
export function getEventSponsorUrl(eventId: string, fileName: string, cacheBust?: number | string): string {
  if (!eventId || !fileName) return '';
  const url = `${SUPABASE_URL}/storage/v1/object/public/assets/${eventId}/sponsors/${fileName}`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}

/**
 * Mengambil URL publik soundtrack musik pementasan.
 */
export function getEventMusicUrl(eventId: string, cacheBust?: number | string): string {
  if (!eventId) return '';
  const url = `${SUPABASE_URL}/storage/v1/object/public/assets/${eventId}/music.mp3`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}

/**
 * Mengambil URL publik untuk aset global (avatar pemeran, logo, dsb).
 */
export function getGlobalAssetUrl(path: string, cacheBust?: number | string): string {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${SUPABASE_URL}/storage/v1/object/public/assets/${cleanPath}`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}

/**
 * Mengonversi judul pementasan atau teks menjadi slug URL yang bersih dan terstandarisasi.
 * Menghindari perbedaan regex di berbagai halaman.
 */
export function getEventSlug(titleOrEvent: { title: string } | string): string {
  const title = typeof titleOrEvent === 'string' ? titleOrEvent : titleOrEvent?.title || '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Mengonversi tautan Spotify (Album, Track, Playlist) menjadi URL Embed resmi.
 * Contoh: https://open.spotify.com/album/4aawy... -> https://open.spotify.com/embed/album/4aawy...?utm_source=generator&theme=0
 */
export function getSpotifyEmbedUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.includes('open.spotify.com/embed/')) return trimmed;

  const match = trimmed.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
  if (match) {
    const type = match[1];
    const id = match[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }
  return null;
}

/**
 * Mendapatkan URL publik foto merchandise dari path storage atau URL langsung.
 */
export function getMerchandiseImageUrl(imageUrlOrPath?: string | null, cacheBust?: number | string): string {
  if (!imageUrlOrPath) return '/logo.png';
  if (imageUrlOrPath.startsWith('http://') || imageUrlOrPath.startsWith('https://')) {
    return cacheBust ? `${imageUrlOrPath}?t=${cacheBust}` : imageUrlOrPath;
  }
  return getGlobalAssetUrl(imageUrlOrPath, cacheBust);
}
