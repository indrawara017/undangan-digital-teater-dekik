'use client';

import { motion, Variants } from 'framer-motion';

const premiumStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const premiumFadeIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
  }
};

const premiumScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
  }
};

interface SynopsisSectionProps {
  eventData: any;
  getAssetUrl: (path: string) => string;
  setZoomedImage: (url: string) => void;
}

export function SynopsisSection({ eventData, getAssetUrl, setZoomedImage }: SynopsisSectionProps) {
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15, margin: "0px 0px -100px 0px" }}
      variants={premiumStagger}
      className="relative py-32 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16"
    >
      <motion.div variants={premiumFadeIn} className="flex-1 space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-neutral-600" />
          <span className="text-xs tracking-[0.3em] uppercase text-neutral-400">Sinopsis Singkat</span>
        </div>
        <h2 className="font-cormorant text-4xl md:text-5xl leading-tight text-neutral-200">
          {eventData.title}
        </h2>
        <p className="text-neutral-400 leading-relaxed font-light text-sm md:text-base whitespace-pre-wrap">
          {eventData.description || 'Deskripsi atau sinopsis pementasan belum ditambahkan.'}
        </p>
      </motion.div>
      <motion.div variants={premiumScaleIn} className="flex-1 w-full max-w-[220px] md:max-w-[280px] mx-auto">
        <div 
          onClick={() => setZoomedImage(getAssetUrl('design.jpg'))}
          className="block aspect-[9/16] relative group cursor-zoom-in"
        >
          <img 
            src={getAssetUrl('design.jpg')} 
            alt="Poster" 
            className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-all duration-500"
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1507676184212-d0330a151f84?q=80&w=800&auto=format&fit=crop' }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl">
            <span className="bg-black/80 text-white text-[10px] px-4 py-2 rounded-full backdrop-blur-md uppercase tracking-widest border border-white/20 shadow-xl">
              Perbesar Gambar
            </span>
          </div>

          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30 -translate-x-2 -translate-y-2" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30 translate-x-2 -translate-y-2" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30 -translate-x-2 translate-y-2" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30 translate-x-2 translate-y-2" />
        </div>
      </motion.div>
    </motion.section>
  );
}
