'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { getMerchandiseImageUrl } from '@/lib/assets';
import { getMerchandiseImages } from '@/lib/merchandise';
import type { GlobalConfig } from '@/lib/config';

export interface MerchandiseProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  image_url: string | null;
  image_urls?: string[] | null;
  variants: string[] | null;
  event_id: string | null;
  is_featured: boolean;
  events?: { id?: string; title?: string } | Array<{ id?: string; title?: string }> | null;
}

export function getProductEventTitle(eventsData: MerchandiseProduct['events']): string | null {
  return Array.isArray(eventsData) ? eventsData[0]?.title || null : eventsData?.title || null;
}

const CATEGORIES = ['Semua', 'Kaos & Pakaian', 'Totebag & Tas', 'Buku & Naskah', 'Aksesoris & Pin', 'Paket Bundling'];
const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function MerchandiseClient({ products, events }: { products: MerchandiseProduct[]; events: Array<{ id: string; title: string }>; config: GlobalConfig }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedEventId, setSelectedEventId] = useState('all');
  const filteredProducts = products.filter((product) =>
    (selectedCategory === 'Semua' || product.category === selectedCategory) &&
    (selectedEventId === 'all' || (selectedEventId === 'general' ? !product.event_id : product.event_id === selectedEventId)),
  );

  return <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 pb-20">
    <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"><p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Koleksi resmi</p><h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">Merchandise Teater Dekik</h1><p className="text-neutral-400 text-sm sm:text-base mt-4 leading-relaxed">Koleksi cinderamata, kaos pementasan, dan buku naskah yang dibuat untuk menemani karya kami.</p></header>
    <section aria-label="Filter merchandise" className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-md"><div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1.5 md:pb-0">{CATEGORIES.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === category ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>{category}</button>)}</div><label className="flex items-center gap-2 w-full md:w-auto justify-end text-xs text-neutral-500"><span className="hidden sm:inline">Pementasan:</span><select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)} className="px-3 py-1.5 bg-black/60 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 w-full md:w-56"><option value="all">Semua Koleksi</option><option value="general">Koleksi Umum Dekik</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label></section>
    {filteredProducts.length === 0 ? <div className="py-20 text-center border border-neutral-800 bg-neutral-900/20 rounded-3xl"><ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto mb-3" /><p className="text-sm text-neutral-400">Belum ada merchandise pada pilihan ini.</p><button type="button" onClick={() => { setSelectedCategory('Semua'); setSelectedEventId('all'); }} className="text-xs text-amber-400 hover:underline mt-3">Lihat semua koleksi</button></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredProducts.map((product, index) => { const image = getMerchandiseImages(product.image_urls, product.image_url)[0]; return <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.04 }}><Link href={`/merchandise/${product.slug}`} className="group h-full rounded-2xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 overflow-hidden flex flex-col transition-all hover:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><div className="relative aspect-square bg-neutral-950 overflow-hidden"><img src={getMerchandiseImageUrl(image)} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute top-3 left-3 right-3 flex justify-between">{product.is_featured ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black"><Sparkles className="w-3 h-3 fill-black" />UNGGULAN</span> : <span />}{product.stock <= 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">HABIS</span>}</div></div><div className="p-4 sm:p-5 flex-1 flex flex-col justify-between"><div><div className="flex justify-between gap-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider"><span className="text-neutral-400">{product.category}</span>{getProductEventTitle(product.events) && <span className="text-amber-400 truncate">🎭 {getProductEventTitle(product.events)}</span>}</div><h2 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 line-clamp-1">{product.name}</h2>{product.description && <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>}</div><div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between"><span className="text-sm font-bold text-white font-mono">{formatRupiah(product.price)}</span><span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-amber-400">Lihat detail <ChevronRight className="w-3.5 h-3.5" /></span></div></div></Link></motion.div>; })}</div>}
  </div>;
}
