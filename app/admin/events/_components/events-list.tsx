'use client';

import { Edit2, Trash2, CalendarDays, MapPin, Map, MoreVertical } from 'lucide-react';
import { Youtube } from '@/app/components/icons/SocialIcons';
import { Button } from '@/app/components/ui/Button';

interface EventsListProps {
  events: any[];
  onEditEvent: (ev: any) => void;
  onDeleteEvent: (id: string) => void;
}

export function EventsList({ events, onEditEvent, onDeleteEvent }: EventsListProps) {
  const formatIndonesianDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
  };

  return (
    <>
      {/* Table Content (Desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-950/50">
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/3">Nama Panggung</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/4">Tanggal & Waktu</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-1/4">Lokasi</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                  <p>Belum ada jadwal panggung.</p>
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
                      {ev.youtube_url && (
                        <a href={ev.youtube_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 ml-6">
                          <Youtube className="w-3.5 h-3.5" /> Rekaman Video
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEditEvent(ev)}
                        className="h-8 border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => onDeleteEvent(ev.id)}
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
            <p>Belum ada jadwal panggung.</p>
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
                  onClick={() => onEditEvent(ev)}
                  className="h-10 flex-1 border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => onDeleteEvent(ev.id)}
                  className="h-10 flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
