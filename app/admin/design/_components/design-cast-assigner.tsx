'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Search, X } from 'lucide-react';
import { useToast } from '@/app/components/Toast';
import type { CastMember } from '@/app/admin/anggota/_components';

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

export function DesignCastAssigner({ eventId }: { eventId: string }) {
  const [masterCast, setMasterCast] = useState<CastMember[]>([]);
  const [eventCast, setEventCast] = useState<EventCastEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  // Modal & form state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CastMember | null>(null);
  const [roleInput, setRoleInput] = useState('Sutradara');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch master list from members table with storage fallback
      let loadedMaster: CastMember[] = [];
      const { data: dbMembers } = await supabase.from('members').select('*').order('name', { ascending: true });
      if (dbMembers && dbMembers.length > 0) {
        loadedMaster = dbMembers.map((m: any) => ({ id: m.id, name: m.name, photoUrl: m.photo_url || '' }));
      } else {
        const { data: masterData } = await supabase.storage.from('assets').download('global/cast_members.json');
        if (masterData) {
          try {
            const parsed = JSON.parse(await masterData.text());
            loadedMaster = parsed.map((m: any) => ({ id: m.id, name: m.name, photoUrl: m.photoUrl }));
          } catch (e) {}
        }
      }
      setMasterCast(loadedMaster);

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

  const openPicker = () => {
    setSelectedMember(null);
    setRoleInput('Sutradara');
    setIsEditingExisting(false);
    setSearchQuery('');
    setIsPickerOpen(true);
  };

  const handleSelectMember = (member: CastMember) => {
    setSelectedMember(member);
    setIsEditingExisting(false);
    setRoleInput('Sutradara');
  };

  const handleEditRole = (entry: EventCastEntry) => {
    setSelectedMember({
      id: entry.memberId,
      name: entry.name,
      photoUrl: entry.photoUrl
    });
    setRoleInput(entry.role);
    setIsEditingExisting(true);
    setIsPickerOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedMember || !roleInput.trim()) return;

    const existingEntry = eventCast.find(c => c.memberId === selectedMember.id);
    let newList: EventCastEntry[];

    if (existingEntry) {
      if (isEditingExisting) {
        newList = eventCast.map(c =>
          c.memberId === selectedMember.id ? { ...c, role: roleInput.trim() } : c
        );
        showToast(`Peran untuk ${selectedMember.name} berhasil diperbarui!`, 'success');
      } else {
        const existingRoles = existingEntry.role.split(', ').map(r => r.trim());
        if (existingRoles.includes(roleInput.trim())) {
          showToast(`${selectedMember.name} sudah memiliki peran "${roleInput.trim()}".`, 'error');
          return;
        }
        const mergedRole = [...existingRoles, roleInput.trim()].join(', ');
        newList = eventCast.map(c =>
          c.memberId === selectedMember.id ? { ...c, role: mergedRole } : c
        );
        showToast(`Peran tambahan untuk ${selectedMember.name} berhasil disimpan!`, 'success');
      }
    } else {
      const entry: EventCastEntry = {
        memberId: selectedMember.id,
        name: selectedMember.name,
        photoUrl: selectedMember.photoUrl,
        role: roleInput.trim()
      };
      newList = [...eventCast, entry];
      showToast(`${selectedMember.name} berhasil ditambahkan ke panggung!`, 'success');
    }

    await saveEventCast(newList);
    setSelectedMember(null);
    setRoleInput('Sutradara');
    setIsPickerOpen(false);
    setIsEditingExisting(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Hapus pemeran ini dari panggung?')) return;
    const newList = eventCast.filter(c => c.memberId !== memberId);
    await saveEventCast(newList);
    showToast('Pemeran berhasil dihapus dari panggung.', 'success');
  };

  // Master available search
  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return masterCast;
    const q = searchQuery.toLowerCase();
    return masterCast.filter(m => m.name.toLowerCase().includes(q));
  }, [masterCast, searchQuery]);

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-4 flex flex-col gap-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-neutral-400">
          Daftar Pemeran ({eventCast.length})
        </span>

        <button
          onClick={openPicker}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Pemeran</span>
        </button>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="py-8 text-center text-xs text-neutral-500 animate-pulse">
          Memuat data pemeran panggung...
        </div>
      ) : eventCast.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          Belum ada pemeran yang ditugaskan di panggung ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-16">Foto</th>
                <th className="py-2.5 px-3">Nama Seniman</th>
                <th className="py-2.5 px-3">Peran</th>
                <th className="py-2.5 px-3 text-right w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {eventCast.map((entry, idx) => (
                <tr key={entry.memberId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 text-center text-neutral-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <img
                      src={entry.photoUrl}
                      alt={entry.name}
                      className="w-8 h-10 object-cover rounded-lg bg-neutral-800 shrink-0"
                    />
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {entry.name}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px]">
                      {entry.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditRole(entry)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Ubah Peran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(entry.memberId)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Hapus Pemeran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simplified Picker Modal */}
      {isPickerOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget) setIsPickerOpen(false); }}
        >
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 shrink-0">
              <h3 className="text-sm font-semibold text-white">
                {selectedMember ? (isEditingExisting ? 'Ubah Peran' : 'Tentukan Peran') : 'Pilih Seniman'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              {selectedMember ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 bg-black/40 border border-neutral-800 rounded-xl">
                    <img
                      src={selectedMember.photoUrl}
                      alt={selectedMember.name}
                      className="w-10 h-12 object-cover rounded-lg bg-neutral-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-white block truncate">{selectedMember.name}</span>
                      <span className="text-[11px] text-neutral-400">Seniman Terpilih</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-300">Peran di Panggung</label>
                    <input
                      list="cast-roles-list"
                      type="text"
                      placeholder="Pilih atau ketik peran (contoh: Pemeran Utama)"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                      autoFocus
                    />
                    <datalist id="cast-roles-list">
                      {DEFAULT_ROLES.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {!isEditingExisting && (
                      <button
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
                      >
                        Kembali
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAssign}
                      disabled={!roleInput.trim()}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors"
                    >
                      {isEditingExisting ? 'Simpan Peran' : 'Tetapkan ke Panggung'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari nama seniman..."
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

                  {/* List */}
                  {filteredAvailable.length === 0 ? (
                    <p className="text-xs text-neutral-500 text-center py-6">
                      {masterCast.length === 0 ? 'Belum ada data anggota di Master Anggota.' : 'Seniman tidak ditemukan.'}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                      {filteredAvailable.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectMember(m)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-neutral-800 transition-colors text-left"
                        >
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            className="w-8 h-10 object-cover rounded-lg bg-neutral-800 shrink-0"
                          />
                          <span className="text-xs font-semibold text-white truncate">{m.name}</span>
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

export { DesignCastAssigner as EventCastAssigner };
