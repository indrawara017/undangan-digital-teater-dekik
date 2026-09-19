'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Ticket, Users, Sparkles, ShoppingBag } from 'lucide-react';
import { getEventPosterUrl, getEventSlug, getMerchandiseImageUrl } from '@/lib/assets';

export interface SponsorItem {
  name: string;
  displayName: string;
  url: string;
}

interface HomeClientProps {
  events: any[];
  config: Record<string, any>;
  sponsorLogos?: string[];
  sponsors?: SponsorItem[];
  merchandise?: any[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'Segera';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(price: number) {
  if (!price || price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

// Determine if event is upcoming
function isUpcoming(dateStr: string) {
  if (!dateStr) return true;
  try {
    return new Date(dateStr).getTime() > Date.now() - 86400000; // within 1 day margin
  } catch {
    return true;
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

export function HomeClient({ events, config, sponsorLogos = [], sponsors = [], merchandise = [] }: HomeClientProps) {
  const upcomingEvents = events.filter(e => isUpcoming(e.date));
  const featuredEvent = upcomingEvents[0] || events[0];

  const sponsorList: SponsorItem[] = (sponsors && sponsors.length > 0)
    ? sponsors
    : sponsorLogos.map((url, idx) => ({
        name: `sponsor-${idx}`,
        displayName: 'Sponsor & Mitra',
        url,
      }));

  return (
    <div className="flex flex-col">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[calc(100svh-4rem)] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Ambient BG */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neutral-900/30 rounded-full blur-[200px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-950/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 sm:gap-6"
          >
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-[11px] sm:text-sm font-mono tracking-[0.22em] sm:tracking-[0.3em] text-neutral-500 uppercase"
            >
              Selamat Datang Di
            </motion.p>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-cinzel text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]"
            >
              Teater Dekik
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed px-1 sm:px-2"
            >
              Komunitas seni pertunjukan yang mendedikasikan panggung untuk bercerita, 
              menggerakkan emosi, dan membangun generasi seniman muda yang berani berkarya.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-4 w-full sm:w-auto"
            >
              <Link
                href="/events"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white text-black text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Jadwal & Tiket</span>
              </Link>
              <Link
                href="/merchandise"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-neutral-900/90 border border-neutral-700/80 hover:border-pink-500/40 text-neutral-200 hover:text-white text-xs sm:text-sm font-medium transition-all active:scale-[0.97]"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400" />
                <span>Merchandise</span>
              </Link>
              <Link
                href="/tentang"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-neutral-800 text-neutral-300 text-xs sm:text-sm font-medium hover:bg-white/[0.04] hover:border-neutral-700 transition-all"
              >
                <span>Tentang Kami</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-5 h-8 rounded-full border border-neutral-700 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-neutral-500" />
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED EVENT (SOROTAN) ===== */}
      {featuredEvent && (
        <section className="relative py-20 sm:py-28">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-10"
            >
              <p className="text-xs font-mono tracking-[0.3em] text-amber-500/70 uppercase mb-3">
                Pementasan Terdekat
              </p>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {featuredEvent.title}
              </h2>
              {featuredEvent.creator && (
                <p className="text-neutral-500 text-sm mt-2">
                  Oleh {featuredEvent.creator}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-4 sm:p-8 backdrop-blur-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 items-center">
                {/* Poster Preview */}
                <div className="relative aspect-[3/4] max-w-[200px] sm:max-w-[240px] md:max-w-none w-full mx-auto rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl group">
                  <img
                    src={getEventPosterUrl(featuredEvent.id)}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Event Details */}
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">Tanggal</p>
                          <p className="text-sm text-white font-medium">{formatDate(featuredEvent.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">Lokasi</p>
                          <p className="text-sm text-white font-medium">{featuredEvent.location || 'Akan diumumkan'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <Ticket className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">Tiket</p>
                          <p className="text-sm text-white font-medium">Tersedia Online</p>
                        </div>
                      </div>
                    </div>

                    {featuredEvent.description && (
                      <p className="text-sm text-neutral-400 mt-6 leading-relaxed line-clamp-3">
                        {featuredEvent.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <Link
                      href={`/events/${getEventSlug(featuredEvent.title)}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white text-black text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.97]"
                    >
                      <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Pesan Tiket</span>
                    </Link>
                    <Link
                      href={`/events/${getEventSlug(featuredEvent.title)}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-neutral-800 text-neutral-300 text-xs sm:text-sm font-medium hover:bg-white/[0.04] transition-all"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== TENTANG SINGKAT ===== */}
      <section className="relative py-20 sm:py-28">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-3">
                Tentang Kami
              </p>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">
                Panggung adalah <br />Rumah Kami
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                Teater Dekik lahir dari semangat kolektif untuk menjaga seni pertunjukan teater tetap hidup 
                dan relevan. Di panggung inilah kami belajar, bertumbuh, dan saling menguatkan melalui 
                cerita-cerita yang bermakna.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Setiap pementasan adalah hasil dari proses panjang — latihan yang tekun, 
                eksplorasi yang berani, dan dedikasi tanpa syarat dari seluruh anggota teater.
              </p>
              <Link
                href="/tentang"
                className="inline-flex items-center gap-2 text-sm text-white font-medium hover:text-neutral-300 transition-colors"
              >
                Kenali lebih dekat
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {[
                { icon: Users, label: 'Anggota Aktif', value: '20+' },
                { icon: Sparkles, label: 'Pementasan', value: `${events.length}+` },
                { icon: Calendar, label: 'Tahun Berdiri', value: '2015' },
                { icon: Ticket, label: 'Penonton', value: '500+' },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-3.5 sm:p-5 text-center"
                >
                  <stat.icon className="w-5 h-5 text-neutral-500 mx-auto mb-2" />
                  <p className="font-cinzel text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SPONSOR & MITRA ANIMATED SECTION ===== */}
      {sponsorList.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative py-14 sm:py-20 border-t border-b border-white/[0.04] bg-neutral-950/40 backdrop-blur-sm overflow-hidden w-full max-w-full"
        >
          <div className="w-full text-center mb-8 sm:mb-10 px-4">
            <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-2">
              Didukung Oleh
            </p>
            <h2 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Sponsor & Mitra Pementasan
            </h2>
          </div>

          <div className="relative w-full max-w-6xl mx-auto overflow-hidden px-2 sm:px-4">
            {/* Fade Gradients on left & right */}
            <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 md:w-28 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 md:w-28 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

            <div className="flex overflow-hidden py-3 w-full max-w-full">
              <motion.div
                className="flex items-center gap-10 sm:gap-16 md:gap-20 shrink-0 pr-10 sm:pr-16 md:pr-20"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: Math.max(16, sponsorList.length * 5),
                    ease: 'linear',
                  },
                }}
              >
                {[...sponsorList, ...sponsorList, ...sponsorList, ...sponsorList].map((sponsor, idx) => {
                  const displayName = sponsor.displayName || sponsor.name.split('---')[0];
                  return (
                    <div
                      key={`${sponsor.name}-${idx}`}
                      className="flex flex-col items-center gap-2.5 shrink-0 group cursor-default"
                    >
                      <div className="h-12 md:h-16 flex items-center justify-center">
                        <img
                          src={sponsor.url}
                          alt={`Sponsor ${displayName}`}
                          className="h-10 md:h-14 w-auto max-w-[140px] object-contain opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 filter group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-neutral-400 group-hover:text-neutral-200 transition-colors whitespace-nowrap">
                        {displayName}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ===== MERCHANDISE SHOWCASE SECTION ===== */}
      {merchandise && merchandise.length > 0 && (
        <section className="relative py-16 sm:py-24 border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-7 sm:mb-10">
              <div>
                <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  Merchandise Teater Dekik
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
                  Kaos pementasan resmi, totebag, dan cinderamata seni untuk mendukung karya kami.
                </p>
              </div>

              <Link
                href="/merchandise"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all hover:gap-3"
              >
                <span>Lihat Semua Katalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {merchandise.map((item) => (
                <Link
                  key={item.id}
                  href={`/merchandise/${item.slug}`}
                  className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/30 hover:bg-neutral-900/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-neutral-700/80 hover:shadow-xl"
                >
                  <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
                    <img
                      src={getMerchandiseImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-white border border-white/10 backdrop-blur-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 sm:line-clamp-1">
                        {item.name}
                      </h3>
                      {item.events?.title && (
                        <p className="text-[10px] text-amber-400/80 mt-0.5 truncate">
                          🎭 {item.events.title}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-white text-[11px] sm:text-sm">
                        {formatPrice(item.price)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-neutral-400 group-hover:text-white transition-colors">
                        <span>Pesan</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-950/10 rounded-full blur-[180px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Bergabung Bersama Kami
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Kami selalu terbuka untuk kolaborasi, pementasan bersama, 
              atau sekadar bertukar cerita tentang seni pertunjukan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full">
              <a
                href={`https://wa.me/${config.whatsapp || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-white text-black text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.97]"
              >
                Hubungi via WhatsApp
              </a>
              <Link
                href="/faq"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl border border-neutral-800 text-neutral-300 text-xs sm:text-sm font-medium hover:bg-white/[0.04] transition-all"
              >
                FAQ & Bantuan
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
