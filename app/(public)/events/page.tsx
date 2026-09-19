import { supabase } from '@/lib/supabase';
import { EventsClient } from '@/app/(public)/events/_components/events-client';

export const revalidate = 0;

export const metadata = {
  title: 'Jadwal Pementasan — Teater Dekik',
  description: 'Lihat jadwal pementasan mendatang dan arsip pementasan Teater Dekik. Pesan tiket langsung secara online.',
};

export default async function EventsPage() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  return <EventsClient events={events || []} />;
}
