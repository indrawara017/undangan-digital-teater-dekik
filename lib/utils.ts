import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Memformat nomor WhatsApp ke standar internasional kode negara 62.
 * Menghapus spasi, strip, dan memformat awalan 0 atau +62 menjadi 62.
 */
export function formatWhatsApp(phone: string): string {
  let cleaned = phone.trim().replace(/[^0-9+]/g, ''); // hanya angka dan +
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = '62' + cleaned.substring(3);
  }
  return cleaned;
}

/**
 * Membuat slug URL yang bersih dan ramah SEO dari nama tamu/undangan.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Ganti karakter non-alfanumerik dengan strip
    .replace(/(^-|-$)+/g, '');   // Hapus strip di awal dan akhir
}

