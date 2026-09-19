'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Save, History, RefreshCw, Plus, Trash2, Phone, Mail, CreditCard, Share2 } from 'lucide-react';
import { useToast } from '@/app/components/Toast';
import { DEFAULT_CONFIG, DEFAULT_TIMELINE, type GlobalConfig, type TimelineEventItem } from '@/lib/config';

export function SystemSettings() {
  const [saving, setSaving] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);
  const [syncingEvents, setSyncingEvents] = useState(false);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [timeline, setTimeline] = useState<TimelineEventItem[]>(DEFAULT_TIMELINE);
  const { showToast } = useToast();

  useEffect(() => {
    fetchConfig();
    fetchHistory();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await supabase.storage.from('assets').download('global/config.json');
      if (data) {
        const text = await data.text();
        setConfig((prev) => ({ ...prev, ...JSON.parse(text) }));
      }
    } catch (e) {
      console.error('Failed to parse config:', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await supabase.storage.from('assets').download('global/history.json');
      if (data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTimeline(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse history:', e);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const file = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const { error } = await supabase.storage.from('assets').upload('global/config.json', file, { 
        upsert: true, 
        cacheControl: '300' 
      });
      
      if (error) throw error;
      showToast('Pengaturan sistem berhasil disimpan!', 'success');
    } catch (err: any) {
      showToast('Gagal menyimpan pengaturan: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveHistory = async () => {
    setSavingHistory(true);
    try {
      const file = new Blob([JSON.stringify(timeline, null, 2)], { type: 'application/json' });
      const { error } = await supabase.storage.from('assets').upload('global/history.json', file, { 
        upsert: true, 
        cacheControl: '300' 
      });
      
      if (error) throw error;
      showToast('Linimasa sejarah berhasil disimpan ke database!', 'success');
    } catch (err: any) {
      showToast('Gagal menyimpan linimasa: ' + err.message, 'error');
    } finally {
      setSavingHistory(false);
    }
  };

  // Fitur Pintar: Tarik Otomatis dari Data Pementasan (Sync from Events)
  const handleSyncFromEvents = async () => {
    setSyncingEvents(true);
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, creator, date, description')
        .order('date', { ascending: true });

      if (error) throw error;

      if (!events || events.length === 0) {
        showToast('Belum ada data pementasan di database.', 'warning');
        return;
      }

      const generated: TimelineEventItem[] = events.map((ev) => {
        let year = new Date().getFullYear().toString();
        if (ev.date) {
          const d = new Date(ev.date);
          if (!isNaN(d.getFullYear())) year = d.getFullYear().toString();
        }
        return {
          id: ev.id,
          year,
          title: ev.title,
          desc: ev.description || `Pementasan karya ${ev.creator || 'Teater Dekik'}.`,
          tag: ev.creator ? `Karya: ${ev.creator}` : 'Pementasan Panggung',
          eventId: ev.id,
        };
      });

      // Gabungkan momen awal berdirinya komunitas (sebelum pementasan tercatat) jika belum ada
      const awalMula = timeline.find(t => t.tag?.toLowerCase().includes('kelahiran') || t.year === '2019');
      const finalList = awalMula ? [awalMula, ...generated] : generated;

      setTimeline(finalList);
      showToast(`Berhasil menarik ${generated.length} pementasan menjadi linimasa! Jangan lupa klik 'Simpan Linimasa'.`, 'success');
    } catch (err: any) {
      showToast('Gagal menarik pementasan: ' + err.message, 'error');
    } finally {
      setSyncingEvents(false);
    }
  };

  const handleAddTimelineItem = () => {
    const newItem: TimelineEventItem = {
      id: `history-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: 'Momen / Pementasan Baru',
      desc: 'Deskripsi perjalanan artistik atau capaian pementasan...',
      tag: 'Karya Teater',
    };
    setTimeline([newItem, ...timeline]);
  };

  const handleUpdateTimelineItem = (index: number, field: keyof TimelineEventItem, value: string) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    setTimeline(updated);
  };

  const handleDeleteTimelineItem = (index: number) => {
    const updated = timeline.filter((_, i) => i !== index);
    setTimeline(updated);
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
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2.5">
          <Settings className="w-5 h-5 text-white" />
          <h2 className="text-base font-semibold text-white tracking-wide">Pengaturan Sistem & Konfigurasi Tunggal</h2>
        </div>
        <p className="text-xs text-neutral-400 mt-1 max-w-xl mx-auto">
          Kelola kontak resmi, nomor WhatsApp, rekening pembayaran tiket, media sosial, serta linimasa sejarah pementasan tanpa perlu mengubah kode program.
        </p>
      </div>

      {/* Bagian 1: Kontak, Rekening Bank & Media Sosial */}
      <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide">Kontak Resmi & Helpdesk</h3>
          </div>
          <span className="text-[11px] text-neutral-500">Otomatis digunakan di Footer, FAQ, & Halaman Publik</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">Nomor WhatsApp Admin / Helpdesk</label>
            <input 
              type="text" 
              placeholder="Contoh: 6281234567890 (awali 62)"
              value={config.whatsapp || ''}
              onChange={(e) => setConfig({ ...config, whatsapp: e.target.value.replace(/[^0-9]/g, '') })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
            <p className="text-[10px] text-neutral-500">Format internasional tanpa tanda plus (+), contoh: 6281234567890</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">Email Resmi Teater</label>
            <input 
              type="email" 
              placeholder="teaterdekik@gmail.com"
              value={config.email || ''}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
            <p className="text-[10px] text-neutral-500">Alamat surel untuk pertanyaan penonton dan narahubung kerja sama</p>
          </div>
        </div>

        {/* Rekening Pembayaran */}
        <div className="flex items-center gap-2 border-t border-neutral-800/80 pt-4">
          <CreditCard className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Rekening Pembayaran Tiket (Manual Transfer)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">Nama Bank / E-Wallet</label>
            <input 
              type="text" 
              placeholder="Contoh: Bank BRI, Bank BCA, Mandiri"
              value={config.bankName || ''}
              onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">Nomor Rekening</label>
            <input 
              type="text" 
              placeholder="Contoh: 1234 5678 9012 3456"
              value={config.bankAccountNumber || ''}
              onChange={(e) => setConfig({ ...config, bankAccountNumber: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">Atas Nama (Pemilik Rekening)</label>
            <input 
              type="text" 
              placeholder="Contoh: Teater Dekik"
              value={config.bankAccountHolder || ''}
              onChange={(e) => setConfig({ ...config, bankAccountHolder: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Media Sosial */}
        <div className="flex items-center gap-2 border-t border-neutral-800/80 pt-4">
          <Share2 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Media Sosial Resmi</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">Instagram</label>
            <input 
              type="text" 
              placeholder="teaterdekik (tanpa @)"
              value={config.instagram || ''}
              onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">YouTube Channel</label>
            <input 
              type="text" 
              placeholder="https://youtube.com/@teaterdekik"
              value={config.youtube || ''}
              onChange={(e) => setConfig({ ...config, youtube: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">TikTok</label>
            <input 
              type="text" 
              placeholder="teaterdekik (tanpa @)"
              value={config.tiktok || ''}
              onChange={(e) => setConfig({ ...config, tiktok: e.target.value })}
              className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>
        </div>

        {/* Visibilitas Modul Undangan */}
        <div className="flex flex-col gap-3 border-t border-neutral-800/80 pt-4">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Visibilitas Modul Undangan Tamu
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectionToggles.map((item) => {
              const isEnabled = (config as any)[item.key] !== false;

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

        {/* Tombol Simpan Konfigurasi */}
        <div className="flex justify-end pt-3 border-t border-neutral-800/60">
          <button 
            type="button"
            onClick={saveConfig} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 shadow-lg cursor-pointer"
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

      {/* Bagian 2: Editor Linimasa & Histori Pementasan */}
      <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">Linimasa & Histori Pementasan (Halaman Tentang)</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Kelola linimasa perjalanan teater di sini tanpa koding. Perubahan langsung tampil di halaman publik Tentang Kami.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleSyncFromEvents}
              disabled={syncingEvents}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              title="Tarik pementasan dari tabel database otomatis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingEvents ? 'animate-spin' : ''}`} />
              <span>{syncingEvents ? 'Menarik...' : 'Tarik dari Pementasan'}</span>
            </button>

            <button
              type="button"
              onClick={handleAddTimelineItem}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Momen</span>
            </button>
          </div>
        </div>

        {/* Daftar Momen Linimasa */}
        <div className="flex flex-col gap-3">
          {timeline.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="p-4 rounded-xl border border-neutral-800 bg-black/40 flex flex-col gap-3 group hover:border-neutral-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-24 shrink-0">
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Tahun</label>
                  <input
                    type="text"
                    value={item.year}
                    onChange={(e) => handleUpdateTimelineItem(idx, 'year', e.target.value)}
                    className="w-full h-8 px-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                  />
                </div>

                <div className="flex-1 w-full">
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Judul Momen / Pementasan</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateTimelineItem(idx, 'title', e.target.value)}
                    className="w-full h-8 px-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </div>

                <div className="w-full sm:w-48 shrink-0">
                  <label className="text-[10px] text-neutral-500 font-mono block mb-1">Kategori / Tag</label>
                  <input
                    type="text"
                    value={item.tag}
                    onChange={(e) => handleUpdateTimelineItem(idx, 'tag', e.target.value)}
                    className="w-full h-8 px-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTimelineItem(idx)}
                  className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 self-end sm:self-center"
                  title="Hapus Momen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 font-mono block mb-1">Deskripsi Singkat / Cerita</label>
                <textarea
                  rows={2}
                  value={item.desc}
                  onChange={(e) => handleUpdateTimelineItem(idx, 'desc', e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Simpan Linimasa */}
        <div className="flex justify-end pt-3 border-t border-neutral-800/60">
          <button 
            type="button"
            onClick={saveHistory} 
            disabled={savingHistory}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 shadow-lg cursor-pointer"
          >
            {savingHistory ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savingHistory ? 'Menyimpan Linimasa...' : 'Simpan Linimasa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
