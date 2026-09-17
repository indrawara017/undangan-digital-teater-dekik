import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GuestClient from './_components/guest-client';
import { Metadata } from 'next';

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (resolvedParams.slug === 'preview') {
    return { title: 'Pratinjau Undangan | Teater Dekik' };
  }

  const { data: guests } = await supabase.from('guests').select('name, slug');
  if (!guests) return { title: 'Undangan Tidak Ditemukan' };
  
  const guest = guests
    .sort((a, b) => b.slug.length - a.slug.length)
    .find(g => resolvedParams.slug.startsWith(g.slug));

  if (!guest) return { title: 'Undangan Tidak Ditemukan' };

  return {
    title: `Undangan Spesial untuk ${guest.name} | Teater Dekik`,
  };
}

export default async function GuestPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const eventIdParam = resolvedSearchParams.event as string;

  // 1. Tangani Mode Pratinjau (Preview)
  if (slug === 'preview') {
    if (!eventIdParam) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <p className="text-red-500 font-cormorant text-2xl tracking-widest">
            PARAMETER EVENT TIDAK DITEMUKAN
          </p>
        </div>
      );
    }

    const { data: eventData } = await supabase.from('events').select('*').eq('id', eventIdParam).single();
    
    if (!eventData) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <p className="text-red-500 font-cormorant text-2xl tracking-widest">
            EVENT TIDAK DITEMUKAN
          </p>
        </div>
      );
    }

    // Dummy Guest Data for Preview
    const dummyGuest = {
      id: 'dummy',
      name: '[Nama Tamu Undangan]',
      slug: 'preview',
      category: 'Tamu Umum',
      gender: 'Laki-laki',
      invitation_method: 'whatsapp',
      status: 'pending'
    };

    const dummyInvitation = {
      id: 'dummy_inv',
      guest_id: 'dummy',
      event_id: eventIdParam,
      rsvp_status: 'pending',
      checked_in: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${eventIdParam}`;

    return (
      <GuestClient
        guest={dummyGuest}
        invitation={dummyInvitation}
        event={eventData}
        bucketUrl={bucketUrl}
        isPreview={true}
      />
    );
  }

  // 2. Tangani Mode Undangan Sungguhan
  const { data: guests } = await supabase.from('guests').select('*');
  if (!guests) notFound();

  // Sort descending by length so longer slugs match first (e.g. 'budi-santoso' before 'budi')
  const guest = guests
    .sort((a, b) => b.slug.length - a.slug.length)
    .find(g => slug.startsWith(g.slug));

  if (!guest) notFound();

  // Ekstrak event slug dari sisa string (jika ada)
  let targetEventId = null;
  const eventSlugPart = slug.substring(guest.slug.length).replace(/^-/, ''); // remove leading dash if present
  
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

  // Cari undangan
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-2xl">
          <h1 className="text-2xl font-bold font-cormorant mb-3 text-white">Halo, {guest.name}</h1>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Undangan pementasan ini tidak ditemukan atau belum tersedia.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-sm font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${targetInvitation.event_id}`;

  return (
    <GuestClient
      guest={guest}
      invitation={targetInvitation}
      event={targetInvitation.events}
      bucketUrl={bucketUrl}
      isPreview={false}
    />
  );
}
