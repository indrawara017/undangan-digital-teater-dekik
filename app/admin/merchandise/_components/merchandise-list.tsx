'use client';

import { Edit2, Trash2, ShoppingBag, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { getMerchandiseImageUrl } from '@/lib/assets';
import type { MerchandiseItem } from './merchandise-modal';

interface MerchandiseListProps {
  products: MerchandiseItem[];
  onEditProduct: (product: MerchandiseItem) => void;
  onDeleteProduct: (product: MerchandiseItem) => void;
  onToggleActive: (product: MerchandiseItem) => void;
  loading: boolean;
}

export function MerchandiseList({
  products,
  onEditProduct,
  onDeleteProduct,
  onToggleActive,
  loading,
}: MerchandiseListProps) {
  if (loading) {
    return (
      <div className="py-16 text-center border border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-neutral-400">Memuat katalog merchandise...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center border border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col items-center justify-center gap-3">
        <ShoppingBag className="w-8 h-8 text-neutral-600" />
        <p className="text-xs text-neutral-400">Belum ada merchandise yang terdaftar pada filter ini.</p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 font-medium bg-neutral-900/60">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Produk Merchandise</th>
              <th className="py-3 px-4">Kategori & Pementasan</th>
              <th className="py-3 px-4">Varian / Ukuran</th>
              <th className="py-3 px-4 text-right">Harga (IDR)</th>
              <th className="py-3 px-4 text-center">Stok</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/40">
            {products.map((item, idx) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-3 px-4 text-center text-neutral-500 font-mono">
                  {idx + 1}
                </td>

                {/* Info Produk & Foto */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                      <img
                        src={getMerchandiseImageUrl(item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.is_featured && (
                          <span title="Produk Unggulan">
                            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[10px] text-neutral-500 line-clamp-1 max-w-[200px] mt-0.5">
                          {item.description}
                        </p>
                      )}
                      {(item.image_urls?.length || 0) > 1 && <p className="text-[10px] text-amber-400 mt-0.5">{item.image_urls?.length} foto</p>}
                    </div>
                  </div>
                </td>

                {/* Kategori & Relasi Pementasan */}
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-neutral-300 border border-white/10">
                    {item.category}
                  </span>
                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                    {item.events?.title ? (
                      <span className="text-amber-400/90 font-medium">🎭 {item.events.title}</span>
                    ) : (
                      <span className="text-neutral-500">★ Umum Dekik</span>
                    )}
                  </div>
                </td>

                {/* Varian */}
                <td className="py-3 px-4">
                  {item.variants && item.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {item.variants.map((v) => (
                        <span
                          key={v}
                          className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700/50"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-500">-</span>
                  )}
                </td>

                {/* Harga */}
                <td className="py-3 px-4 text-right">
                  <span className="font-mono font-bold text-white">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                </td>

                {/* Stok */}
                <td className="py-3 px-4 text-center">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      item.stock > 10
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.stock > 0
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {item.stock} pcs
                  </span>
                </td>

                {/* Status Aktif */}
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleActive(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                      item.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700/50 hover:text-white'
                    }`}
                  >
                    {item.is_active ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Nonaktif</span>
                      </>
                    )}
                  </button>
                </td>

                {/* Aksi */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEditProduct(item)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Edit Produk"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(item)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
