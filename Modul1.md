# LEMBAR KERJA PRAKTIKUM PKPL - MODUL 1

**Nama Proyek:** Undangan Digital Teater Dekik (Modul Dasbor Admin)
**Platform:** Website

---

## 1. PENENTUAN PROYEK STUDI KASUS

Proyek perangkat lunak yang dipilih berfokus pada **Sistem Dasbor Admin Manajemen Undangan Teater Dekik**. Untuk memenuhi kebutuhan praktikum agar fokus dan terarah, fitur yang akan dikembangkan dan diuji dibatasi pada 3 fitur inti:

1. **Registrasi Admin:** Fitur untuk mendaftarkan akun administrator baru agar dapat mengakses sistem.
2. **Login Admin:** Sistem autentikasi untuk membatasi hak akses halaman dasbor hanya bagi pengguna yang valid.
3. **Manajemen Tamu (Fitur Utama):** Halaman dasbor interaktif di mana admin dapat menambah tamu baru, melihat daftar tamu, dan mengelola data tamu yang akan diundang ke pementasan.

---

## 2. DOKUMEN TEST PLAN

### IEEE TEST PLAN SEDERHANA

**TEST PLAN IDENTIFIER**
TP-TEATERINV-MOD1-001

**INTRODUCTION**
Dokumen Test Plan ini bertujuan untuk mendefinisikan strategi dan ruang lingkup pengujian secara spesifik untuk modul Dasbor Admin pada platform Undangan Digital Teater Dekik. Fokus pengujian dibatasi hanya pada tiga fungsionalitas utama: Registrasi, Login, dan Manajemen Data Tamu. Pembatasan ini dilakukan untuk memastikan pengujian yang efisien dan mendalam pada inti sistem (*core system*).

**TEST ITEMS**
Item perangkat lunak yang akan diuji meliputi:
1. Modul Otentikasi Admin (Registrasi)
2. Modul Otentikasi Admin (Login & Proteksi Rute)
3. Modul Dasbor Manajemen Tamu (Operasi Data Tamu)

**FEATURES to be TESTED**
Fungsionalitas spesifik yang akan diuji:
* **Modul Registrasi:**
  * Proses pendaftaran dengan format email dan kata sandi yang valid.
  * Proses penolakan pendaftaran jika format email salah atau kata sandi tidak memenuhi standar keamanan.
* **Modul Login:**
  * Proses login dengan kredensial yang valid.
  * Proses penolakan login jika email belum terdaftar atau *password* salah.
  * Proteksi halaman Dasbor Admin (pengguna yang belum login otomatis diarahkan kembali ke halaman login).
* **Modul Manajemen Tamu:**
  * Penambahan data tamu baru (input valid).
  * Menampilkan tabel daftar tamu secara real-time.

**FEATURES not to be TESTED**
Fungsionalitas yang secara sengaja TIDAK akan diuji pada dokumen ini:
* **Pengalaman Tamu (Guest Experience / UI Undangan):** Tampilan undangan digital untuk tamu tidak diuji karena di luar *scope* pengujian modul dasbor admin.
* **Pengujian Performa / Load Test:** Jumlah admin sangat terbatas, sehingga isu performa/beban server bukan prioritas.
* **Pengujian Keamanan Infrastruktur:** Keamanan database telah di-*handle* oleh penyedia (Supabase) secara standar, bukan merupakan fokus praktikum ini.

**APPROACH**
Pendekatan yang digunakan adalah **Black-box Testing** secara manual. Penguji akan langsung berinteraksi dengan antarmuka web (UI) untuk memastikan fitur Registrasi, Login, dan Manajemen Tamu berjalan sesuai dengan ekspektasi. Pengujian difokuskan pada validasi input pengguna dan respon fungsional sistem.

**ITEM PASS/FAIL CRITERIA**
* **LULUS (PASS):** Sistem berhasil menerima *input* valid (akun berhasil dibuat/login berhasil/tamu bertambah) dan menampilkan pesan peringatan yang tepat saat menerima *input* invalid, tanpa ada halaman yang *crash*.
* **GAGAL (FAIL):** Fitur gagal memproses *input* yang benar, fungsi navigasi/proteksi rute rusak, atau data tamu tidak berhasil disimpan/ditampilkan dari *database*.

**TEST DELIVERABLES**
1. Dokumen Test Plan ini (TP-TEATERINV-MOD1-001)
2. Dokumen Skenario Uji (*Test Cases*) khusus Registrasi, Login, dan Manajemen Tamu.
3. Dokumen Laporan Bug (*Bug Report*).

**ENVIRONMENTAL NEEDS**
* **Hardware:** PC/Laptop untuk membuka Dasbor Admin.
* **Software:** Web Browser (Google Chrome/Mozilla Firefox).
* **Data:** *Dummy email* untuk percobaan registrasi dan login, serta *dummy data* nama-nama tamu teater.
* **Koneksi:** Akses internet yang stabil untuk berkomunikasi dengan database.

**SCHEDULE**
* 26 Juli 2026 - 28 Juli 2026: Pembuatan Skenario Uji (*Test Cases*).
* 29 Juli 2026 - 31 Juli 2026: Pelaksanaan *Black-box Testing*.
* 1 Agustus 2026: Penyusunan Laporan Bug & Pengujian.

---

## 3. REFERENSI PENJELASAN DEMO KEPADA ASISTEN (CATATAN TAMBAHAN)

**1. Alasan Pembatasan Fokus Hanya pada 3 Fitur:**
Ruang lingkup dipersempit hanya pada fungsi Dasbor Admin (Registrasi, Login, Manajemen Tamu) agar pengujian lebih fokus, spesifik, dan sesuai dengan syarat minimum praktikum (3 fitur jelas). Menguji tampilan UI tamu undangan diabaikan karena akan melebar pada pengujian *styling* dan animasi yang tidak relevan dengan esensi fungsionalitas *backend/database* yang sedang dipelajari.

**2. Mengapa Load Testing dan Security Tidak Diuji?**
Aplikasi menggunakan basis data **Supabase** (layanan BaaS). Untuk skala *user* admin yang hanya beberapa orang, infrastruktur bawaan Supabase sudah sangat aman (didukung *Row Level Security*) dan stabil. Menguji infrastruktur server melampaui kebutuhan praktikum rekayasa perangkat lunak tingkat aplikasi ini.

**3. Pemahaman Codebase Singkat:**
* **Frontend/Framework:** Menggunakan **Next.js** dan **Tailwind CSS**. 
* **Database & Auth:** Otentikasi dan *database* tamu menggunakan **Supabase**.
* **Logika Fitur:** Proses login/registrasi dikelola dalam komponen `Login.tsx`, sedangkan operasi penambahan/pembacaan data tamu menggunakan SDK Supabase di dalam halaman dasbor (Rute: `/admin`).
