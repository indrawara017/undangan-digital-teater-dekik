'use client';

import { useState, useMemo } from 'react';
import { 
  Users, 
  Trash2, 
  Edit2, 
  UserPlus, 
  Search, 
  ArrowUpDown 
} from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import type { CastMember } from './types';

interface AnggotaListProps {
  members: CastMember[];
  loading: boolean;
  searchQuery: string;
  onResetSearch: () => void;
  onEditMember: (member: CastMember) => void;
  onDeleteMember: (id: string) => void;
  onAddMember: () => void;
}

export function AnggotaList({
  members,
  loading,
  searchQuery,
  onResetSearch,
  onEditMember,
  onDeleteMember,
  onAddMember
}: AnggotaListProps) {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = members.filter(member => 
      member.name.toLowerCase().includes(q) ||
      member.id.toLowerCase().includes(q)
    );

    result.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [members, searchQuery, sortDirection]);

  const toggleSort = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <>
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[350px]">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 animate-pulse flex flex-col items-center gap-2">
            <Users className="w-6 h-6 animate-bounce text-neutral-600" />
            <span>Memuat data anggota...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-800/60 flex items-center justify-center border border-neutral-700">
              <Users className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-300">Belum ada anggota terdaftar</p>
            <span className="text-xs text-neutral-500 max-w-xs">
              Mulai tambahkan anggota teater dengan menekan tombol &quot;Tambah Anggota&quot; di atas.
            </span>
            <Button onClick={onAddMember} size="sm" variant="outline" className="mt-2">
              <UserPlus className="w-4 h-4 mr-1.5" /> Tambah Anggota Pertama
            </Button>
          </div>
        ) : filteredAndSortedMembers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Search className="w-8 h-8 text-neutral-600" />
            <p className="text-sm text-neutral-300">Tidak ada anggota yang cocok</p>
            <span className="text-xs text-neutral-500">
              Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;.
            </span>
            <Button onClick={onResetSearch} size="sm" variant="outline" className="mt-2 text-xs">
              Reset Pencarian
            </Button>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-950/40 text-xs uppercase tracking-wider">
                <th className="p-4 w-20 text-center font-medium">Foto</th>
                <th 
                  className="p-4 font-medium cursor-pointer hover:text-white transition-colors group"
                  onClick={toggleSort}
                >
                  <div className="flex items-center gap-2">
                    <span>Nama Anggota</span>
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortDirection === 'desc' ? 'text-white' : 'text-neutral-500 group-hover:text-white'}`} />
                    <span className="text-[10px] text-neutral-500 lowercase">({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
                  </div>
                </th>
                <th className="p-4 font-medium text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredAndSortedMembers.map((member) => (
                <tr 
                  key={member.id} 
                  className="hover:bg-neutral-800/30 transition-colors group"
                >
                  {/* Foto */}
                  <td className="p-4 text-center">
                    <div className="w-10 h-12 mx-auto rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800/80 shrink-0 shadow-sm">
                      <img 
                        src={member.photoUrl} 
                        alt={member.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  </td>

                  {/* Nama */}
                  <td className="p-4">
                    <span className="font-medium text-white group-hover:text-white transition-colors">
                      {member.name}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => onEditMember(member)}
                        className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-white hover:text-black text-neutral-400 transition-all border border-neutral-700/50 hover:border-white shadow-sm"
                        title="Edit Anggota"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDeleteMember(member.id)}
                        className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-red-500 hover:text-white text-neutral-400 transition-all border border-neutral-700/50 hover:border-red-500 shadow-sm"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Footer */}
      {!loading && filteredAndSortedMembers.length > 0 && (
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 bg-neutral-950/20">
          <div>
            Menampilkan <span className="text-white font-medium">{filteredAndSortedMembers.length}</span> dari <span className="text-white font-medium">{members.length}</span> anggota
          </div>
        </div>
      )}
    </>
  );
}
