'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

export interface DesignSponsorsProps {
  eventId: string;
}

export function DesignSponsors({ eventId }: DesignSponsorsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemName, setEditingItemName] = useState<string | null>(null); // original file name if editing
  const [sponsorNameInput, setSponsorNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (eventId) fetchSponsors();
  }, [eventId]);

  const fetchSponsors = async () => {
    setLoadingItems(true);
    const { data } = await supabase.storage.from('assets').list(`${eventId}/sponsors`);
    if (data) {
      setItems(data.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder'));
    }
    setLoadingItems(false);
  };

  const openAddModal = () => {
    setEditingItemName(null);
    setSponsorNameInput('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fileName: string) => {
    const displayName = fileName.split('---')[0];
    setEditingItemName(fileName);
    setSponsorNameInput(displayName);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !sponsorNameInput.trim()) {
      showToast('Silakan masukkan nama sponsor.', 'error');
      return;
    }

    setSaving(true);
    const safeName = sponsorNameInput.trim().replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 30) || 'sponsor';

    if (editingItemName) {
      // Editing existing sponsor
      const currentDisplayName = editingItemName.split('---')[0];
      const ext = editingItemName.split('.').pop();
      const newFileName = `${safeName}---${Date.now()}.${ext}`;

      if (selectedFile) {
        // Upload new file and remove old
        const newExt = selectedFile.name.split('.').pop();
        const fileWithNewExt = `${safeName}---${Date.now()}.${newExt}`;
        const { error: uploadErr } = await supabase.storage.from('assets').upload(
          `${eventId}/sponsors/${fileWithNewExt}`,
          selectedFile,
          { cacheControl: '3600' }
        );

        if (uploadErr) {
          showToast('Gagal mengunggah logo baru: ' + uploadErr.message, 'error');
          setSaving(false);
          return;
        }

        await supabase.storage.from('assets').remove([`${eventId}/sponsors/${editingItemName}`]);
        showToast('Sponsor dan logo berhasil diperbarui!', 'success');
      } else if (currentDisplayName !== safeName) {
        // Rename file only
        const { error: moveErr } = await supabase.storage.from('assets').move(
          `${eventId}/sponsors/${editingItemName}`,
          `${eventId}/sponsors/${newFileName}`
        );

        if (moveErr) {
          showToast('Gagal mengubah nama sponsor: ' + moveErr.message, 'error');
          setSaving(false);
          return;
        }
        showToast('Nama sponsor berhasil diperbarui!', 'success');
      }

      fetchSponsors();
      setIsModalOpen(false);
    } else {
      // Adding new sponsor
      if (!selectedFile) {
        showToast('Silakan pilih file logo sponsor.', 'error');
        setSaving(false);
        return;
      }

      const ext = selectedFile.name.split('.').pop();
      const filePath = `${eventId}/sponsors/${safeName}---${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from('assets').upload(filePath, selectedFile, { cacheControl: '3600' });
      if (error) {
        showToast('Gagal menambahkan sponsor: ' + error.message, 'error');
      } else {
        showToast(`Sponsor "${sponsorNameInput.trim()}" berhasil ditambahkan!`, 'success');
        fetchSponsors();
        setIsModalOpen(false);
      }
    }

    setSaving(false);
  };

  const handleDelete = async (fileName: string) => {
    const displayName = fileName.split('---')[0];
    if (!confirm(`Hapus sponsor "${displayName}"?`)) return;

    const { error } = await supabase.storage.from('assets').remove([`${eventId}/sponsors/${fileName}`]);
    if (error) {
      showToast('Gagal menghapus sponsor: ' + error.message, 'error');
    } else {
      showToast('Sponsor berhasil dihapus', 'success');
      fetchSponsors();
    }
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-4 flex flex-col gap-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-neutral-400">
          Daftar Sponsor ({items.length})
        </span>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Sponsor</span>
        </button>
      </div>

      {/* Table Section */}
      {loadingItems ? (
        <div className="py-8 text-center text-xs text-neutral-500 animate-pulse">
          Memuat daftar sponsor...
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          Belum ada sponsor yang ditambahkan untuk panggung ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-16">Logo</th>
                <th className="py-2.5 px-3">Nama Sponsor</th>
                <th className="py-2.5 px-3 text-right w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {items.map((item, idx) => {
                const displayName = item.name.split('---')[0];
                const publicUrl = `${supabase.storage.from('assets').getPublicUrl(`${eventId}/sponsors/${item.name}`).data.publicUrl}?t=${Date.now()}`;

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
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEditModal(item.name)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Ubah Sponsor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus Sponsor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Sponsor Modal */}
      {isModalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget && !saving) setIsModalOpen(false); }}
        >
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 shrink-0">
              <h3 className="text-sm font-semibold text-white">
                {editingItemName ? 'Ubah Data Sponsor' : 'Tambah Sponsor Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Nama Instansi / Mitra Sponsor
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bank BCA, Telkom Indonesia..."
                  value={sponsorNameInput}
                  onChange={(e) => setSponsorNameInput(e.target.value)}
                  className="w-full h-10 px-3.5 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  {editingItemName ? 'Ganti File Logo (Opsional)' : 'File Logo Sponsor'}
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer cursor-pointer"
                  required={!editingItemName}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || !sponsorNameInput.trim() || (!editingItemName && !selectedFile)}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                  <span>{editingItemName ? 'Simpan Perubahan' : 'Simpan Sponsor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
