'use client';

import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, MessageCircle, Link as LinkIcon, ChevronLeft, ChevronRight, ArrowUpDown, MoreVertical } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';

interface GuestListProps {
  guests: any[];
  onEditGuest: (g: any) => void;
  onDeleteGuest: (g: any) => void;
}

export function GuestList({ guests, onEditGuest, onDeleteGuest }: GuestListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' }>({ key: 'created_at', direction: 'desc' });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const sortedGuests = [...guests].sort((a, b) => {
    let aVal = a[sortConfig.key] || '';
    let bVal = b[sortConfig.key] || '';
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedGuests.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuests = sortedGuests.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryBadgeColor = (category: string) => {
    switch(category) {
      case 'Alumni': return 'bg-blue-950/50 text-blue-400 border-blue-900/50';
      case 'Teater': return 'bg-purple-950/50 text-purple-400 border-purple-900/50';
      default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Tautan undangan berhasil disalin!');
    setOpenDropdownId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="hidden md:block overflow-x-auto min-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/50">
              <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  Nama {sortConfig.key === 'name' && <ArrowUpDown className="w-3 h-3 text-neutral-500 group-hover:text-white" />}
                </div>
              </th>
              <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('gender')}>
                <div className="flex items-center gap-2">
                  Jenis Kelamin {sortConfig.key === 'gender' && <ArrowUpDown className="w-3 h-3 text-neutral-500 group-hover:text-white" />}
                </div>
              </th>
              <th className="p-4 font-medium cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-2">
                  Kategori {sortConfig.key === 'category' && <ArrowUpDown className="w-3 h-3 text-neutral-500 group-hover:text-white" />}
                </div>
              </th>
              <th className="p-4 font-medium">WhatsApp</th>
              <th className="p-4 font-medium text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {paginatedGuests.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center text-neutral-500">Belum ada data tamu.</td></tr>
            ) : (
              paginatedGuests.map((g) => (
                <tr key={g.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4 font-medium text-white">
                    {g.name}
                  </td>
                  <td className="p-4 text-neutral-300">
                    {g.gender || '-'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getCategoryBadgeColor(g.category || 'Alumni')}`}>
                      {g.category || 'Alumni'}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300">
                    {g.whatsapp || '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center relative action-dropdown-container">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === g.id ? null : g.id);
                        }} 
                        className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openDropdownId === g.id && (
                        <div className="absolute right-12 top-0 mt-2 w-48 rounded-md border border-neutral-800 bg-neutral-900 shadow-xl z-50 py-1">
                          <button 
                            onClick={() => copyLink(g.slug)}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" /> Salin Tautan
                          </button>
                          
                          {g.whatsapp && (
                            <a 
                              href={`https://wa.me/${g.whatsapp}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-green-400 flex items-center gap-2 transition-colors"
                              onClick={() => setOpenDropdownId(null)}
                            >
                              <MessageCircle className="w-4 h-4" /> Chat WA
                            </a>
                          )}

                          <button 
                            onClick={() => {
                              onEditGuest(g);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-blue-400 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          
                          <div className="h-px bg-neutral-800 my-1"></div>
                          
                          <button 
                            onClick={() => {
                              onDeleteGuest(g);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col divide-y divide-neutral-800/50">
        {paginatedGuests.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">Belum ada data tamu.</div>
        ) : (
          paginatedGuests.map((g) => (
            <div key={g.id} className="flex flex-col p-4 hover:bg-neutral-800/30 transition-colors gap-3 relative action-dropdown-container">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-white text-base">{g.name}</span>
                  <span className="text-xs text-neutral-500 mt-1">{g.gender || '-'} • {g.whatsapp || 'Tidak ada WA'}</span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(openDropdownId === g.id ? null : g.id);
                  }} 
                  className="p-2 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors -mr-2"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {openDropdownId === g.id && (
                  <div className="absolute right-6 top-10 w-48 rounded-md border border-neutral-800 bg-neutral-900 shadow-xl z-50 py-1">
                    <button 
                      onClick={() => copyLink(g.slug)}
                      className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-3"
                    >
                      <LinkIcon className="w-4 h-4" /> Salin Tautan
                    </button>
                    
                    {g.whatsapp && (
                      <a 
                        href={`https://wa.me/${g.whatsapp}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-green-400 flex items-center gap-3"
                        onClick={() => setOpenDropdownId(null)}
                      >
                        <MessageCircle className="w-4 h-4" /> Chat WA
                      </a>
                    )}

                    <button 
                      onClick={() => {
                        onEditGuest(g);
                        setOpenDropdownId(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-blue-400 flex items-center gap-3"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    
                    <div className="h-px bg-neutral-800 my-1"></div>
                    
                    <button 
                      onClick={() => {
                        onDeleteGuest(g);
                        setOpenDropdownId(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 flex items-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border uppercase tracking-wider ${getCategoryBadgeColor(g.category || 'Alumni')}`}>
                  {g.category || 'Alumni'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-900/30 mt-auto">
          <span className="text-xs text-neutral-500 font-medium">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedGuests.length)} dari {sortedGuests.length} tamu
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                if (totalPages > 5) {
                  if (i !== 0 && i !== totalPages - 1 && Math.abs(currentPage - 1 - i) > 1) {
                    if (i === 1 || i === totalPages - 2) return <span key={i} className="text-neutral-600 px-1">...</span>;
                    return null;
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      currentPage === i + 1 ? 'bg-white text-black' : 'text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
