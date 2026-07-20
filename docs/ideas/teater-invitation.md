# Teater Dekik: Alumni Invitation

## Problem Statement
Bagaimana kita bisa menciptakan pengalaman undangan digital yang tanpa friksi, bernuansa nostalgia, dan premium untuk alumni Teater Dekik, sekaligus meminimalkan beban kerja admin?

## Recommended Direction
**The "Magic Link" Minimalist Experience.**
Kita membuang CMS yang berat dan fokus pada *front-end* yang ultra-premium. 
Alumni menerima URL unik via WhatsApp (contoh: `invit.app/dekik/budi-santoso`). Saat diklik, mereka disambut layar hitam minimalis. Transisi halus dari Framer Motion menampilkan pesan puitis yang menyapa nama mereka secara personal. Tidak perlu *login*. Hanya ada satu tombol elegan: "Saya Akan Hadir".

Untuk admin, kita hanya membuat **satu halaman *dashboard* sederhana** (dilindungi satu *password*). Halaman ini hanya berisi tabel daftar alumni, status RSVP mereka, dan tombol "Copy Link" untuk disebar.

## Key Assumptions to Validate
- [ ] **Data Bersih:** Kita berasumsi Anda memiliki daftar nama dan kontak alumni yang valid.
- [ ] **Friksi Link:** Kita berasumsi alumni mau mengklik tautan eksternal yang dikirim via WhatsApp tanpa mengiranya sebagai *spam/phishing*.

## MVP Scope
- **In:** *Dynamic Routing* Next.js untuk halaman personal tamu.
- **In:** Animasi Framer Motion (fokus pada tipografi dan *fade-in* yang mewah).
- **In:** Database Supabase sederhana (Tabel `guests`: id, name, slug, rsvp_status, ai_message).
- **In:** Supabase Storage (Bucket) untuk menyimpan aset visual.
- **In:** 1 Halaman Admin *Dashboard* untuk melihat RSVP, copy link, dan mengunggah/mengganti 5 aset gambar (logo, background, desain, tiket, sponsor).
- **Out:** Role-Based Access Control (Super Admin, Editor) yang kompleks.
- **Out:** In-app AI generator yang kompleks (AI teks di-generate terpisah).
- **Out:** Sistem tiket (+1/pasangan), undangan ini eksklusif hanya untuk 1 orang (alumni itu sendiri).

## Not Doing (and Why)
- **Sistem Login Multi-Role:** Berlebihan. Karena adminnya adalah tim internal (siswa SMA), satu akun admin bersama sudah cukup untuk masuk ke dashboard.
- **Sistem Tiket QR Code:** Cukup dengan daftar buku tamu fisik yang dicocokkan dengan data RSVP.

## Open Questions
- (Resolved) Undangan ini eksklusif hanya untuk 1 orang.
