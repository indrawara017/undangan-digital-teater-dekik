'use client';

import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { Input } from '@/app/components/ui/Input';

export interface TicketTierForm {
  id?: string;
  name: string;
  price: number;
  quota: number;
  available_quota: number;
  max_per_order: number;
  description: string;
  is_active: boolean;
  sort_order: number;
}

interface TicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: TicketTierForm;
  setForm: (form: TicketTierForm) => void;
  isEditing: boolean;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export function TicketsModal({
  isOpen,
  onClose,
  form,
  setForm,
  isEditing,
  onSave,
  saving,
}: TicketsModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 text-left">
        <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800">
            <h3 className="text-base font-medium text-white">
              {isEditing ? 'Edit Kategori Tiket' : 'Tambah Kategori Tiket Baru'}
            </h3>
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSave} className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-neutral-400 font-medium block">Nama Kategori Tiket</label>
                <Input
                  type="text"
                  placeholder="Contoh: Presale 1, Reguler, VIP"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium block">Harga Tiket (IDR)</label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0 untuk gratis"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium block">Maksimal Tiket / Checkout</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={form.max_per_order}
                  onChange={e => setForm({ ...form, max_per_order: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium block">Total Kuota Tiket</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Jumlah kursi"
                  value={form.quota}
                  onChange={e => {
                    const q = parseInt(e.target.value) || 0;
                    setForm({ 
                      ...form, 
                      quota: q,
                      // Jika baru membuat, sisa kuota otomatis sama dengan kuota total
                      available_quota: isEditing ? form.available_quota : q 
                    });
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400 font-medium block">Sisa Kuota Tiket</label>
                <Input
                  type="number"
                  min="0"
                  max={form.quota}
                  value={form.available_quota}
                  onChange={e => setForm({ ...form, available_quota: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-medium block">Deskripsi & Benefit Tiket</label>
              <textarea
                rows={3}
                placeholder="Contoh: Termasuk stiker eksklusif, duduk di zona tengah..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="flex w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-xs text-white shadow-sm transition-colors placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white resize-none"
              />
            </div>

            {/* Toggle Status Penjualan */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-black/40">
              <div>
                <span className="text-xs font-semibold text-white block">Buka Penjualan Tiket</span>
                <span className="text-[10px] text-neutral-400">
                  {form.is_active ? 'Tiket ini dapat dibeli oleh publik di katalog pementasan' : 'Tiket ini disembunyikan dari halaman checkout'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  form.is_active ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    form.is_active ? 'translate-x-4' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? 'Menyimpan...' : 'Simpan Tiket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
