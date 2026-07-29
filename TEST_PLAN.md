# Test Plan Document
## Teater Invitation (Undangan Digital Teater Dekik)

**Version:** 1.0 - Modul 1 Praktikum Focus
**Description:** Test Plan khusus modul 1 praktikum yang berfokus hanya pada Register, Login, dan Manajemen Tamu.

---

### IEEE TEST PLAN SEDERHANA

**TEST PLAN IDENTIFIER**
TP-TEATERINV-MOD1-001

**INTRODUCTION**
Dokumen Test Plan ini bertujuan untuk mendefinisikan strategi dan ruang lingkup pengujian secara spesifik untuk modul Dasbor Admin pada platform Undangan Digital Teater Dekik. Fokus pengujian dibatasi hanya pada tiga fungsionalitas utama: Registrasi, Login, dan Manajemen Data Tamu. Pembatasan ini dilakukan untuk memastikan pengujian yang efisien, fokus, dan terarah sesuai kebutuhan Praktikum Modul 1.

**TEST ITEMS**
Item perangkat lunak yang akan diuji meliputi:
1. Modul Otentikasi Admin (Registrasi)
2. Modul Otentikasi Admin (Login & Proteksi Rute)
3. Modul Dasbor Manajemen Tamu (Operasi Data Tamu)

**FEATURES to be TESTED**
Fungsionalitas spesifik yang akan diuji:
* **Modul Registrasi:**
  * Proses pendaftaran akun admin baru dengan email dan kata sandi valid.
  * Validasi input dan pesan error saat format email salah atau kata sandi tidak memenuhi kriteria.
* **Modul Login:**
  * Proses login admin dengan kredensial valid.
  * Penolakan login saat email tidak terdaftar atau kata sandi salah.
  * Proteksi halaman Dasbor Admin (pengguna yang belum login otomatis diarahkan ke halaman login).
* **Modul Manajemen Tamu:**
  * Penambahan data tamu baru (input data valid).
  * Menampilkan daftar data tamu yang terdaftar di dasbor secara real-time.

**FEATURES not to be TESTED**
Fungsionalitas yang secara sengaja TIDAK akan diuji pada dokumen ini:
* **Pengalaman Tamu (Guest Experience / UI Undangan):** Tampilan halaman undangan untuk tamu publik di luar ruang lingkup pengujian dasbor admin modul 1.
* **Pengujian Performa / Load Test:** Tidak diuji karena skala pengguna admin sangat terbatas.
* **Pengujian Keamanan Infrastruktur:** Keamanan database telah ditangani oleh standar layanan Supabase.

**APPROACH**
Pendekatan yang digunakan adalah **Black-box Testing** secara manual. Penguji akan langsung berinteraksi dengan antarmuka web (UI) untuk memastikan fitur Registrasi, Login, dan Manajemen Tamu berjalan sesuai dengan ekspektasi tanpa crash.

**ITEM PASS/FAIL CRITERIA**
* **LULUS (PASS):** Sistem berhasil menerima *input* valid (akun berhasil dibuat, login berhasil, dan data tamu bertambah/tertampil) serta menampilkan respon error yang tepat saat *input* invalid.
* **GAGAL (FAIL):** Fitur gagal memproses *input* yang benar, fungsi proteksi rute rusak, atau data tamu tidak berhasil disimpan/ditampilkan dari *database*.

**TEST DELIVERABLES**
1. Dokumen Test Plan ini (TP-TEATERINV-MOD1-001)
2. Dokumen Skenario Uji (*Test Cases*) khusus Registrasi, Login, dan Manajemen Tamu.
3. Dokumen Laporan Bug (*Bug Report*).

**ENVIRONMENTAL NEEDS**
* **Hardware:** PC/Laptop untuk mengakses Dasbor Admin.
* **Software:** Web Browser modern (Google Chrome, Firefox, Edge).
* **Data:** Email *dummy* untuk skenario registrasi/login dan data *dummy* nama tamu teater.
* **Koneksi:** Akses internet yang stabil untuk berkomunikasi dengan basis data Supabase.

**SCHEDULE**
* 26 Juli 2026 - 28 Juli 2026: Pembuatan Skenario Uji (*Test Cases*).
* 29 Juli 2026 - 31 Juli 2026: Pelaksanaan *Black-box Testing*.
* 1 Agustus 2026: Penyusunan Laporan Bug & Pengujian.

