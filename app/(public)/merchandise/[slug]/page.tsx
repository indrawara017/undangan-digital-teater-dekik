import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getGlobalConfig } from '@/lib/config';
import { MerchandiseDetailClient } from './merchandise-detail-client';

export const revalidate = 60;

export default async function MerchandiseDetailPage({ params }: PageProps<'/merchandise/[slug]'>) {
  const { slug } = await params;
  const [{ data: product }, config] = await Promise.all([
    supabase.from('merchandise').select('id, name, slug, description, price, stock, category, image_url, image_urls, variants, event_id, is_featured, events ( id, title )').eq('slug', slug).eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    getGlobalConfig(),
  ]);
  if (!product) notFound();
  return <MerchandiseDetailClient product={product} config={config} />;
}
