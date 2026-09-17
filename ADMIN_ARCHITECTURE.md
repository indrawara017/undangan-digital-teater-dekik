# Panduan Arsitektur Modular Halaman Admin

Dokumen ini adalah panduan standar (SOP) untuk mengimplementasikan halaman-halaman di panel admin (seperti `distribution`, `events`, `rsvp`, `config`, dll) agar memiliki struktur kode yang konsisten, rapi, dan mudah di-maintenance, berkaca pada struktur yang telah diterapkan di halaman `guests`.

## Konsep Dasar (Smart & Dumb Components)

Pola utama yang digunakan adalah pemisahan antara pengelolaan logika (*state/data*) dan antarmuka (*UI/view*).

1. **`page.tsx` (Smart Component / Container)**: 
   - Berfungsi sebagai pengelola utama halaman.
   - Mengatur semua state (`useState`), memanggil data dari Supabase (`useEffect`), dan menangani logika fungsi dasar (Simpan, Hapus, Filter).
   - **Tidak boleh** memuat terlalu banyak elemen HTML/UI (seperti `<table>` atau modal yang panjang). `page.tsx` hanya bertugas merakit komponen-komponen kecil.
   
2. **`_components/` (Dumb Components / Presentational)**:
   - Direktori khusus di dalam setiap halaman admin.
   - Hanya bertugas menampilkan UI (Visual) berdasarkan `props` yang diberikan oleh `page.tsx`.
   - Mengomunikasikan aksi pengguna (klik tombol, ketik input) kembali ke `page.tsx` melalui fungsi *callback* (seperti `onEdit`, `onDelete`).

---

## Struktur Direktori Standar

Setiap folder halaman admin wajib mengikuti struktur berikut:

```text
app/admin/[nama_halaman]/
├── page.tsx                   # Pengelola state dan penyedia data utama
└── _components/               # Folder wajib untuk komponen-komponen UI
    ├── index.ts               # File barrel untuk export semua komponen
    ├── [fitur]-toolbar.tsx    # Komponen untuk pencarian, filter, dan tombol utama
    ├── [fitur]-list.tsx       # Komponen tabel data / list data
    └── [fitur]-add.tsx        # Komponen form/modal untuk tambah/edit data
```

---

## Aturan Penamaan & Pembuatan File

### 1. File `_components/index.ts`
Berfungsi sebagai *barrel file* agar proses impor di `page.tsx` menjadi rapi (satu baris).
```typescript
// Contoh di app/admin/guests/_components/index.ts
export * from './guest-toolbar';
export * from './guest-list';
export * from './guest-add';
```

### 2. Komponen Toolbar (`[fitur]-toolbar.tsx`)
**Tugas:** Menampung input pencarian (*search*), *dropdown* filter (`CustomSelect`), dan tombol utama (seperti "Tambah Data").
**Syarat:** 
- Menggunakan flexbox responsif (`flex-col md:flex-row`).
- Memanfaatkan ikon dari `lucide-react`.

### 3. Komponen List/Data Table (`[fitur]-list.tsx`)
**Tugas:** Menampilkan kumpulan data yang dikirim dari `page.tsx`.
**Syarat:**
- **Harus Responsif:** Menggunakan `<table>` standar untuk mode desktop (`hidden md:block`), dan menggunakan desain kartu bersusun untuk mode *mobile* (`md:hidden flex flex-col`).
- **Aksi Data (Action):** Ditempatkan di sisi paling kanan tabel. Jika aksi lebih dari dua, gunakan *dropdown* titik tiga (vertikal ellipsis) agar tabel tidak terlihat sesak.
- **Paginasi & Pengurutan (Sorting):** Terapkan fungsi *sorting* di *header* tabel, serta kontrol paginasi di bagian bawah tabel jika jumlah data diekspektasikan banyak.

### 4. Komponen Form/Modal (`[fitur]-add.tsx`)
**Tugas:** Komponen yang melayang (*overlay*) untuk menambah atau mengubah (*edit*) data.
**Syarat:**
- Harus menangani properti `isOpen` dan `onClose`.
- Pesan kesalahan (validasi) form ditangani dan dilempar dari `page.tsx`, komponen ini hanya menampilkannya.

---

## Contoh Cara Mengimpor di `page.tsx`

Halaman utama (`page.tsx`) harus terlihat sangat deklaratif dan mudah dibaca:

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// Cukup impor dari folder _components
import { GuestToolbar, GuestList, GuestAdd } from './_components';

export default function GuestPage() {
  // ... (State & Logika Data) ...

  return (
    <div className="flex flex-col gap-6 animate-in fade-in pb-20">
      
      {/* 1. Bagian Atas: Toolbar */}
      <div className="w-full">
        <GuestToolbar 
           searchQuery={searchQuery}
           setSearchQuery={setSearchQuery}
           onAddGuest={() => setIsModalOpen(true)}
           // ... props lainnya
        />
      </div>

      {/* 2. Bagian Tengah: Tabel Data */}
      <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl">
        <GuestList 
           data={filteredData}
           onEdit={handleEdit}
           onDelete={handleDelete}
        />
      </div>

      {/* 3. Bagian Modal: Form Penambahan Data */}
      <GuestAdd 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         // ... props lainnya
      />
    </div>
  );
}
```

## Tujuan & Keuntungan

1. **Kode yang Terisolasi**: Jika terjadi error pada desain tabel, Anda hanya perlu mengecek `[fitur]-list.tsx` tanpa perlu membedah ribuan baris kode logika di `page.tsx`.
2. **Kemudahan Kolaborasi & AI**: Struktur yang seragam (*predictable*) memudahkan modifikasi atau pengembangan otomatis oleh asisten AI ke depannya.
3. **Reusabilitas (Bisa Dipakai Ulang)**: Komponen di `_components` lebih mudah didaur ulang atau dipindahkan jika ada perubahan desain besar.
