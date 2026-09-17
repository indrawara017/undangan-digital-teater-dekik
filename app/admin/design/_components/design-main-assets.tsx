'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

interface DesignMainAssetsProps {
  selectedEventId: string;
}

export function DesignMainAssets({ selectedEventId }: DesignMainAssetsProps) {
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [cacheBust, setCacheBust] = useState<number>(Date.now());
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileName: string, label: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB.', 'error');
      return;
    }

    setUploadingImage(fileName);
    const filePath = `${selectedEventId}/${fileName}`;
    const { error } = await supabase.storage.from('assets').upload(filePath, file, {
      upsert: true,
      cacheControl: '3600'
    });

    if (error) {
      showToast(`Gagal mengunggah ${label}: ` + error.message, 'error');
    } else {
      setFailedImages(prev => ({ ...prev, [fileName]: false }));
      setCacheBust(Date.now());
      showToast(`${label} berhasil diperbarui!`, 'success');
    }
    setUploadingImage(null);
  };

  const assetFields = [
    { name: 'design.jpg', label: 'Poster Panggung' },
    { name: 'background.jpg', label: 'Visual Background' },
    { name: 'ticket.jpg', label: 'Desain Tiket' },
  ];

  return (
    <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assetFields.map((field) => {
          const isFailed = failedImages[field.name];
          const isUploading = uploadingImage === field.name;
          const imageUrl = `${supabase.storage.from('assets').getPublicUrl(`${selectedEventId}/${field.name}`).data.publicUrl}?t=${cacheBust}`;

          return (
            <div key={field.name} className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-white text-center">
                {field.label}
              </span>

              <div className="relative w-full h-52 rounded-xl bg-black/40 border border-neutral-800 overflow-hidden group flex items-center justify-center">
                <input
                  type="file"
                  id={`upload-${field.name}`}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileUpload(e, field.name, field.label)}
                  disabled={isUploading}
                  className="sr-only"
                />

                {!isFailed ? (
                  <img
                    src={imageUrl}
                    alt={field.label}
                    className="w-full h-full object-contain p-2"
                    onError={() => setFailedImages(prev => ({ ...prev, [field.name]: true }))}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-neutral-500">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[11px]">Belum ada gambar</span>
                  </div>
                )}

                {/* Uploading State */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                {/* Simple Hover Overlay */}
                <label
                  htmlFor={`upload-${field.name}`}
                  className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                >
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold shadow-lg">
                    <UploadCloud className="w-3.5 h-3.5" /> Ganti Gambar
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
