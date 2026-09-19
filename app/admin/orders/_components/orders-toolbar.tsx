'use client';

import { ShoppingCart, Search, Download, CheckCircle2, Clock, XCircle, AlertCircle, X } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

interface OrdersToolbarProps {
  events: any[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onExportCSV: () => void;
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu Konfirmasi' },
  { value: 'paid', label: 'Lunas' },
  { value: 'expired', label: 'Kedaluwarsa' },
  { value: 'rejected', label: 'Ditolak' },
];

export function OrdersToolbar({
  events,
  selectedEventId,
  setSelectedEventId,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onExportCSV,
  totalOrders,
  totalRevenue,
  pendingCount,
}: OrdersToolbarProps) {
  const eventOptions = [
    { value: 'all', label: '✦ Semua Pementasan' },
    ...events.map(ev => ({
      value: ev.id,
      label: ev.title,
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">Kelola Pesanan Tiket</h2>
            <p className="text-[11px] text-neutral-400">
              Verifikasi bukti pembayaran transfer dan kelola e-tiket penonton.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-black/40 text-left">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Total Pesanan</div>
            <div className="text-xs font-bold text-white font-mono">{totalOrders}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-left">
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Pendapatan Lunas</div>
            <div className="text-xs font-bold text-emerald-300 font-mono">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-left animate-pulse">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider">Perlu Verifikasi</div>
              <div className="text-xs font-bold text-amber-300 font-mono">{pendingCount} Pesanan</div>
            </div>
          )}
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/30">
        {/* Left: Event Selector & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="w-full sm:w-56">
            <CustomSelect
              value={selectedEventId}
              onChange={setSelectedEventId}
              options={eventOptions}
              placeholder="Pilih Pementasan..."
            />
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari order #, nama pembeli, WA..."
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

        {/* Right: Status Filters & Export */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {STATUS_FILTERS.map((st) => {
              const isActive = filterStatus === st.value;
              return (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setFilterStatus(st.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {st.label}
                  {st.value === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            title="Download CSV Pesanan"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
