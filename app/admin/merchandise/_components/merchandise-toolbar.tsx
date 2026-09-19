'use client';

import { ShoppingBag, Plus, Search, X, Tag } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

export const MERCH_CATEGORIES = [
  'Semua Kategori',
  'Kaos & Pakaian',
  'Totebag & Tas',
  'Buku & Naskah',
  'Aksesoris & Pin',
  'Paket Bundling',
  'Lainnya',
];

interface MerchandiseToolbarProps {
  events: any[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddProduct: () => void;
  totalProducts: number;
  totalStock: number;
}

export function MerchandiseToolbar({
  events,
  selectedEventId,
  setSelectedEventId,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onAddProduct,
  totalProducts,
  totalStock,
}: MerchandiseToolbarProps) {
  const eventOptions = [
    { value: 'all', label: '✦ Semua Pementasan & Umum' },
    { value: 'general', label: '★ Merchandise Umum Dekik' },
    ...events.map(ev => ({
      value: ev.id,
      label: `🎭 ${ev.title}`,
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">Merchandise Resmi Teater</h2>
            <p className="text-[11px] text-neutral-400">
              Kelola katalog produk, kaos pementasan, buku naskah, dan suvenir teater.
            </p>
          </div>
        </div>

        {/* Quick Stats & Add Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-black/40 text-left">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Produk</div>
              <div className="text-xs font-bold text-white font-mono">{totalProducts}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-black/40 text-left">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Total Stok</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">{totalStock} pcs</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddProduct}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Event Filter */}
          <div className="w-full sm:w-60">
            <CustomSelect
              value={selectedEventId}
              onChange={setSelectedEventId}
              options={eventOptions}
              placeholder="Pilih Pementasan..."
            />
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama merchandise, kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-8 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {MERCH_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
