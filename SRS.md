# Spesifikasi Kebutuhan Sistem (SRS) - Teater Invitation

## 1. Pendahuluan
Platform Teater Invitation dirancang khusus untuk mendukung kebutuhan pementasan Teater Dekik. Platform ini mengutamakan estetika premium, minimalisme, dan personalisasi mendalam untuk pengalaman tamu undangan.

## 2. Fitur Utama

### 2.1 Pengalaman Tamu (Guest Experience)
- **Akses Dinamis**: Menggunakan tautan/link unik untuk setiap tamu.
- **Tampilan Premium & Animasi**: Layar *loading* dan transisi mewah menggunakan **Framer Motion**.
- **Personalisasi Dinamis**: Menampilkan nama tamu secara personal dan dinamis dalam desain.

### 2.2 Manajemen Admin (Admin Dashboard)
- **Manajemen Aset**: Mengelola identitas visual dan aset desain platform.
- **Preview Simulasi**: Fitur pratinjau (*preview*) untuk melihat hasil tampilan sebelum diterbitkan.
- **Role-Based Access Control (RBAC)**: Pemisahan hak akses secara ketat antara **Super Admin**, **Editor**, dan **Guest**.
- **AI Asisten**: Fitur bantuan kecerdasan buatan untuk menyusun draf pesan undangan yang puitis dan bermakna.

## 3. Spesifikasi Teknis

- **Framework Frontend**: Next.js (App Router) untuk performa unggul melalui Server-Side Rendering (SSR).
- **Styling**: Tailwind CSS untuk memastikan antarmuka (UI) minimalis, cepat, dan responsif.
- **Animasi**: Framer Motion untuk transisi dan *micro-interactions*.
- **Backend & Database**: Supabase
  - Manajemen data relasional
  - Storage untuk aset/media
  - Autentikasi Pengguna
- **Keamanan**: Implementasi Row Level Security (RLS) di Supabase untuk memproteksi data berdasarkan peran (RBAC).

## 4. Peta Jalan Implementasi (Roadmap)
1. **Fase 1: Setup Lingkungan** (Inisialisasi Next.js, Tailwind, Framer Motion, Supabase SDK).
2. **Fase 2: Infrastruktur Database** (Setup Supabase, Autentikasi, Skema Tabel, RLS).
3. **Fase 3: Pengembangan Fitur Inti** (UI Tamu, Transisi, Link Unik).
4. **Fase 4: Manajemen Admin** (Dashboard, CMS, Integrasi AI Asisten).
5. **Fase 5: Pengujian & Rilis** (Pengujian performa, simulasi peran, deployment).
