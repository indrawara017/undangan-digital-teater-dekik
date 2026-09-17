'use client';

import { Search, Filter, X } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

interface DistributionToolbarProps {
  displayedCount: number;
  invitedCount: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  categories: string[];
  filterStatus: string;
  setFilterStatus: (val: string) => void;
}

export function DistributionToolbar({
  displayedCount,
  invitedCount,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  categories,
  filterStatus,
  setFilterStatus,
}: DistributionToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Cari nama tamu undangan..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-10 bg-neutral-900/60 border border-neutral-800 text-white text-sm rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-neutral-500"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-white transition-colors"
            title="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters & Status */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
        <div className="w-full sm:w-[170px]">
          <CustomSelect 
            value={filterCategory}
            onChange={(val) => setFilterCategory(val)}
            options={categories.map(c => ({ value: c, label: c === 'Semua' ? 'Semua Kategori' : c }))}
            placeholder="Semua Kategori"
            icon={<Filter className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-[170px]">
          <CustomSelect 
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={[
              { value: 'Semua', label: 'Semua Status' },
              { value: 'Sudah', label: 'Sudah Diundang' },
              { value: 'Belum', label: 'Belum Diundang' }
            ]}
            placeholder="Semua Status"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 whitespace-nowrap h-10 shrink-0">
          <span>Diundang:</span>
          <strong className="text-white font-semibold">{invitedCount}</strong>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-300">{displayedCount}</span>
        </div>
      </div>
    </div>
  );
}
