'use client';

import { motion, Variants } from 'framer-motion';

const heroStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const heroFadeIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
  }
};

const heroScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
  }
};

interface HeroSectionProps {
  bgUrl: string;
  logos: any[];
  getAssetUrl: (path: string) => string;
  eventData: any;
  guest: any;
  formatIndonesianDate: (date: string) => string;
}

export function HeroSection({ bgUrl, logos, getAssetUrl, eventData, guest, formatIndonesianDate }: HeroSectionProps) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      {/* HERO BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
        {/* Dramatic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* Smooth Gradient Transition to Black Content Below */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent z-0 pointer-events-none" />
      
      {/* Content Container */}
      <motion.div 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: false, amount: 0.15 }}
        variants={heroStagger}
        className="flex-1 w-full flex flex-col items-center justify-center pb-16 md:pb-20 z-10"
      >
      
      {/* LOGOS (Replaces Tipografi/Judul) */}
      {logos.length > 0 && (
        <motion.div 
          variants={heroFadeIn}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6 w-full px-4"
        >
          {logos.map((logo) => (
            <img 
              key={logo.name}
              src={getAssetUrl(`logos/${logo.name}`)}
              alt="Logo"
              className="h-12 sm:h-16 md:h-20 w-auto max-w-[160px] object-contain drop-shadow-lg"
            />
          ))}
        </motion.div>
      )}

      <motion.div
        variants={heroFadeIn}
        className="flex flex-col items-center justify-center gap-1.5 mb-4 w-full"
      >
        <p className="text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase text-neutral-200 font-medium text-center w-full drop-shadow-md">
          Teater Dekik Mempersembahkan
        </p>
        <p className="text-xs sm:text-sm tracking-wider text-neutral-300 font-normal italic mt-0.5 text-center w-full drop-shadow-sm">
          Karya: {eventData.creator || '[Nama Penulis/Sutradara]'}
        </p>
      </motion.div>
      
      {/* Typography Title */}
      <motion.h1 
        variants={heroScaleIn}
        className="w-full text-center font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium mb-6 pb-2 px-4 leading-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400"
      >
        {eventData.title}
      </motion.h1>

      {/* Guest Name Greeting */}
      <motion.div
        variants={heroFadeIn}
        className="flex flex-col items-center justify-center gap-2 mb-8 text-center px-4 w-full"
      >
        <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-neutral-400 text-center w-full">
          {guest?.category === 'Teater' ? 'Kepada' : guest?.gender === 'Perempuan' ? 'Kepada Yth. Saudari' : 'Kepada Yth. Saudara'}
        </span>
        <span className="text-xl md:text-2xl font-cormorant font-medium text-white text-center w-full">{guest?.name}</span>
      </motion.div>

      <motion.div 
        variants={heroFadeIn}
        className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-8 w-20"
      />

      <motion.div
        variants={heroFadeIn}
        className="flex flex-col items-center justify-center gap-4 w-full text-center"
      >
        <div className="flex flex-row items-center justify-center gap-2 text-neutral-200 w-full">
          <p className="text-sm md:text-base tracking-[0.2em] uppercase font-light text-center">
            {eventData.date ? formatIndonesianDate(eventData.date) : 'Waktu Belum Ditentukan'}
          </p>
        </div>
        
        <div className="flex flex-row items-center justify-center gap-2 text-neutral-500 w-full">
          <p className="text-xs md:text-sm tracking-widest font-light uppercase text-center">
            {eventData.location || 'Lokasi Belum Ditentukan'}
          </p>
        </div>
      </motion.div>

      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-500 font-medium">Gulir ke Bawah</span>
        <motion.div 
          animate={{ y: [0, 15, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"
        />
      </motion.div>
      
    </main>
  );
}
