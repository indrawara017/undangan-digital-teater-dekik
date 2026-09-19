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

interface LocationSectionProps {
  eventData: any;
  formatIndonesianDate: (date: string) => string;
}

export function LocationSection({ eventData, formatIndonesianDate }: LocationSectionProps) {
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15, margin: "0px 0px -100px 0px" }}
      variants={premiumStagger}
      className="relative py-20 md:py-28"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col gap-10 md:gap-14">
        {/* Title at the Top */}
        <motion.div variants={premiumFadeIn} className="text-center">
          <ScriptTypewriterHeader title="Waktu & Tempat" subtitle="Pelaksanaan" align="center" />
        </motion.div>

        {/* Content: Date, Location & Google Maps */}
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          <motion.div variants={premiumFadeIn} className="flex-1 space-y-6 text-left w-full">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1.5">Tanggal & Waktu</p>
                <p className="text-base md:text-lg text-neutral-200 font-medium">{eventData.date ? formatIndonesianDate(eventData.date) : '-'}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1.5">Lokasi Pementasan</p>
                <p className="text-base md:text-lg text-neutral-200 font-medium mb-5">{eventData.location || '-'}</p>
                
                {eventData.gmaps_url && (
                  <a 
                    href={eventData.gmaps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white text-black text-xs font-medium uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors w-fit shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={premiumScaleIn} className="flex-1 w-full h-[280px] sm:h-[340px] lg:h-[360px] border border-neutral-700/80 bg-neutral-900 rounded-2xl overflow-hidden relative group shadow-2xl">
            {eventData.gmaps_url ? (
              <iframe 
                src={eventData.gmaps_url} 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(110%)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-4 p-8 text-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <p className="text-sm">Link embed Google Maps belum diatur.<br/>Silakan atur di Dashboard Admin.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
