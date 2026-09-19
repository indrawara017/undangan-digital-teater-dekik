import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { getGlobalConfig } from '@/lib/config';
import { MerchandiseClient } from '@/app/(public)/merchandise/merchandise-client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Teater Dekik Merchandise',
  description: 'Katalog merchandise, kaos pementasan, buku naskah drama, dan cinderamata resmi Teater Dekik.',
};

export default async function MerchandisePage() {
  const [merchRes, eventsRes, config] = await Promise.all([
    supabase
      .from('merchandise')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        stock,
        category,
        image_url,
        image_urls,
        variants,
        event_id,
        is_active,
        is_featured,
        created_at,
        events (
          id,
          title
        )
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('events')
      .select('id, title, date')
      .order('created_at', { ascending: false }),
    getGlobalConfig(),
  ]);

  const products = merchRes.data || [];
  const events = eventsRes.data || [];

  return <MerchandiseClient products={products} events={events} config={config} />;
}
