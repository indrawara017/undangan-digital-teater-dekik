'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '@/lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { CalendarDays, MapPin, Edit2, Trash2, Map, Plus, X } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

export function EventsTab({ events, fetchData }: { events: any[], fetchData: () => void }) {
  const formatIndonesianDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
  };

  const [eventForm, setEventForm] = useState({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '' });
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    if (editingEvent) {
      const { error } = await supabase.from('events').update(eventForm).eq('id', editingEvent.id);
      if (error) alert(error.message);
      else { 
        setEditingEvent(null); 
        setEventForm({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '' }); 
        setIsModalOpen(false);
        fetchData(); 
      }
    } else {
      const { error } = await supabase.from('events').insert([eventForm]);
      if (error) alert(error.message);
      else { 
        setEventForm({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '' }); 
        setIsModalOpen(false);
        fetchData(); 
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Hapus event ini?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchData();
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setEventForm({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (ev: any) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title,
      creator: ev.creator || '',
      date: ev.date || '',
      location: ev.location || '',
      description: ev.description || '',
      gmaps_url: ev.gmaps_url || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Table Container */}
      <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Toolbar / Header */}
        <div className="p-4 md:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-white tracking-wide">Data Pementasan</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-xs text-neutral-400 font-medium border border-neutral-700/50">
              Total: {events.length}
            </span>
          </div>
          <Button onClick={openAddModal} size="sm" className="h-9 shrink-0 shadow-lg">
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Pementasan
          </Button>
        </div>

        {/* Table Content (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-950/50">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/3">Judul Pementasan</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/4">Tanggal & Waktu</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/4">Lokasi</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                    <p>Belum ada jadwal pementasan.</p>
                  </td>
                </tr>
              ) : (
                events.map(ev => (
                  <tr key={ev.id} className="hover:bg-neutral-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white text-base font-cormorant tracking-wide">{ev.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        <span>{formatIndonesianDate(ev.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[200px]">{ev.location || '-'}</span>
                        </div>
                        {ev.gmaps_url && (
                          <a href={ev.gmaps_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 ml-6">
                            <Map className="w-3 h-3" /> Buka Maps
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(ev)}
                          className="h-8 border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="h-8"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card Content (Mobile) */}
        <div className="md:hidden flex flex-col divide-y divide-neutral-800/50">
          {events.length === 0 ? (
            <div className="px-6 py-12 text-center text-neutral-500">
              <p>Belum ada jadwal pementasan.</p>
            </div>
          ) : (
            events.map(ev => (
              <div key={ev.id} className="flex flex-col gap-4 p-5 hover:bg-neutral-800/30 transition-colors">
                <p className="font-medium text-white text-xl font-cormorant tracking-wide leading-tight">{ev.title}</p>
                
                <div className="flex flex-col gap-2.5 text-neutral-400 text-sm">
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{formatIndonesianDate(ev.date)}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1.5">
                      <span className="leading-snug">{ev.location || '-'}</span>
                      {ev.gmaps_url && (
                        <a href={ev.gmaps_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 uppercase tracking-widest font-medium mt-1">
                          <Map className="w-3 h-3" /> Buka Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-4 border-t border-neutral-800/50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditModal(ev)}
                    className="h-10 flex-1 border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="h-10 flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4 text-left">
            <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                <h3 className="text-lg font-medium text-white">
                  {editingEvent ? 'Edit Jadwal Pementasan' : 'Tambah Pementasan Baru'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveEvent} className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm text-neutral-400 font-medium block">Nama Pementasan</label>
                      <Input 
                        type="text" 
                        placeholder="Masukkan Nama Pementasan" 
                        value={eventForm.title} 
                        onChange={e => setEventForm({...eventForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-neutral-400 font-medium block">Karya (Penulis/Sutradara)</label>
                      <Input 
                        type="text" 
                        placeholder="Masukkan Nama Penulis/Sutradara" 
                        value={eventForm.creator} 
                        onChange={e => setEventForm({...eventForm, creator: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-sm text-neutral-400 font-medium block">Tanggal & Waktu</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <DatePicker
                          selected={(() => {
                            if (!eventForm.date) return null;
                            const d = new Date(eventForm.date);
                            return isNaN(d.getTime()) ? null : d;
                          })()}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const existing = eventForm.date ? new Date(eventForm.date) : new Date();
                              if (isNaN(existing.getTime())) {
                                existing.setTime(new Date().getTime());
                              }
                              date.setHours(existing.getHours());
                              date.setMinutes(existing.getMinutes());
                              
                              const tzOffset = date.getTimezoneOffset() * 60000;
                              const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
                              setEventForm({...eventForm, date: localISOTime});
                            }
                          }}
                          withPortal
                          dateFormat="dd MMM yyyy"
                          placeholderText="1. Pilih Tanggal"
                          className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 text-center cursor-pointer hover:bg-neutral-800/80"
                        />
                      </div>
                      <div className="flex-1 flex gap-2 items-center">
                        <div className="relative w-full">
                          <CustomSelect
                            value={(() => {
                              if (!eventForm.date) return '19';
                              const d = new Date(eventForm.date);
                              return isNaN(d.getTime()) ? '19' : String(d.getHours()).padStart(2, '0');
                            })()}
                            onChange={(val) => {
                              const hours = parseInt(val, 10);
                              const currentMins = eventForm.date && !isNaN(new Date(eventForm.date).getTime()) 
                                ? new Date(eventForm.date).getMinutes() 
                                : 0;
                              
                              const existing = eventForm.date ? new Date(eventForm.date) : new Date();
                              if (isNaN(existing.getTime())) existing.setTime(new Date().getTime());
                              
                              existing.setHours(hours);
                              existing.setMinutes(currentMins);
                              
                              const tzOffset = existing.getTimezoneOffset() * 60000;
                              const localISOTime = new Date(existing.getTime() - tzOffset).toISOString().slice(0, 16);
                              setEventForm({...eventForm, date: localISOTime});
                            }}
                            options={Array.from({length: 24}).map((_, i) => ({ value: String(i).padStart(2, '0'), label: String(i).padStart(2, '0') }))}
                          />
                        </div>
                        <span className="text-neutral-500 font-bold">:</span>
                        <div className="relative w-full">
                          <CustomSelect
                            value={(() => {
                              if (!eventForm.date) return '00';
                              const d = new Date(eventForm.date);
                              return isNaN(d.getTime()) ? '00' : String(d.getMinutes()).padStart(2, '0');
                            })()}
                            onChange={(val) => {
                              const mins = parseInt(val, 10);
                              const currentHours = eventForm.date && !isNaN(new Date(eventForm.date).getTime()) 
                                ? new Date(eventForm.date).getHours() 
                                : 19;
                              
                              const existing = eventForm.date ? new Date(eventForm.date) : new Date();
                              if (isNaN(existing.getTime())) existing.setTime(new Date().getTime());
                              
                              existing.setHours(currentHours);
                              existing.setMinutes(mins);
                              
                              const tzOffset = existing.getTimezoneOffset() * 60000;
                              const localISOTime = new Date(existing.getTime() - tzOffset).toISOString().slice(0, 16);
                              setEventForm({...eventForm, date: localISOTime});
                            }}
                            options={['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(val => ({ value: val, label: val }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm text-neutral-400 font-medium block">Lokasi (Teks)</label>
                  <Input 
                    type="text" 
                    placeholder="Masukkan Lokasi Pementasan" 
                    value={eventForm.location} 
                    onChange={e => setEventForm({...eventForm, location: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm text-neutral-400 font-medium block">Link Google Maps (Sematkan Peta / Embed)</label>
                  <Input 
                    type="text" 
                    placeholder="Masukkan Link Google Maps (Sematkan Peta)" 
                    value={eventForm.gmaps_url} 
                    onChange={e => {
                      let val = e.target.value;
                      const iframeMatch = val.match(/src="([^"]+)"/);
                      if (iframeMatch) {
                        val = iframeMatch[1];
                      }
                      setEventForm({...eventForm, gmaps_url: val});
                    }} 
                  />
                  <p className="text-[10px] text-neutral-500">
                    Buka Google Maps &gt; Bagikan &gt; Sematkan Peta (Embed a map) &gt; Salin HTML. Anda bisa langsung mem-paste kode HTML tersebut di sini.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-neutral-400 font-medium block">Sinopsis Pementasan</label>
                  <textarea 
                    placeholder="Ceritakan gambaran singkat tentang pementasan ini..." 
                    value={eventForm.description} 
                    onChange={e => setEventForm({...eventForm, description: e.target.value})} 
                    className="flex w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y custom-scrollbar"
                  />
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-neutral-800 mt-2">
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingEvent ? 'Simpan' : 'Tambah Event'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
