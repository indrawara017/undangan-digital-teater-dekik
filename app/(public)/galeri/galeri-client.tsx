'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface GaleriClientProps {
  galleries: {
    eventTitle: string;
    eventDate: string;
    images: string[];
  }[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function GaleriClient({ galleries }: GaleriClientProps) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const allImages = galleries.flatMap(g => g.images);

  const openLightbox = (images: string[], index: number) => {
    setLightbox({ images, index });
  };

  const closeLightbox = () => setLightbox(null);

  const nextImage = () => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index + 1) % lightbox.images.length,
    });
  };

  const prevImage = () => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length,
    });
  };

  return (
    <div className="min-h-screen py-8 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-3">
            Dokumentasi
          </p>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Galeri Pementasan
          </h1>
          <p className="text-neutral-500 text-sm mt-3">
            {allImages.length} foto dari {galleries.length} pementasan
          </p>
        </div>

        {galleries.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Belum ada galeri dokumentasi.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {galleries.map((gallery, gIdx) => (
              <motion.section
                key={gIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4">
                  <h2 className="text-lg text-white font-semibold">{gallery.eventTitle}</h2>
                  {gallery.eventDate && (
                    <p className="text-xs text-neutral-500 mt-0.5">{formatDate(gallery.eventDate)}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {gallery.images.map((img, imgIdx) => (
                    <motion.div
                      key={imgIdx}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-neutral-900 border border-neutral-800/40"
                      onClick={() => openLightbox(gallery.images, imgIdx)}
                    >
                      <Image
                        src={img}
                        alt={`${gallery.eventTitle} foto ${imgIdx + 1}`}
                        fill
                        className="object-cover hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 z-10 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 z-10 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div
              className="relative w-full max-w-4xl max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.images[lightbox.index]}
                alt="Gallery image"
                width={1200}
                height={800}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
              <p className="text-center text-neutral-500 text-xs mt-3">
                {lightbox.index + 1} / {lightbox.images.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
