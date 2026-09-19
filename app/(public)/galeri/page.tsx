import { supabase } from '@/lib/supabase';
import { GaleriClient } from '@/app/(public)/galeri/galeri-client';
import { getEventAssetUrl } from '@/lib/assets';

export const revalidate = 0;

export const metadata = {
  title: 'Galeri Dokumentasi — Teater Dekik',
  description: 'Galeri dokumentasi pementasan dan kegiatan panggung Teater Dekik.',
};

export default async function GaleriPage() {
  // Fetch events to get gallery folders
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date')
    .order('date', { ascending: false });

  const galleries: { eventTitle: string; eventDate: string; images: string[] }[] = [];

  if (events) {
    for (const event of events) {
      let images: string[] = [];

      // 1. Cek folder khusus gallery ({eventId}/gallery)
      const { data: files } = await supabase.storage
        .from('assets')
        .list(`${event.id}/gallery`);

      if (files && files.length > 0) {
        images = files
          .filter(f => f.name !== '.emptyFolderPlaceholder' && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
          .map(f => getEventAssetUrl(event.id, `gallery/${f.name}`));
      }

      // 2. Jika tidak ada folder gallery khusus, agregasikan aset visual pementasan (poster, latar, cast)
      if (images.length === 0) {
        const { data: eventFiles } = await supabase.storage
          .from('assets')
          .list(event.id);

        if (eventFiles) {
          const visualFiles = eventFiles.filter(f => 
            (f.name.startsWith('design.') || f.name.startsWith('background.') || f.name.startsWith('ticket.')) &&
            /\.(jpg|jpeg|png|webp)$/i.test(f.name)
          );

          images = visualFiles.map(f => getEventAssetUrl(event.id, f.name));
        }

        // Cek juga foto cast ({eventId}/cast) jika ada
        const { data: castFiles } = await supabase.storage
          .from('assets')
          .list(`${event.id}/cast`);

        if (castFiles) {
          const validCast = castFiles
            .filter(f => f.name !== '.emptyFolderPlaceholder' && /\.(jpg|jpeg|png|webp)$/i.test(f.name))
            .map(f => getEventAssetUrl(event.id, `cast/${f.name}`));
          images = [...images, ...validCast];
        }
      }

      if (images.length > 0) {
        galleries.push({
          eventTitle: event.title,
          eventDate: event.date,
          images,
        });
      }
    }
  }

  return <GaleriClient galleries={galleries} />;
}
