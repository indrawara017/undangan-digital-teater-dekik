'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

export function SystemSettings() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    showSynopsis: true,
    showTicketPamflet: true,
    showCast: true,
    showLocationMap: true,
    showRSVP: true,
    showSponsors: true,
    instagram: '',
    youtube: '',
    tiktok: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.storage.from('assets').download('global/config.json');
      if (data) {
        try {
          const text = await data.text();
          setConfig((prev: any) => ({ ...prev, ...JSON.parse(text) }));
        } catch (e) {
          console.error('Failed to parse config');
        }
      }
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    const file = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const { error } = await supabase.storage.from('assets').upload('global/config.json', file, { 
      upsert: true, 
      cacheControl: '300' 
    });
    
    if (error) {
      showToast('Gagal menyimpan pengaturan: ' + error.message, 'error');
    } else {
      showToast('Pengaturan sistem berhasil disimpan!', 'success');
    }
    
    setSaving(false);
  };

  const sectionToggles = [
    { key: 'showSynopsis', label: 'Sinopsis Cerita' },
    { key: 'showTicketPamflet', label: 'Poster & E-Tiket' },
    { key: 'showCast', label: 'Daftar Pemeran (Cast)' },
    { key: 'showLocationMap', label: 'Waktu & Peta Lokasi' },
    { key: 'showRSVP', label: 'Konfirmasi Hadir (RSVP)' },
    { key: 'showSponsors', label: 'Sponsor & Mitra' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2.5">
          <Settings className="w-5 h-5 text-white" />
          <h2 className="text-base font-semibold text-white tracking-wide">Pengaturan Sistem</h2>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Atur visibilitas fitur undangan tamu dan tautan media sosial teater.
        </p>
      </div>
      
      {/* Minimalist Card */}
      <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-2xl">
        {/* Section 1: Visibility Toggles */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Visibilitas Modul Undangan
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectionToggles.map((item) => {
              const isEnabled = config[item.key] !== false;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setConfig((prev: any) => ({ ...prev, [item.key]: !isEnabled }))}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    isEnabled 
                      ? 'bg-white/[0.04] border-neutral-700/80 text-white' 
                      : 'bg-black/30 border-neutral-800/60 text-neutral-500'
                  }`}
                >
                  <span className="text-xs font-medium">{item.label}</span>
                  <div 
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                      isEnabled ? 'bg-emerald-500/90' : 'bg-neutral-800'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Social Media Links */}
        <div className="flex flex-col gap-3 pt-2">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Media Sosial (Footer Undangan)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400">Instagram</label>
              <input 
                type="text" 
                placeholder="@username (tanpa @)"
                value={config.instagram || ''}
                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400">YouTube</label>
              <input 
                type="text" 
                placeholder="Link atau nama channel"
                value={config.youtube || ''}
                onChange={(e) => setConfig({ ...config, youtube: e.target.value })}
                className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400">TikTok</label>
              <input 
                type="text" 
                placeholder="@username (tanpa @)"
                value={config.tiktok || ''}
                onChange={(e) => setConfig({ ...config, tiktok: e.target.value })}
                className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2 border-t border-neutral-800/60">
          <button 
            type="button"
            onClick={saveConfig} 
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
