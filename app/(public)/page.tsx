import { supabase } from '@/lib/supabase';
import { HomeClient } from '@/app/(public)/_components/home-client';
import { getGlobalConfig } from '@/lib/config';
import { getEventSponsorUrl } from '@/lib/assets';

export const revalidate = 0;

export const metadata = {
  title: 'Teater Dekik',
  description: 'Teater Dekik. Lihat jadwal pementasan, beli tiket online, dan kenali lebih dekat komunitas teater kami.',
};

export default async function HomePage() {
  const { data: events } = await supabase
    .from('events')
    .select('*, ticket_tiers ( available_quota )')
    .order('date', { ascending: true });

  const config = await getGlobalConfig();

  let sponsors: Array<{ name: string; displayName: string; url: string }> = [];
  if (events && events.length > 0) {
    for (const ev of events) {
      const { data: sponsorFiles } = await supabase.storage
        .from('assets')
        .list(`${ev.id}/sponsors`);

      if (sponsorFiles && sponsorFiles.length > 0) {
        const valid = sponsorFiles
          .filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder')
          .map(f => ({
            name: f.name,
            displayName: f.name.split('---')[0].replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            url: getEventSponsorUrl(ev.id, f.name),
          }));

        if (valid.length > 0) {
          for (const item of valid) {
            if (!sponsors.some(s => s.displayName.toLowerCase() === item.displayName.toLowerCase())) {
              sponsors.push(item);
            }
          }
        }
      }
    }
  }

  const { data: merchandise } = await supabase
    .from('merchandise')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <HomeClient
      events={events || []}
      config={config}
      sponsors={sponsors}
      sponsorLogos={sponsors.map(s => s.url)}
      merchandise={merchandise || []}
      referenceTime={Date.now()}
    />
  );
}
