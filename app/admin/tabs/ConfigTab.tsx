'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Image as ImageIcon, UploadCloud, Save, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CustomSelect } from '@/app/components/CustomSelect';
import { CastMasterManager } from '../components/CastMasterManager';

export function ConfigTab({ events = [] }: { events?: any[] }) {
  const [activeTab, setActiveTab] = useState<'system' | 'cast'>('system');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);
  
  const [config, setConfig] = useState({
    showSynopsis: true,
    showTicketPamflet: true,
    showCast: true,
    showTrailer: true,
    showLocationMap: true,
    showRSVP: true,
    showSponsors: true,
    instagram: '',
    youtube: '',
    tiktok: ''
  });

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.storage.from('assets').download('global/config.json');
      if (data) {
        try {
          const text = await data.text();
          setConfig(JSON.parse(text));
        } catch (e) {
          console.error('Failed to parse config');
        }
      }
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    const file = new Blob([JSON.stringify(config)], { type: 'application/json' });
    const { error } = await supabase.storage.from('assets').upload('global/config.json', file, { 
      upsert: true, 
      cacheControl: '300' 
    });
    
    if (error) alert('Gagal menyimpan pengaturan: ' + error.message);
    else alert('Pengaturan sistem berhasil disimpan!');
    
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const { error } = await supabase.storage.from('assets').upload('global/app-logo.png', file, { 
      upsert: true, 
      cacheControl: '3600' 
    });
    
    if (error) alert('Gagal mengunggah logo: ' + error.message);
    else alert('Logo aplikasi berhasil diperbarui! Silakan refresh halaman untuk melihat perubahan pada Navbar.');
    
    setUploading(false);
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const { error } = await supabase.storage.from('assets').upload('global/favicon.png', file, { 
      upsert: true, 
      cacheControl: '3600' 
    });
    
    if (error) alert('Gagal mengunggah favicon: ' + error.message);
    else alert('Favicon aplikasi berhasil diperbarui! Silakan refresh halaman.');
    
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 ${
            activeTab === 'system'
              ? 'bg-white text-black shadow-xl shadow-white/10'
              : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <Settings className="w-4 h-4" /> Pengaturan System & Logo
        </button>

        <button
          onClick={() => setActiveTab('cast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 ${
            activeTab === 'cast'
              ? 'bg-white text-black shadow-xl shadow-white/10'
              : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <Users className="w-4 h-4" /> Database Master Pemeran & Tim (Cast & Crew)
        </button>
      </div>

      {activeTab === 'system' ? (
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Left Column: Logo Upload */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
            <ImageIcon className="w-5 h-5 text-white" />
            <h2 className="text-lg font-medium text-white tracking-wide">Logo Aplikasi Utama</h2>
          </div>
          
          <div className="p-5 border border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div>
                <label className="text-sm font-medium text-white block">Ganti Logo Navbar</label>
                <span className="text-xs text-neutral-500 mt-1 block">
                  Logo ini akan ditampilkan di Navbar atas pada seluruh halaman Admin. Gunakan format PNG dengan background transparan.
                </span>
              </div>
            </div>
            
            <div className="relative mt-2">
              <input 
                type="file" 
                id="file-app-logo"
                accept="image/png, image/jpeg, image/svg+xml" 
                onChange={handleLogoUpload} 
                disabled={uploading}
                className="sr-only" 
              />
              <label 
                htmlFor="file-app-logo"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed rounded-xl text-sm cursor-pointer transition-colors ${uploading ? 'bg-neutral-800 border-neutral-700 text-neutral-400 cursor-not-allowed' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-500'}`}
              >
                <UploadCloud className="w-4 h-4" />
                {uploading ? 'Mengunggah Logo...' : 'Pilih File / Unggah Logo Baru'}
              </label>
            </div>
          </div>

          <div className="p-5 border border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div>
                <label className="text-sm font-medium text-white block">Ganti Favicon Website</label>
                <span className="text-xs text-neutral-500 mt-1 block">
                  Ikon kecil yang muncul di tab browser. Gunakan format PNG berukuran 1:1 (kotak).
                </span>
              </div>
            </div>
            
            <div className="relative mt-2">
              <input 
                type="file" 
                id="file-app-favicon"
                accept="image/png" 
                onChange={handleFaviconUpload} 
                disabled={uploading}
                className="sr-only" 
              />
              <label 
                htmlFor="file-app-favicon"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed rounded-xl text-sm cursor-pointer transition-colors ${uploading ? 'bg-neutral-800 border-neutral-700 text-neutral-400 cursor-not-allowed' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-500'}`}
              >
                <UploadCloud className="w-4 h-4" />
                {uploading ? 'Mengunggah Favicon...' : 'Pilih File / Unggah Favicon Baru'}
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: App Configuration */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
            <Settings className="w-5 h-5 text-white" />
            <h2 className="text-lg font-medium text-white tracking-wide">Pengaturan Sistem</h2>
          </div>
          
          <div className="p-6 border border-neutral-800 bg-neutral-900/30 rounded-2xl flex flex-col gap-6">
            
            {/* Section Toggles Header */}
            <div className="flex flex-col gap-1 border-b border-neutral-800 pb-3">
              <span className="text-sm font-semibold text-white uppercase tracking-wider">Visibilitas Section Undangan</span>
              <span className="text-xs text-neutral-500">Atur seksi mana saja yang ingin ditampilkan atau disembunyikan pada halaman undangan tamu.</span>
            </div>

            {/* Toggle Sinopsis */}
            <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-white">Sinopsis Singkat Pementasan</span>
                <span className="text-xs text-neutral-500 mt-0.5">Menampilkan cerita latar & deskripsi pementasan.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={config.showSynopsis !== false}
                  onChange={(e) => setConfig({...config, showSynopsis: e.target.checked})}
                />
                <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-neutral-600 peer-checked:border-white/50"></div>
              </label>
            </div>

            {/* Toggle Tiket Pamflet */}
            <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-white">Poster & Tiket Pementasan</span>
                <span className="text-xs text-neutral-500 mt-0.5">Menampilkan desain pamflet/tiket pertunjukan.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={config.showTicketPamflet !== false}
                  onChange={(e) => setConfig({...config, showTicketPamflet: e.target.checked})}
                />
                <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-neutral-600 peer-checked:border-white/50"></div>
              </label>
            </div>



            {/* Toggle Cast & Crew */}
            <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-white">Galeri Pemeran & Tim Produksi (Cast & Crew)</span>
                <span className="text-xs text-neutral-500 mt-0.5">Menampilkan foto & jajaran aktor/sutradara pementasan.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={config.showCast !== false}
                  onChange={(e) => setConfig({...config, showCast: e.target.checked})}
                />
                <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-neutral-600 peer-checked:border-white/50"></div>
              </label>
            </div>

            {/* Toggle Location & Map */}
            <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-white">Waktu & Peta Lokasi (Google Maps)</span>
                <span className="text-xs text-neutral-500 mt-0.5">Menampilkan rincian tanggal, jam, dan peta lokasi.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={config.showLocationMap !== false}
                  onChange={(e) => setConfig({...config, showLocationMap: e.target.checked})}
                />
                <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-neutral-600 peer-checked:border-white/50"></div>
              </label>
            </div>

            {/* Toggle RSVP & E-Ticket */}
            <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-white">Konfirmasi Kehadiran (RSVP & E-Tiket)</span>
                <span className="text-xs text-neutral-500 mt-0.5">Menampilkan form konfirmasi hadir & terbitan E-Tiket QR Code.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={config.showRSVP !== false}
                  onChange={(e) => setConfig({...config, showRSVP: e.target.checked})}
                />
                <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-neutral-600 peer-checked:border-white/50"></div>
              </label>
            </div>

            {/* Toggle Sponsor */}
            <div className="flex items-center justify-between border-b border-neutral-800/50 pb-6">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-white">Tampilkan Bagian Sponsor</span>
                <span className="text-xs text-neutral-500 mt-1">Aktifkan untuk menampilkan barisan sponsor & partner di bagian bawah undangan.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={config.showSponsors !== false}
                  onChange={(e) => setConfig({...config, showSponsors: e.target.checked})}
                />
                <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20 border border-neutral-600 peer-checked:border-white/50"></div>
              </label>
            </div>

            {/* Social Media Links */}
            <div className="flex flex-col gap-4">
              <span className="text-sm font-medium text-white">Sosial Media (Ditampilkan di Footer)</span>
              
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-neutral-500 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Username Instagram (Contoh: teaterdekik)"
                    value={config.instagram}
                    onChange={(e) => setConfig({...config, instagram: e.target.value})}
                    className="w-full bg-black/40 border border-neutral-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-neutral-500 text-sm transition-colors"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-neutral-500 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nama / Link Channel YouTube"
                    value={config.youtube}
                    onChange={(e) => setConfig({...config, youtube: e.target.value})}
                    className="w-full bg-black/40 border border-neutral-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-neutral-500 text-sm transition-colors"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-neutral-500 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.33-1.95 1.61-4.66 2.12-7.14 1.56-2.53-.55-4.65-2.27-5.62-4.67-1.11-2.73-.66-6.05 1.17-8.32 1.73-2.16 4.62-3.04 7.27-2.48.16.03.32.08.48.13V14.3c-1.49-.32-3.14-.13-4.43.76-1.37.95-1.95 2.82-1.39 4.38.54 1.51 2.21 2.45 3.8 2.29 1.46-.14 2.65-1.14 3.12-2.52.27-.79.33-1.64.33-2.48V.02z"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Username TikTok"
                    value={config.tiktok}
                    onChange={(e) => setConfig({...config, tiktok: e.target.value})}
                    className="w-full bg-black/40 border border-neutral-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-neutral-500 text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={saveConfig} 
              disabled={saving}
              className="w-full mt-2 bg-white text-black hover:bg-neutral-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </div>

      </div>
      ) : (
        <CastMasterManager />
      )}
    </div>
  );
}
