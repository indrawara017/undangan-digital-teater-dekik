'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingAudioPlayer({ audioUrl, autoPlay = false }: { audioUrl: string, autoPlay?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We don't autoplay due to browser policies. We wait for user interaction.
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audioRef.current = audio;

    if (autoPlay) {
      audio.currentTime = 0;
      audio.volume = 0; // Start at 0 for fade in
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
          
          // Cinematic Fade-in Effect (2.5 seconds for very clear effect)
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 1) {
              vol = Math.min(1, vol + 0.02); // Slower volume increase
              if (audioRef.current) audioRef.current.volume = vol;
            } else {
              clearInterval(fadeInterval);
            }
          }, 50);
          
        }).catch(e => {
          console.log("Autoplay blocked by browser policy. Waiting for user interaction.", e);
          setIsPlaying(false);
        });
      }
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 1; // Ensure full volume on manual play
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    
    setIsPlaying(!isPlaying);
    if (!hasInteracted) setHasInteracted(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
            className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-neutral-800 text-white text-[10px] uppercase tracking-widest font-medium rounded-full shadow-2xl pointer-events-none"
          >
            Play Music
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={togglePlay}
        className={`w-12 h-12 flex items-center justify-center rounded-full shadow-2xl transition-all duration-500 border ${
          isPlaying 
            ? 'bg-white text-black border-white' 
            : 'bg-black/60 backdrop-blur-md text-white border-neutral-700 hover:bg-neutral-900 hover:border-neutral-500'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <div className="relative flex items-center justify-center w-full h-full">
            <Music className="w-5 h-5 relative z-10" />
            {!hasInteracted && (
              <span className="absolute inset-0 rounded-full border border-white/30 animate-ping" />
            )}
          </div>
        )}
      </button>
    </div>
  );
}
