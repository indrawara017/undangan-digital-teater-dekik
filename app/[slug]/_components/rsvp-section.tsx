'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ScriptTypewriterHeader } from '@/app/components/ScriptTypewriterHeader';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, XCircle, RefreshCw } from 'lucide-react';

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

interface RsvpSectionProps {
  isPreview: boolean;
  rsvpStatus: string | null;
  isChangingRsvp: boolean;
  setIsChangingRsvp: (val: boolean) => void;
  isCheckedIn: boolean;
  guest: any;
  eventData: any;
  invitation: any;
  handleRSVP: (status: 'attending' | 'declined') => void;
  isUpdating: boolean;
}

export function RsvpSection({ 
  isPreview, rsvpStatus, isChangingRsvp, setIsChangingRsvp, 
  isCheckedIn, guest, eventData, invitation, handleRSVP, isUpdating 
}: RsvpSectionProps) {

  // PREVIEW MODE
  if (isPreview) {
    return (
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15, margin: "0px 0px -100px 0px" }}
        variants={premiumStagger}
        className="relative py-10 md:py-16 px-4 sm:px-6 max-w-md mx-auto text-center space-y-5"
      >
        <motion.div variants={premiumFadeIn} className="w-full space-y-3">
          <ScriptTypewriterHeader title="Konfirmasi Kehadiran" subtitle="Kehadiran" align="center" />
          <p className="text-neutral-400 text-xs font-light max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Merupakan suatu kehormatan bagi kami apabila Anda berkenan hadir dan menyaksikan pementasan ini.
          </p>
        </motion.div>

        <motion.div variants={premiumFadeIn} className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-xl space-y-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-6">Mode Preview - Formulir Tidak Aktif</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button disabled className="px-6 py-4 border border-emerald-800 text-emerald-500 bg-emerald-950/30 opacity-50 cursor-not-allowed rounded-sm uppercase tracking-wider text-xs font-medium">Saya Akan Hadir</button>
            <button disabled className="px-6 py-4 border border-rose-800 text-rose-500 bg-rose-950/30 opacity-50 cursor-not-allowed rounded-sm uppercase tracking-wider text-xs font-medium">Maaf, Tidak Hadir</button>
          </div>
        </motion.div>
      </motion.section>
    );
  }

  // REAL MODE
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15, margin: "0px 0px -100px 0px" }}
      variants={premiumStagger}
      className="relative py-10 md:py-16 px-4 sm:px-6 max-w-lg mx-auto text-center space-y-5"
    >
      <motion.div variants={premiumFadeIn} className="w-full space-y-3">
        <ScriptTypewriterHeader 
          title={rsvpStatus === 'attending' && !isChangingRsvp ? 'Tiket Digital' : 'Konfirmasi Kehadiran'} 
          subtitle="Kehadiran"
          align="center" 
        />
        <p className="text-neutral-400 text-xs font-light max-w-xs sm:max-w-sm mx-auto leading-relaxed">
          {rsvpStatus === 'attending' && !isChangingRsvp 
            ? 'Tiket resmi pementasan Anda telah terbit di bawah ini.' 
            : 'Merupakan suatu kehormatan bagi kami apabila Anda berkenan hadir dan menyaksikan pementasan ini.'}
        </p>
      </motion.div>
      
      <motion.div variants={premiumFadeIn}>
        <AnimatePresence mode="wait">
          {rsvpStatus === 'attending' && !isChangingRsvp ? (
            /* ULTRA MINIMALIST DIGITAL PASS CARD */
            <motion.div 
              key="e-ticket-card"
              initial={{ opacity: 0, y: 24, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: [0.93, 1.03, 1] }}
              viewport={{ once: false, amount: 0.3 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.3 } }}
              className="border border-neutral-800 bg-neutral-950/90 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl relative overflow-hidden text-center backdrop-blur-md max-w-sm mx-auto"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              
              <div className="border-b border-neutral-800/80 pb-3 space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium truncate pr-2">{guest.name}</span>
                  {isCheckedIn ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400 font-semibold shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" /> Checked-In
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400 font-semibold shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Tiket Aktif
                    </span>
                  )}
                </div>
                <h3 className="font-cormorant text-xl font-medium text-white tracking-wide leading-tight">
                  {eventData.title}
                </h3>
              </div>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: [0.9, 1.05, 1], opacity: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                className="aspect-square w-full max-w-[240px] sm:max-w-[260px] mx-auto p-4 bg-white rounded-2xl shadow-2xl my-3 flex flex-col items-center justify-center"
              >
                <QRCodeSVG 
                  value={JSON.stringify({ invId: invitation.id, guestId: guest.id })} 
                  size={200} 
                  bgColor="#ffffff" 
                  fgColor="#000000" 
                  level="H" 
                  imageSettings={{
                    src: "/logo_teater.png",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
                <p className="text-[10px] font-mono text-neutral-600 mt-2 font-semibold tracking-widest uppercase">
                  ID: DEKIK-{invitation.id.slice(0, 8).toUpperCase()}
                </p>
              </motion.div>

              <p className="text-[11px] text-neutral-400 font-light tracking-wide">
                Tunjukkan QR Code ini kepada panitia saat tiba di lokasi.
              </p>

              <div className="pt-1 border-t border-neutral-900">
                <button
                  onClick={() => setIsChangingRsvp(true)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 underline tracking-wider transition-colors font-light"
                >
                  Ubah Konfirmasi Kehadiran
                </button>
              </div>
            </motion.div>
          ) : rsvpStatus === 'declined' && !isChangingRsvp ? (
            /* DECLINED CARD */
            <motion.div 
              key="declined-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="border border-neutral-800 bg-neutral-950/80 rounded-2xl p-6 md:p-8 space-y-6 text-center shadow-xl backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Terima Kasih atas Konfirmasinya</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto font-light leading-relaxed">
                  Kami memahami Anda berhalangan hadir. Semoga kita dapat berjumpa di pementasan Teater Dekik berikutnya.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleRSVP('attending')}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-white uppercase tracking-wider font-semibold transition-all shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Memproses...' : 'Berubah Pikiran? Konfirmasi Hadir'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* RSVP FORM */
            <motion.div 
              key="rsvp-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-xl space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleRSVP('attending')}
                  disabled={isUpdating}
                  className="px-6 py-4 border border-emerald-800/50 text-emerald-500 hover:bg-emerald-950/40 disabled:opacity-50 transition-colors rounded-sm uppercase tracking-wider text-xs font-medium relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10">{isUpdating ? 'Memproses...' : 'Saya Akan Hadir'}</span>
                </button>
                <button
                  onClick={() => handleRSVP('declined')}
                  disabled={isUpdating}
                  className="px-6 py-4 border border-rose-800/50 text-rose-500 hover:bg-rose-950/40 disabled:opacity-50 transition-colors rounded-sm uppercase tracking-wider text-xs font-medium relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-rose-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10">{isUpdating ? 'Memproses...' : 'Maaf, Tidak Hadir'}</span>
                </button>
              </div>
              {rsvpStatus && (
                <div className="pt-4 border-t border-neutral-800/50">
                  <button
                    onClick={() => setIsChangingRsvp(false)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-widest font-light transition-colors"
                  >
                    Batal Ubah
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
