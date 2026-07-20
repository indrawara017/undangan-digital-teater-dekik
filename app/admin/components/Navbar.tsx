'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setTimestamp(Date.now());
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menus = [
    { href: '/admin/guests', label: 'Tamu' },
    { href: '/admin/events', label: 'Event' },
    { href: '/admin/design', label: 'Visual' },
    { href: '/admin/distribution', label: 'Kirim' },
    { href: '/admin/rsvp', label: 'RSVP' },
    { href: '/admin/config', label: 'Sistem' },
  ];

  const logoUrl = supabase.storage.from('assets').getPublicUrl('global/app-logo.png').data.publicUrl;

  const renderNavLinks = (items: typeof menus) => {
    return items.map((menu) => {
      const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
      return (
        <Link
          key={menu.href}
          href={menu.href}
          className="relative group px-2 py-1"
        >
          <span className={cn(
            "relative z-10 text-[11px] md:text-xs uppercase tracking-[0.2em] transition-all duration-300",
            isActive ? "text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-neutral-400 font-semibold group-hover:text-neutral-200"
          )}>
            {menu.label}
          </span>
          {/* Animated active dot/underline */}
          <span className={cn(
            "absolute -bottom-1.5 left-1/2 h-[2px] bg-white -translate-x-1/2 transition-all duration-300",
            isActive ? "w-full opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-0 opacity-0"
          )} />
          {/* Hover glow */}
          <span className="absolute inset-0 bg-white/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>
      );
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-6 transition-all duration-500 pointer-events-none">
      
      {/* The Floating Glass Pill */}
      <div 
        className={cn(
          "relative pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-full border transition-all duration-500 overflow-hidden",
          scrolled 
            ? "h-16 bg-black/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl" 
            : "h-20 bg-black/30 border-white/5 shadow-2xl backdrop-blur-md"
        )}
      >
        {/* Subtle inner highlight for 3D glass effect */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" style={{ mixBlendMode: 'overlay' }} />

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden ml-4 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 hover:border-white/20 transition-all duration-300 z-20 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Left Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-end gap-6 pr-8 lg:pr-12 z-20">
          {renderNavLinks(menus.slice(0, 3))}
        </nav>

        {/* Center Logo */}
        <Link 
          href="/admin" 
          className="flex shrink-0 items-center justify-center gap-2 md:gap-3 z-20 px-2 group absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0"
        >
          {!logoError && (
            <img 
              src={`${logoUrl}?t=${timestamp}`} 
              alt="Logo" 
              className={cn(
                "w-auto object-contain transition-all duration-500 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                scrolled ? "h-5 md:h-7" : "h-6 md:h-8"
              )}
              onError={() => setLogoError(true)}
            />
          )}
          <span className={cn(
            "font-cormorant tracking-widest text-white font-semibold transition-all duration-500 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] group-hover:text-neutral-200 whitespace-nowrap",
            scrolled ? "text-base md:text-xl" : "text-lg md:text-2xl"
          )}>
            TEATER DEKIK
          </span>
        </Link>

        {/* Desktop Right Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-start gap-6 pl-8 lg:pl-12 z-20">
          {renderNavLinks(menus.slice(3, 6))}
        </nav>

        {/* Logout Button */}
        <div className="flex absolute right-4 md:right-6 z-20">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 p-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-30 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-28 left-4 right-4 md:hidden pointer-events-auto animate-in slide-in-from-top-4 duration-300 z-40">
            <div className="rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
              <nav className="flex flex-col">
                {menus.map((menu) => {
                const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
                return (
                  <Link
                    key={menu.href}
                    href={menu.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-xs uppercase tracking-[0.2em] transition-all",
                      isActive 
                        ? "bg-white/15 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10" 
                        : "text-neutral-400 font-semibold hover:text-white hover:bg-white/5"
                    )}
                  >
                    {menu.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        </>
      )}
    </header>
  );
}
