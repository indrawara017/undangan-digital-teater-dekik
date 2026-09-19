'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingAudioPlayer } from '@/app/components/FloatingAudioPlayer';

import {
  TeaterSubtleTypingLoader,
  HeroSection,
  SynopsisSection,
  TicketSection,
  CastSection,
  LocationSection,
  RsvpSection,
  FooterSection
} from './';

export default function GuestClient({ 
  guest, 
  invitation, 
  event: eventData, 
  bucketUrl,
  isPreview = false
}: { 
  guest: any, 
  invitation: any, 
  event: any, 
  bucketUrl: string,
  isPreview?: boolean
}) {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [logos, setLogos] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ showSponsors: true, instagram: '', youtube: '', tiktok: '' });
  const [loading, setLoading] = useState(true);
  const [ticketError, setTicketError] = useState(false);
  const [audioTimestamp] = useState(Date.now());
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [wantsMusic, setWantsMusic] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const [rsvpStatus, setRsvpStatus] = useState(invitation?.rsvp_status || null);
  const [isChangingRsvp, setIsChangingRsvp] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const isCheckedIn = !!invitation?.checked_in;
  const [cast, setCast] = useState<any[]>([]);
  const [assignedCast, setAssignedCast] = useState<any[]>([]);

  const getAssetUrl = (fileName: string) => {
    return `${bucketUrl}/${fileName}`;
  };

  const handleRSVP = async (status: 'attending' | 'declined') => {
    if (isPreview) return; // Disable RSVP in preview mode
    
    setIsUpdating(true);
    const { error } = await supabase
      .from('invitations')
      .update({ rsvp_status: status })
      .eq('id', invitation.id);
    
    if (!error) {
      setRsvpStatus(status);
      setIsChangingRsvp(false);
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

      const { data: castData } = await supabase.storage.from('assets').list(`${eventId}/cast`);
      if (castData) {
        setCast(castData.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.emptyFolder'));
      }

      try {
        const { data: eventCastData } = await supabase.storage.from('assets').download(`${eventId}/event_cast.json`);
        if (eventCastData) {
          const castList: any[] = JSON.parse(await eventCastData.text());
          setAssignedCast(castList);
        }
      } catch (e) {}

      const { data: configData } = await supabase.storage.from('assets').download('global/config.json');
      if (configData) {
        try {
          const text = await configData.text();
          setConfig(JSON.parse(text));
        } catch(e) {}
      }
      
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
          img.onerror = resolve; 
        }))
      );

      setTimeout(() => setLoading(false), 3350);
    };
    fetchAdditionalData();
  }, [eventData.id, bucketUrl]);

  if (!eventData && !loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <p className="font-cormorant text-2xl text-red-500 tracking-widest">PEMENTASAN TIDAK DITEMUKAN</p>
      </div>
    );
  }

  const bgUrl = getAssetUrl('background.jpg');
  const ticketUrl = getAssetUrl('ticket.jpg');

  // Welcome / Cover Screen with smooth AnimatePresence transition from Loader
  if (loading || !isCoverOpened) {
    return (
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-50"
          >
            <TeaterSubtleTypingLoader />
          </motion.div>
        ) : (
          <motion.div 
            key="cover"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white overflow-hidden p-6"
          >
            {isPreview && (
              <div className="fixed top-6 left-6 z-[60] bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-full">
                Mode Preview
              </div>
            )}
            
            <div className="absolute inset-0 z-0">
              <img 
                src={bgUrl} 
                alt="Theater Event Background" 
                className="w-full h-full object-cover opacity-65 scale-105 transition-all duration-1000"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0.25';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/75" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full my-auto py-10 space-y-10 sm:space-y-12">
              {logos.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.1, duration: 0.8 }}
                  className="flex flex-wrap items-center justify-center gap-4 mb-2"
                >
                  {logos.map((logo) => (
                    <img 
                      key={logo.name}
                      src={getAssetUrl(`logos/${logo.name}`)}
                      alt="Logo"
                      className="h-10 sm:h-14 w-auto max-w-[150px] object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                    />
                  ))}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3 sm:space-y-4"
              >
                <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-neutral-400 font-light">
                  Selamat Datang di
                </p>
                <h2 className="font-cormorant text-2xl sm:text-3xl font-medium text-neutral-200 tracking-widest uppercase">
                  Undangan Digital
                </h2>
                <h1 className="font-cormorant text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-100 tracking-wide drop-shadow-md">
                  Teater Dekik
                </h1>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.8 }}
                className="flex flex-col w-full sm:w-auto gap-3 pt-2"
              >
                <button 
                  onClick={() => {
                    setWantsMusic(eventData?.is_audio_enabled !== false);
                    setIsCoverOpened(true);
                  }}
                  className="px-9 py-4 bg-white text-black text-xs uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2.5 active:scale-95"
                >
                  {eventData?.is_audio_enabled !== false ? (
                    <>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      Buka & Putar Musik
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Buka Undangan
                    </>
                  )}
                </button>
                {eventData?.is_audio_enabled !== false && (
                  <button 
                    onClick={() => {
                      setWantsMusic(false);
                      setIsCoverOpened(true);
                    }}
                    className="px-9 py-3.5 bg-transparent border border-white/25 text-white/90 text-xs uppercase tracking-[0.2em] font-medium rounded-full hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                    Buka Tanpa Musik
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen selection:bg-neutral-800 relative">
      
      {wantsMusic && (
        <FloatingAudioPlayer 
          audioUrl={getAssetUrl('music.mp3?t=' + audioTimestamp)} 
          autoPlay={true} 
        />
      )}

      {isPreview && (
        <div className="fixed top-6 left-6 z-[60] bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-full">
          Mode Preview
        </div>
      )}

      <div className="relative z-10">
        
        <HeroSection 
          bgUrl={bgUrl}
          logos={logos}
          getAssetUrl={getAssetUrl}
          eventData={eventData}
          guest={guest}
          formatIndonesianDate={formatIndonesianDate}
        />

        {config.showSynopsis !== false && (
          <SynopsisSection 
            eventData={eventData} 
            getAssetUrl={getAssetUrl} 
            setZoomedImage={setZoomedImage} 
          />
        )}

        {config.showTicketPamflet !== false && (
          <TicketSection 
            ticketUrl={ticketUrl}
            setZoomedImage={setZoomedImage}
            ticketError={ticketError}
            setTicketError={setTicketError}
          />
        )}

        {config.showCast !== false && (
          <CastSection 
            assignedCast={assignedCast} 
            cast={cast} 
            getAssetUrl={getAssetUrl} 
            setZoomedImage={setZoomedImage} 
          />
        )}

        {config.showLocationMap !== false && (
          <LocationSection 
            eventData={eventData} 
            formatIndonesianDate={formatIndonesianDate} 
          />
        )}

        {config.showRSVP !== false && (
          <RsvpSection 
            isPreview={isPreview}
            rsvpStatus={rsvpStatus}
            isChangingRsvp={isChangingRsvp}
            setIsChangingRsvp={setIsChangingRsvp}
            isCheckedIn={isCheckedIn}
            guest={guest}
            eventData={eventData}
            invitation={invitation}
            handleRSVP={handleRSVP}
            isUpdating={isUpdating}
          />
        )}

        <FooterSection 
          sponsors={sponsors} 
          config={config} 
          getAssetUrl={getAssetUrl} 
        />

      </div>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 p-2 md:p-6 cursor-zoom-out backdrop-blur-lg overflow-auto flex items-center justify-center"
            style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                src={zoomedImage}
                alt="Zoomed"
                drag
                dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                dragElastic={0.5}
                className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl cursor-grab active:cursor-grabbing"
              />
            </motion.div>

            <button
              onClick={() => setZoomedImage(null)}
              className="fixed top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 backdrop-blur-md transition-colors z-[101]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
