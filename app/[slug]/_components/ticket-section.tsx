'use client';

import { motion, Variants } from 'framer-motion';
import { ScriptTypewriterHeader } from '@/app/components/ScriptTypewriterHeader';

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

interface TicketSectionProps {
  ticketUrl: string;
  setZoomedImage: (url: string) => void;
  ticketError: boolean;
  setTicketError: (error: boolean) => void;
}

export function TicketSection({ ticketUrl, setZoomedImage, ticketError, setTicketError }: TicketSectionProps) {
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15, margin: "0px 0px -100px 0px" }}
      variants={premiumStagger}
      className="relative py-20 px-6 max-w-4xl mx-auto flex flex-col items-center text-center gap-10"
    >
      <motion.div variants={premiumFadeIn}>
        <ScriptTypewriterHeader title="Tiket Pementasan" subtitle="Poster & E-Tiket" align="center" />
      </motion.div>
      
      <motion.div variants={premiumScaleIn} className="w-full max-w-2xl relative">
        {!ticketError ? (
          <div 
            className="relative group cursor-zoom-in"
            onClick={() => setZoomedImage(ticketUrl)}
          >
            <img 
              src={ticketUrl} 
              alt="Desain Tiket" 
              className="w-full aspect-[16/9] object-cover rounded-lg shadow-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] opacity-80 group-hover:opacity-100 transition-all duration-500"
              onError={() => setTicketError(true)}
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
        ) : (
          <div className="p-12 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-sm">
            Gambar tiket belum diunggah
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
