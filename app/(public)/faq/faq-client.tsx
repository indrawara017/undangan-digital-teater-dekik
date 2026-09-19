'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, ChevronDown } from 'lucide-react';
import { Instagram } from '@/app/components/icons/SocialIcons';
import type { GlobalConfig } from '@/lib/config';

const faqData = [
  {
    category: 'Tiket & Pembelian',
    items: [
      {
        q: 'Bagaimana cara membeli tiket?',
        a: 'Kunjungi halaman Pementasan, pilih event, lalu klik "Pesan Tiket Sekarang". Isi data diri dan jumlah tiket yang diinginkan, lalu lakukan pembayaran via transfer bank.',
      },
      {
        q: 'Berapa lama batas waktu pembayaran?',
        a: 'Anda memiliki waktu 24 jam setelah pemesanan untuk menyelesaikan pembayaran. Jika melewati batas waktu, pesanan akan otomatis kedaluwarsa dan kuota tiket dikembalikan.',
      },
      {
        q: 'Bagaimana cara mengunggah bukti pembayaran?',
        a: 'Setelah transfer, buka halaman status pesanan Anda (tautan diberikan setelah checkout). Klik tombol "Unggah Bukti Pembayaran" dan pilih foto/screenshot bukti transfer.',
      },
      {
        q: 'Kapan tiket saya dikirim?',
        a: 'E-Tiket berupa QR code akan langsung tersedia di halaman status pesanan setelah admin memverifikasi pembayaran Anda (maksimal 1×24 jam kerja).',
      },
      {
        q: 'Apakah tiket bisa direfund?',
        a: 'Tiket yang sudah dibayar dan dikonfirmasi tidak dapat direfund. Namun, tiket dapat dialihkan ke orang lain dengan menghubungi admin terlebih dahulu.',
      },
    ],
  },
  {
    category: 'Pementasan',
    items: [
      {
        q: 'Apa yang harus saya bawa saat datang?',
        a: 'Cukup bawa smartphone dengan E-Tiket QR code yang bisa diakses dari halaman pesanan Anda. Tim kami akan melakukan scan QR saat Anda masuk venue.',
      },
      {
        q: 'Apakah boleh membawa kamera?',
        a: 'Pengambilan foto dan video selama pementasan berlangsung TIDAK diperbolehkan untuk menjaga kenyamanan penonton dan penampil. Dokumentasi resmi akan diunggah di galeri kami.',
      },
      {
        q: 'Apakah ada batasan usia penonton?',
        a: 'Setiap pementasan mungkin memiliki batasan usia yang berbeda. Informasi ini akan dicantumkan di halaman detail event masing-masing.',
      },
    ],
  },
  {
    id: 'syarat',
    category: 'Syarat & Ketentuan',
    items: [
      {
        q: 'Apa saja syarat masuk venue?',
        a: 'Penonton wajib menunjukkan E-Tiket QR code yang valid, datang tepat waktu (gerbang ditutup setelah pementasan dimulai), dan mematuhi aturan venue yang berlaku.',
      },
      {
        q: 'Apakah tiket bisa digunakan lebih dari sekali?',
        a: 'Tidak. Satu tiket hanya berlaku untuk satu kali masuk (single entry). Setelah QR di-scan, tiket tidak bisa digunakan kembali.',
      },
    ],
  },
];

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.04] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-4 w-full py-4 text-left cursor-pointer"
      >
        <span className="text-sm text-white font-medium">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-neutral-400 leading-relaxed pb-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FAQClientProps {
  config?: GlobalConfig;
}

export function FAQClient({ config }: FAQClientProps) {
  const waNum = config?.whatsapp || '6281234567890';
  const igHandle = (config?.instagram || 'teaterdekik').replace(/^@/, '');
  const emailAddr = config?.email || 'teaterdekik@gmail.com';

  return (
    <div className="min-h-screen py-8 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-3">
            Bantuan
          </p>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Pertanyaan Umum
          </h1>
        </div>

        {/* FAQ Sections */}
        <div className="flex flex-col gap-8">
          {faqData.map((section, sIdx) => (
            <section key={sIdx} id={section.id || undefined}>
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest mb-3">
                {section.category}
              </h2>
              <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl px-5 sm:px-6">
                {section.items.map((item, idx) => (
                  <AccordionItem key={idx} question={item.q} answer={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <section id="kontak" className="mt-16">
          <div className="text-center mb-8">
            <h2 className="font-cinzel text-2xl font-bold text-white tracking-tight">
              Hubungi Kami
            </h2>
            <p className="text-neutral-500 text-sm mt-2">
              Punya pertanyaan lain? Jangan ragu untuk menghubungi kami.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href={`https://wa.me/${waNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 hover:border-neutral-700/80 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-white font-medium">WhatsApp</span>
              <span className="text-xs text-neutral-500">+{waNum}</span>
            </a>
            <a
              href={`https://instagram.com/${igHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 hover:border-neutral-700/80 transition-all"
            >
              <Instagram className="w-5 h-5 text-primary" />
              <span className="text-sm text-white font-medium">Instagram</span>
              <span className="text-xs text-neutral-500">@{igHandle}</span>
            </a>
            <a
              href={`mailto:${emailAddr}`}
              className="flex flex-col items-center gap-2 bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 hover:border-neutral-700/80 transition-all"
            >
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-white font-medium">Email</span>
              <span className="text-xs text-neutral-500">{emailAddr}</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
