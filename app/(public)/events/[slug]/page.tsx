import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { EventDetailClient } from '@/app/(public)/events/[slug]/_components/event-detail-client';
import { getEventPosterUrl, getEventAssetUrl, getEventSlug, getEventSponsorUrl } from '@/lib/assets';
import { getGlobalConfig } from '@/lib/config';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: events } = await supabase.from('events').select('*');
  const event = events?.find(e => getEventSlug(e.title) === slug);
  if (!event) return { title: 'Pementasan Tidak Ditemukan' };
  return {
    title: `${event.title} — Teater Dekik`,
    description: event.description || `Detail pementasan ${event.title} oleh Teater Dekik.`,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch all events and find matching one by slug
  const { data: events } = await supabase.from('events').select('*');
  const event = events?.find(e => getEventSlug(e.title) === slug);
  if (!event) notFound();

  // Fetch ticket tiers for this event
  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // Fetch cast & actors for this specific event with multi-source fallback:
  // 1. ${event.id}/event_cast.json (assigned cast from admin)
  // 2. ${event.id}/cast folder in Supabase Storage
  // 3. global/cast_members.json
  // 4. members table in database
  let cast: Array<{ id: string; name: string; role: string; photoUrl: string }> = [];

  try {
    const { data: eventCastData } = await supabase.storage
      .from('assets')
      .download(`${event.id}/event_cast.json`);
    if (eventCastData) {
      const parsed = JSON.parse(await eventCastData.text());
      if (Array.isArray(parsed) && parsed.length > 0) {
        cast = parsed.map((m: any) => ({
          id: m.memberId || m.id || m.name,
          name: m.name,
          role: m.role || 'Pemeran / Tim',
          photoUrl: m.photoUrl || '',
        }));
      }
    }
  } catch (e) {}

  if (cast.length === 0) {
    try {
      const { data: castFiles } = await supabase.storage
        .from('assets')
        .list(`${event.id}/cast`);
      if (castFiles) {
        const validFiles = castFiles.filter(
          f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder'
        );
        if (validFiles.length > 0) {
          cast = validFiles.map(f => ({
            id: f.name,
            name: f.name.split('.')[0].replace(/[-_]/g, ' '),
            role: 'Pemeran / Tim',
            photoUrl: getEventAssetUrl(event.id, `cast/${f.name}`),
          }));
        }
      }
    } catch (e) {}
  }

  if (cast.length === 0) {
    try {
      const { data: globalData } = await supabase.storage
        .from('assets')
        .download('global/cast_members.json');
      if (globalData) {
        const parsed = JSON.parse(await globalData.text());
        if (Array.isArray(parsed) && parsed.length > 0) {
          cast = parsed.map((m: any) => ({
            id: m.id || m.name,
            name: m.name,
            role: m.role || 'Anggota Teater Dekik',
            photoUrl: m.photoUrl || '',
          }));
        }
      }
    } catch (e) {}
  }

  if (cast.length === 0) {
    const { data: dbMembers } = await supabase
      .from('members')
      .select('id, name, position, photo_url')
      .limit(30);
    if (dbMembers && dbMembers.length > 0) {
      cast = dbMembers.map(m => ({
        id: m.id,
        name: m.name,
        role: m.position || 'Anggota Teater Dekik',
        photoUrl: m.photo_url || '',
      }));
    }
  }

  // Ambil poster dari Supabase Storage (${event.id}/design.jpg)
  // Sama dengan poster yang diunggah di Admin Visual & Desain
  let posterUrl: string | null = null;
  const { data: eventFiles } = await supabase.storage
    .from('assets')
    .list(event.id);

  const posterFile = eventFiles?.find(f => 
    f.name === 'design.jpg' || f.name.startsWith('design.') || f.name.startsWith('poster.')
  );

  if (posterFile) {
    posterUrl = getEventAssetUrl(event.id, posterFile.name);
  } else {
    // Default URL poster panggung yang seragam
    posterUrl = getEventPosterUrl(event.id);
  }

  // Fetch sponsors for this stage (${event.id}/sponsors)
  const { data: sponsorFiles } = await supabase.storage
    .from('assets')
    .list(`${event.id}/sponsors`);

  const sponsors = (sponsorFiles || [])
    .filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder')
    .map(f => ({
      name: f.name,
      displayName: f.name.split('---')[0],
      url: getEventSponsorUrl(event.id, f.name),
    }));

  // Fetch merchandise specifically tied to this event
  const { data: eventMerchandise } = await supabase
    .from('merchandise')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const config = await getGlobalConfig();

  return (
    <EventDetailClient
      event={event}
      tiers={tiers || []}
      cast={cast}
      posterUrl={posterUrl}
      sponsors={sponsors}
      merchandise={eventMerchandise || []}
      config={config}
    />
  );
}
