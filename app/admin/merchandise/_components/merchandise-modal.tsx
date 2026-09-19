'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  Tag, 
  Trash2, 
  Plus, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getGlobalAssetUrl, getMerchandiseImageUrl } from '@/lib/assets';
import { CustomSelect } from '@/app/components/CustomSelect';

export interface MerchandiseItem {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  image_urls?: string[];
  variants: string[];
  event_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  events?: {
    id: string;
    title: string;
  };
}

interface MerchandiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: MerchandiseItem;
  setForm: React.Dispatch<React.SetStateAction<MerchandiseItem>>;
  isEditing: boolean;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
  events: any[];
}

const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'All Size'];

export function MerchandiseModal({
  isOpen,
  onClose,
  form,
  setForm,
  isEditing,
  onSave,
  saving,
  events,
}: MerchandiseModalProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customVariant, setCustomVariant] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || typeof document === 'undefined') return null;

  const eventOptions = [
    { value: '', label: 'Merchandise Teater Dekik' },
    ...events.map((ev) => ({
      value: ev.id,
      label: `${ev.title}`,
    })),
  ];

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `merch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const path = `merchandise/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('assets')
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const fullUrl = getGlobalAssetUrl(path);
      setForm((prev) => {
        const imageUrls = [...(prev.image_urls || []), fullUrl];
        return { ...prev, image_url: imageUrls[0], image_urls: imageUrls };
      });
    } catch (err: any) {
      alert('Gagal mengunggah foto: ' + (err.message || 'Coba lagi'));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (image: string) => {
    setForm((prev) => {
      const imageUrls = (prev.image_urls || []).filter((item) => item !== image);
      return { ...prev, image_url: imageUrls[0] || '', image_urls: imageUrls };
    });
  };

  const handleToggleSize = (size: string) => {
    setForm((prev) => {
      const current = prev.variants || [];
      if (current.includes(size)) {
        return { ...prev, variants: current.filter((s) => s !== size) };
      } else {
        return { ...prev, variants: [...current, size] };
      }
    });
  };

  const handleAddCustomVariant = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const val = customVariant.trim();
    if (!val) return;
    if (!(form.variants || []).includes(val)) {
      setForm((prev) => ({ ...prev, variants: [...(prev.variants || []), val] }));
    }
    setCustomVariant('');
  };

  const handleRemoveVariant = (variantToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((v) => v !== variantToRemove),
    }));
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 text-left">
        <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/40">
            <div>
              <h3 className="text-base font-semibold text-white">
                {isEditing ? 'Edit Merchandise' : 'Tambah Merchandise Baru'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Isi rincian produk, harga, stok, dan pilihan varian.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSave} className="p-6 flex flex-col gap-5 max-h-[calc(85vh-120px)] overflow-y-auto">
            <div className="p-4 rounded-xl border border-neutral-800 bg-black/40">
              <div className="flex items-start justify-between gap-4 mb-3"><div><h4 className="text-xs font-semibold text-white">Foto Merchandise</h4><p className="text-[11px] text-neutral-400 mt-1">Unggah beberapa foto. Foto pertama menjadi gambar utama katalog.</p></div><input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => { const files = Array.from(e.target.files || []); for (const file of files) await handleImageUpload(file); e.target.value = ''; }} /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium disabled:opacity-50"><Upload className="w-3.5 h-3.5" /> Unggah Foto</button></div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{(form.image_urls || []).map((image, index) => <div key={image} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-700"><img src={getMerchandiseImageUrl(image)} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />{index === 0 && <span className="absolute left-1 bottom-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white">Utama</span>}<button type="button" onClick={() => removeImage(image)} aria-label={`Hapus foto ${index + 1}`} className="absolute right-1 top-1 p-1 bg-black/70 rounded text-white hover:text-red-400"><X className="w-3 h-3" /></button></div>)}<div className="aspect-square rounded-lg border border-dashed border-neutral-700 text-neutral-600 grid place-items-center">{uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}</div></div>
            </div>

            {/* Nama Produk */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Nama Produk Merchandise <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kaos Resmi Pementasan Sandyakala"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>

            {/* Kategori & Pementasan Terkait */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Kategori Produk
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
                >
                  <option value="Kaos & Pakaian">Kaos & Pakaian</option>
                  <option value="Totebag & Tas">Totebag & Tas</option>
                  <option value="Buku & Naskah">Buku & Naskah</option>
                  <option value="Aksesoris & Pin">Aksesoris & Pin</option>
                  <option value="Paket Bundling">Paket Bundling</option>
                  <option value="Umum">Umum / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Terkait Pementasan (Opsional)
                </label>
                <CustomSelect
                  value={form.event_id || ''}
                  onChange={(val) => setForm({ ...form, event_id: val ? val : null })}
                  options={eventOptions}
                  placeholder="Pilih pementasan..."
                />
              </div>
            </div>

            {/* Harga & Stok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Harga (IDR) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-mono">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Ketersediaan Stok (pcs) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>
            </div>

            {/* Varian (Ukuran / Warna) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-300">
                Pilihan Varian / Ukuran (Opsional)
              </label>
              
              {/* Quick Size Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-neutral-500 mr-1">Ukuran Standar:</span>
                {COMMON_SIZES.map((sz) => {
                  const isSelected = (form.variants || []).includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Selected Variants List & Custom Input */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-neutral-800 bg-neutral-900/50 min-h-[42px]">
                {(form.variants || []).map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white text-[11px] border border-white/10"
                  >
                    <span>{v}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v)}
                      className="text-neutral-400 hover:text-red-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                  <input
                    type="text"
                    placeholder="Tambah varian kustom..."
                    value={customVariant}
                    onChange={(e) => setCustomVariant(e.target.value)}
                    onKeyDown={handleAddCustomVariant}
                    className="w-full bg-transparent border-none text-xs text-white placeholder:text-neutral-600 focus:outline-none px-1"
                  />
                  {customVariant && (
                    <button
                      type="button"
                      onClick={handleAddCustomVariant}
                      className="text-emerald-400 hover:text-emerald-300 p-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Deskripsi & Spesifikasi Produk
              </label>
              <textarea
                rows={3}
                placeholder="Bahan Cotton Combed 24s, sablon discharge berkualitas tinggi, nyaman dipakai harian..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
              />
            </div>

            {/* Toggle Status */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  Aktif Dijual (Tampil di Katalog)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Sorot sebagai Produk Unggulan</span>
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="flex items-center gap-1.5 px-5 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
