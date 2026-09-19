import { supabase } from '@/lib/supabase';

export interface GlobalConfig {
  // Social Media
  instagram: string;
  youtube: string;
  tiktok: string;

  // Contact & Helpdesk
  whatsapp: string;
  email: string;

  // Bank & Payment Information
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;

  // Invitation Module Visibility Toggles
  showSynopsis?: boolean;
  showTicketPamflet?: boolean;
  showCast?: boolean;
  showLocationMap?: boolean;
  showRSVP?: boolean;
  showSponsors?: boolean;
}

export interface TimelineEventItem {
  id?: string;
  year: string;
  title: string;
  desc: string;
  tag: string;
  eventId?: string;
}

export const DEFAULT_CONFIG: GlobalConfig = {
  instagram: 'teaterdekik',
  youtube: 'https://youtube.com/@teaterdekik',
  tiktok: 'teaterdekik',
  whatsapp: '6281234567890',
  email: 'teaterdekik@gmail.com',
  bankName: 'Bank BRI',
  bankAccountNumber: '1234 5678 9012 3456',
  bankAccountHolder: 'Teater Dekik',
  showSynopsis: true,
  showTicketPamflet: true,
  showCast: true,
  showLocationMap: true,
  showRSVP: true,
  showSponsors: true,
};

export const DEFAULT_TIMELINE: TimelineEventItem[] = [
  {
    year: '2019',
    title: 'Awal Mula & Titik Temu',
    desc: 'Pertemuan sekelompok pegiat seni muda di ruang sederhana yang menyatukan tekad untuk mendirikan wadah teater independen yang jujur, kritis, dan berakar pada nilai kemanusiaan.',
    tag: 'Kelahiran Komunitas',
  },
  {
    year: '2021',
    title: 'Pementasan Perdana',
    desc: 'Menggelar lakon perdana di panggung alternatif. Mengasah kemampuan keaktoran, penyutradaraan, dan penataan panggung sebagai karya orisinal pertama Teater Dekik.',
    tag: 'Pentas Pertama',
  },
  {
    year: '2023',
    title: 'Regenerasi & Kolaborasi',
    desc: 'Membuka kesempatan bagi anggota baru, memperkuat departemen musik & artistik, serta menjalin kolaborasi dengan pegiat seni dan musisi panggung lokal.',
    tag: 'Ekspansi Kreatif',
  },
  {
    year: '2025',
    title: 'Panggung Terbuka & Publikasi Karya',
    desc: 'Menyelenggarakan pementasan teater berskala besar dengan panggung terbuka, serta mendokumentasikan rekaman pertunjukan untuk publik.',
    tag: 'Pentas Terbuka',
  },
  {
    year: '2026',
    title: 'Era Digital & E-Tiket Terpadu',
    desc: 'Meluncurkan Teater Dekik, sistem ticketing online terintegrasi, dan undangan digital eksklusif untuk para penonton setia.',
    tag: 'Transformasi Digital',
  },
];

/**
 * Mengambil konfigurasi global dari Supabase Storage (global/config.json).
 * Memberikan fallback yang aman jika file belum dibuat atau gagal dimuat.
 */
export async function getGlobalConfig(): Promise<GlobalConfig> {
  try {
    const { data, error } = await supabase.storage.from('assets').download('global/config.json');
    if (error || !data) return DEFAULT_CONFIG;
    const text = await data.text();
    const parsed = JSON.parse(text);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Mengambil entri linimasa / sejarah dari Supabase Storage (global/history.json).
 * Jika kosong atau belum ada, secara otomatis menyusun linimasa dari tabel public.events.
 */
export async function getGlobalHistory(): Promise<TimelineEventItem[]> {
  try {
    const { data, error } = await supabase.storage.from('assets').download('global/history.json');
    if (!error && data) {
      const parsed = JSON.parse(await data.text());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Fallback otomatis: Tarik dari tabel events
  try {
    const { data: events } = await supabase
      .from('events')
      .select('id, title, creator, date, description')
      .order('date', { ascending: true });

    if (events && events.length > 0) {
      return events.map((ev) => {
        let year = '2026';
        if (ev.date) {
          const d = new Date(ev.date);
          if (!isNaN(d.getFullYear())) year = d.getFullYear().toString();
        }
        return {
          id: ev.id,
          year,
          title: ev.title,
          desc: ev.description || `Pementasan karya ${ev.creator || 'Teater Dekik'}.`,
          tag: ev.creator ? `Karya: ${ev.creator}` : 'Pementasan',
          eventId: ev.id,
        };
      });
    }
  } catch {}

  return DEFAULT_TIMELINE;
}
