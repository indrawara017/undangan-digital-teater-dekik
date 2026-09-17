'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, X, Users, Sparkles } from 'lucide-react';
import { ScriptTypewriterHeader } from './ScriptTypewriterHeader';

export interface CastMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
}

interface CompactCastSectionProps {
  castList: CastMember[];
  onZoomImage: (url: string) => void;
}

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export function CompactCastSection({ castList, onZoomImage }: CompactCastSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  if (castList.length === 0) return null;

  // Show up to 6 items on main invitation page in a compact single row (desktop) / 2 rows (mobile)
  const teaserList = castList.slice(0, 6);
  const hasMore = castList.length > 6;

  // Filter full cast list inside modal
  const filteredCast = castList.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedRoleFilter === 'all') return matchesSearch;
    return matchesSearch && member.role.toLowerCase().includes(selectedRoleFilter.toLowerCase());
  });

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <ScriptTypewriterHeader title="Pemeran & Tim Produksi" subtitle="Jajaran Seniman" align="center" />

      {/* Main Page Compact Teaser Grid */}
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5 max-w-4xl mx-auto px-2"
      >
        {teaserList.map((member, idx) => {
          const roles = member.role ? member.role.split(/[,&]/).map((r) => r.trim()).filter(Boolean) : ['Pemeran / Tim'];

          return (
            <motion.div
              key={`${member.id}-${idx}`}
              variants={cardItemVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -3, 
                transition: { type: 'spring', stiffness: 400, damping: 25 } 
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onZoomImage(member.photoUrl)}
              className="group relative bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-1.5 sm:p-2 cursor-zoom-in transition-colors duration-300 hover:border-amber-500/50 shadow-md hover:shadow-xl flex flex-col justify-between"
            >
              {/* Photo Frame - Compact Proportional Aspect Ratio */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900 rounded-lg">
                <motion.img
                  src={member.photoUrl}
                  alt={member.name}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Text Info Below Photo */}
              <div className="pt-2 pb-0.5 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-white truncate w-full group-hover:text-amber-200 transition-colors">
                  {member.name}
                </p>

                <div className="w-full flex flex-col items-center justify-center min-h-[16px]">
                  {roles.slice(0, 1).map((r, rIdx) => (
                    <p key={rIdx} className="text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-300/90 font-medium truncate w-full leading-tight">
                      {r}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Button to View Full Cast Modal */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center pt-2"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/50 text-neutral-200 hover:text-white text-xs font-medium uppercase tracking-wider rounded-full transition-all duration-300 shadow-xl group hover:shadow-2xl hover:scale-105"
          >
            <Users className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Lihat Seluruh Seniman ({castList.length})</span>
            <Sparkles className="w-3 h-3 text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
          </button>
        </motion.div>
      )}

      {/* Full Roster Modal Gallery */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl max-h-[88vh] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md shrink-0">
                <div className="space-y-0.5">
                  <h3 className="font-cormorant text-xl sm:text-2xl font-medium text-white">
                    Jajaran Seniman & Tim Produksi
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-light">
                    Total {castList.length} seniman dan tim kreatif pementasan ini
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 sm:p-4 border-b border-neutral-900 bg-neutral-950/80 shrink-0">
                <div className="relative w-full max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Cari nama seniman atau peran..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
              </div>

              {/* Modal Grid Body */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar">
                {filteredCast.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 space-y-2">
                    <p className="text-xs font-medium">Tidak ada seniman yang cocok dengan pencarian.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                    {filteredCast.map((member, idx) => {
                      const roles = member.role ? member.role.split(/[,&]/).map((r) => r.trim()).filter(Boolean) : ['Pemeran / Tim'];

                      return (
                        <div
                          key={`modal-${member.id}-${idx}`}
                          onClick={() => {
                            onZoomImage(member.photoUrl);
                          }}
                          className="group relative bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/50 rounded-xl p-1.5 cursor-zoom-in transition-all duration-300 hover:bg-neutral-900 flex flex-col justify-between"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950 rounded-lg mb-1.5">
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-300"
                            />
                          </div>
                          <div className="text-center space-y-0.5 min-w-0 w-full">
                            <p className="text-[10px] sm:text-xs font-semibold text-white truncate group-hover:text-amber-200">
                              {member.name}
                            </p>
                            <div className="w-full flex flex-col items-center justify-center min-h-[14px]">
                              {roles.slice(0, 1).map((r, rIdx) => (
                                <p key={rIdx} className="text-[7px] sm:text-[8px] uppercase tracking-wider text-amber-300/90 font-medium truncate w-full leading-tight">
                                  {r}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
