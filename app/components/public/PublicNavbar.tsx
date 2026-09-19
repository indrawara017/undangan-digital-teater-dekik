'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Ticket } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/events', label: 'Pementasan' },
  { href: '/merchandise', label: 'Merchandise' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/faq', label: 'FAQ' },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-9 h-9 overflow-hidden rounded-full ring-1 ring-white/10 group-hover:ring-white/20 transition-all shrink-0">
                <Image
                  src="/logo.png"
                  alt="Teater Dekik"
                  width={36}
                  height={36}
                  className="object-cover rounded-full"
                />
              </div>
              <span className="text-white font-semibold tracking-wide text-sm truncate max-w-[140px] sm:max-w-none">
                Teater Dekik
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || 
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/[0.08]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/events"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-neutral-200 transition-all active:scale-[0.97]"
              >
                <Ticket className="w-3.5 h-3.5" />
                Beli Tiket
              </Link>
              <Link
                href="/login"
                className="hidden md:block text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors px-3 py-2"
              >
                Admin
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
                aria-label="Menu navigasi"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-black/95 backdrop-blur-2xl border-b border-white/[0.08] md:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain shadow-2xl"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/[0.08]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="border-t border-white/[0.06] mt-2 pt-3 flex flex-col gap-1">
                <Link
                  href="/events"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black text-sm font-semibold active:scale-[0.97] transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  Beli Tiket
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm text-neutral-500 hover:text-neutral-300 transition-colors text-center"
                >
                  Akses Admin
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
