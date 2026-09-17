'use client';

import { Search, Plus, X } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';

interface AnggotaToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  totalMembers: number;
  onAddMember: () => void;
}

export function AnggotaToolbar({
  searchQuery,
  setSearchQuery,
  totalMembers,
  onAddMember
}: AnggotaToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Cari nama anggota atau ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Counter & Action */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <span className="px-3 py-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs font-medium text-neutral-400 whitespace-nowrap h-10 flex items-center">
          Total: <strong className="text-white ml-1">{totalMembers}</strong>&nbsp;Anggota
        </span>

        <Button onClick={onAddMember} size="sm" className="h-10 shrink-0 shadow-lg px-4">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Anggota
        </Button>
      </div>
    </div>
  );
}
