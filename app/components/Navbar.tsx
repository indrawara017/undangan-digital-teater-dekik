'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menus = [
    { href: '/admin/guests', label: 'Tamu' },
    { href: '/admin/events', label: 'Panggung' },
    { href: '/admin/design', label: 'Visual' },
    { href: '/admin/distribution', label: 'Kirim' },
    { href: '/admin/rsvp', label: 'RSVP' },
    { href: '/admin/anggota', label: 'Anggota' },
    { href: '/admin/system', label: 'Sistem' },
  ];

  const renderNavLinks = (items: typeof menus) => {
    return items.map((menu) => {
      const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
      return (
        <Link
          key={menu.href}
          href={menu.href}
          className={cn(
            "relative group px-2.5 lg:px-3 py-1.5 rounded-full transition-all duration-300",
            isActive 
              ? "bg-white/10 text-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.06)]" 
              : "text-neutral-400 font-semibold hover:text-white hover:bg-white/5"
          )}
        >
          <span className={cn(
            "relative z-10 text-[10px] lg:text-[11px] xl:text-xs uppercase tracking-[0.14em] transition-colors duration-300 whitespace-nowrap",
            isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-neutral-400 group-hover:text-neutral-200"
          )}>
            {menu.label}
          </span>
          {/* Animated active indicator */}
          <span className={cn(
            "absolute -bottom-1 left-1/2 h-[2px] bg-white -translate-x-1/2 transition-all duration-300 rounded-full",
            isActive ? "w-1/2 opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-0 opacity-0"
          )} />
        </Link>
      );
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5 md:pt-6 transition-all duration-500 pointer-events-none">
      
      {/* The Floating Glass Pill */}
      <div 
        className={cn(
          "relative pointer-events-auto flex items-center justify-between md:justify-start w-full md:w-auto max-w-lg md:max-w-none rounded-full border transition-all duration-500 px-4 md:px-5 gap-3 md:gap-4 lg:gap-5",
          scrolled 
            ? "h-16 bg-black/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl" 
            : "h-20 bg-black/30 border-white/5 shadow-2xl backdrop-blur-md"
        )}
      >
        {/* Subtle inner highlight for 3D glass effect */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" style={{ mixBlendMode: 'overlay' }} />

        {/* Logo & Title */}
        <Link 
          href="/admin" 
          className="flex shrink-0 items-center gap-2.5 md:gap-3 group z-20"
        >
          <div className="relative flex items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10 shrink-0">
            <Image 
              src="/logo.png" 
              alt="Teater Dekik Logo" 
              width={40}
              height={40}
              className={cn(
                "object-cover rounded-full transition-all duration-500 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.4)]",
                scrolled ? "w-8 h-8 md:w-9 md:h-9" : "w-9 h-9 md:w-10 md:h-10"
              )}
              priority
            />
          </div>
          <span className={cn(
            "font-cormorant tracking-widest text-white font-semibold transition-all duration-500 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] group-hover:text-neutral-200 whitespace-nowrap",
            scrolled ? "text-base md:text-lg" : "text-lg md:text-xl"
          )}>
            TEATER DEKIK
          </span>
        </Link>

        {/* Divider between Brand and Navigation Menu */}
        <div className="hidden md:block h-4 w-px bg-white/15 shrink-0 z-20" />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 z-20">
          {renderNavLinks(menus)}
        </nav>

        {/* Divider between Navigation Menu and Logout */}
        <div className="hidden md:block h-4 w-px bg-white/15 shrink-0 z-20" />

        {/* Right Actions: Mobile Menu Toggle & Logout Button */}
        <div className="flex items-center gap-2 z-20 shrink-0">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 hover:border-white/20 transition-all duration-300 shrink-0"
            aria-label="Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logout Button */}
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
                          ? "bg-white/15 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
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

