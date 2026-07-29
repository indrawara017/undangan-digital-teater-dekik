'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export interface CastShowcaseMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
}

interface AnimatedCastShowcaseProps {
  castList: CastShowcaseMember[];
  onZoomImage: (url: string) => void;
}

function ContinuousFilmRow({
  members,
  direction,
  onZoomImage
}: {
  members: CastShowcaseMember[];
  direction: 'right' | 'left';
  onZoomImage: (url: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (members.length === 0) return null;

  // Duplicate items 8 times so -50% shift is 100% seamless
  const displayItems = [
    ...members, ...members, ...members, ...members,
    ...members, ...members, ...members, ...members
  ];

  const duration = Math.max(24, members.length * 8);

  return (
    <div
      className="relative w-full overflow-hidden select-none py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Continuous Seamless Moving Track */}
      <div className="overflow-hidden w-full">
        <motion.div
          className="flex w-max shrink-0 gap-2 sm:gap-3 px-1"
          animate={{ x: direction === 'right' ? ['-50%', '0%'] : ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: duration,
              ease: 'linear',
            },
          }}
          style={{
            animationPlayState: isHovered ? 'paused' : 'running',
            willChange: 'transform',
          }}
        >
          {displayItems.map((member, idx) => {
            const roles = member.role ? member.role.split(/[,&]/).map(r => r.trim()).filter(Boolean) : ['Pemeran / Tim'];

            return (
              <motion.div
                key={`${direction}-${member.id}-${idx}`}
                whileHover={{ 
                  scale: 1.06, 
                  y: -3, 
                  zIndex: 30,
                  transition: { type: 'spring', stiffness: 350, damping: 25 } 
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onZoomImage(member.photoUrl)}
                className="group relative shrink-0 w-24 sm:w-28 md:w-32 bg-transparent cursor-zoom-in flex flex-col justify-between"
              >
                {/* Clean Photo Card */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900 rounded-xl border border-neutral-800/80 group-hover:border-amber-500/50 shadow-md transition-colors">
                  <motion.img
                    src={member.photoUrl}
                    alt={member.name}
                    whileHover={{ scale: 1.10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Text Info Below Photo */}
                <div className="pt-1.5 text-center flex flex-col items-center gap-0.5 w-full min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate w-full group-hover:text-amber-200 transition-colors">
                    {member.name}
                  </p>

                  <div className="w-full flex flex-col items-center justify-center min-h-[18px]">
                    {roles.slice(0, 2).map((r, rIdx) => (
                      <p key={rIdx} className="text-[7.5px] uppercase tracking-wider text-amber-300/90 font-medium truncate w-full leading-tight">
                        {r}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export function AnimatedCastShowcase({ castList, onZoomImage }: AnimatedCastShowcaseProps) {
  if (castList.length === 0) return null;

  // Split list into 2 rows if enough items, or use all items for both
  const halfLength = Math.ceil(castList.length / 2);
  const row1List = castList.length > 2 ? castList.slice(0, halfLength) : castList;
  const row2List = castList.length > 2 ? castList.slice(halfLength) : castList;

  return (
    <div className="relative w-full overflow-hidden space-y-3 py-1">
      {/* Left and Right Edge Vignette Overlay */}
      <div className="absolute top-0 bottom-0 left-0 w-12 md:w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-30 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-12 md:w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-30 pointer-events-none" />

      {/* Row 1: Moving to RIGHT */}
      <ContinuousFilmRow members={row1List} direction="right" onZoomImage={onZoomImage} />

      {/* Row 2: Moving to LEFT */}
      <ContinuousFilmRow members={row2List} direction="left" onZoomImage={onZoomImage} />
    </div>
  );
}
