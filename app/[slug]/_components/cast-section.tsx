'use client';

import { motion, Variants } from 'framer-motion';
import { CompactCastSection } from '@/app/components/CompactCastSection';

const premiumStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const premiumFadeIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

interface CastSectionProps {
  assignedCast: any[];
  cast: any[];
  getAssetUrl: (path: string) => string;
  setZoomedImage: (url: string) => void;
}

export function CastSection({ assignedCast, cast, getAssetUrl, setZoomedImage }: CastSectionProps) {
  const castList = assignedCast.length > 0 
    ? assignedCast.map((member) => ({
        id: member.memberId || member.id || member.name,
        name: member.name,
        role: member.role,
        photoUrl: member.photoUrl
      }))
    : cast.length > 0
    ? cast.map((item) => ({
        id: item.name,
        name: item.name.split('.')[0].replace(/[-_]/g, ' '),
        role: 'Pemeran / Tim',
        photoUrl: getAssetUrl(`cast/${item.name}`)
      }))
    : [
        { id: 'demo-1', name: 'Manik Sukadana', role: 'Sutradara Pementasan', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
        { id: 'demo-2', name: 'Indra Wardana', role: 'Pemeran Utama', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
        { id: 'demo-3', name: 'Dewi Anjani', role: 'Pemeran Utama', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
        { id: 'demo-4', name: 'Bagus Pratama', role: 'Penata Musik & Tim', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop' }
      ];

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15, margin: "0px 0px -100px 0px" }}
      variants={premiumStagger}
      className="relative py-20 md:py-28 px-4 sm:px-6 max-w-5xl mx-auto text-center"
    >
      <motion.div variants={premiumFadeIn}>
        <CompactCastSection 
          castList={castList} 
          onZoomImage={setZoomedImage} 
        />
      </motion.div>
    </motion.section>
  );
}
