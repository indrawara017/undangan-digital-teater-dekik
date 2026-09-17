'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import type { CastMember } from './types';

interface AnggotaAddProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: CastMember | null;
  nameInput: string;
  setNameInput: (val: string) => void;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export function AnggotaAdd({
  isOpen,
  onClose,
  editingMember,
  nameInput,
  setNameInput,
  previewUrl,
  onFileChange,
  onSave,
  saving
}: AnggotaAddProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <form 
        onSubmit={onSave}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative z-[10000]"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-semibold text-white">
            {editingMember ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
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
              onChange={onFileChange}
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
        </div>

        {/* Name Input */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-medium">Nama</label>
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
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>,
    document.body
  );
}
