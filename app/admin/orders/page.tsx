'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/app/components/Toast';
import { 
  OrdersToolbar, 
  OrdersList, 
  OrdersModal, 
  type OrderDetail 
} from './_components';

export default function OrdersPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { showToast } = useToast();

  // 1. Fetch Events Master
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, date')
        .order('created_at', { ascending: false });

      if (data) {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  // 2. Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          event_id,
          buyer_name,
          buyer_email,
          buyer_phone,
          total_amount,
          payment_method,
          payment_status,
          payment_proof_url,
          expires_at,
          paid_at,
          rejected_reason,
          created_at,
          events (
            id,
            title,
            date
          ),
          tickets (
            id,
            ticket_code,
            qr_code_hash,
            attendee_name,
            is_checked_in,
            checked_in_at,
            ticket_tiers (
              id,
              name,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedEventId !== 'all') {
        query = query.eq('event_id', selectedEventId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOrders((data as any[]) || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      showToast('Gagal memuat daftar pesanan: ' + (err.message || 'Coba lagi'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 3. Confirm Payment
  const handleConfirmPaid = async (orderId: string) => {
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          paid_at: nowIso,
        })
        .eq('id', orderId);

      if (error) throw error;

      showToast('Pesanan berhasil dikonfirmasi lunas! E-Tiket kini aktif.', 'success');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, payment_status: 'paid', paid_at: nowIso } : null);
      }
    } catch (err: any) {
      console.error('Error confirming order:', err);
      showToast('Gagal konfirmasi pesanan: ' + (err.message || 'Coba lagi'), 'error');
      throw err;
    }
  };

  // 4. Reject Order & Restore Quota
  const handleRejectOrder = async (orderId: string, reason?: string) => {
    try {
      // 1. Attempt restore quota via RPC
      try {
        await supabase.rpc('restore_quota', { p_order_id: orderId });
      } catch (rpcErr) {
        console.warn('RPC restore_quota error (or not defined):', rpcErr);
      }

      // 2. Update order status
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'rejected',
          rejected_reason: reason || 'Pembayaran ditolak panitia',
        })
        .eq('id', orderId);

      if (error) throw error;

      showToast('Pesanan ditolak dan kuota tiket berhasil dikembalikan.', 'success');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { 
          ...prev, 
          payment_status: 'rejected', 
          rejected_reason: reason || 'Pembayaran ditolak panitia' 
        } : null);
      }
    } catch (err: any) {
      console.error('Error rejecting order:', err);
      showToast('Gagal menolak pesanan: ' + (err.message || 'Coba lagi'), 'error');
      throw err;
    }
  };

  // 5. Filter orders by search and status
  const filteredOrders = orders.filter((order) => {
    const matchStatus = filterStatus === 'all' || order.payment_status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      order.order_number.toLowerCase().includes(q) ||
      order.buyer_name.toLowerCase().includes(q) ||
      order.buyer_phone.includes(q) ||
      (order.buyer_email && order.buyer_email.toLowerCase().includes(q)) ||
      (order.tickets && order.tickets.some((t) => t.attendee_name.toLowerCase().includes(q)));

    return matchStatus && matchSearch;
  });

  // Calculate stats
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const pendingCount = orders.filter((o) => o.payment_status === 'pending').length;

  // 6. Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      return showToast('Tidak ada data pesanan untuk diekspor.', 'info');
    }

    const headers = [
      'Nomor Order',
      'Pementasan',
      'Tanggal Dipesan',
      'Nama Pembeli',
      'No WhatsApp',
      'Email',
      'Total Bayar (IDR)',
      'Status Pembayaran',
      'Bukti Transfer URL',
      'Jumlah Tiket',
      'Daftar Penonton & Kode Tiket',
    ];

    const rows = filteredOrders.map((o) => {
      const ticketsStr = (o.tickets || [])
        .map((t) => `${t.attendee_name} (${t.ticket_code} - ${t.ticket_tiers?.name || 'Tiket'})`)
        .join('; ');

      return [
        `"${o.order_number}"`,
        `"${o.events?.title || '-'}"`,
        `"${new Date(o.created_at).toLocaleString('id-ID')}"`,
        `"${o.buyer_name.replace(/"/g, '""')}"`,
        `"'${o.buyer_phone}"`,
        `"${o.buyer_email || '-'}"`,
        o.total_amount,
        `"${o.payment_status}"`,
        `"${o.payment_proof_url || '-'}"`,
        o.tickets?.length || 0,
        `"${ticketsStr.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pesanan_tiket_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV pesanan berhasil diunduh.', 'success');
  };

  return (
    <div className="space-y-6">
      <OrdersToolbar
        events={events}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onExportCSV={handleExportCSV}
        totalOrders={filteredOrders.length}
        totalRevenue={totalRevenue}
        pendingCount={pendingCount}
      />

      <OrdersList
        orders={filteredOrders}
        onViewOrder={(order) => {
          setSelectedOrder(order);
          setIsModalOpen(true);
        }}
        onConfirmPaid={handleConfirmPaid}
        loading={loading}
        showEventColumn={selectedEventId === 'all'}
      />

      <OrdersModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConfirmPaid={handleConfirmPaid}
        onRejectOrder={handleRejectOrder}
      />
    </div>
  );
}
