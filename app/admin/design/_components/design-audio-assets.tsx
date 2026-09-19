'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Power, UploadCloud } from 'lucide-react';
import { useToast } from '@/app/components/Toast';
import { getSpotifyEmbedUrl } from '@/lib/assets';

interface DesignAudioAssetsProps {
  selectedEvent: any;
  fetchData: () => void;
}

export function DesignAudioAssets({ selectedEvent, fetchData }: DesignAudioAssetsProps) {
  const [uploadingAudio, setUploadingAudio] = useState<boolean>(false);
  const [cacheBust, setCacheBust] = useState<number>(Date.now());
  const [spotifyInput, setSpotifyInput] = useState<string>(selectedEvent?.spotify_url || '');
  const [savingSpotify, setSavingSpotify] = useState<boolean>(false);
  const { showToast } = useToast();
  
  const selectedEventId = selectedEvent?.id;
  const isAudioEnabled = selectedEvent?.is_audio_enabled !== false;

  useEffect(() => {
    setSpotifyInput(selectedEvent?.spotify_url || '');
  }, [selectedEvent?.id, selectedEvent?.spotify_url]);

  const spotifyEmbed = getSpotifyEmbedUrl(spotifyInput);

  const handleSaveSpotify = async () => {
    if (!selectedEventId) return;
    setSavingSpotify(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({ spotify_url: spotifyInput.trim() || null })
        .eq('id', selectedEventId);
      if (error) throw error;
      showToast('Tautan Spotify pementasan berhasil disimpan!', 'success');
      fetchData();
    } catch (err: any) {
      showToast('Gagal menyimpan Spotify: ' + err.message, 'error');
    } finally {
      setSavingSpotify(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) return;

    // Check size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran file audio maksimal 8MB.', 'error');
      return;
    }

    setUploadingAudio(true);
    const filePath = `${selectedEventId}/music.mp3`;
    const { error } = await supabase.storage.from('assets').upload(filePath, file, { 
      upsert: true, 
      cacheControl: '3600' 
    });

    if (error) {
      showToast('Gagal mengunggah file audio: ' + error.message, 'error');
    } else {
      setCacheBust(Date.now());
      showToast('Soundtrack musik berhasil diperbarui!', 'success');
      fetchData();
    }
    setUploadingAudio(false);
  };

  const handleToggleAudio = async () => {
    if (!selectedEventId) return;
    const nextStatus = !isAudioEnabled;
    const { error } = await supabase.from('events').update({ is_audio_enabled: nextStatus }).eq('id', selectedEventId);
    
    if (error) {
      showToast('Gagal mengubah status musik: ' + error.message, 'error');
    } else {
      showToast(`Soundtrack panggung ${nextStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
      fetchData();
    }
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Status & Player */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
        <button 
          onClick={handleToggleAudio}
          className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border shrink-0 w-full sm:w-auto ${
            isAudioEnabled 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40' 
              : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800'
          }`}
          title={isAudioEnabled ? "Klik untuk menonaktifkan musik" : "Klik untuk mengaktifkan musik"}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isAudioEnabled ? 'Musik Aktif' : 'Musik Nonaktif'}</span>
        </button>

        <div className={`flex-1 w-full max-w-md transition-opacity ${!isAudioEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <audio 
            key={cacheBust}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${selectedEventId}/music.mp3?t=${cacheBust}`}
            className="w-full h-9 custom-audio rounded-lg"
            controls
            controlsList="nodownload noplaybackrate"
          />
        </div>
      </div>

      {/* Upload File Button */}
      <div className="relative shrink-0 w-full sm:w-auto">
        <input 
          type="file" 
          id="audio-upload-input"
          accept="audio/mpeg, audio/wav, audio/mp3" 
          onChange={handleFileUpload} 
          disabled={uploadingAudio || !isAudioEnabled}
          className="sr-only" 
          title="Unggah Lagu Baru"
        />
        <label
          htmlFor="audio-upload-input"
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all w-full sm:w-auto ${
            !isAudioEnabled
              ? 'opacity-40 pointer-events-none border-neutral-800 text-neutral-500'
              : uploadingAudio
              ? 'bg-white/10 border-white/20 text-white cursor-wait'
              : 'border-neutral-700 bg-black/40 text-neutral-300 hover:text-white hover:border-neutral-500 cursor-pointer'
          }`}
        >
          {uploadingAudio ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-neutral-400" />
              <span>Ganti Audio MP3</span>
            </>
          )}
        </label>
      </div>

      {/* Spotify Album / OST Section */}
      <div className="w-full pt-3 mt-1 border-t border-neutral-800/80 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-white tracking-wide">Album / Soundtrack Spotify Pementasan</span>
            <p className="text-[10px] text-neutral-400">
              Tautkan album, lagu tema, atau playlist Spotify resmi untuk diputar langsung di halaman detail pementasan.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="https://open.spotify.com/album/... atau track/..."
            value={spotifyInput}
            onChange={(e) => setSpotifyInput(e.target.value)}
            className="flex-1 h-9 px-3 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <button
            type="button"
            onClick={handleSaveSpotify}
            disabled={savingSpotify}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
          >
            {savingSpotify ? 'Menyimpan...' : 'Simpan Spotify'}
          </button>
        </div>

        {spotifyEmbed && (
          <div className="mt-1 rounded-xl overflow-hidden border border-neutral-800 bg-black/30">
            <iframe
              src={spotifyEmbed}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
