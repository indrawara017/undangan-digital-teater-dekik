'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CalendarDays, Clock, Ticket } from 'lucide-react';
import { FullScreenLoader } from '@/app/components/Loader';
import { FloatingAudioPlayer } from '../components/FloatingAudioPlayer';

const premiumStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const premiumFadeIn = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } 
  }
};

const premiumScaleIn = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function GuestClient({ guest, invitation, event: eventData, bucketUrl }: { guest: any, invitation: any, event: any, bucketUrl: string }) {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [logos, setLogos] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ showSponsors: true, instagram: '', youtube: '', tiktok: '' });
  const [loading, setLoading] = useState(true);
  const [ticketError, setTicketError] = useState(false);
  const [sponsorIndex, setSponsorIndex] = useState(0);
  const [audioTimestamp] = useState(Date.now());
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [wantsMusic, setWantsMusic] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const [rsvpStatus, setRsvpStatus] = useState(invitation?.rsvp_status || null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (sponsors.length > 3) {
      const timer = setInterval(() => {
        setSponsorIndex(prev => (prev + 1) % sponsors.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [sponsors.length]);
  
  const getAssetUrl = (fileName: string) => {
    return `${bucketUrl}/${fileName}`;
  };

  const handleRSVP = async (status: 'attending' | 'declined') => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('invitations')
      .update({ rsvp_status: status })
      .eq('id', invitation.id);
    
    if (!error) {
      setRsvpStatus(status);
    }
    setIsUpdating(false);
  };

  const formatIndonesianDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
  };

  useEffect(() => {
    const fetchAdditionalData = async () => {
      const eventId = eventData.id;
      
      const { data: sponsorData } = await supabase.storage.from('assets').list(`${eventId}/sponsors`);
      if (sponsorData) {
        let fetched = sponsorData.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder');
        if (fetched.length === 4 || fetched.length === 5) {
          fetched = [...fetched, ...fetched];
        }
        setSponsors(fetched);
      }

      const { data: logoData } = await supabase.storage.from('assets').list(`${eventId}/logos`);
      if (logoData) {
        setLogos(logoData.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder'));
      }

      const { data: configData } = await supabase.storage.from('assets').download('global/config.json');
      if (configData) {
        try {
          const text = await configData.text();
          setConfig(JSON.parse(text));
        } catch(e) {}
      }
      
      // Preload critical images
      const imagesToPreload = [
        `${bucketUrl}/background.jpg`,
        `${bucketUrl}/design.jpg`,
        `${bucketUrl}/ticket.jpg`
      ];

      await Promise.allSettled(
        imagesToPreload.map(src => new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // proceed even if it fails
        }))
      );

      // Artificial delay for premium loader experience
      setTimeout(() => setLoading(false), 500);
    };
    fetchAdditionalData();
  }, [eventData.id]);

  if (loading) {
    return <FullScreenLoader text="MEMBUKA TIRAI..." />;
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <p className="font-cormorant text-2xl text-red-500 tracking-widest">PEMENTASAN TIDAK DITEMUKAN</p>
      </div>
    );
  }

  const bgUrl = getAssetUrl('background.jpg');
  const ticketUrl = getAssetUrl('ticket.jpg');

  // Welcome / Cover Screen
  if (!isCoverOpened) {
    return (
      <motion.div 
        key="cover"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
      >
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6 max-w-lg mb-8">
          
          {/* LOGOS ON WELCOME SCREEN */}
          {logos.length > 0 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-2"
            >
              {logos.map((logo) => (
                <img 
                  key={logo.name}
                  src={getAssetUrl(`logos/${logo.name}`)}
                  alt="Logo"
                  className="h-10 md:h-12 w-auto object-contain drop-shadow-lg"
                />
              ))}
            </motion.div>
          )}

          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs tracking-[0.3em] uppercase text-neutral-400">
            Selamat Datang di
          </motion.p>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="font-cormorant text-3xl md:text-4xl text-white drop-shadow-xl leading-snug">
            Undangan Digital<br/>Teater Dekik
          </motion.h1>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="w-16 h-px bg-white/30 my-4" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 }}
            className="flex flex-col w-full sm:w-auto gap-3"
          >
            <button 
              onClick={() => { setWantsMusic(eventData?.is_audio_enabled !== false); setIsCoverOpened(true); }}
              className="px-8 py-3.5 bg-white text-black text-[11px] uppercase tracking-[0.2em] font-bold rounded-full transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
            >
              {eventData?.is_audio_enabled !== false ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                  Buka & Putar Musik
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Buka Undangan
                </>
              )}
            </button>
            {eventData?.is_audio_enabled !== false && (
              <button 
                onClick={() => { setWantsMusic(false); setIsCoverOpened(true); }}
                className="px-8 py-3.5 bg-transparent border border-white/20 text-white text-[11px] uppercase tracking-[0.2em] font-medium rounded-full hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                Buka Tanpa Musik
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen selection:bg-neutral-800 relative">
      
      {/* Removed GLOBAL FIXED BACKGROUND, moved to HERO */}

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10">
        
        {/* SECTION 1: HERO / OPENING */}
        <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
          
          {/* HERO BACKGROUND IMAGE */}
          <div className="absolute inset-0 z-0">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 4, ease: 'easeOut' }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${bgUrl})` }}
            />
            {/* Dramatic Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80 pointer-events-none" />
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          </div>

          {/* Smooth Gradient Transition to Black Content Below */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent z-0 pointer-events-none" />
          
          {/* Content Container */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={premiumStagger}
            className="flex-1 w-full flex flex-col items-center justify-center pb-16 md:pb-20 z-10"
          >
          
          {/* LOGOS (Replaces Tipografi/Judul) */}
          {logos.length > 0 && (
            <motion.div 
              variants={premiumFadeIn}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10 w-full px-4"
            >
              {logos.map((logo) => (
                <img 
                  key={logo.name}
                  src={getAssetUrl(`logos/${logo.name}`)}
                  alt="Logo"
                  className="h-12 md:h-16 w-auto object-contain drop-shadow-lg"
                />
              ))}
            </motion.div>
          )}

          <motion.div
            variants={premiumFadeIn}
            className="flex flex-col items-center justify-center gap-1 mb-3 w-full"
          >
            <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-neutral-400 text-center w-full">
              Teater Dekik Mempersembahkan
            </p>
            <p className="text-[9px] md:text-[10px] tracking-widest text-neutral-500 font-light italic mt-1 text-center w-full">
              Karya: {eventData.creator || '[Nama Penulis/Sutradara]'}
            </p>
          </motion.div>
          
          {/* Typography Title */}
          <motion.h1 
            variants={premiumScaleIn}
            className="w-full text-center font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium mb-6 pb-2 px-4 leading-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400"
          >
            {eventData.title}
          </motion.h1>

          {/* Guest Name Greeting */}
          <motion.div
            variants={premiumFadeIn}
            className="flex flex-col items-center justify-center gap-2 mb-8 text-center px-4 w-full"
          >
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-neutral-400 text-center w-full">Kepada Yth. Bapak/Ibu/Saudara/i</span>
            <span className="text-xl md:text-2xl font-cormorant font-medium text-white text-center w-full">{guest.name}</span>
          </motion.div>

          <motion.div 
            variants={premiumFadeIn}
            className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-8 w-20"
          />

          <motion.div
            variants={premiumFadeIn}
            className="flex flex-col items-center justify-center gap-4 w-full text-center"
          >
            <div className="flex flex-row items-center justify-center gap-2 text-neutral-200 w-full">
              <p className="text-sm md:text-base tracking-[0.2em] uppercase font-light text-center">
                {eventData.date ? formatIndonesianDate(eventData.date) : 'Waktu Belum Ditentukan'}
              </p>
            </div>
            
            <div className="flex flex-row items-center justify-center gap-2 text-neutral-500 w-full">
              <p className="text-xs md:text-sm tracking-widest font-light uppercase text-center">
                {eventData.location || 'Lokasi Belum Ditentukan'}
              </p>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.5, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-500 font-medium">Gulir ke Bawah</span>
          <motion.div 
            animate={{ y: [0, 15, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"
          />
        </motion.div>
        
      </main>

      {/* SECTION 2: SINOPSIS & POSTER */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: "0px 0px -100px 0px" }}
        variants={premiumStagger}
        className="relative py-32 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16"
      >
        <motion.div variants={premiumFadeIn} className="flex-1 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-neutral-600" />
            <span className="text-xs tracking-[0.3em] uppercase text-neutral-400">Sinopsis Singkat</span>
          </div>
          <h2 className="font-cormorant text-4xl md:text-5xl leading-tight text-neutral-200">
            {eventData.title}
          </h2>
          <p className="text-neutral-400 leading-relaxed font-light text-sm md:text-base whitespace-pre-wrap">
            {eventData.description || 'Deskripsi atau sinopsis pementasan belum ditambahkan. Anda dapat menambahkan deskripsi pementasan ini melalui menu Manajemen Event di Dashboard Admin untuk memberikan gambaran cerita kepada tamu undangan Anda.'}
          </p>
        </motion.div>
        <motion.div variants={premiumScaleIn} className="flex-1 w-full max-w-[220px] md:max-w-[280px] mx-auto">
          <div 
            onClick={() => setZoomedImage(`${getAssetUrl('design.jpg')}?t=${Date.now()}`)}
            className="block aspect-[9/16] relative group cursor-zoom-in"
          >
            <img 
              src={`${getAssetUrl('design.jpg')}?t=${Date.now()}`} 
              alt="Poster" 
              className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-all duration-500"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1507676184212-d0330a151f84?q=80&w=800&auto=format&fit=crop' }}
            />
            
            {/* Hover Expand Hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl">
              <span className="bg-black/80 text-white text-[10px] px-4 py-2 rounded-full backdrop-blur-md uppercase tracking-widest border border-white/20 shadow-xl">
                Perbesar Gambar
              </span>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30 -translate-x-2 -translate-y-2" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30 translate-x-2 -translate-y-2" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30 -translate-x-2 translate-y-2" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30 translate-x-2 translate-y-2" />
          </div>
        </motion.div>
      </motion.section>

      {/* SECTION 2B: TICKET / PAMFLET */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: "0px 0px -100px 0px" }}
        variants={premiumStagger}
        className="relative py-20 px-6 max-w-4xl mx-auto flex flex-col items-center text-center gap-10"
      >
        <motion.div variants={premiumFadeIn} className="space-y-4">
          <h2 className="font-cormorant text-4xl md:text-5xl text-neutral-200">Tiket Pementasan</h2>
        </motion.div>
        
        <motion.div variants={premiumScaleIn} className="w-full max-w-2xl relative">
          {!ticketError ? (
            <div 
              className="relative group cursor-zoom-in"
              onClick={() => setZoomedImage(`${ticketUrl}?t=${Date.now()}`)}
            >
              <img 
                src={`${ticketUrl}?t=${Date.now()}`} 
                alt="Desain Tiket" 
                className="w-full aspect-[16/9] object-cover rounded-lg shadow-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] opacity-80 group-hover:opacity-100 transition-all duration-500"
                onError={() => setTicketError(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl">
                <span className="bg-black/80 text-white text-[10px] px-4 py-2 rounded-full backdrop-blur-md uppercase tracking-widest border border-white/20 shadow-xl">
                  Perbesar Gambar
                </span>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30 -translate-x-2 -translate-y-2" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30 translate-x-2 -translate-y-2" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30 -translate-x-2 translate-y-2" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30 translate-x-2 translate-y-2" />
            </div>
          ) : (
            <div className="p-12 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-sm">
              Gambar tiket belum diunggah
            </div>
          )}
        </motion.div>
      </motion.section>

      {/* SECTION 3: WAKTU & LOKASI (GMAPS) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: "0px 0px -100px 0px" }}
        variants={premiumStagger}
        className="relative py-32"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-16">
          <motion.div variants={premiumFadeIn} className="flex-1 space-y-10">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.3em] uppercase text-neutral-500">Pelaksanaan</span>
              <h2 className="font-cormorant text-4xl text-neutral-200">Waktu & Tempat</h2>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="flex flex-col">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Tanggal & Waktu</p>
                <p className="text-lg text-neutral-200 font-medium">{eventData.date ? formatIndonesianDate(eventData.date) : '-'}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Lokasi Pementasan</p>
                <p className="text-lg text-neutral-200 font-medium mb-6">{eventData.location || '-'}</p>
                
                {eventData.gmaps_url && (
                  <a 
                    href={eventData.gmaps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black text-xs font-medium uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors w-fit shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={premiumScaleIn} className="flex-1 w-full aspect-square border border-white/10 bg-black/50 rounded-xl overflow-hidden relative group backdrop-blur-md">
            {eventData.gmaps_url ? (
              <iframe 
                src={eventData.gmaps_url} 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(80%) contrast(120%)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80 hover:opacity-100 transition-opacity duration-500 pointer-events-auto"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-4 p-8 text-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <p className="text-sm">Link embed Google Maps belum diatur.<br/>Silakan atur di Dashboard Admin.</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 4: RSVP PREVIEW */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: "0px 0px -100px 0px" }}
        variants={premiumStagger}
        className="relative py-32 px-6 max-w-2xl mx-auto text-center space-y-12"
      >
        <motion.div variants={premiumFadeIn}>
          <h2 className="font-cormorant text-4xl md:text-5xl text-neutral-200 mb-4">Konfirmasi Kehadiran</h2>
          <p className="text-neutral-400 text-sm md:text-base font-light">
            Merupakan suatu kehormatan bagi kami apabila Anda berkenan hadir dan menyaksikan pementasan ini.
          </p>
        </motion.div>
        
        <motion.div variants={premiumFadeIn} className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => handleRSVP('attending')}
              disabled={isUpdating}
              className={`px-6 py-4 border rounded-sm uppercase tracking-wider text-xs font-medium transition-all duration-300 ${
                rsvpStatus === 'attending' 
                  ? 'bg-emerald-700 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                  : 'border-emerald-800 text-emerald-500 bg-emerald-950/30'
              }`}
            >
              {isUpdating && rsvpStatus !== 'attending' ? 'Memproses...' : 'Saya Akan Hadir'}
            </button>
            <button 
              onClick={() => handleRSVP('declined')}
              disabled={isUpdating}
              className={`px-6 py-4 border rounded-sm uppercase tracking-wider text-xs font-medium transition-all duration-300 ${
                rsvpStatus === 'declined' 
                  ? 'bg-rose-700 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' 
                  : 'border-rose-800 text-rose-500 bg-rose-950/30'
              }`}
            >
              Maaf, Tidak Hadir
            </button>
          </div>
          
          {rsvpStatus && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-xs text-neutral-500 font-medium tracking-widest uppercase"
            >
              Status: {rsvpStatus === 'attending' ? 'Hadir' : 'Tidak Hadir'}
            </motion.p>
          )}
        </motion.div>
      </motion.section>

      {/* SECTION 5: SPONSORS (Conditional) */}
      {config.showSponsors && sponsors.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="py-20 overflow-hidden relative"
        >
          <div className="w-full text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-10">Didukung Oleh</p>
            
            {sponsors.length <= 3 ? (
              <div className="flex justify-center items-center gap-12 opacity-80">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.name} className="flex flex-col items-center gap-3">
                    <img 
                      src={getAssetUrl(`sponsors/${sponsor.name}`)}
                      alt={`Sponsor ${sponsor.name}`}
                      className="h-10 md:h-12 w-auto max-w-[120px] object-contain transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="relative h-24 md:h-32 w-full max-w-3xl mx-auto flex justify-center items-center cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -30) {
                    setSponsorIndex((prev) => (prev + 1) % sponsors.length);
                  } else if (offset.x > 30) {
                    setSponsorIndex((prev) => (prev - 1 + sponsors.length) % sponsors.length);
                  }
                }}
              >
                <AnimatePresence mode="popLayout">
                  {[-1, 0, 1, 2].map((offset) => {
                    // Normalize the index to safely wrap around the array length
                    const normalizedIndex = (((sponsorIndex + offset) % sponsors.length) + sponsors.length) % sponsors.length;
                    const sponsor = sponsors[normalizedIndex];
                    // The unique key MUST incorporate the specific index in the array to handle duplicates properly
                    const uniqueKey = `${sponsor.name}-${normalizedIndex}`;
                    
                    const isMain = offset === 0 || offset === 1;
                    const spacing = typeof window !== 'undefined' && window.innerWidth < 768 ? 85 : 140;
                    const xPos = (offset - 0.5) * spacing;
                    
                    return (
                      <motion.div
                        key={uniqueKey}
                        layout
                        initial={{ opacity: 0, x: xPos + 100, scale: 0.5 }}
                        animate={{
                          x: xPos,
                          scale: isMain ? 1 : 0.75,
                          opacity: isMain ? 1 : 0.3,
                          filter: isMain ? 'grayscale(0%)' : 'grayscale(100%)',
                          zIndex: isMain ? 20 : 10,
                        }}
                        exit={{ opacity: 0, x: xPos - 100, scale: 0.5 }}
                        transition={{ duration: 1.0, ease: "easeInOut" }}
                        className="absolute flex flex-col items-center gap-3"
                      >
                        <img 
                          src={getAssetUrl(`sponsors/${sponsor.name}`)}
                          alt={`Sponsor ${sponsor.name}`}
                          className="h-10 md:h-14 w-auto max-w-[120px] object-contain"
                        />
                        {isMain && (
                          <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-[10px] uppercase tracking-widest text-neutral-400 absolute -bottom-6 md:-bottom-8 whitespace-nowrap"
                          >
                            {sponsor.name.split('---')[0]}
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.section>
      )}

      {/* FOOTER */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
        className="pt-32 pb-16 text-center flex flex-col items-center justify-center gap-6 bg-gradient-to-t from-black via-black/80 to-transparent relative z-10"
      >
        <div className="flex items-center gap-6">
          {config.instagram && (
            <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          )}
          {config.youtube && (
            <a href={config.youtube.startsWith('http') ? config.youtube : `https://youtube.com/search?q=${config.youtube}`} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          )}
          {config.tiktok && (
            <a href={`https://tiktok.com/@${config.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.33-1.95 1.61-4.66 2.12-7.14 1.56-2.53-.55-4.65-2.27-5.62-4.67-1.11-2.73-.66-6.05 1.17-8.32 1.73-2.16 4.62-3.04 7.27-2.48.16.03.32.08.48.13V14.3c-1.49-.32-3.14-.13-4.43.76-1.37.95-1.95 2.82-1.39 4.38.54 1.51 2.21 2.45 3.8 2.29 1.46-.14 2.65-1.14 3.12-2.52.27-.79.33-1.64.33-2.48V.02z"/></svg>
            </a>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-xs tracking-widest text-neutral-600 uppercase">&copy; {new Date().getFullYear()} TEATER DEKIK</p>
          <p className="text-[10px] tracking-widest text-neutral-700 uppercase">Development by Indra Wardana</p>
        </div>
      </motion.footer>
      
      </div> {/* END FOREGROUND CONTENT */}

      {/* Floating Audio Player */}
      {eventData?.is_audio_enabled !== false && (
        <FloatingAudioPlayer audioUrl={`${bucketUrl}/music.mp3?t=${audioTimestamp}`} autoPlay={wantsMusic} />
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out backdrop-blur-lg"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            />
            <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 backdrop-blur-md transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
