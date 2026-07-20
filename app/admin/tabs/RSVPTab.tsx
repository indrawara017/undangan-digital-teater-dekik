'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CustomSelect } from '@/app/components/CustomSelect';

export function RSVPTab({ 
  events, 
  invitations, 
  selectedEventId, 
  setSelectedEventId 
}: { 
  events: any[], 
  invitations: any[],
  selectedEventId: string, 
  setSelectedEventId: (id: string) => void
}) {

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const currentEventInvitations = invitations.filter(i => i.event_id === selectedEventId);
  
  const categories = ['Semua', ...Array.from(new Set(currentEventInvitations.map(i => i.guests?.category).filter(Boolean)))];
  
  const filteredInvitations = currentEventInvitations.filter(inv => {
    const matchCategory = filterCategory === 'Semua' || inv.guests?.category === filterCategory;
    const matchStatus = filterStatus === 'Semua' || 
                       (filterStatus === 'Hadir' && inv.rsvp_status === 'attending') ||
                       (filterStatus === 'Tidak Hadir' && inv.rsvp_status === 'declined') ||
                       (filterStatus === 'Belum Respon' && !inv.rsvp_status);
    const matchSearch = inv.guests?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'attending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-950/50 text-green-400 border border-green-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Hadir
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/50 text-red-400 border border-red-900/50">
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Tidak Hadir
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Belum Respon
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">

      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 w-full max-w-md mx-auto">
        <label className="text-[10px] uppercase tracking-widest font-medium text-neutral-400 shrink-0">Pilih Panggung:</label>
        <div className="relative w-full">
          <CustomSelect 
            value={selectedEventId} 
            onChange={(val) => setSelectedEventId(val)} 
            options={events.length === 0 
              ? [{ value: "", label: "-- Belum ada event terdaftar --" }]
              : events.map(ev => ({ value: ev.id, label: ev.title }))
            }
            placeholder="Pilih Panggung"
          />
        </div>
      </div>

      {selectedEventId ? (
        <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl mt-4">
          <div className="grid grid-cols-3 gap-px bg-neutral-800/50">
            <div className="bg-neutral-900/80 p-5 text-center">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Total Diundang</p>
              <p className="text-3xl font-cormorant font-medium mt-1 text-white">{currentEventInvitations.length}</p>
            </div>
            <div className="bg-neutral-900/80 p-5 text-center">
              <p className="text-xs text-green-500/70 font-medium uppercase tracking-wider">Hadir</p>
              <p className="text-3xl font-cormorant font-medium mt-1 text-green-400">
                {currentEventInvitations.filter(i => i.rsvp_status === 'attending').length}
              </p>
            </div>
            <div className="bg-neutral-900/80 p-5 text-center">
              <p className="text-xs text-red-500/70 font-medium uppercase tracking-wider">Tidak Hadir</p>
              <p className="text-3xl font-cormorant font-medium mt-1 text-red-400">
                {currentEventInvitations.filter(i => i.rsvp_status === 'declined').length}
              </p>
            </div>
          </div>
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-auto flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Cari nama tamu..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-neutral-800 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center relative w-full sm:w-auto">
                <CustomSelect 
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  options={categories.map(c => ({ value: c as string, label: c as string }))}
                  icon={<Filter className="w-4 h-4 text-neutral-500" />}
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <CustomSelect 
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  options={[
                    { value: "Semua", label: "Semua Status" },
                    { value: "Hadir", label: "Hadir" },
                    { value: "Tidak Hadir", label: "Tidak Hadir" },
                    { value: "Belum Respon", label: "Belum Respon" }
                  ]}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-neutral-800 text-neutral-400 bg-black/40">
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/2">Nama Tamu Undangan</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/2">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {currentEventInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-neutral-500">
                      <p>Belum ada tamu yang diundang ke event ini.</p>
                      <p className="text-xs mt-2">Gunakan menu Distribusi untuk mengundang tamu.</p>
                    </td>
                  </tr>
                ) : filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-neutral-500">
                      <p>Tidak ada tamu yang sesuai dengan filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map(inv => (
                    <tr key={inv.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{inv.guests?.name}</div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">{inv.guests?.category || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.rsvp_status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-2xl text-neutral-400 flex flex-col items-center justify-center gap-4 text-center mt-4">
          <Clock className="w-8 h-8 text-neutral-600" />
          <p>Silakan tentukan Panggung (Event) terlebih dahulu untuk melihat konfirmasi kehadiran tamu.</p>
        </div>
      )}
    </div>
  );
}
