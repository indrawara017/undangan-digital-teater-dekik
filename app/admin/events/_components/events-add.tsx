'use client';

import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { X } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

interface EventsAddProps {
  isOpen: boolean;
  onClose: () => void;
  eventForm: { title: string; creator: string; date: string; location: string; description: string; gmaps_url: string; youtube_url?: string; spotify_url?: string };
  setEventForm: (form: any) => void;
  isEditing: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function EventsAdd({ isOpen, onClose, eventForm, setEventForm, isEditing, onSave }: EventsAddProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="flex min-h-full items-center justify-center p-4 text-left">
        <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-neutral-800">
            <h3 className="text-lg font-medium text-white">
              {isEditing ? 'Edit Jadwal Panggung' : 'Tambah Panggung Baru'}
            </h3>
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={onSave} className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-neutral-400 font-medium block">Nama Panggung</label>
                  <Input 
                    type="text" 
                    placeholder="Masukkan Nama Panggung" 
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
                placeholder="Masukkan Lokasi Panggung" 
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
              <label className="text-sm text-neutral-400 font-medium block">Link Rekaman YouTube (Opsional)</label>
              <Input 
                type="url" 
                placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..." 
                value={eventForm.youtube_url || ''} 
                onChange={e => setEventForm({...eventForm, youtube_url: e.target.value})} 
              />
              <p className="text-[10px] text-neutral-500">
                Untuk pementasan yang sudah selesai, masukkan link video YouTube agar pengunjung dapat menyaksikan rekaman penampilannya.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-neutral-400 font-medium block">Link Album / Soundtrack Spotify (Opsional)</label>
              <Input 
                type="url" 
                placeholder="https://open.spotify.com/album/... atau track/..." 
                value={eventForm.spotify_url || ''} 
                onChange={e => setEventForm({...eventForm, spotify_url: e.target.value})} 
              />
              <p className="text-[10px] text-neutral-500">
                Masukkan tautan album, lagu tema, atau playlist Spotify resmi untuk pementasan ini agar penonton dapat mendengarkan lagu temanya.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-neutral-400 font-medium block">Sinopsis Panggung</label>
              <textarea 
                placeholder="Ceritakan gambaran singkat tentang panggung ini..." 
                value={eventForm.description} 
                onChange={e => setEventForm({...eventForm, description: e.target.value})} 
                className="flex w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y custom-scrollbar"
              />
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-neutral-800 mt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? 'Simpan' : 'Tambah Panggung'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
