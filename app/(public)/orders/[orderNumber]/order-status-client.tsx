'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Upload, Loader2, QrCode, AlertTriangle, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { getGlobalAssetUrl } from '@/lib/assets';
import type { GlobalConfig } from '@/lib/config';

interface OrderStatusClientProps {
  order: any;
  tickets: any[];
  config?: GlobalConfig;
}

function formatPrice(price: number) {
  if (!price || price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function timeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Kedaluwarsa';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}j ${minutes}m tersisa`;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Menunggu Pembayaran',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  paid: {
    icon: CheckCircle2,
    label: 'Pembayaran Dikonfirmasi',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  expired: {
    icon: XCircle,
    label: 'Pesanan Kedaluwarsa',
    color: 'text-neutral-400',
    bg: 'bg-neutral-400/10 border-neutral-400/20',
  },
  rejected: {
    icon: AlertTriangle,
    label: 'Pembayaran Ditolak',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
  },
};

export function OrderStatusClient({ order, tickets, config }: OrderStatusClientProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = statusConfig[order.payment_status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isPending = order.payment_status === 'pending';
  const isPaid = order.payment_status === 'paid';

  const handleUploadProof = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `payment-proofs/${order.id}/bukti.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('assets')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const proofUrl = getGlobalAssetUrl(path);
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ payment_proof_url: proofUrl })
        .eq('id', order.id);
      if (updateErr) throw updateErr;

      setUploadSuccess(true);
    } catch (err: any) {
      alert('Gagal mengunggah bukti: ' + (err.message || 'Coba lagi'));
    } finally {
      setUploading(false);
    }
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          {/* Status Banner */}
          <div className={`flex items-center justify-center gap-3 rounded-2xl border p-5 ${status.bg}`}>
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
          </div>

          {/* Order Details */}
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">
                Detail Pesanan
              </h2>
              <button
                onClick={handleCopyOrderNumber}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {order.order_number}
              </button>
            </div>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Event</span>
                <span className="text-white font-medium">{order.events?.title || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Pembeli</span>
                <span className="text-white">{order.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">WhatsApp</span>
                <span className="text-white">{order.buyer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total</span>
                <span className="text-white font-bold">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tanggal Pesan</span>
                <span className="text-neutral-400 text-xs">{formatDate(order.created_at)}</span>
              </div>
              {isPending && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Batas Bayar</span>
                  <span className="text-amber-400 text-xs font-medium">{timeRemaining(order.expires_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions (Pending) */}
          {isPending && (
            <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-4">
                Instruksi Pembayaran
              </h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-neutral-500 text-xs mb-1">Transfer ke</p>
                  <p className="text-white font-semibold">{config?.bankName || 'Bank BRI'}</p>
                  <p className="text-white font-mono text-lg tracking-wider mt-1">{config?.bankAccountNumber || '1234 5678 9012 3456'}</p>
                  <p className="text-neutral-400 text-xs mt-1">a.n. {config?.bankAccountHolder || 'Teater Dekik'}</p>
                </div>
                <p className="text-neutral-500 text-xs">
                  Jumlah transfer: <span className="text-white font-semibold">{formatPrice(order.total_amount)}</span>
                </p>
                <p className="text-neutral-600 text-xs">
                  Setelah transfer, unggah bukti pembayaran di bawah. Admin akan memverifikasi dalam 1×24 jam.
                </p>
              </div>

              {/* Upload Proof */}
              <div className="mt-4">
                {uploadSuccess || order.payment_proof_url ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProof(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Unggah Bukti Pembayaran
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* E-Tickets (Paid) */}
          {isPaid && tickets.length > 0 && (
            <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-4">
                E-Tiket Anda
              </h2>
              <div className="flex flex-col gap-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white font-medium">{ticket.attendee_name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{ticket.ticket_tiers?.name}</p>
                        <p className="text-[10px] text-neutral-600 font-mono mt-1">{ticket.ticket_code}</p>
                      </div>
                      <div className="shrink-0 p-1.5 bg-white rounded-lg flex items-center justify-center shadow-md">
                        <QRCodeSVG 
                          value={JSON.stringify({
                            ticket_code: ticket.ticket_code,
                            qr_hash: ticket.qr_code_hash,
                            id: ticket.id,
                          })}
                          size={64}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="M"
                        />
                      </div>
                    </div>
                    {ticket.is_checked_in && (
                      <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sudah check-in
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-neutral-600 mt-4 text-center">
                Tunjukkan kode QR tiket saat masuk venue. Satu tiket hanya berlaku untuk satu kali masuk.
              </p>
            </div>
          )}

          {/* Rejected reason */}
          {order.payment_status === 'rejected' && order.rejected_reason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
              <p className="text-sm text-red-400">
                <span className="font-semibold">Alasan penolakan:</span> {order.rejected_reason}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
