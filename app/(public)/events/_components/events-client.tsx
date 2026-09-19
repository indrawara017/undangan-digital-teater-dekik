'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Ticket } from 'lucide-react';
import { getEventPosterUrl, getEventSlug } from '@/lib/assets';
import { isPublicEventReadyToOrder, isPublicEventUpcoming, orderPublicEvents, type PublicEvent } from '@/lib/public-events';
import { Spotify, Youtube } from '@/app/components/icons/SocialIcons';

interface EventItem extends PublicEvent {
  title: string;
  creator?: string | null;
  location?: string | null;
  description?: string | null;
  spotify_url?: string | null;
  youtube_url?: string | null;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Segera';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function EventsClient({ events, referenceTime }: { events: EventItem[]; referenceTime: number }) {
  const orderedEvents = orderPublicEvents(events, referenceTime);
  const readyEvents = orderedEvents.filter((event) => isPublicEventReadyToOrder(event, referenceTime));

  return (
    <div className="min-h-screen py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-9 sm:mb-12">
          <p className="text-xs font-mono tracking-[0.3em] text-primary uppercase mb-3">Jadwal Panggung</p>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-tight">Pementasan Teater Dekik</h1>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto mt-3 leading-relaxed">
            Seluruh pementasan kami, dengan jadwal yang tiketnya tersedia ditempatkan paling awal.
          </p>
        </header>

        {readyEvents.length > 0 && (
          <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary-soft px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-primary font-medium"><Ticket className="w-4 h-4 shrink-0" />Tiket tersedia untuk {readyEvents.length} pementasan</div>
            <span className="text-xs text-primary/80 hidden sm:block">Pilih pementasan untuk memesan</span>
          </div>
        )}

        {orderedEvents.length === 0 ? (
          <div className="text-center py-20"><p className="text-neutral-500 text-sm">Belum ada pementasan yang dipublikasikan.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orderedEvents.map((event, index) => {
              const upcoming = isPublicEventUpcoming(event, referenceTime);
              const readyToOrder = isPublicEventReadyToOrder(event, referenceTime);
              const status = readyToOrder ? 'Tiket tersedia' : upcoming ? 'Segera hadir' : 'Selesai';

              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }}>
                  <Link
                    href={'/events/' + getEventSlug(event.title)}
                    className={'group block h-full bg-neutral-950/60 border rounded-2xl overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ' + (readyToOrder ? 'border-primary/50 hover:border-primary' : 'border-neutral-800/60 hover:border-neutral-700/80')}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center overflow-hidden">
                      <img src={getEventPosterUrl(event.id)} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500" onError={(error) => { error.currentTarget.style.display = 'none'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/40 to-transparent z-10" />
                      <h2 className="relative z-20 font-cinzel text-xl sm:text-2xl font-bold text-white/95 text-center px-6 drop-shadow-md group-hover:text-white transition-colors">{event.title}</h2>
                      <span className={'absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-wider font-medium backdrop-blur-sm ' + (readyToOrder ? 'bg-primary text-primary-foreground border-primary' : upcoming ? 'bg-neutral-900/90 border-neutral-700/50 text-neutral-300' : 'bg-neutral-900/90 border-neutral-700/50 text-neutral-400')}>
                        {status}
                      </span>
                    </div>

                    <div className="p-5">
                      {event.creator && <p className="text-xs text-neutral-500 mb-3">Oleh {event.creator}</p>}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-400"><Calendar className="w-3.5 h-3.5 text-neutral-500" />{formatDate(event.date)}</div>
                        {event.location && <div className="flex items-center gap-2 text-sm text-neutral-400"><MapPin className="w-3.5 h-3.5 text-neutral-500" />{event.location}</div>}
                      </div>
                      {event.description && <p className="text-xs text-neutral-500 mt-3 line-clamp-2 leading-relaxed">{event.description}</p>}
                      <div className="mt-4 flex items-center justify-between">
                        <span className={'flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all ' + (readyToOrder ? 'text-primary' : 'text-white')}>
                          {readyToOrder ? 'Pesan Tiket' : upcoming ? 'Lihat Jadwal' : 'Lihat Detail'}<ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex items-center gap-2">
                          {event.spotify_url && <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" title="Soundtrack di Spotify"><Spotify className="w-3 h-3" />OST</span>}
                          {!upcoming && event.youtube_url && <span className="flex items-center gap-1 text-xs text-red-400 font-medium"><Youtube className="w-3.5 h-3.5" />Video</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
