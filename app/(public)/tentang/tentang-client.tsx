'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Sparkles } from 'lucide-react';

import type { TimelineEventItem } from '@/lib/config';

interface TentangClientProps {
  members: any[];
  timelineEvents?: TimelineEventItem[];
}

const fallbackTimelineEvents: TimelineEventItem[] = [
  {
    year: '2019',
    title: 'Awal Mula & Titik Temu',
    desc: 'Pertemuan sekelompok pegiat seni muda di ruang sederhana yang menyatukan tekad untuk mendirikan wadah teater independen yang jujur, kritis, dan berakar pada nilai kemanusiaan.',
    tag: 'Kelahiran Komunitas'
  },
  {
    year: '2021',
    title: 'Pementasan Perdana',
    desc: 'Menggelar lakon perdana di panggung alternatif. Mengasah kemampuan keaktoran, penyutradaraan, dan penataan panggung sebagai karya orisinal pertama Teater Dekik.',
    tag: 'Pentas Pertama'
  },
  {
    year: '2023',
    title: 'Regenerasi & Kolaborasi',
    desc: 'Membuka kesempatan bagi anggota baru, memperkuat departemen musik & artistik, serta menjalin kolaborasi dengan pegiat seni dan musisi panggung lokal.',
    tag: 'Ekspansi Kreatif'
  },
  {
    year: '2025',
    title: 'Panggung Terbuka & Publikasi Karya',
    desc: 'Menyelenggarakan pementasan teater berskala besar dengan panggung terbuka, serta mendokumentasikan rekaman pertunjukan untuk publik.',
    tag: 'Pentas Terbuka'
  },
  {
    year: '2026',
    title: 'Era Digital & E-Tiket Terpadu',
    desc: 'Meluncurkan portal resmi Teater Dekik, sistem ticketing online terintegrasi, dan undangan digital eksklusif untuk para penonton setia.',
    tag: 'Transformasi Digital'
  },
];

export function TentangClient({ members, timelineEvents }: TentangClientProps) {
  const activeTimeline = timelineEvents && timelineEvents.length > 0 ? timelineEvents : fallbackTimelineEvents;
  return (
    <div className="min-h-screen py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-3">
            Tentang Kami
          </p>
          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Teater Dekik
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            Sebuah komunitas seni pertunjukan yang bergerak, belajar, dan tumbuh bersama di atas panggung.
          </p>
        </div>

        {/* History Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 sm:mb-20"
        >
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-6">
            Sejarah Singkat
          </h2>
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 sm:p-8">
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              Teater Dekik berdiri sebagai wadah bagi mereka yang percaya bahwa seni pertunjukan 
              bukan sekadar hiburan, melainkan medium untuk menyuarakan pikiran, merasakan empati, 
              dan membangun kesadaran kolektif.
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              Dari panggung kecil hingga pentas terbuka, kami terus berproses bersama — 
              mengasah kemampuan berakting, menyutradarai, menata artistik, dan membangun 
              narasi yang bermakna bagi penonton.
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Setiap anggota yang bergabung membawa warna dan perspektif unik yang memperkaya 
              karya-karya kami. Teater Dekik adalah rumah bagi siapa pun yang ingin belajar 
              dan berkarya lewat seni panggung.
            </p>
          </div>
        </motion.section>

        {/* Timeline Linimasa Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-20 sm:mb-24 overflow-hidden sm:overflow-visible"
        >
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-2">
              Linimasa Perjalanan
            </p>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Jejak Langkah Teater Dekik
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Perjalanan berkesenian kami dari ruang latihan sederhana hingga panggung pertunjukan hari ini.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Poros Utama Garis Vertikal Tengah (Desktop) & Sisi Kiri (Mobile) */}
            <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-px bg-neutral-800 md:-translate-x-1/2" />

            <div className="flex flex-col gap-8 md:gap-12">
              {activeTimeline.map((item, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <motion.div
                    key={item.id || `${item.year}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="relative flex items-center md:justify-between group"
                  >
                    {/* Node Titik Poros Tengah (Desktop) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border-2 border-neutral-600 group-hover:border-primary group-hover:bg-primary-soft group-hover:scale-125 transition-all duration-300 ring-4 ring-neutral-950 shadow-[0_0_12px_rgba(251,191,36,0.25)]" />
                    </div>

                    {/* Node Titik Poros Kiri (Mobile) */}
                    <div className="md:hidden absolute left-4 top-8 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-neutral-900 border-2 border-primary ring-4 ring-neutral-950 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                    </div>

                    {/* Garis Horizontal Pendek (Mobile) */}
                    <div className="md:hidden absolute left-4 top-8 w-6 h-px bg-neutral-700 -translate-y-1/2" />

                    {/* SISI KIRI (Left Column on Desktop) */}
                    {isLeft ? (
                      <div className="w-full md:w-1/2 pl-10 md:pl-0 md:pr-10">
                        <div className="relative">
                          {/* Garis Horizontal Pendek Penghubung Node ke Kotak (Desktop Sisi Kiri) */}
                          <div className="hidden md:block absolute -right-10 top-1/2 w-10 h-px bg-neutral-700 -translate-y-1/2 group-hover:bg-primary/50 transition-colors" />

                          <div className="bg-gradient-to-b from-neutral-900/60 to-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700/80 group-hover:border-primary/50 rounded-2xl p-5 sm:p-6 shadow-lg shadow-black/40 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5">
                            {/* Label Tahun dengan Huruf Tebal & Tag */}
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                              <span className="font-cinzel text-xl sm:text-2xl font-bold text-primary tracking-tight">
                                {item.year}
                              </span>
                              {item.tag && (
                                <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-neutral-400 uppercase px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                                  {item.tag}
                                </span>
                              )}
                            </div>

                            {/* Judul Peristiwa */}
                            <h3 className="text-sm sm:text-base font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>

                            {/* Deskripsi Singkat */}
                            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="hidden md:block md:w-1/2" />
                    )}

                    {/* SISI KANAN (Right Column on Desktop) */}
                    {!isLeft ? (
                      <div className="w-full md:w-1/2 pl-10 md:pl-10">
                        <div className="relative">
                          {/* Garis Horizontal Pendek Penghubung Node ke Kotak (Desktop Sisi Kanan) */}
                          <div className="hidden md:block absolute -left-10 top-1/2 w-10 h-px bg-neutral-700 -translate-y-1/2 group-hover:bg-primary/50 transition-colors" />

                          <div className="bg-gradient-to-b from-neutral-900/60 to-neutral-950/80 border border-neutral-800/80 hover:border-neutral-700/80 group-hover:border-primary/50 rounded-2xl p-5 sm:p-6 shadow-lg shadow-black/40 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5">
                            {/* Label Tahun dengan Huruf Tebal & Tag */}
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                              <span className="font-cinzel text-xl sm:text-2xl font-bold text-primary tracking-tight">
                                {item.year}
                              </span>
                              {item.tag && (
                                <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-neutral-400 uppercase px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                                  {item.tag}
                                </span>
                              )}
                            </div>

                            {/* Judul Peristiwa */}
                            <h3 className="text-sm sm:text-base font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>

                            {/* Deskripsi Singkat */}
                            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="hidden md:block md:w-1/2" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Visi & Misi */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-6">
            Visi & Misi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                title: 'Visi',
                desc: 'Menjadi komunitas teater yang inspiratif, inklusif, dan konsisten menghasilkan karya berkualitas.',
              },
              {
                icon: Heart,
                title: 'Misi',
                desc: 'Menumbuhkan kecintaan terhadap seni pertunjukan dan memberi ruang bagi setiap individu untuk berekspresi.',
              },
              {
                icon: Sparkles,
                title: 'Nilai',
                desc: 'Kolaborasi, keberanian, dedikasi, dan semangat untuk terus belajar dan berkarya tanpa henti.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-6"
              >
                <item.icon className="w-5 h-5 text-neutral-500 mb-3" />
                <h3 className="text-sm text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Members */}
        {members.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">
                Anggota & Pengurus
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Users className="w-3.5 h-3.5" />
                {members.length} anggota
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {members.map((member: any) => (
                <motion.div
                  key={member.id}
                  whileHover={{ y: -4 }}
                  className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-4 text-center transition-colors hover:border-neutral-700/80"
                >
                  <div className="w-16 h-16 rounded-full bg-neutral-800 mx-auto mb-3 overflow-hidden ring-1 ring-white/[0.06]">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xl font-semibold">
                        {member.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white font-medium truncate">{member.name}</p>
                  {member.position && (
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">{member.position}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
