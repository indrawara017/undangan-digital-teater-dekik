import { supabase } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { CheckoutClient } from '@/app/(public)/events/[slug]/checkout/checkout-client';
import { getEventSlug } from '@/lib/assets';

export const revalidate = 0;

export const metadata = {
  title: 'Checkout Tiket — Teater Dekik',
};

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find event by slug
  const { data: events } = await supabase.from('events').select('*');
  const event = events?.find(e => getEventSlug(e.title) === slug);
  if (!event) notFound();

  // Fetch active tiers
  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!tiers || tiers.length === 0) {
    redirect(`/events/${slug}`);
  }

  return <CheckoutClient event={event} tiers={tiers} />;
}
