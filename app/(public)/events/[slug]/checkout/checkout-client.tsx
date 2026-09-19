'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getEventSlug } from '@/lib/assets';

interface CheckoutClientProps {
  event: any;
  tiers: any[];
}

function formatPrice(price: number) {
  if (!price || price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${y}${m}-${rand}`;
}

function generateTicketCode() {
  return 'TIK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateQRHash() {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 24);
}

export function CheckoutClient({ event, tiers }: CheckoutClientProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    tiers.forEach(t => { init[t.id] = 0; });
    return init;
  });
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [attendeeNames, setAttendeeNames] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    tiers.forEach(t => { init[t.id] = []; });
    return init;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalAmount = tiers.reduce((sum, tier) => sum + (quantities[tier.id] || 0) * tier.price, 0);

  const updateQuantity = (tierId: string, delta: number) => {
    const tier = tiers.find(t => t.id === tierId)!;
    const current = quantities[tierId] || 0;
    const next = Math.max(0, Math.min(current + delta, Math.min(tier.max_per_order, tier.available_quota)));
    setQuantities(prev => ({ ...prev, [tierId]: next }));

    // Adjust attendee names array
    setAttendeeNames(prev => {
      const names = [...(prev[tierId] || [])];
      if (next > names.length) {
        while (names.length < next) names.push('');
      } else {
        names.length = next;
      }
      return { ...prev, [tierId]: names };
    });
  };

  const updateAttendeeName = (tierId: string, idx: number, name: string) => {
    setAttendeeNames(prev => {
      const names = [...(prev[tierId] || [])];
      names[idx] = name;
      return { ...prev, [tierId]: names };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTickets === 0) return setError('Pilih minimal 1 tiket.');
    if (!buyerName.trim()) return setError('Nama pembeli harus diisi.');
    if (!buyerPhone.trim()) return setError('Nomor WhatsApp harus diisi.');

    // Validate all attendee names
    for (const tier of tiers) {
      const qty = quantities[tier.id] || 0;
      for (let i = 0; i < qty; i++) {
        if (!attendeeNames[tier.id]?.[i]?.trim()) {
          return setError(`Nama pemegang tiket ${tier.name} #${i + 1} harus diisi.`);
        }
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Atomic quota decrease for each tier
      for (const tier of tiers) {
        const qty = quantities[tier.id] || 0;
        if (qty === 0) continue;
        const { data: success, error: rpcErr } = await supabase.rpc('decrease_quota_atomic', {
          p_tier_id: tier.id,
          p_quantity: qty,
        });
        if (rpcErr) throw new Error(`Gagal mengamankan kuota: ${rpcErr.message}`);
        if (success === false) throw new Error(`Kuota tiket "${tier.name}" tidak cukup. Coba refresh halaman.`);
      }

      // 2. Create order
      const orderNumber = generateOrderNumber();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          event_id: event.id,
          buyer_name: buyerName.trim(),
          buyer_email: buyerEmail.trim() || null,
          buyer_phone: buyerPhone.trim(),
          total_amount: totalAmount,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (orderErr) throw new Error(`Gagal membuat pesanan: ${orderErr.message}`);

      // 3. Create individual tickets
      const ticketInserts = [];
      for (const tier of tiers) {
        const qty = quantities[tier.id] || 0;
        for (let i = 0; i < qty; i++) {
          ticketInserts.push({
            order_id: order.id,
            ticket_tier_id: tier.id,
            ticket_code: generateTicketCode(),
            qr_code_hash: generateQRHash(),
            attendee_name: attendeeNames[tier.id][i].trim(),
          });
        }
      }

      const { error: ticketErr } = await supabase.from('tickets').insert(ticketInserts);
      if (ticketErr) throw new Error(`Gagal membuat tiket: ${ticketErr.message}`);

      // 4. Redirect to order status page
      router.push(`/orders/${orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          href={`/events/${getEventSlug(event.title)}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Detail Event
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Pesan Tiket
            </h1>
            <p className="text-neutral-500 text-sm mt-1">{event.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Ticket Selection */}
            <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-4">
                Pilih Tiket
              </h2>
              <div className="flex flex-col gap-3">
                {tiers.map((tier) => {
                  const qty = quantities[tier.id] || 0;
                  const soldOut = tier.available_quota <= 0;
                  return (
                    <div
                      key={tier.id}
                      className={`rounded-xl border p-4 transition-all ${
                        qty > 0 ? 'border-white/[0.15] bg-white/[0.03]' : 'border-white/[0.06]'
                      } ${soldOut ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-white font-medium">{tier.name}</p>
                          {tier.description && (
                            <p className="text-xs text-neutral-500 mt-0.5">{tier.description}</p>
                          )}
                          <p className="text-sm text-white font-semibold mt-1">{formatPrice(tier.price)}</p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">
                            Sisa {tier.available_quota} tiket
                          </p>
                        </div>
                        {!soldOut && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(tier.id, -1)}
                              disabled={qty === 0}
                              className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/[0.1] transition-all cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-white font-semibold text-sm w-6 text-center">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(tier.id, 1)}
                              disabled={qty >= Math.min(tier.max_per_order, tier.available_quota)}
                              className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/[0.1] transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {soldOut && (
                          <span className="text-[10px] text-red-400 uppercase tracking-wider font-medium shrink-0">
                            Habis
                          </span>
                        )}
                      </div>

                      {/* Attendee Name Inputs */}
                      {qty > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                          {Array.from({ length: qty }).map((_, i) => (
                            <input
                              key={i}
                              type="text"
                              placeholder={`Nama pemegang tiket #${i + 1}`}
                              value={attendeeNames[tier.id]?.[i] || ''}
                              onChange={(e) => updateAttendeeName(tier.id, i, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                              required
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buyer Info */}
            <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-4">
                Informasi Pembeli
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    placeholder="Contoh: 6281234567890"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Email (opsional)</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            {totalTickets > 0 && (
              <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-4">
                  Ringkasan Pesanan
                </h2>
                <div className="flex flex-col gap-2">
                  {tiers.map(tier => {
                    const qty = quantities[tier.id] || 0;
                    if (qty === 0) return null;
                    return (
                      <div key={tier.id} className="flex justify-between text-sm">
                        <span className="text-neutral-400">{tier.name} × {qty}</span>
                        <span className="text-white font-medium">{formatPrice(tier.price * qty)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-white/[0.06] pt-2 mt-1 flex justify-between text-sm">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-bold text-base">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || totalTickets === 0}
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Konfirmasi Pesanan — {formatPrice(totalAmount)}
                </>
              )}
            </button>

            <p className="text-[10px] text-neutral-600 text-center leading-relaxed">
              Dengan menekan tombol di atas, Anda menyetujui syarat dan ketentuan pembelian tiket. 
              Pesanan akan kedaluwarsa dalam 24 jam jika belum melakukan pembayaran.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
