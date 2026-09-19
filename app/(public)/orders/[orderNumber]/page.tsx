import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { OrderStatusClient } from '@/app/(public)/orders/[orderNumber]/order-status-client';
import { getGlobalConfig } from '@/lib/config';

export const revalidate = 0;

export const metadata = {
  title: 'Status Pesanan — Teater Dekik',
};

export default async function OrderStatusPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  const config = await getGlobalConfig();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, events(title, date, location)')
    .eq('order_number', orderNumber)
    .single();

  if (error || !order) notFound();

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, ticket_tiers(name, price)')
    .eq('order_id', order.id);

  return <OrderStatusClient order={order} tickets={tickets || []} config={config} />;
}
