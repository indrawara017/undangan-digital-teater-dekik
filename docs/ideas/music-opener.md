# Fitur Music Opener (Undangan)

## Problem Statement
Bagaimana kita bisa memberikan kebebasan bagi Admin untuk mengunggah dan menyematkan soundtrack MP3/WAV khusus pada tiap pementasan, yang bisa diaktifkan secara sukarela oleh tamu melalui pemutar audio minimalis di pojok layar, tanpa membebani performa halaman utama?

## Recommended Direction
**The Floating Minimalist Player**
Kita akan membuat tombol *Floating Action Button* (berbentuk ikon piringan hitam atau not balok) di pojok kanan/kiri bawah undangan. Karena *browser* melarang audio otomatis, tombol ini berdenyut pelan (*subtle pulse animation*) untuk memancing perhatian tamu agar mengkliknya. 

Di sisi Admin (Dashboard Visual/Pementasan), kita tambahkan satu kolom *upload* audio (`.mp3` atau `.wav`) yang terhubung langsung ke *storage bucket* Supabase, lengkap dengan tombol _toggle_ (on/off) untuk menyalakan atau mematikan fitur musik pada event tersebut.

## Key Assumptions to Validate
- [ ] **Asumsi Visibilitas:** Kita berasumsi tamu akan sadar ada tombol kecil di pojok. *(Cara test: Pasang efek glow/pulse di awal, jika tamu jarang memutar, kita mungkin perlu menambahkan teks "Play Music")*.
- [ ] **Asumsi Ukuran File:** Kita berasumsi Admin akan mengunggah lagu MP3 dengan ukuran wajar (< 5MB). Jika ada yang iseng mengunggah file WAV sebesar 50MB, *loading* undangan akan jadi sangat berat dan kuota Supabase cepat habis. *(Cara test/mitigasi: Pasang batasan ukuran maksimal saat upload).*
- [ ] **Asumsi Performa Navigasi:** Kita berasumsi bahwa *audio instance* di React harus dikelola dengan baik agar tidak _error_ atau dobel lagunya saat tamu melakukan _scroll_ atau pindah tab.

## MVP Scope
**Yang Masuk dalam Pengerjaan (In-Scope):**
- Modifikasi tabel `events` di database untuk menambahkan kolom `audio_url` dan `is_audio_enabled`.
- Input *file uploader* baru di tab Pementasan pada Dashboard Admin.
- Pembuatan komponen `FloatingAudioPlayer.tsx` yang muncul melayang di `GuestClient.tsx`.
- Animasi sederhana saat musik sedang dimainkan (misal: ikon berputar).

## Not Doing (and Why)
- **Autoplay** — Karena Safari dan Chrome akan memblokirnya dan bisa membuat komponen *error*.
- **Integrasi Spotify/YouTube API** — Karena Anda sudah memilih jalur unggah MP3 fisik (lebih murni secara desain tanpa *branding* pihak ketiga).
- **Audio Equalizer/Visualizer Layar Penuh** — Terlalu berat untuk memori HP tamu dan mengganggu fokus membaca isi undangan.
- **Dukungan Video (MP4)** — Fokus hanya pada audio untuk menekan biaya bandwidth server.

## Open Questions
- Berapa batas ukuran maksimal file (Megabyte) yang boleh diunggah Admin per pementasannya agar kuota *storage* tetap hemat?
