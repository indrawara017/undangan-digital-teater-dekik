'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '../components/ui/Button';
import { Link2, MessageCircle, Check, Circle, Eye, Search } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

export function DistributionTab({ 
  events, 
  guests, 
  invitations, 
  selectedEventId, 
  setSelectedEventId,
  fetchData
}: { 
  events: any[], 
  guests: any[], 
  invitations: any[],
  selectedEventId: string, 
  setSelectedEventId: (id: string) => void,
  fetchData: () => void
}) {

  const ensureInvited = async (guestId: string) => {
    if (!selectedEventId) {
      alert('Pilih event dulu');
      return false;
    }
    const existing = invitations.find(i => i.event_id === selectedEventId && i.guest_id === guestId);
    if (!existing) {
      await supabase.from('invitations').insert([{ event_id: selectedEventId, guest_id: guestId }]);
      fetchData();
    }
    return true;
  };

  const getEventSlug = () => {
    const ev = events.find(e => e.id === selectedEventId);
    if (!ev) return '';
    return ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleCopyLink = async (guest: any) => {
    const success = await ensureInvited(guest.id);
    if (!success) return;
    const url = `${window.location.origin}/${guest.slug}-${getEventSlug()}`;
    navigator.clipboard.writeText(url);
    alert('Link berhasil disalin: ' + url);
  };

  const handleSendWA = async (guest: any) => {
    if (!guest.whatsapp) return alert('Nomor WhatsApp tamu ini belum diisi.');
    const success = await ensureInvited(guest.id);
    if (!success) return;
    const url = `${window.location.origin}/${guest.slug}-${getEventSlug()}`;
    const text = `Halo ${guest.name}, ini adalah undangan resmi Anda untuk pementasan Teater Dekik. Silakan buka link berikut: ${url}`;
    window.open(`https://wa.me/${guest.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const categories = ['Semua', ...Array.from(new Set(guests.map(g => g.category)))];

  const currentEventInvitations = invitations.filter(i => i.event_id === selectedEventId);
  const invitedGuestIds = currentEventInvitations.map(i => i.guest_id);
  const displayedGuests = guests.filter(g => {
    const matchCategory = filterCategory === 'Semua' || g.category === filterCategory;
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isInvited = invitedGuestIds.includes(g.id);
    const matchStatus = filterStatus === 'Semua' || (filterStatus === 'Sudah' ? isInvited : !isInvited);
    return matchCategory && matchSearch && matchStatus;
  });

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
          <div className="p-4 border-b border-neutral-800 bg-black/40 text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto mb-2 sm:mb-0">
              <span className="font-medium text-white whitespace-nowrap">Daftar Tamu Undangan (Total: {displayedGuests.length})</span>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-xs font-medium border border-neutral-700/50 text-neutral-300 whitespace-nowrap">
                Telah Diundang: {invitedGuestIds.length}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="text" 
                  placeholder="Cari nama tamu..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-700 text-white text-xs pl-9 pr-4 py-1.5 rounded-md focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="relative w-full sm:w-40 shrink-0">
                <CustomSelect 
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  options={categories.map(c => ({ value: c, label: c }))}
                  placeholder="Filter Kategori"
                />
              </div>
              <div className="relative w-full sm:w-44 shrink-0">
                <CustomSelect 
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  options={[
                    { value: 'Semua', label: 'Semua Status' },
                    { value: 'Sudah', label: 'Sudah Diundang' },
                    { value: 'Belum', label: 'Belum Diundang' }
                  ]}
                  placeholder="Filter Status"
                />
              </div>
          </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y divide-neutral-800/50 custom-scrollbar">
            {displayedGuests.length === 0 && (
              <div className="p-12 text-center text-neutral-500">Belum ada data tamu untuk kategori ini.</div>
            )}
            {displayedGuests.map(g => {
              const isInvited = invitedGuestIds.includes(g.id);
              return (
                <div key={g.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-neutral-800/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${isInvited ? 'text-white' : 'text-neutral-300'}`}>{g.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 border border-neutral-700 rounded bg-neutral-900 text-neutral-400 font-medium tracking-wider uppercase">
                          {g.category || 'Umum'}
                        </span>
                        {isInvited && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-white text-black font-bold tracking-widest uppercase">
                            Terkirim
                          </span>
                        )}
                      </div>
                      {g.whatsapp && <p className="text-xs text-neutral-500 mt-1 font-mono">WA: {g.whatsapp}</p>}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 pl-0">
                    <Button variant="outline" size="sm" onClick={() => handleCopyLink(g)} className="h-8 border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300">
                      <Link2 className="w-3.5 h-3.5 mr-1.5" /> Salin Link
                    </Button>
                    {g.whatsapp && (
                      <Button 
                        className="bg-green-950/40 text-green-400 border border-green-900/50 hover:bg-green-900/80 h-8 text-xs font-medium" 
                        size="sm"
                        onClick={() => handleSendWA(g)}
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Kirim WA
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-2xl text-neutral-400 flex flex-col items-center justify-center gap-4 text-center mt-4">
          <Circle className="w-8 h-8 text-neutral-600" />
          <p>Silakan tentukan Panggung (Event) terlebih dahulu untuk mulai mendistribusikan undangan.</p>
        </div>
      )}
    </div>
  );
}
