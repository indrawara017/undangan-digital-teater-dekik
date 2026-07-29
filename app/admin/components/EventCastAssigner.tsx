'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, Trash2, Check, Plus, Search, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CustomSelect } from '@/app/components/CustomSelect';
import type { CastMember } from './CastMasterManager';

export interface EventCastEntry {
  memberId: string;
  name: string;
  photoUrl: string;
  role: string;
}

const DEFAULT_ROLES = [
  'Sutradara',
  'Penulis Naskah',
  'Pemeran Utama',
  'Pemeran Pendukung',
  'Penata Musik',
  'Penata Busana & Rias',
  'Penata Artistik & Panggung',
  'Tim Produksi / Crew'
];

export function EventCastAssigner({ eventId }: { eventId: string }) {
  const [masterCast, setMasterCast] = useState<CastMember[]>([]);
  const [eventCast, setEventCast] = useState<EventCastEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CastMember | null>(null);
  const [roleInput, setRoleInput] = useState('Sutradara');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch master list
      const { data: masterData } = await supabase.storage.from('assets').download('global/cast_members.json');
      if (masterData) {
        try {
          const parsed = JSON.parse(await masterData.text());
          setMasterCast(parsed.map((m: any) => ({ id: m.id, name: m.name, photoUrl: m.photoUrl })));
        } catch (e) {}
      }

      // Fetch event-specific cast
      const { data: eventData } = await supabase.storage.from('assets').download(`${eventId}/event_cast.json`);
      if (eventData) {
        try {
          setEventCast(JSON.parse(await eventData.text()));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error loading event cast:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchData();
  }, [eventId, fetchData]);

  const saveEventCast = async (newList: EventCastEntry[]) => {
    const jsonBlob = new Blob([JSON.stringify(newList, null, 2)], { type: 'application/json' });
    await supabase.storage.from('assets').upload(`${eventId}/event_cast.json`, jsonBlob, { upsert: true });
    setEventCast(newList);
  };

  const getRoleOptions = () => {
    const existingRoles = eventCast.map(c => c.role.trim()).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_ROLES, ...existingRoles]));
    const options = combined.map(r => ({ value: r, label: r }));
    options.push({ value: '__NEW_ROLE__', label: '+ Tambah Peran/Jabatan Baru...' });
    return options;
  };

  const openPicker = () => {
    setSelectedMember(null);
    setRoleInput('Sutradara');
    setIsCustomRole(false);
    setSearchQuery('');
    setIsPickerOpen(true);
  };

  const handleSelectMember = (member: CastMember) => {
    setSelectedMember(member);
    setRoleInput('Sutradara');
    setIsCustomRole(false);
  };

  const handleAssign = async () => {
    if (!selectedMember || !roleInput.trim()) return;

    const existingEntry = eventCast.find(c => c.memberId === selectedMember.id);
    let newList: EventCastEntry[];

    if (existingEntry) {
      // Merge: append new role to existing roles
      const existingRoles = existingEntry.role.split(', ').map(r => r.trim());
      if (existingRoles.includes(roleInput.trim())) {
        alert(`${selectedMember.name} sudah memiliki peran "${roleInput.trim()}".`);
        return;
      }
      const mergedRole = [...existingRoles, roleInput.trim()].join(', ');
      newList = eventCast.map(c =>
        c.memberId === selectedMember.id ? { ...c, role: mergedRole } : c
      );
    } else {
      const entry: EventCastEntry = {
        memberId: selectedMember.id,
        name: selectedMember.name,
        photoUrl: selectedMember.photoUrl,
        role: roleInput.trim()
      };
      newList = [...eventCast, entry];
    }

    await saveEventCast(newList);
    setSelectedMember(null);
    setRoleInput('Sutradara');
    setIsCustomRole(false);
    setIsPickerOpen(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Hapus pemeran ini dari pementasan?')) return;
    const newList = eventCast.filter(c => c.memberId !== memberId);
    await saveEventCast(newList);
  };

  const assignedIds = new Set(eventCast.map(c => c.memberId));

  // All master members are available (can add more roles to already-assigned ones)
  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return masterCast;
    const q = searchQuery.toLowerCase();
    return masterCast.filter(m => m.name.toLowerCase().includes(q));
  }, [masterCast, searchQuery]);


  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-5 md:p-6 flex flex-col gap-5 shadow-2xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white tracking-wide">Pemeran & Tim untuk Event Ini</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pilih seniman dari Database Master dan tentukan peran mereka untuk pementasan ini.
          </p>
        </div>

        <Button onClick={openPicker} size="sm" className="h-9 shrink-0 shadow-lg">
          <UserPlus className="w-4 h-4 mr-1.5" /> Tambah Pemeran
        </Button>
      </div>

      {/* Assigned Cast List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">Memuat data pemeran...</div>
      ) : eventCast.length === 0 ? (
        <div className="p-8 border border-dashed border-neutral-800 rounded-xl text-center flex flex-col items-center gap-2">
          <Users className="w-8 h-8 text-neutral-600" />
          <p className="text-sm text-neutral-400">Belum ada pemeran yang ditambahkan ke pementasan ini.</p>
          <span className="text-xs text-neutral-500">Gunakan tombol &quot;Tambah Pemeran&quot; untuk memilih dari Database Master.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {eventCast.map((entry) => (
            <div 
              key={entry.memberId}
              className="relative group border rounded-xl p-3.5 flex items-center gap-3.5 bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 shadow-md"
            >
              {/* Avatar */}
              <div className="w-12 h-14 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                <img src={entry.photoUrl} alt={entry.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-8">
                <h4 className="text-xs font-semibold text-white truncate">{entry.name}</h4>
                <span className="text-[10px] text-neutral-400 block truncate mt-0.5">{entry.role}</span>
              </div>

              {/* Remove Button */}
              <button 
                onClick={() => handleRemove(entry.memberId)}
                className="absolute right-2 top-2 p-1.5 rounded-md bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Hapus dari pementasan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Picker Modal (Portal) */}
      {isPickerOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsPickerOpen(false); }}
        >
          <div className="w-full sm:max-w-xl md:max-w-2xl bg-neutral-900 border border-neutral-800 sm:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 relative z-[10000] flex flex-col max-h-[92vh] sm:max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="border-b border-neutral-800 shrink-0">
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {selectedMember ? 'Tetapkan Peran' : 'Pilih Seniman dari Database Master'}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {selectedMember 
                      ? `Tentukan peran untuk ${selectedMember.name}` 
                      : 'Pilih seniman lalu tentukan perannya untuk event ini.'}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="text-neutral-500 hover:text-white text-xs font-medium ml-4 shrink-0"
                >
                  Tutup
                </button>
              </div>

              {/* Search Bar (only in selection mode) */}
              {!selectedMember && masterCast.length > 0 && (
                <div className="px-5 pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari nama seniman..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-8 rounded-lg border border-neutral-800 bg-neutral-950/80 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-neutral-700 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5">
              
              {/* If a member is selected, show role assignment */}
              {selectedMember ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <div className="w-11 h-14 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0">
                      <img src={selectedMember.photoUrl} alt={selectedMember.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{selectedMember.name}</h4>
                      <span className="text-[10px] text-neutral-500">Dipilih — tentukan peran di bawah</span>
                    </div>
                  </div>

                  {/* Role Selector — overflow visible so dropdown renders above */}
                  <div className="space-y-1.5 relative" style={{ overflow: 'visible' }}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-neutral-400 font-medium">Peran / Jabatan untuk Event Ini</label>
                      {isCustomRole && (
                        <button 
                          type="button" 
                          onClick={() => { setIsCustomRole(false); setRoleInput('Sutradara'); }}
                          className="text-[10px] text-neutral-400 hover:text-white underline"
                        >
                          Pilih dari daftar
                        </button>
                      )}
                    </div>

                    {!isCustomRole ? (
                      <CustomSelect
                        value={roleInput}
                        onChange={(val) => {
                          if (val === '__NEW_ROLE__') {
                            setIsCustomRole(true);
                            setRoleInput('');
                          } else {
                            setRoleInput(val);
                          }
                        }}
                        options={getRoleOptions()}
                        placeholder="Pilih Peran/Jabatan"
                      />
                    ) : (
                      <Input 
                        type="text"
                        placeholder="Tuliskan nama Peran / Jabatan Baru..."
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" onClick={() => setSelectedMember(null)} className="flex-1">
                      Kembali
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAssign} 
                      disabled={!roleInput.trim()}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Tetapkan
                    </Button>
                  </div>
                </div>
              ) : (
                /* Member Selection List */
                <div className="space-y-4">
                  {filteredAvailable.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-neutral-800 rounded-xl">
                      <p className="text-sm text-neutral-400">
                        {masterCast.length === 0 
                          ? 'Database Master kosong. Tambahkan seniman terlebih dahulu di menu Sistem → Database Master.' 
                          : searchQuery 
                            ? `Tidak ada seniman dengan nama "${searchQuery}".`
                            : 'Semua seniman sudah ditambahkan ke pementasan ini.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                      {!searchQuery && (
                        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium block pb-0.5">Tersedia ({filteredAvailable.length})</span>
                      )}
                      {filteredAvailable.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => handleSelectMember(member)}
                          className="w-full group border rounded-xl px-3 py-2.5 bg-neutral-950/60 border-neutral-800/80 hover:border-white/30 hover:bg-neutral-800/60 transition-all duration-200 flex items-center gap-3 cursor-pointer text-left"
                        >
                          <div className="w-9 h-11 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-neutral-300 group-hover:text-white truncate block transition-colors">{member.name}</span>
                            {assignedIds.has(member.id) && (
                              <span className="text-[10px] text-neutral-500 truncate block">{eventCast.find(c => c.memberId === member.id)?.role}</span>
                            )}
                          </div>
                          {assignedIds.has(member.id) ? (
                            <span className="text-[9px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full ml-auto shrink-0">+ Peran</span>
                          ) : (
                            <Plus className="w-4 h-4 text-neutral-600 group-hover:text-white ml-auto shrink-0 transition-colors" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
