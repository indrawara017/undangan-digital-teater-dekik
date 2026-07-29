'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Users, Trash2, Edit2, UploadCloud, UserPlus } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export interface CastMember {
  id: string;
  name: string;
  photoUrl: string;
}

export function CastMasterManager() {
  const [masterCast, setMasterCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CastMember | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchMasterCast();
  }, []);

  const fetchMasterCast = async () => {
    setLoading(true);
    try {
      const { data: masterData } = await supabase.storage.from('assets').download('global/cast_members.json');
      let loadedMaster: CastMember[] = [];
      if (masterData) {
        try {
          const text = await masterData.text();
          const parsed = JSON.parse(text);
          // Migrate: strip role field if present from old data
          loadedMaster = parsed.map((m: any) => ({ id: m.id, name: m.name, photoUrl: m.photoUrl }));
        } catch (e) {}
      }
      setMasterCast(loadedMaster);
    } catch (err) {
      console.error('Error loading cast data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setNameInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsFormOpen(true);
  };

  const openEditModal = (member: CastMember) => {
    setEditingMember(member);
    setNameInput(member.name);
    setSelectedFile(null);
    setPreviewUrl(member.photoUrl);
    setIsFormOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSaving(true);
    try {
      const memberId = editingMember ? editingMember.id : `cast-${Date.now()}`;
      let photoUrl = editingMember ? editingMember.photoUrl : '';

      // Upload profile photo if a new file was selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `global/cast-avatars/${memberId}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, selectedFile, {
          upsert: true,
          cacheControl: '3600'
        });

        if (uploadError) {
          alert('Gagal mengunggah foto profil: ' + uploadError.message);
          setSaving(false);
          return;
        }

        photoUrl = supabase.storage.from('assets').getPublicUrl(filePath).data.publicUrl + `?t=${Date.now()}`;
      }

      const updatedMember: CastMember = {
        id: memberId,
        name: nameInput.trim(),
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
      };

      let newMasterList: CastMember[] = [];
      if (editingMember) {
        newMasterList = masterCast.map(m => (m.id === editingMember.id ? updatedMember : m));
      } else {
        newMasterList = [...masterCast, updatedMember];
      }

      // Save updated master JSON globally
      const jsonBlob = new Blob([JSON.stringify(newMasterList, null, 2)], { type: 'application/json' });
      await supabase.storage.from('assets').upload('global/cast_members.json', jsonBlob, { upsert: true });

      setMasterCast(newMasterList);
      setIsFormOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan seniman: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Hapus seniman ini dari Database Master?')) return;

    const newMasterList = masterCast.filter(m => m.id !== id);
    const jsonBlob = new Blob([JSON.stringify(newMasterList, null, 2)], { type: 'application/json' });
    await supabase.storage.from('assets').upload('global/cast_members.json', jsonBlob, { upsert: true });

    setMasterCast(newMasterList);
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-5 md:p-6 flex flex-col gap-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white tracking-wide">Database Master Seniman</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Database global seniman. Nama & foto yang terdaftar di sini dapat dipilih dan ditetapkan perannya saat menambahkan ke pementasan tertentu.
          </p>
        </div>

        <Button onClick={openAddModal} size="sm" className="h-9 shrink-0 shadow-lg">
          <UserPlus className="w-4 h-4 mr-1.5" /> Tambah Seniman
        </Button>
      </div>

      {/* Main Content: Master List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">Memuat Database Seniman...</div>
      ) : masterCast.length === 0 ? (
        <div className="p-8 border border-dashed border-neutral-800 rounded-xl text-center flex flex-col items-center gap-2">
          <Users className="w-8 h-8 text-neutral-600" />
          <p className="text-sm text-neutral-400">Belum ada seniman terdaftar di Database Master.</p>
          <span className="text-xs text-neutral-500">Gunakan tombol &quot;Tambah Seniman&quot; di kanan atas untuk menambahkan.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {masterCast.map((member) => (
            <div 
              key={member.id}
              className="relative group border rounded-xl p-3 bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-all duration-300 shadow-md flex flex-col items-center text-center gap-2"
            >
              {/* Avatar */}
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              </div>

              {/* Name */}
              <h4 className="text-xs font-semibold text-white truncate w-full">{member.name}</h4>

              {/* Action Buttons */}
              <div className="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(member)}
                  className="p-1.5 rounded-md bg-neutral-800 hover:bg-white hover:text-black text-neutral-400 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-1.5 rounded-md bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit (Top Most Layer Portal) */}
      {isFormOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handleSaveMember}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative z-[10000]"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {editingMember ? 'Edit Data Seniman' : 'Tambah Seniman Baru'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-neutral-500 hover:text-white text-xs font-medium"
              >
                Tutup
              </button>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative w-24 h-32 rounded-xl overflow-hidden border border-dashed border-neutral-700 bg-neutral-950 flex flex-col items-center justify-center cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                    <UploadCloud className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300">Unggah Foto</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-neutral-500">Rasio 3:4 disarankan (Foto Profil/Portret)</span>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium">Nama Lengkap Seniman / Tim</label>
              <Input 
                type="text"
                placeholder="Contoh: Manik Sukadana"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-3 border-t border-neutral-800">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
