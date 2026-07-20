import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GuestClient from './GuestClient';
import { Metadata } from 'next';

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: guests } = await supabase.from('guests').select('name, slug');
  if (!guests) return { title: 'Undangan Tidak Ditemukan' };
  
  const guest = guests
    .sort((a, b) => b.slug.length - a.slug.length)
    .find(g => slug.startsWith(g.slug));

  if (!guest) return { title: 'Undangan Tidak Ditemukan' };

  return {
    title: `Undangan Spesial untuk ${guest.name} | Teater Dekik`,
  };
}

export default async function GuestPage({ params }: Props) {
  const resolvedParams = await params;
  
  // 1. Ambil semua guests untuk mencocokkan prefix
  const { data: guests } = await supabase.from('guests').select('*');
  if (!guests) notFound();

  // Sort descending by length so longer slugs match first (e.g. 'budi-santoso' before 'budi')
  const guest = guests
    .sort((a, b) => b.slug.length - a.slug.length)
    .find(g => resolvedParams.slug.startsWith(g.slug));

  if (!guest) notFound();

  // 2. Ekstrak event slug dari sisa string (jika ada)
  let targetEventId = null;
  const eventSlugPart = resolvedParams.slug.substring(guest.slug.length).replace(/^-/, ''); // remove leading dash if present
  
  if (eventSlugPart) {
    const { data: events } = await supabase.from('events').select('*');
    if (events) {
      const targetEvent = events.find(e => {
        const eSlug = e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return eSlug === eventSlugPart;
      });
      if (targetEvent) targetEventId = targetEvent.id;
    }
  }

  // 3. Cari undangan
  let query = supabase.from('invitations').select('*, events(*)').eq('guest_id', guest.id);
  
  if (targetEventId) {
    query = query.eq('event_id', targetEventId);
  } else {
    // Fallback: ambil undangan terbaru jika URL tidak mencantumkan event slug secara valid
    query = query.order('created_at', { ascending: false }).limit(1);
  }

  const { data: invitations } = await query;
  const targetInvitation = invitations?.[0];

  if (!targetInvitation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center font-inter">
        <div>
          <h1 className="text-2xl font-cormorant mb-4">Halo, {guest.name}</h1>
          <p className="text-neutral-400">Undangan pementasan ini tidak ditemukan atau belum tersedia.</p>
        </div>
      </div>
    );
  }

  // Pass the public URL of the assets bucket with event ID
  const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${targetInvitation.event_id}`;

  return (
    <GuestClient
      guest={guest}
      invitation={targetInvitation}
      event={targetInvitation.events}
      bucketUrl={bucketUrl}
    />
  );
}
