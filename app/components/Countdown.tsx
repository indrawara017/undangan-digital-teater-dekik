'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownProps {
  targetDate: string | null;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!targetDate) return;
    
    const date = new Date(targetDate).getTime();
    if (isNaN(date)) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = date - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsFinished(true);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isMounted || !targetDate || isFinished) return null;

  const timeUnits = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6 mt-8 mb-4">
      {timeUnits.map((unit, idx) => (
        <motion.div 
          key={unit.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
          className="flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-xl md:rounded-2xl shadow-inner"
        >
          <span className="text-xl md:text-2xl font-semibold font-inter text-white tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-widest mt-1">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
