'use client';

import { Edit2, Trash2, Ticket, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { TicketTierForm } from './tickets-modal';

interface TicketsListProps {
  tiers: TicketTierForm[];
  loading: boolean;
  onEdit: (tier: TicketTierForm) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function formatPrice(price: number) {
  if (!price || price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

export function TicketsList({
  tiers,
  loading,
  onEdit,
  onDelete,
  onAdd,
}: TicketsListProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-neutral-500 text-xs flex flex-col items-center gap-2">
        <div className="w-5 h-5 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
        <span>Memuat kategori tiket...</span>
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
          <Ticket className="w-6 h-6" />
        </div>
        <p className="text-sm text-neutral-300 font-medium">Belum Ada Kategori Tiket</p>
        <p className="text-xs text-neutral-500 max-w-sm">
          Pementasan ini belum memiliki kategori tiket. Buat tiket seperti Presale, Reguler, atau VIP untuk memulai penjualan.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all"
        >
          Buat Kategori Pertama
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-800/60">
      {tiers.map((tier) => {
        const sold = tier.quota - tier.available_quota;
        const percentSold = tier.quota > 0 ? Math.round((sold / tier.quota) * 100) : 0;
        const isSoldOut = tier.available_quota <= 0;

        return (
          <div 
            key={tier.id}
            className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
          >
            {/* Info Utama */}
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                tier.is_active 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-neutral-800/40 border-neutral-700/40 text-neutral-500'
              }`}>
                <Ticket className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-sm font-semibold text-white tracking-wide">{tier.name}</h4>
                  
                  {tier.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Ditutup
                    </span>
                  )}

                  {isSoldOut && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      <AlertCircle className="w-3 h-3" /> Habis
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-400 font-medium mt-1">
                  {formatPrice(tier.price)} <span className="text-[11px] text-neutral-500 font-normal">/ tiket (maks {tier.max_per_order}/order)</span>
                </p>

                {tier.description && (
                  <p className="text-xs text-neutral-400 mt-1 max-w-lg leading-relaxed">
                    {tier.description}
                  </p>
                )}
              </div>
            </div>

            {/* Kuota & Aksi */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
              {/* Progress Kuota */}
              <div className="w-36 text-right">
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Terjual: {sold}</span>
                  <span className="font-semibold text-white">Sisa: {tier.available_quota}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      percentSold >= 100 ? 'bg-red-500' : percentSold >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentSold)}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">Kapasitas: {tier.quota} tiket</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(tier)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  title="Edit Tiket"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => tier.id && onDelete(tier.id)}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Hapus Tiket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
