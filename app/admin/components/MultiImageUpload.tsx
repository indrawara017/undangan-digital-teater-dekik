'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, Trash2, Plus, Users, Image as ImageIcon } from 'lucide-react';

interface MultiImageUploadProps {
  eventId: string;
  folderName: 'sponsors' | 'logos' | 'cast';
  title: string;
  icon: 'users' | 'image';
}

export function MultiImageUpload({ eventId, folderName, title, icon }: MultiImageUploadProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [newImageName, setNewImageName] = useState('');
  
  const [editingItem, setEditingItem] = useState<{ originalName: string, newDisplayName: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  useEffect(() => {
    if (eventId) fetchItems();
  }, [eventId]);

  const fetchItems = async () => {
    setLoadingItems(true);
    const { data } = await supabase.storage.from('assets').list(`${eventId}/${folderName}`);
    if (data) {
      setItems(data.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder'));
    }
    setLoadingItems(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;
    setUploadingImage('new');
    
    const ext = file.name.split('.').pop();
    const baseName = folderName === 'logos' ? file.name.replace(/\.[^/.]+$/, "") : (newImageName.trim() || file.name.replace(/\.[^/.]+$/, ""));
    const safeName = baseName.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 30) || (folderName === 'logos' ? 'logo' : 'image'); 
    const filePath = `${eventId}/${folderName}/${safeName}---${Date.now()}.${ext}`;
    
    const { error } = await supabase.storage.from('assets').upload(filePath, file, { cacheControl: '3600' });
    if (error) alert(`Gagal mengunggah ${title}: ` + error.message);
    else {
      fetchItems();
      setNewImageName('');
    }
    
    setUploadingImage(null);
  };

  const handleSaveName = async (originalName: string) => {
    if (!editingItem || !editingItem.newDisplayName.trim()) {
      setEditingItem(null);
      return;
    }
    const currentDisplayName = originalName.split('---')[0];
    const newNameSafe = editingItem.newDisplayName.trim().replace(/[^a-zA-Z0-9 ]/g, '');
    
    if (currentDisplayName !== newNameSafe) {
      setUploadingEdit(true);
      const ext = originalName.split('.').pop();
      const newFileName = `${newNameSafe}---${Date.now()}.${ext}`;
      
      const { error } = await supabase.storage.from('assets').move(
        `${eventId}/${folderName}/${originalName}`,
        `${eventId}/${folderName}/${newFileName}`
      );
      
      if (error) alert('Gagal mengubah nama: ' + error.message);
      else fetchItems();
      setUploadingEdit(false);
    }
    setEditingItem(null);
  };

  const handleEditFile = async (e: React.ChangeEvent<HTMLInputElement>, originalName: string) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    
    setUploadingEdit(true);
    const newNameSafe = editingItem.newDisplayName.trim().replace(/[^a-zA-Z0-9 ]/g, '');
    const ext = file.name.split('.').pop();
    const newFileName = `${newNameSafe}---${Date.now()}.${ext}`;
    
    const { error: uploadError } = await supabase.storage.from('assets').upload(`${eventId}/${folderName}/${newFileName}`, file, { cacheControl: '3600' });
    if (uploadError) {
      alert('Gagal mengganti gambar: ' + uploadError.message);
    } else {
      await supabase.storage.from('assets').remove([`${eventId}/${folderName}/${originalName}`]);
      fetchItems();
      setEditingItem(null);
    }
    setUploadingEdit(false);
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Hapus gambar ini?')) return;
    await supabase.storage.from('assets').remove([`${eventId}/${folderName}/${fileName}`]);
    fetchItems();
  };

  const IconComponent = icon === 'users' ? Users : ImageIcon;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
        <IconComponent className="w-5 h-5 text-white" />
        <h2 className="text-lg font-medium text-white tracking-wide">{title}</h2>
      </div>
      
      <div className="flex flex-col gap-3 p-5 border border-neutral-800 bg-neutral-900/20 rounded-2xl flex-1 min-h-0">
        <div className="flex flex-col gap-2 shrink-0">
          <label className="text-xs uppercase tracking-widest font-medium text-neutral-400">Tambah {title} Baru</label>
          {folderName !== 'logos' && (
            <input 
              type="text" 
              placeholder={`Masukkan Nama ${title.split(' ')[0]}...`}
              value={newImageName}
              onChange={e => setNewImageName(e.target.value)}
              className="w-full bg-black/40 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          )}
          <div className="relative w-full h-11 mt-1">
            <input 
              type="file" 
              id={`file-${folderName}`}
              accept="image/png, image/jpeg" 
              onChange={handleUpload} 
              disabled={uploadingImage === 'new' || (folderName === 'sponsors' && !newImageName.trim())}
              className="sr-only" 
            />
            <label 
              htmlFor={`file-${folderName}`}
              className={`flex items-center justify-center gap-1.5 w-full h-full border border-dashed rounded-xl text-sm font-medium transition-all duration-300 ${uploadingImage === 'new' ? 'bg-white/10 border-white/20 text-white cursor-wait' : (folderName === 'sponsors' && !newImageName.trim()) ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed' : 'border-neutral-700 text-neutral-400 hover:bg-white hover:text-black hover:border-white cursor-pointer'}`}
            >
              {uploadingImage === 'new' ? 'Loading...' : (folderName === 'sponsors' && !newImageName.trim()) ? (
                <><Plus className="w-4 h-4" /> Isi nama dulu</>
              ) : (
                <><Plus className="w-4 h-4" /> Pilih File Gambar</>
              )}
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 flex-1 min-h-0">
          <h3 className="text-xs uppercase tracking-widest font-medium text-neutral-500 mb-2 shrink-0">Daftar {title} ({items.length})</h3>
          
          {loadingItems ? (
            <p className="text-sm text-neutral-500 animate-pulse shrink-0">Memuat daftar...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-neutral-600 italic shrink-0">Belum ada gambar yang diunggah.</p>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {items.map((item) => {
                const displayName = item.name.split('---')[0];
                const isEditing = editingItem?.originalName === item.name;

                return (
                  <div key={item.name} className="flex flex-col p-3 bg-black/40 border border-neutral-800 rounded-lg group hover:border-neutral-600 transition-colors shrink-0">
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <input 
                          type="text" 
                          value={editingItem?.newDisplayName || ''}
                          onChange={e => editingItem && setEditingItem({ ...editingItem, newDisplayName: e.target.value })}
                          className="w-full bg-black/60 border border-neutral-700 text-white px-3 py-1.5 rounded-md focus:outline-none focus:border-white text-xs"
                          placeholder="Nama Baru"
                        />
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input 
                              type="file" 
                              id={`edit-file-${item.name}`}
                              accept="image/png, image/jpeg" 
                              onChange={(e) => handleEditFile(e, item.name)}
                              disabled={uploadingEdit}
                              className="sr-only" 
                            />
                            <label 
                              htmlFor={`edit-file-${item.name}`}
                              className={`flex items-center justify-center gap-2 w-full px-3 py-1.5 border border-dashed rounded-md text-xs font-medium cursor-pointer transition-all duration-300 ${uploadingEdit ? 'bg-white/10 border-white/20 text-white cursor-wait' : 'border-neutral-700 text-neutral-400 hover:bg-white hover:text-black hover:border-white'}`}
                            >
                              <UploadCloud className="w-3 h-3" />
                              {uploadingEdit ? 'Menyimpan...' : 'Ganti Gambar'}
                            </label>
                          </div>
                          <button 
                            onClick={() => handleSaveName(item.name)}
                            disabled={uploadingEdit}
                            className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-md hover:bg-neutral-200"
                          >
                            Simpan
                          </button>
                          <button 
                            onClick={() => setEditingItem(null)}
                            disabled={uploadingEdit}
                            className="px-3 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded-md hover:bg-neutral-700"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded bg-white/5 border border-white/10 p-1 flex items-center justify-center shrink-0">
                            <img 
                              src={`${supabase.storage.from('assets').getPublicUrl(`${eventId}/${folderName}/${item.name}`).data.publicUrl}?t=${Date.now()}`}
                              alt={displayName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-xs font-medium text-white truncate">{displayName}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <button 
                            onClick={() => handleDelete(item.name)}
                            className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
