'use client';

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { CustomSelect } from '@/app/components/CustomSelect';

interface GuestAddProps {
  isOpen: boolean;
  onClose: () => void;
  guestForm: any;
  setGuestForm: (val: any) => void;
  formErrors: any;
  handleSaveGuest: (e: React.FormEvent) => void;
  editingGuest: any;
}

export function GuestAdd({ isOpen, onClose, guestForm, setGuestForm, formErrors, handleSaveGuest, editingGuest }: GuestAddProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  const categories = ['Alumni', 'Teater'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h3 className="text-lg font-medium text-white">
            {editingGuest ? 'Edit Data Tamu' : 'Tambah Tamu Baru'}
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSaveGuest} className="p-5 flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-sm text-neutral-400 font-medium block">Nama Lengkap</label>
            <Input 
              type="text" 
              placeholder="Masukkan Nama Lengkap" 
              value={guestForm.name} 
              onChange={(e) => setGuestForm({...guestForm, name: e.target.value})} 
              className={formErrors.name ? 'border-red-500/80 focus-visible:ring-red-500/50 focus-visible:border-red-500/80' : ''}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm text-neutral-400 font-medium block">No. WhatsApp</label>
            <Input 
              type="text" 
              placeholder="Masukkan No WhatsApp" 
              value={guestForm.whatsapp} 
              onChange={(e) => setGuestForm({...guestForm, whatsapp: e.target.value})} 
              className={formErrors.whatsapp ? 'border-red-500/80 focus-visible:ring-red-500/50 focus-visible:border-red-500/80' : ''}
            />
            {formErrors.whatsapp && (
              <p className="text-xs text-red-500 mt-1">{formErrors.whatsapp}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm text-neutral-400 font-medium block">Kategori Tamu</label>
            <div className="relative w-full">
              <CustomSelect 
                value={guestForm.category}
                onChange={(val) => setGuestForm({...guestForm, category: val})}
                options={categories.map(c => ({ value: c, label: c }))}
                className={formErrors.category ? 'border border-red-500/80 rounded-md' : ''}
              />
            </div>
            {formErrors.category && (
              <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
            )}
          </div>

          {guestForm.category === 'Alumni' && (
            <div className="space-y-1.5">
              <label className="text-sm text-neutral-400 font-medium block">Gender</label>
              <div className="relative w-full">
                <CustomSelect 
                  value={guestForm.gender}
                  onChange={(val) => setGuestForm({...guestForm, gender: val})}
                  options={[{value: 'Laki-laki', label: 'Laki-laki'}, {value: 'Perempuan', label: 'Perempuan'}]}
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t border-neutral-800 mt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              {editingGuest ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
