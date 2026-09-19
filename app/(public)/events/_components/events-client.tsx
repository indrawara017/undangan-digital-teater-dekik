'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Ticket, Archive, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { getEventPosterUrl, getEventSlug } from '@/lib/assets';
import { Youtube, Spotify } from '@/app/components/icons/SocialIcons';

interface EventsClientProps {
  events: any[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'Segera';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function isUpcoming(dateStr: string) {
  if (!dateStr) return true;
  try {
    return new Date(dateStr).getTime() > Date.now() - 86400000;
  } catch {
    return true;
  }
}

export function EventsClient({ events }: EventsClientProps) {
  const [tab, setTab] = useState<'upcoming' | 'archive'>('upcoming');

  const upcoming = events.filter(e => isUpcoming(e.date));
  const archive = events.filter(e => !isUpcoming(e.date));
  const displayed = tab === 'upcoming' ? upcoming : archive;

  return (
    <div className="min-h-screen py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-3">
            Jadwal Panggung
          </p>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Pementasan Teater Dekik
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10 w-full">
          <button
            onClick={() => setTab('upcoming')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === 'upcoming'
                ? 'bg-white text-black'
                : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Mendatang ({upcoming.length})
          </button>
          <button
            onClick={() => setTab('archive')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === 'archive'
                ? 'bg-white text-black'
                : 'bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Archive className="w-4 h-4" />
            Arsip ({archive.length})
          </button>
        </div>

        {/* Events Grid */}
        {displayed.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-sm">
              {tab === 'upcoming' 
                ? 'Belum ada pementasan yang dijadwalkan. Nantikan pengumuman selanjutnya!'
                : 'Belum ada arsip pementasan.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayed.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Link
                  href={`/events/${getEventSlug(event.title)}`}
                  className="group block bg-neutral-950/60 border border-neutral-800/60 rounded-2xl overflow-hidden hover:border-neutral-700/80 transition-all"
                >
                  {/* Poster Image with Gradient Overlay */}
                  <div className="relative h-48 bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={getEventPosterUrl(event.id)}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/40 to-transparent z-10" />
                    <h3 className="relative z-20 font-cinzel text-xl sm:text-2xl font-bold text-white/95 text-center px-6 drop-shadow-md group-hover:text-white transition-colors">
                      {event.title}
                    </h3>
                    {!isUpcoming(event.date) && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                        <div className="px-2.5 py-1 rounded-lg bg-neutral-900/90 border border-neutral-700/50 text-neutral-400 text-[10px] uppercase tracking-wider font-medium backdrop-blur-sm">
                          Selesai
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {event.creator && (
                      <p className="text-xs text-neutral-500 mb-3">
                        Oleh {event.creator}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        {formatDate(event.date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-neutral-500 mt-3 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-white font-medium group-hover:gap-2.5 transition-all">
                        {isUpcoming(event.date) ? 'Lihat & Pesan Tiket' : 'Lihat Detail'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {event.spotify_url && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" title="Soundtrack di Spotify">
                            <Spotify className="w-3 h-3" /> OST
                          </span>
                        )}
                        {!isUpcoming(event.date) && event.youtube_url && (
                          <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                            <Youtube className="w-3.5 h-3.5" /> Video
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
