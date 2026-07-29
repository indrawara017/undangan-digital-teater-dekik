'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, SearchX, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Theater Spotlight & Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Dynamic Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* Decorative Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs tracking-widest uppercase mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Teater Dekik • Error 404</span>
        </motion.div>

        {/* Big 404 Visual */}
        <div className="relative mb-6">
          <h1 className="text-8xl sm:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-300 to-neutral-700 font-cormorant select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black">
              <SearchX className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <h2 className="text-2xl sm:text-3xl font-bold font-cormorant text-white mb-3 tracking-wide">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
          Maaf, halaman atau undangan pementasan yang Anda tuju tidak ditemukan, telah dipindahkan, atau link yang dimasukkan tidak sesuai.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 group backdrop-blur-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Halaman Sebelumnya</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Footer Credit */}
        <div className="mt-16 pt-8 border-t border-neutral-900 text-neutral-600 text-xs">
          Undangan Digital Pementasan Teater Dekik
        </div>
      </motion.div>
    </div>
  );
}
