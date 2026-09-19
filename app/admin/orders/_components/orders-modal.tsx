'use client';

import { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  MessageCircle, 
  Ticket, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar,
  AlertTriangle,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface OrderDetail {
  id: string;
  order_number: string;
  event_id: string;
  buyer_name: string;
  buyer_email: string | null;
  buyer_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'expired' | 'rejected';
  payment_proof_url: string | null;
  expires_at: string;
  paid_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  events?: {
    id: string;
    title: string;
    date: string;
  };
  tickets?: Array<{
    id: string;
    ticket_code: string;
    qr_code_hash: string;
    attendee_name: string;
    is_checked_in: boolean;
    checked_in_at: string | null;
    ticket_tiers?: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetail | null;
  onConfirmPaid: (orderId: string) => Promise<void>;
  onRejectOrder: (orderId: string, reason?: string) => Promise<void>;
}

export function OrdersModal({
  isOpen,
  onClose,
  order,
  onConfirmPaid,
  onRejectOrder,
}: OrdersModalProps) {
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !order) return null;

  const handleConfirm = async () => {
    if (!confirm(`Konfirmasi pembayaran untuk pesanan ${order.order_number}? Tiket akan berstatus aktif.`)) {
      return;
    }
    setProcessing(true);
    try {
      await onConfirmPaid(order.id);
      onClose();
    } catch (err: any) {
      alert('Gagal konfirmasi pesanan: ' + (err.message || 'Coba lagi'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await onRejectOrder(order.id, rejectReason.trim() || undefined);
      setShowRejectInput(false);
      onClose();
    } catch (err: any) {
      alert('Gagal menolak pesanan: ' + (err.message || 'Coba lagi'));
    } finally {
      setProcessing(false);
    }
  };

  const formattedPhone = order.buyer_phone.replace(/\D/g, '');
  const cleanPhone = formattedPhone.startsWith('0') 
    ? '62' + formattedPhone.slice(1) 
    : formattedPhone;

  const waMessage = encodeURIComponent(
    `Halo ${order.buyer_name},\n\nKami dari Panitia Teater Dekik mengenai pesanan tiket Anda #${order.order_number} untuk pementasan "${order.events?.title || 'Teater Dekik'}".\n\nStatus pesanan Anda saat ini: ${order.payment_status.toUpperCase()}.\n\nTerima kasih!`
  );

  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 bg-neutral-900/40">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{order.order_number}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  order.payment_status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : order.payment_status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : order.payment_status === 'rejected'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {order.payment_status === 'paid' ? 'LUNAS' : order.payment_status === 'pending' ? 'MENUNGGU VERIFIKASI' : order.payment_status === 'rejected' ? 'DITOLAK' : 'KEDALUWARSA'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {order.events?.title || 'Pementasan Teater'} • {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6 max-h-[calc(85vh-140px)] overflow-y-auto">
            {/* Buyer & Payment Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Buyer info */}
              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/30 space-y-2.5">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Data Pembeli</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{order.buyer_name}</div>
                  <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{order.buyer_phone}</span>
                  </div>
                  {order.buyer_email && (
                    <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span>{order.buyer_email}</span>
                    </div>
                  )}
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Chat WhatsApp</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/30 space-y-2.5">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rincian Pembayaran</span>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Total Nominal</div>
                  <div className="text-lg font-bold text-white font-mono">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Metode: Transfer Manual Bank
                  </div>
                </div>
                {order.paid_at && (
                  <div className="text-[11px] text-emerald-400">
                    Dikonfirmasi: {new Date(order.paid_at).toLocaleString('id-ID')}
                  </div>
                )}
                {order.rejected_reason && (
                  <div className="text-[11px] text-red-400">
                    Alasan ditolak: {order.rejected_reason}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Proof Section */}
            <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Bukti Pembayaran Transfer
                </div>
                {order.payment_proof_url && (
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>Buka Resolusi Penuh</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {order.payment_proof_url ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black/60 max-h-72 flex items-center justify-center group">
                  <img
                    src={order.payment_proof_url}
                    alt="Bukti Transfer"
                    className="max-h-72 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="py-6 px-4 rounded-xl border border-dashed border-neutral-800 text-center bg-black/20">
                  <Clock className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">
                    Pembeli belum mengunggah bukti transfer pembayaran.
                  </p>
                </div>
              )}
            </div>

            {/* Tickets Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-purple-400" />
                  <span>Daftar E-Tiket ({order.tickets?.length || 0} Tiket)</span>
                </div>
              </div>

              {order.tickets && order.tickets.length > 0 ? (
                <div className="divide-y divide-neutral-800/60 border border-neutral-800/80 rounded-xl overflow-hidden bg-black/20">
                  {order.tickets.map((t, i) => (
                    <div key={t.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-500 font-mono w-4 text-center">{i + 1}</span>
                        <div>
                          <p className="font-semibold text-white">{t.attendee_name}</p>
                          <p className="text-[11px] text-neutral-400">
                            {t.ticket_tiers?.name || 'Tiket'} • <span className="font-mono text-neutral-500">{t.ticket_code}</span>
                          </p>
                        </div>
                      </div>
                      <div>
                        {t.is_checked_in ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Sudah Check-In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] text-neutral-500 border border-neutral-800">
                            Belum Masuk
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-neutral-500 border border-neutral-800 rounded-xl">
                  Tidak ada data tiket individual.
                </div>
              )}
            </div>

            {/* Reject Form Input */}
            {showRejectInput && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                <div className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Tolak Pesanan Ini & Kembalikan Kuota Tiket</span>
                </div>
                <input
                  type="text"
                  placeholder="Masukkan alasan penolakan (misal: Bukti tidak valid / Nominal kurang)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={processing}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Konfirmasi Tolak</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {order.payment_status !== 'rejected' && !showRejectInput && (
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  disabled={processing}
                  className="px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Tolak Pesanan
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              {order.payment_status !== 'paid' && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={processing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Konfirmasi Lunas</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
