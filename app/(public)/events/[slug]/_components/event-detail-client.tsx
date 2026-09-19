'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Ticket, Users, ExternalLink, ArrowLeft, 
  ArrowRight, Play, Sparkles, Search, X, ZoomIn, ShoppingBag 
} from 'lucide-react';
import { Youtube, Spotify } from '@/app/components/icons/SocialIcons';
import { getEventSlug, getSpotifyEmbedUrl, getMerchandiseImageUrl } from '@/lib/assets';

export interface SponsorItem {
  name: string;
  displayName: string;
  url: string;
}

export interface CastMemberItem {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
}

interface EventDetailClientProps {
  event: any;
  tiers: any[];
  cast?: CastMemberItem[];
  members?: any[];
  posterUrl: string | null;
  sponsors?: SponsorItem[];
  merchandise?: any[];
  config?: any;
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

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch {
    return '';
  }
}

function formatPrice(price: number) {
  if (!price || price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function isUpcoming(dateStr: string) {
  if (!dateStr) return true;
  try {
    return new Date(dateStr).getTime() > Date.now() - 86400000;
  } catch {
    return true;
  }
}

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export function EventDetailClient({ 
  event, 
  tiers, 
  cast, 
  members, 
  posterUrl, 
  sponsors = [],
  merchandise = [],
  config,
}: EventDetailClientProps) {
  const [imgError, setImgError] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [castSearch, setCastSearch] = useState('');

  const upcoming = isUpcoming(event.date);
  const embedUrl = getYouTubeEmbedUrl(event.youtube_url);
  const spotifyEmbed = getSpotifyEmbedUrl(event.spotify_url);
  const hasTiers = tiers.length > 0;

  // Unifikasi data cast / aktor & tim pementasan
  const castList: CastMemberItem[] = (cast && cast.length > 0)
    ? cast
    : (members || []).map((m: any) => ({
        id: m.id || m.name,
        name: m.name,
        role: m.position || m.role || 'Pemeran',
        photoUrl: m.photo_url || m.photoUrl || '',
      }));

  const filteredCast = castList.filter((m) =>
    m.name.toLowerCase().includes(castSearch.toLowerCase()) ||
    (m.role && m.role.toLowerCase().includes(castSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-6 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pementasan
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Left: Poster */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[3/4] max-w-xs sm:max-w-sm mx-auto lg:max-w-none rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/60 shadow-xl"
            >
              {posterUrl && !imgError ? (
                <Image
                  src={posterUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950">
                  <div className="text-center px-6">
                    <p className="font-cinzel text-2xl font-bold text-white/80 mb-2">
                      {event.title}
                    </p>
                    <p className="text-xs text-neutral-500">Poster segera hadir</p>
                  </div>
                </div>
              )}
              {!upcoming && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-neutral-400 text-xs uppercase tracking-wider font-medium">
                  Selesai
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-6"
          >
            {/* Title */}
            <div>
              <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {event.title}
              </h1>
              {event.creator && (
                <p className="text-neutral-500 text-xs sm:text-sm mt-1.5">Oleh {event.creator}</p>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500">Tanggal</p>
                  <p className="text-sm text-white font-medium">{formatDate(event.date)}</p>
                </div>
              </div>
              {formatTime(event.date) && (
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                  <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Waktu</p>
                    <p className="text-sm text-white font-medium">{formatTime(event.date)}</p>
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5">
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Lokasi</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-white font-medium">{event.location}</p>
                      {event.gmaps_url && (
                        <a
                          href={event.gmaps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-500 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Synopsis */}
            {event.description && (
              <div>
                <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-3">
                  Sinopsis
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Ticket Tiers */}
            {hasTiers && upcoming && (
              <div>
                <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-3">
                  Tiket Tersedia
                </h2>
                <div className="flex flex-col gap-3">
                  {tiers.map((tier) => {
                    const soldOut = tier.available_quota <= 0;
                    return (
                      <div
                        key={tier.id}
                        className={`flex items-center justify-between gap-4 bg-white/[0.03] border rounded-xl px-4 py-4 transition-all ${
                          soldOut ? 'border-neutral-800/40 opacity-60' : 'border-white/[0.06]'
                        }`}
                      >
                        <div>
                          <p className="text-sm text-white font-medium">{tier.name}</p>
                          {tier.description && (
                            <p className="text-xs text-neutral-500 mt-0.5">{tier.description}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">
                            Sisa: {tier.available_quota} / {tier.quota}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-semibold text-white">{formatPrice(tier.price)}</p>
                          {soldOut && (
                            <p className="text-[10px] text-red-400 uppercase tracking-wider mt-1">Habis</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkout CTA */}
                <Link
                  href={`/events/${getEventSlug(event.title)}/checkout`}
                  className="mt-4 flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.98]"
                >
                  <Ticket className="w-4 h-4" />
                  Pesan Tiket Sekarang
                </Link>
              </div>
            )}

            {!hasTiers && upcoming && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-6 text-center">
                <Ticket className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">Penjualan tiket belum dibuka.</p>
                <p className="text-xs text-neutral-500 mt-1">Nantikan pengumuman selanjutnya.</p>
              </div>
            )}

            {/* Teaser link for upcoming events if available */}
            {upcoming && event.youtube_url && (
              <a
                href={event.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors self-start"
              >
                <Youtube className="w-4 h-4" />
                <span>Tonton Teaser / Trailer di YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </motion.div>
        </div>

        {/* Cast, Actors & Crew Section */}
        {castList.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mt-16 sm:mt-20 pt-12 border-t border-neutral-900"
          >
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Pemeran & Tim Pementasan
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                Para aktor, pemeran panggung, sutradara, dan tim artistik yang menghidupkan kisah dalam pementasan {event.title}.
              </p>

              {castList.length > 6 && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsCastModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-all group"
                  >
                    <Search className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                    <span>Cari & Lihat Semua ({castList.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cast Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {castList.slice(0, 12).map((member, idx) => (
                <div
                  key={`${member.id}-${idx}`}
                  onClick={() => member.photoUrl && setZoomedImage(member.photoUrl)}
                    className="group relative bg-gradient-to-b from-neutral-900/60 to-neutral-950/90 border border-neutral-800/80 hover:border-primary/50 rounded-2xl p-2.5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
                >
                  {/* Photo Container - 3/4 Portrait */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-neutral-900 mb-2.5">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-600">
                        <Users className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-sm font-semibold">{member.name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />

                    {member.photoUrl && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Name and Role */}
                  <div className="text-center min-w-0 w-full">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {member.name}
                    </p>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-primary-soft border border-primary/30 text-primary text-[10px] font-medium tracking-wide uppercase truncate max-w-full">
                        {member.role || 'Pemeran'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* If more than 12 cast members, view all CTA */}
            {castList.length > 12 && (
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsCastModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold tracking-wider uppercase transition-all"
                >
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>Lihat {castList.length - 12} Seniman Lainnya</span>
                </button>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mt-16 sm:mt-20 pt-12 border-t border-neutral-900"
          >
            <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] max-w-xl mx-auto">
              <Users className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
              <h3 className="font-cinzel text-base font-semibold text-white">Jajaran Pemeran & Aktor</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Daftar pemeran panggung, aktor, dan tim artistik untuk pementasan ini akan segera diumumkan.
              </p>
            </div>
          </motion.section>
        )}

        {/* Embedded YouTube Video Section */}
        {embedUrl && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mt-16 sm:mt-20 pt-12 border-t border-neutral-900"
          >
            <div className="text-center mb-8">
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Saksikan Rekaman Pementasan
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto mt-2">
                Tonton rekaman penampilan penuh pementasan {event.title} langsung di bawah ini.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-950 shadow-2xl">
                <iframe
                  src={embedUrl}
                  title={`Penampilan ${event.title}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between mt-4 px-2">
                <p className="text-xs text-neutral-500">
                  Dokumentasi resmi oleh Teater Dekik
                </p>
                <a
                  href={event.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka di YouTube
                </a>
              </div>
            </div>
          </motion.section>
        )}

        {/* Spotify Soundtrack & Album Section */}
        {spotifyEmbed && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mt-16 sm:mt-20 pt-12 border-t border-neutral-900"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
                <Spotify className="w-3.5 h-3.5" />
                <span>Original Soundtrack & Theme</span>
              </div>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Album Pementasan
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto mt-2">
                Dengarkan musik tema dan soundtrack orisinal pementasan {event.title} langsung di Spotify.
              </p>
            </div>

            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950/80 shadow-2xl p-1.5 backdrop-blur-sm">
                <iframe
                  src={spotifyEmbed}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl w-full"
                />
              </div>

              <div className="flex items-center justify-between px-2">
                <p className="text-xs text-neutral-500">
                  Diproduksi resmi untuk pementasan Teater Dekik
                </p>
                <a
                  href={event.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <Spotify className="w-3.5 h-3.5" />
                  Buka di Spotify
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.section>
        )}

        {/* Official Merchandise Section */}
        {merchandise && merchandise.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mt-16 sm:mt-20 pt-12 border-t border-neutral-900"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-mono tracking-[0.3em] text-primary uppercase mb-1">
                  Official Merchandise
                </p>
                <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Cinderamata Resmi Pementasan
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-lg">
                  Koleksi kaos, suvenir, dan naskah resmi edisi khusus pementasan {event.title}.
                </p>
              </div>

              <Link
                href="/merchandise"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <span>Lihat Semua Koleksi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchandise.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 overflow-hidden group hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-square bg-neutral-950 overflow-hidden">
                    <img
                      src={getMerchandiseImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm border border-white/10">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed font-light">
                          {item.description}
                        </p>
                      )}
                      {item.variants && item.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {item.variants.map((v: string) => (
                            <span key={v} className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-500">Harga</div>
                        <div className="text-sm font-bold text-white font-mono">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <Link
                        href="/merchandise"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer shadow-md"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Pesan</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Sponsors & Partners Section - Animated Marquee like Undangan Slug */}
        {sponsors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mt-12 sm:mt-20 pt-10 sm:pt-12 border-t border-neutral-900 overflow-hidden relative w-full max-w-full"
          >
            <div className="w-full text-center mb-6 sm:mb-8">
              <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-1">
                Didukung Oleh
              </p>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sponsor & Mitra Pementasan
              </h2>
            </div>

            <div className="relative w-full max-w-5xl mx-auto overflow-hidden px-2 sm:px-4">
              {/* Fade Gradients on left & right */}
              <div className="absolute top-0 bottom-0 left-0 w-8 md:w-28 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-8 md:w-28 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

              <div className="flex overflow-hidden py-3 w-full max-w-full">
                <motion.div
                  className="flex items-center gap-12 md:gap-20 shrink-0 pr-12 md:pr-20"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: Math.max(16, sponsors.length * 5),
                      ease: 'linear',
                    },
                  }}
                >
                  {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((sponsor, idx) => {
                    const displayName = sponsor.displayName || sponsor.name.split('---')[0];
                    return (
                      <div key={`${sponsor.name}-${idx}`} className="flex flex-col items-center gap-2.5 shrink-0 group">
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

        {/* Modal: Full Cast & Actors Directory */}
        <AnimatePresence>
          {isCastModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="relative w-full max-w-3xl max-h-[90dvh] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 shrink-0">
                  <div>
                    <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                      Jajaran Pemeran & Tim Kreatif
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Total {castList.length} seniman & kru pementasan {event.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCastModalOpen(false)}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="p-3 sm:p-4 border-b border-neutral-800/60 bg-neutral-900/30 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Cari nama aktor, aktris, atau peran (contoh: Sutradara, Pemeran Utama)..."
                      value={castSearch}
                      onChange={(e) => setCastSearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary/70"
                      autoFocus
                    />
                    {castSearch && (
                      <button
                        type="button"
                        onClick={() => setCastSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid of All Cast */}
                <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                  {filteredCast.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs sm:text-sm">
                      Tidak ditemukan seniman dengan kata kunci &quot;{castSearch}&quot;.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredCast.map((member, idx) => (
                        <div
                          key={`modal-${member.id}-${idx}`}
                          onClick={() => member.photoUrl && setZoomedImage(member.photoUrl)}
                          className="bg-neutral-900/60 border border-neutral-800 hover:border-primary/50 rounded-xl p-2 cursor-pointer transition-all hover:bg-neutral-900 flex flex-col justify-between"
                        >
                          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-neutral-950 mb-2">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-600 text-base font-semibold">
                                {member.name?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <p className="text-xs font-semibold text-white truncate">
                              {member.name}
                            </p>
                            <p className="text-[10px] text-primary uppercase tracking-wider truncate mt-0.5">
                              {member.role || 'Pemeran'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox / Zoomed Image Modal */}
        <AnimatePresence>
          {zoomedImage && (
            <div
              onClick={() => setZoomedImage(null)}
              className="fixed inset-0 z-[120] bg-black/90 p-4 backdrop-blur-md flex items-center justify-center cursor-zoom-out animate-in fade-in duration-150"
            >
              <div 
                className="relative max-w-2xl max-h-[88vh] flex items-center justify-center" 
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={zoomedImage}
                  alt="Zoomed preview"
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-neutral-800"
                />
                <button
                  type="button"
                  onClick={() => setZoomedImage(null)}
                  className="absolute -top-3 -right-3 p-2 rounded-full bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 shadow-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
