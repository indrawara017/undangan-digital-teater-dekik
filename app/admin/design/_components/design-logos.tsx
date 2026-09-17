'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

export interface DesignLogosProps {
  eventId: string;
}

export function DesignLogos({ eventId }: DesignLogosProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (eventId) fetchLogos();
  }, [eventId]);

  const fetchLogos = async () => {
    setLoadingItems(true);
    const { data } = await supabase.storage.from('assets').list(`${eventId}/logos`);
    if (data) {
      setItems(data.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder'));
    }
    setLoadingItems(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;
    setUploading(true);
    
    const ext = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const safeName = baseName.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 30) || 'logo'; 
    const filePath = `${eventId}/logos/${safeName}---${Date.now()}.${ext}`;
    
    const { error } = await supabase.storage.from('assets').upload(filePath, file, { cacheControl: '3600' });
    if (error) {
      showToast('Gagal mengunggah logo: ' + error.message, 'error');
    } else {
      showToast('Logo berhasil diunggah!', 'success');
      fetchLogos();
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (fileName: string) => {
    const displayName = fileName.split('---')[0];
    if (!confirm(`Hapus logo "${displayName}"?`)) return;
    const { error } = await supabase.storage.from('assets').remove([`${eventId}/logos/${fileName}`]);
    if (error) {
      showToast('Gagal menghapus logo: ' + error.message, 'error');
    } else {
      showToast('Logo berhasil dihapus', 'success');
      fetchLogos();
    }
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-4 flex flex-col gap-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-neutral-400">
          Daftar Logo ({items.length})
        </span>

        <div className="relative shrink-0">
          <input 
            type="file" 
            id="file-logos"
            accept="image/png, image/jpeg, image/svg+xml, image/webp" 
            onChange={handleUpload} 
            disabled={uploading}
            className="sr-only" 
            title="Tambah Logo"
          />
          <label 
            htmlFor="file-logos"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              uploading 
                ? 'bg-white/20 text-white cursor-wait' 
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Logo</span>
              </>
            )}
          </label>
        </div>
      </div>
      
      {/* Table Section */}
      {loadingItems ? (
        <div className="py-8 text-center text-xs text-neutral-500 animate-pulse">
          Memuat daftar logo...
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          Belum ada logo yang diunggah untuk panggung ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-16">Logo</th>
                <th className="py-2.5 px-3">Nama Logo</th>
                <th className="py-2.5 px-3 text-right w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {items.map((item, idx) => {
                const displayName = item.name.split('---')[0];
                const publicUrl = `${supabase.storage.from('assets').getPublicUrl(`${eventId}/logos/${item.name}`).data.publicUrl}?t=${Date.now()}`;

                return (
                  <tr key={item.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-center text-neutral-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                        <img 
                          src={publicUrl}
                          alt={displayName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {displayName}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button 
                        onClick={() => handleDelete(item.name)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Hapus Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
