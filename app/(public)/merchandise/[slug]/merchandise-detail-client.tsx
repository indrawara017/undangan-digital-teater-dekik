'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ExternalLink, MessageCircle, Minus, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { getMerchandiseImageUrl } from '@/lib/assets';
import { formatMerchandisePrice, getMerchandiseImages } from '@/lib/merchandise';
import type { GlobalConfig } from '@/lib/config';
import { getProductEventTitle, type MerchandiseProduct } from '../merchandise-client';

export function MerchandiseDetailClient({ product, config }: { product: MerchandiseProduct; config: GlobalConfig }) {
  const images = getMerchandiseImages(product.image_urls, product.image_url);
  const [selectedImage, setSelectedImage] = useState(0);
  const [variant, setVariant] = useState(product.variants?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const eventTitle = getProductEventTitle(product.events);
  const phone = (config.whatsapp || '6281234567890').replace(/\D/g, '').replace(/^0/, '62');
  const message = [
    'Halo Panitia Teater Dekik, saya ingin memesan Official Merchandise:',
    '',
    '• *' + product.name + '*',
    '• Kategori: ' + product.category,
    eventTitle ? '• Terkait: Pementasan "' + eventTitle + '"' : '',
    variant ? '• Varian / Ukuran: *' + variant + '*' : '',
    '• Jumlah: *' + quantity + ' pcs*',
    '• Total Estimasi: *' + formatMerchandisePrice(product.price * quantity) + '*',
    '',
    'Nama Pemesan: ',
    'Alamat Pengiriman (Kota/Kec): ',
    '',
    'Mohon konfirmasi ketersediaan stok & nomor rekening untuk pembayarannya. Terima kasih!',
  ].filter(Boolean).join('\n');
  const orderUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-14 sm:pb-16">
      <Link href="/merchandise" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 hover:text-white mb-5 sm:mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded">
        <ChevronLeft className="w-4 h-4" />
        Kembali ke katalog
      </Link>

      <div className="grid lg:grid-cols-[minmax(0,540px)_minmax(340px,420px)] justify-center gap-7 sm:gap-8 lg:gap-10">
        <section aria-label="Galeri produk" className="w-full max-w-md sm:max-w-lg lg:max-w-[540px] mx-auto lg:mx-0">
          <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <img src={getMerchandiseImageUrl(images[selectedImage])} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-1" aria-label="Pilih foto produk">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={'Tampilkan foto ' + (index + 1)}
                  aria-current={selectedImage === index}
                  className={'w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ' + (selectedImage === index ? 'border-amber-400' : 'border-transparent opacity-70 hover:opacity-100')}
                >
                  <img src={getMerchandiseImageUrl(image)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-neutral-300">{product.category}</span>
            {eventTitle && <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400">🎭 {eventTitle}</span>}
            {product.is_featured && <span className="inline-flex items-center gap-1 text-amber-400"><Sparkles className="w-3.5 h-3.5 fill-amber-400" />Unggulan</span>}
          </div>

          <h1 className="font-cinzel text-xl sm:text-2xl xl:text-3xl font-bold text-white leading-tight mt-3">{product.name}</h1>
          <p className="text-base sm:text-lg xl:text-xl font-bold text-white font-mono mt-2">{formatMerchandisePrice(product.price)}</p>

          {product.description && <p className="whitespace-pre-line text-[13px] sm:text-sm text-neutral-300 leading-relaxed border-y border-neutral-800 py-4 sm:py-5 my-4 sm:my-5">{product.description}</p>}

          {product.variants && product.variants.length > 0 && (
            <div className="mb-4 sm:mb-5">
              <p className="text-sm font-medium text-neutral-200 mb-3">Pilih ukuran / varian</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setVariant(item)}
                    aria-pressed={variant === item}
                    className={'min-w-11 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ' + (variant === item ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-y border-neutral-800 py-4 sm:py-5">
            <div><p className="text-sm font-medium text-white">Jumlah pesanan</p><p className="text-xs text-neutral-500 mt-1">Stok tersedia: {product.stock} pcs</p></div>
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-1">
              <button type="button" aria-label="Kurangi jumlah" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} className="w-9 h-9 grid place-items-center rounded-lg hover:bg-neutral-800 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><Minus className="w-4 h-4" /></button>
              <span className="w-7 text-center text-sm font-bold font-mono">{quantity}</span>
              <button type="button" aria-label="Tambah jumlah" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} disabled={quantity >= product.stock} className="w-9 h-9 grid place-items-center rounded-lg hover:bg-neutral-800 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="mt-4 sm:mt-5">
            {product.stock <= 0 ? <p className="w-full py-3 sm:py-3.5 rounded-xl bg-neutral-800 text-neutral-500 text-sm font-bold text-center">Stok habis</p> : <a href={orderUrl} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-2 w-full py-3 sm:py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"><MessageCircle className="w-5 h-5" />Pesan via WhatsApp<ExternalLink className="w-4 h-4" /></a>}
            <p className="mt-3 text-[11px] text-neutral-500 text-center flex justify-center items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />Terhubung langsung ke panitia resmi Teater Dekik.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
