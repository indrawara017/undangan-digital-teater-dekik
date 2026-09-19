'use client';

import { motion } from 'framer-motion';
import { ScriptTypewriterHeader } from '@/app/components/ScriptTypewriterHeader';

interface FooterSectionProps {
  sponsors: any[];
  config: any;
  getAssetUrl: (path: string) => string;
}

export function FooterSection({ sponsors, config, getAssetUrl }: FooterSectionProps) {
  return (
    <>
      {sponsors.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pt-12 pb-6 md:pt-16 md:pb-8 overflow-hidden relative border-t border-neutral-900/80"
        >
          <div className="w-full text-center space-y-3">
            <ScriptTypewriterHeader title="Didukung Oleh" subtitle="Sponsor & Mitra" align="center" />

            <div className="relative w-full max-w-5xl mx-auto overflow-hidden px-4">
              <div className="absolute top-0 bottom-0 left-0 w-16 md:w-28 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-16 md:w-28 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

              <div className="flex overflow-hidden py-2">
                <motion.div
                  className="flex items-center gap-12 md:gap-20 shrink-0 pr-12 md:pr-20"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: Math.max(14, sponsors.length * 4),
                      ease: 'linear',
                    },
                  }}
                >
                  {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((sponsor, idx) => {
                    const displayName = sponsor.name.split('---')[0];
                    return (
                      <div key={`${sponsor.name}-${idx}`} className="flex flex-col items-center gap-2.5 shrink-0 group">
                        <div className="h-12 md:h-16 flex items-center justify-center">
                          <img
                            src={getAssetUrl(`sponsors/${sponsor.name}`)}
                            alt={`Sponsor ${displayName}`}
                            className="h-10 md:h-14 w-auto max-w-[140px] object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 filter group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          />
                        </div>
                        <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-neutral-400 group-hover:text-neutral-200 transition-colors whitespace-nowrap">
                          {displayName}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1.5 }}
        className="pt-8 md:pt-10 pb-16 text-center flex flex-col items-center justify-center gap-6 bg-gradient-to-t from-black via-black/80 to-transparent relative z-10"
      >
        <div className="flex items-center gap-6">
          {config?.instagram && (
            <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
          )}
          {config?.youtube && (
            <a href={config.youtube.startsWith('http') ? config.youtube : `https://youtube.com/search?q=${config.youtube}`} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          )}
          {config?.tiktok && (
            <a href={`https://tiktok.com/@${config.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.33-1.95 1.61-4.66 2.12-7.14 1.56-2.53-.55-4.65-2.27-5.62-4.67-1.11-2.73-.66-6.05 1.17-8.32 1.73-2.16 4.62-3.04 7.27-2.48.16.03.32.08.48.13V14.3c-1.49-.32-3.14-.13-4.43.76-1.37.95-1.95 2.82-1.39 4.38.54 1.51 2.21 2.45 3.8 2.29 1.46-.14 2.65-1.14 3.12-2.52.27-.79.33-1.64.33-2.48V.02z" /></svg>
            </a>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-xs tracking-widest text-neutral-600 uppercase">&copy; {new Date().getFullYear()} TEATER DEKIK</p>
          <p className="text-[10px] tracking-widest text-neutral-700 uppercase">Development by Indra Wardana</p>
        </div>
      </motion.footer>
    </>
  );
}
