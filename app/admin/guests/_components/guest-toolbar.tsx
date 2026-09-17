'use client';

import { Search, Plus, Filter, X } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { CustomSelect } from '@/app/components/CustomSelect';

interface GuestToolbarProps {
  guests: any[];
  filterCategory: string | null;
  setFilterCategory: (val: string | null) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onAddGuest: () => void;
}

export function GuestToolbar({
  guests,
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
  onAddGuest
}: GuestToolbarProps) {
  const filterOptions = [
    { value: '', label: `Semua Kategori` },
    { value: 'Alumni', label: `Alumni` },
    { value: 'Teater', label: `Teater` }
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Cari nama tamu..." 
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

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-full md:w-[200px]">
          <CustomSelect 
            value={filterCategory || ''}
            onChange={(val) => setFilterCategory(val === '' ? null : val)}
            options={filterOptions}
            placeholder="Semua Kategori"
            icon={<Filter className="w-4 h-4" />}
          />
        </div>
        
        <Button onClick={onAddGuest} size="sm" className="h-10 shrink-0 shadow-lg px-4">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Tamu
        </Button>
      </div>
    </div>
  );
}
