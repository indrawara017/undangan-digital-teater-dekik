'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Image as ImageIcon, UploadCloud, Layout, Eye, Music, Power } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MultiImageUpload } from '../components/MultiImageUpload';
import { CustomSelect } from '@/app/components/CustomSelect';

export function DesignTab({ events, selectedEventId, setSelectedEventId, fetchData }: { 
  events: any[], 
  selectedEventId: string, 
  setSelectedEventId: (id: string) => void,
  fetchData: () => void
}) {
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  useEffect(() => {
    // Only needed for some specific state if any, otherwise MultiImageUpload handles its own fetch
  }, [selectedEventId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileName: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) return;
    setUploadingImage(fileName);
    const filePath = `${selectedEventId}/${fileName}`;
    const { error } = await supabase.storage.from('assets').upload(filePath, file, { upsert: true, cacheControl: '3600' });
    if (error) alert('Gagal mengunggah: ' + error.message);
    else alert(`${fileName} berhasil diperbarui untuk event ini!`);
    setUploadingImage(null);
  };

  const handleToggleAudio = async (currentStatus: boolean) => {
    if (!selectedEventId) return;
    const { error } = await supabase.from('events').update({ is_audio_enabled: !currentStatus }).eq('id', selectedEventId);
    if (error) alert('Gagal mengubah pengaturan musik: ' + error.message);
    else fetchData();
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const assetFields = [
    { name: 'background.jpg', label: 'Background', desc: 'Visual latar belakang utama.' },
    { name: 'design.jpg', label: 'Poster Pementasan', desc: 'Gambar utama untuk publikasi.' },
    { name: 'ticket.jpg', label: 'Desain Tiket', desc: 'Visual yang muncul pada e-tiket.' },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 pb-20">
      
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
        
        {selectedEventId && (
          <Button 
            variant="outline"
            className="shrink-0 h-[42px] px-5 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all duration-300 rounded-lg text-sm"
            onClick={() => window.open(`/preview?event=${selectedEventId}`, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
        )}
      </div>

      {selectedEventId ? (
        <div className="flex flex-col gap-12">
          
          {/* Main Assets */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
              <Layout className="w-5 h-5 text-white" />
              <h2 className="text-lg font-medium text-white tracking-wide">Aset Visual Utama</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {assetFields.map((field) => {
                const isVertical = field.name === 'design.jpg' || field.name === 'background.jpg';
                const aspectClass = isVertical ? 'aspect-[9/16] max-w-[200px] mx-auto' : 'aspect-video';

                return (
                  <div key={field.name} className="relative group p-5 border border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/60 rounded-2xl flex flex-col gap-4 transition-all duration-300">
                    <div>
                      <label className="text-sm font-medium text-white block">{field.label}</label>
                      <span className="text-[11px] text-neutral-500 mt-0.5 block leading-relaxed">{field.desc}</span>
                    </div>
                    
                    <div className={`relative w-full bg-black/40 border border-dashed border-neutral-700 rounded-xl overflow-hidden group/img cursor-pointer transition-colors hover:border-neutral-500 ${aspectClass}`}>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        onChange={(e) => handleFileUpload(e, field.name)} 
                        disabled={uploadingImage === field.name}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                      title={`Unggah ${field.label}`}
                    />
                    
                    <img 
                      src={`${supabase.storage.from('assets').getPublicUrl(`${selectedEventId}/${field.name}`).data.publicUrl}?t=${Date.now()}`}
                      alt={field.label}
                      className="w-full h-full object-cover opacity-80 group-hover/img:opacity-30 transition-opacity duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        e.currentTarget.nextElementSibling?.classList.add('flex');
                      }}
                    />
                    
                    {/* Fallback Placeholder (Hidden if img loads) */}
                    <div className="hidden absolute inset-0 flex-col items-center justify-center gap-2 pointer-events-none">
                      <ImageIcon className="w-8 h-8 text-neutral-700" />
                      <span className="text-[10px] uppercase tracking-wider font-medium text-neutral-600">Klik untuk Unggah</span>
                    </div>

                    {/* Uploading Overlay */}
                    {uploadingImage === field.name && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <span className="text-xs tracking-widest text-white animate-pulse font-medium">MENGUNGGAH...</span>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/20 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold shadow-xl">
                        <UploadCloud className="w-4 h-4" /> Ganti {field.label.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
          
          {/* Audio Assets */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3 justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-white" />
                <h2 className="text-lg font-medium text-white tracking-wide">Soundtrack Pementasan</h2>
              </div>
              
              <button 
                onClick={() => handleToggleAudio(selectedEvent?.is_audio_enabled !== false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                  selectedEvent?.is_audio_enabled !== false 
                    ? 'bg-green-950/30 text-green-400 border-green-900/50 hover:bg-green-900/50' 
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {selectedEvent?.is_audio_enabled !== false ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>
            
            <div className="p-5 border border-neutral-800 bg-neutral-900/20 rounded-2xl flex flex-col sm:flex-row gap-6 items-start transition-all duration-300">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-white block">File Audio (MP3/WAV)</label>
                <span className="text-[11px] text-neutral-500 mt-1 block leading-relaxed max-w-lg mb-4">
                  Lagu ini akan tersedia sebagai musik pengiring undangan. Tamu dapat memutarnya melalui tombol khusus di pojok layar. Pastikan ukuran file di bawah 5MB agar tidak membebani server.
                </span>
                
                {/* Separated Player & File Info */}
                <div className={`flex flex-col gap-3 ${!selectedEvent?.is_audio_enabled && 'opacity-50 grayscale pointer-events-none'}`}>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-black/40 border border-neutral-800 rounded-lg flex items-center gap-2 w-fit shadow-inner">
                      <Music className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-xs font-medium text-neutral-300">music.mp3</span>
                    </div>
                  </div>
                  <audio 
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${selectedEventId}/music.mp3?t=${Date.now()}`}
                    className="w-full max-w-sm h-9 custom-audio"
                    controls
                    controlsList="nodownload noplaybackrate"
                  />
                </div>
              </div>
              
              {/* Separate Upload Box */}
              <div className={`relative w-full sm:w-48 h-32 mt-2 sm:mt-0 bg-black/40 border border-dashed border-neutral-700 rounded-xl overflow-hidden group cursor-pointer transition-colors hover:border-neutral-500 shrink-0 flex flex-col items-center justify-center gap-2 ${!selectedEvent?.is_audio_enabled && 'opacity-50 grayscale'}`}>
                <input 
                  type="file" 
                  accept="audio/mpeg, audio/wav" 
                  onChange={(e) => handleFileUpload(e, 'music.mp3')} 
                  disabled={uploadingImage === 'music.mp3' || selectedEvent?.is_audio_enabled === false}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                  title="Unggah Lagu Baru"
                />
                
                {uploadingImage === 'music.mp3' ? (
                  <span className="text-xs tracking-widest text-white animate-pulse font-medium z-30">MENGUNGGAH...</span>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-neutral-600 group-hover:text-white transition-colors" />
                    <span className="text-[10px] uppercase tracking-wider font-medium text-neutral-500 group-hover:text-neutral-300 text-center px-2">Ganti File Audio</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="h-[450px] md:h-[600px]">
              <MultiImageUpload 
                eventId={selectedEventId} 
                folderName="logos" 
                title="Logo Header (Atas)" 
                icon="image" 
              />
            </div>
            <div className="h-[450px] md:h-[600px]">
              <MultiImageUpload 
                eventId={selectedEventId} 
                folderName="sponsors" 
                title="Sponsor & Partner (Bawah)" 
                icon="users" 
              />
            </div>
          </div>
          
        </div>
      ) : (
        <div className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-2xl text-neutral-400 flex flex-col items-center justify-center gap-4 text-center">
          <Layout className="w-8 h-8 text-neutral-600" />
          <p>Silakan pilih atau buat Jadwal Pementasan terlebih dahulu untuk mulai mengatur visual.</p>
        </div>
      )}
    </div>
  );
}
