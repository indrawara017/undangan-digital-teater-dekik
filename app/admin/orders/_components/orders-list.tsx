'use client';

import { Eye, CheckCircle2, Clock, XCircle, AlertCircle, Image as ImageIcon, Ticket, Phone, Calendar } from 'lucide-react';
import type { OrderDetail } from './orders-modal';

interface OrdersListProps {
  orders: OrderDetail[];
  onViewOrder: (order: OrderDetail) => void;
  onConfirmPaid: (orderId: string) => Promise<void>;
  loading: boolean;
  showEventColumn?: boolean;
}

export function OrdersList({
  orders,
  onViewOrder,
  onConfirmPaid,
  loading,
  showEventColumn = false,
}: OrdersListProps) {
  if (loading) {
    return (
      <div className="py-16 text-center border border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-neutral-400">Memuat data pesanan...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center border border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col items-center justify-center gap-3">
        <Ticket className="w-8 h-8 text-neutral-600" />
        <p className="text-xs text-neutral-400">Tidak ada pesanan yang sesuai dengan filter.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Lunas</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Verifikasi</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            <span>Ditolak</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-400">
            <AlertCircle className="w-3 h-3" />
            <span>Kedaluwarsa</span>
          </span>
        );
    }
  };

  const getTicketsSummary = (order: OrderDetail) => {
    if (!order.tickets || order.tickets.length === 0) return '-';
    
    // Group by tier
    const countByTier: Record<string, number> = {};
    for (const t of order.tickets) {
      const tierName = t.ticket_tiers?.name || 'Tiket';
      countByTier[tierName] = (countByTier[tierName] || 0) + 1;
    }

    return Object.entries(countByTier)
      .map(([tier, count]) => `${count}x ${tier}`)
      .join(', ');
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 font-medium bg-neutral-900/60">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Order # / Tanggal</th>
              {showEventColumn && <th className="py-3 px-4">Pementasan</th>}
              <th className="py-3 px-4">Pembeli</th>
              <th className="py-3 px-4">Rincian Tiket</th>
              <th className="py-3 px-4 text-right">Total Bayar</th>
              <th className="py-3 px-4 text-center">Bukti Transfer</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/40">
            {orders.map((order, idx) => (
              <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-3 px-4 text-center text-neutral-500 font-mono">
                  {idx + 1}
                </td>

                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-white tracking-wide">
                    {order.order_number}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {new Date(order.created_at).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </div>
                </td>

                {showEventColumn && (
                  <td className="py-3 px-4">
                    <span className="text-neutral-300 font-medium line-clamp-1 max-w-[150px]">
                      {order.events?.title || '-'}
                    </span>
                  </td>
                )}

                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{order.buyer_name}</div>
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-2.5 h-2.5" />
                    <span>{order.buyer_phone}</span>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="text-neutral-300 font-medium">
                    {getTicketsSummary(order)}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Total {order.tickets?.length || 0} penonton
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <span className="font-mono font-bold text-white">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  {order.payment_proof_url ? (
                    <button
                      type="button"
                      onClick={() => onViewOrder(order)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Ada Bukti</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-neutral-500">Belum Ada</span>
                  )}
                </td>

                <td className="py-3 px-4 text-center">
                  {getStatusBadge(order.payment_status)}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewOrder(order)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Lihat Detail Pesanan"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {order.payment_status === 'pending' && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Konfirmasi lunas pesanan ${order.order_number}?`)) {
                            await onConfirmPaid(order.id);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Langsung Konfirmasi Lunas"
                      >
                        Lunas
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
