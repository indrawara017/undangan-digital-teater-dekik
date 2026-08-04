# 🎭 Undangan Digital Teater Dekik

Aplikasi web modern (berbasis Next.js) untuk manajemen, kustomisasi visual, dan penyebaran undangan digital khusus pementasan teater. Sistem ini mengombinasikan tampilan undangan (klien) yang interaktif nan premium dengan dasbor administrasi (admin) yang sangat komprehensif. Terintegrasi penuh dengan **Supabase** untuk basis data (PostgreSQL) dan penyimpanan aset (Storage).

![Undangan Digital Teater Dekik Preview](public/preview.png)

## Main Feature

### Guest
- **Animasi Interaktif:** Tampilan awal buka amplop otomatis yang elegan (dibangun menggunakan Framer Motion).
- **Audio Autoplay & Toggle:** Fitur pemutar lagu pengiring yang dapat dihidupkan/dimatikan kapan saja.
- **Daftar Pementasan Dinamis:** Tampilan slide/korsel (carousel) untuk daftar pertunjukan.
- **Sponsor interaktif:** Logo-logo sponsor dapat digeser (swipe) jika lebih dari batas layar.
- **e-Tiket & QR Code:** Tamu yang melakukan RSVP akan mendapatkan QR code secara otomatis.
- **Integrasi Maps:** Peta lokasi disematkan langsung (Google Maps Embed).

### Admin Panel
- **Manajemen Pementasan (Events):** Atur judul, waktu, lokasi peta, hingga kolom khusus nama Penulis/Sutradara/Kreator pementasan.
- **Manajemen Tamu (Guests):** Tambah, edit, dan hapus data tamu (kategori: Alumni & Teater). Fitur "Cari" yang responsif.
- **Distribusi (Broadcast):** Buat tautan (*link*) khusus untuk tiap tamu dan langsung bagikan melalui pesan auto-generate ke **WhatsApp**. 
- **Kustomisasi Visual & Aset:** 
  - Unggah aset visual untuk setiap pementasan: Poster, *Background*, *Tiket*, Logo-logo *Header*, dan Logo Sponsor.
  - Tambahkan/edit nama sponsor yang langsung terhubung dengan logonya.
  - Atur file audio (lagu pengiring) `mp3/wav` secara spesifik.
- **Manajemen Kehadiran (RSVP):** Pantau status konfirmasi tamu (Hadir, Tidak Hadir, Belum Merespon) secara instan.
- **Mobile First & UX Friendly:** Dasbor sangat adaptif saat dibuka dari perangkat seluler. Kotak opsi (Custom Select) serta tata letak tabel telah disesuaikan agar tidak tumpang tindih (*overlap*).

## Framework
- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), React, TypeScript.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/).
- **Animasi:** [Framer Motion](https://www.framer.com/motion/).
- **Ikon:** [Lucide React](https://lucide.dev/).
- **Backend/BaaS:** [Supabase](https://supabase.com/) (PostgreSQL & Storage).

---

## Directory
Berikut adalah gambaran singkat struktur folder pada repositori ini:

- `app/[slug]/` — Halaman klien utama (Front-end untuk para tamu).
- `app/admin/` — Seluruh halaman Dasbor Admin (Events, Guests, RSVP, Design, Distribution).
- `app/components/` — Komponen UI yang dapat digunakan kembali (*reusable*).
- `lib/` — Berisi konfigurasi dan inisialisasi koneksi klien Supabase.
- `public/` — Tempat penyimpanan gambar atau aset publik lokal (seperti `preview.png`).

---

## Developer
Pengembangan (*Development*) oleh **Indra Wardana**.