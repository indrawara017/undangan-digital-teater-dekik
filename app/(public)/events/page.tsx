import { supabase } from '@/lib/supabase';
import { EventsClient } from '@/app/(public)/events/_components/events-client';

export const revalidate = 0;

export const metadata = {
  title: 'Jadwal Pementasan — Teater Dekik',
  description: 'Lihat seluruh pementasan Teater Dekik, dengan jadwal yang tiketnya tersedia ditampilkan paling awal.',
};

export default async function EventsPage() {
  const { data: events } = await supabase
    .from('events')
    .select('*, ticket_tiers ( available_quota )')
    .order('date', { ascending: false });

  return <EventsClient events={events || []} referenceTime={Date.now()} />;
}
