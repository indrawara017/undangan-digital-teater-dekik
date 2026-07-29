'use client';

import { motion, Variants } from 'framer-motion';

interface ScriptTypewriterHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'center' | 'left' | 'right';
}

export function ScriptTypewriterHeader({
  title,
  subtitle,
  className = "",
  align = 'center'
}: ScriptTypewriterHeaderProps) {
  const words = title.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.03,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 3, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const alignmentClass = align === 'left' 
    ? 'justify-start text-left' 
    : align === 'right' 
    ? 'justify-end text-right' 
    : 'justify-center text-center';

  return (
    <div className={`space-y-2 ${className}`}>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.35 }}
          className={`text-xs tracking-[0.3em] uppercase text-neutral-500 font-medium ${align === 'left' ? 'text-left' : 'text-center'}`}
        >
          {subtitle}
        </motion.p>
      )}

      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
        className={`font-cormorant text-2xl sm:text-4xl md:text-5xl text-neutral-200 font-medium leading-tight flex flex-wrap items-center gap-x-2 gap-y-1 ${alignmentClass}`}
        aria-label={title}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => (
              <motion.span key={charIndex} variants={letterVariants} className="inline-block">
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.h2>
    </div>
  );
}
