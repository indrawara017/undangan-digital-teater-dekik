# Refinement Skema Validasi Form Kelola Tamu

## Problem Statement
Bagaimana kita bisa memastikan data input tamu (Nama, WhatsApp, Kategori) tervalidasi secara presisi sebelum diproses, sehingga 100% meluluskan 16 kasus pengujian Black-Box (Equivalence Partitioning & Boundary Value Analysis) baik secara visual maupun fungsional sistem pengujian otomatis?

## Recommended Direction
**Modular Custom Schema Validator & Alert Trigger**
Kita memisahkan logika validasi ke dalam modul utility independen `lib/validation.ts` yang mengevaluasi input menggunakan urutan logis yang presisi. Alur pemeriksaan WhatsApp adalah:
1. Pengecekan kosong -> `"Nomor WhatsApp wajib diisi"`
2. Pengecekan awalan `"08"` -> `"Format nomor tidak valid"`
3. Pengecekan karakter non-digit -> `"Hanya boleh angka"`
4. Batas minimal 10 digit -> `"Nomor WhatsApp minimal 10 digit"`
5. Batas maksimal 13 digit -> `"Nomor WhatsApp maksimal 13 digit"`

Validasi ini terintegrasi langsung di form `GuestsTab.tsx`. Ketika validasi gagal pada saat submisi form, sistem akan menampilkan visual error border merah di bawah kolom input, sekaligus memicu popup `alert()` browser dengan pesan error yang sesuai. Jika data valid dan berhasil dimasukkan, sistem memicu popup `alert("Data berhasil ditambah")`.

Logic ini diawasi ketat oleh 16 unit test Vitest di `lib/validation.test.ts`.

## Key Assumptions to Validate
- [x] **Format WhatsApp Supabase:** Kita berasumsi input WA yang divalidasi dengan format "08xxxx" akan diformat ulang menjadi "62xxxx" sesaat sebelum dikirim ke database Supabase. *(Sudah tervalidasi dan berjalan menggunakan fungsi trim & replace di dalam submit handler).*

## MVP Scope
- **In-Scope:** Pembuatan modul validasi kustom, unit test Vitest, trigger popup alert untuk pesan validasi dan kesuksesan data, styling error border merah pada input di modal form UI, dan reset state form saat modal ditutup/dibuka.
- **Out-of-Scope:** Integrasi form library pihak ketiga (Formik/React Hook Form) karena form kita masih cukup sederhana.

## Not Doing (and Why)
- **Library Validasi Eksternal (Zod/Yup):** Tidak digunakan untuk memangkas ukuran bundle size dan mempermudah urutan pemanggilan pesan error kustom secara spesifik.

## Open Questions
- Apakah kategori tamu di masa depan akan statis hanya "Alumni" & "Teater" atau membutuhkan data dinamis dari database?
