'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader } from '@/app/components/Loader';
import { Palette, ImageIcon, Music, Users, Layers, Handshake } from 'lucide-react';
import { 
  DesignToolbar, 
  DesignMainAssets, 
  DesignAudioAssets, 
  DesignCastAssigner,
  DesignLogos,
  DesignSponsors
} from './_components';

export default function DesignPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) {
      setEvents(data);
      if (data.length > 0 && !selectedEventId) setSelectedEventId(data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (loading && events.length === 0) return <Loader text="Memuat Visual & Desain..." />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      <DesignToolbar 
        events={events} 
        selectedEventId={selectedEventId} 
        setSelectedEventId={setSelectedEventId} 
      />

      {selectedEventId ? (
        <div className="flex flex-col gap-10">
          {/* 1. Aset Visual Utama */}
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-white" />
                <h3 className="text-base font-semibold text-white tracking-wide">Aset Visual Utama</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Unggah gambar latar belakang, poster pementasan, dan desain tiket digital panggung ini.
              </p>
            </div>
            <DesignMainAssets selectedEventId={selectedEventId} />
          </div>

          {/* 2. Soundtrack Panggung */}
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2.5">
                <Music className="w-5 h-5 text-white" />
                <h3 className="text-base font-semibold text-white tracking-wide">Soundtrack Panggung</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Musik pengiring atmosferik yang dapat diputar tamu saat membuka undangan digital panggung ini.
              </p>
            </div>
            <DesignAudioAssets selectedEvent={selectedEvent} fetchData={fetchData} />
          </div>

          {/* 3. Pemeran & Tim untuk Panggung */}
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2.5">
                <Users className="w-5 h-5 text-white" />
                <h3 className="text-base font-semibold text-white tracking-wide">Pemeran & Tim untuk Panggung</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Pilih seniman dari Database Master dan tentukan peran mereka pada jadwal panggung ini.
              </p>
            </div>
            <DesignCastAssigner eventId={selectedEventId} />
          </div>

          {/* 4. Logo Panggung */}
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2.5">
                <Layers className="w-5 h-5 text-white" />
                <h3 className="text-base font-semibold text-white tracking-wide">Logo Panggung</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Unggah logo pihak penyelenggara atau kolaborator panggung.
              </p>
            </div>
            <DesignLogos eventId={selectedEventId} />
          </div>

          {/* 5. Sponsor Panggung */}
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2.5">
                <Handshake className="w-5 h-5 text-white" />
                <h3 className="text-base font-semibold text-white tracking-wide">Sponsor Panggung</h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Kelola logo instansi sponsor dan mitra pendukung acara.
              </p>
            </div>
            <DesignSponsors eventId={selectedEventId} />
          </div>
        </div>
      ) : (
        <div className="p-12 border border-neutral-800 bg-neutral-900/40 rounded-2xl text-neutral-400 flex flex-col items-center justify-center gap-3 text-center shadow-2xl">
          <Palette className="w-10 h-10 text-neutral-600 mb-1" />
          <h3 className="text-base font-semibold text-white">Belum Ada Panggung Terpilih</h3>
          <p className="text-xs text-neutral-400 max-w-sm">
            Silakan pilih atau buat Jadwal Panggung terlebih dahulu melalui menu Panggung untuk mulai mengatur aset visual.
          </p>
        </div>
      )}
    </div>
  );
}
