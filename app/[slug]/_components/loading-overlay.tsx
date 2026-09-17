'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SubtleTypingWord({ text, className }: { text: string; className: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)', y: 4 }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)', y: -4 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`${className} uppercase`}
    >
      {text}
    </motion.p>
  );
}

export function TeaterSubtleTypingLoader() {
  const steps = [
    { text: "Bersatu", size: "text-4xl sm:text-5xl font-light tracking-[0.35em] text-neutral-200" },
    { text: "Bersama", size: "text-4xl sm:text-5xl font-light tracking-[0.35em] text-neutral-200" },
    { text: "dan Terus Berkarya", size: "text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.25em] text-neutral-100" },
    { text: "Teater Dekik Jaya", size: "text-4xl sm:text-5xl md:text-6xl font-semibold font-cormorant tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-200 drop-shadow-[0_0_35px_rgba(255,255,255,0.5)]" },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timings = [750, 1000, 1000, 600];
    let isMounted = true;

    const runSequence = async () => {
      for (let i = 0; i < steps.length - 1; i++) {
        await new Promise(res => setTimeout(res, timings[i]));
        if (!isMounted) return;
        setCurrentStep(prev => prev + 1);
      }
    };

    runSequence();
    return () => { isMounted = false; };
  }, [steps.length]);

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,60,60,0.4)_0%,transparent_75%)] pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <div key={currentStep} className="relative z-10 text-center px-4">
          <SubtleTypingWord text={step.text} className={step.size} />
        </div>
      </AnimatePresence>
    </div>
  );
}
