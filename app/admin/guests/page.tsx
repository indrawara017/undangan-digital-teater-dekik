'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GuestToolbar, GuestList, GuestAdd } from './_components';
import { Loader } from '@/app/components/Loader';

export interface ValidationErrors {
  name?: string;
  whatsapp?: string;
  category?: string;
}

export function validateGuest(input: any): ValidationErrors {
  const errors: ValidationErrors = {};

  const name = input.name ?? '';
  if (name.trim() === '') {
    errors.name = "Nama tamu wajib diisi";
  } else {
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(name)) {
      errors.name = "Nama hanya boleh mengandung huruf dan spasi";
    }
  }

  const whatsapp = input.whatsapp ?? '';
  if (whatsapp === '') {
    errors.whatsapp = "Nomor WhatsApp wajib diisi";
  } else if (!whatsapp.startsWith('08')) {
    errors.whatsapp = "Format nomor tidak valid";
  } else if (!/^\d+$/.test(whatsapp)) {
    errors.whatsapp = "Hanya boleh angka";
  } else if (whatsapp.length < 10) {
    errors.whatsapp = "Nomor minimal 10 digit";
  } else if (whatsapp.length > 13) {
    errors.whatsapp = "Nomor maksimal 13 digit";
  }

  const category = input.category ?? '';
  if (category === '' || (category !== 'Alumni' && category !== 'Teater')) {
    errors.category = "Silakan pilih kategori tamu";
  }

  return errors;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Toolbar
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [guestForm, setGuestForm] = useState({ name: '', whatsapp: '', category: '', gender: 'Laki-laki' });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
    if (data) setGuests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateGuest(guestForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    
    let wa = guestForm.whatsapp.trim();
    if (wa.startsWith('0')) wa = '62' + wa.substring(1);
    if (wa.startsWith('+62')) wa = '62' + wa.substring(3);

    if (editingGuest) {
      const { error } = await supabase.from('guests').update({ 
        name: guestForm.name, 
        whatsapp: wa,
        category: guestForm.category,
        gender: guestForm.category === 'Teater' ? null : guestForm.gender
      }).eq('id', editingGuest.id);
      if (error) alert(error.message);
      else {
        alert("tamu undagan berhasil diperbarui");
        closeModal();
        fetchData(); 
      }
    } else {
      const baseSlug = guestForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let finalSlug = baseSlug;
      
      const { data: existing } = await supabase.from('guests').select('slug').eq('slug', baseSlug).maybeSingle();
      if (existing) {
        finalSlug = baseSlug + '-' + Math.floor(Math.random() * 1000);
      }

      const { error } = await supabase.from('guests').insert([{ 
        name: guestForm.name, 
        whatsapp: wa, 
        slug: finalSlug,
        category: guestForm.category,
        gender: guestForm.category === 'Teater' ? null : guestForm.gender
      }]);
      if (error) alert(error.message);
      else {
        alert("tamu undangan berhasil ditambah");
        closeModal();
        fetchData(); 
      }
    }
  };

  const handleDeleteGuest = async (guest: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${guest.name}?`)) return;
    const { error } = await supabase.from('guests').delete().eq('id', guest.id);
    if (error) alert(error.message);
    else {
      alert("tamu undagan berhasil dihapus");
      fetchData();
    }
  };

  const openAddModal = () => {
    setEditingGuest(null);
    setGuestForm({ name: '', whatsapp: '', category: '', gender: 'Laki-laki' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (g: any) => {
    setEditingGuest(g);
    setGuestForm({ name: g.name, whatsapp: g.whatsapp || '', category: g.category || 'Alumni', gender: g.gender || 'Laki-laki' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
    setFormErrors({});
  };

  const filteredGuests = guests.filter(g => {
    const matchCategory = filterCategory 
      ? (g.category === filterCategory)
      : true;
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <Loader text="Menarik Daftar Tamu..." />;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="w-full">
        <GuestToolbar 
          guests={guests}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddGuest={openAddModal}
        />
      </div>
      <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl">
        <GuestList 
          guests={filteredGuests}
          onEditGuest={openEditModal}
          onDeleteGuest={handleDeleteGuest}
        />
      </div>

      <GuestAdd 
        isOpen={isModalOpen}
        onClose={closeModal}
        guestForm={guestForm}
        setGuestForm={setGuestForm}
        formErrors={formErrors}
        handleSaveGuest={handleSaveGuest}
        editingGuest={editingGuest}
      />
    </div>
  );
}
