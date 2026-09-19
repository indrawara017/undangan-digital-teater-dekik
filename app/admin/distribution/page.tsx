'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getEventSlug } from '@/lib/assets';
import { Loader } from '@/app/components/Loader';
import { CustomSelect } from '@/app/components/CustomSelect';
import { Circle } from 'lucide-react';
import { DistributionToolbar, DistributionList } from './_components';

export default function DistributionPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // States from DistributionView
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    const [eRes, gRes, iRes] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('created_at', { ascending: false }),
      supabase.from('invitations').select('*, guests(*)').order('created_at', { ascending: false })
    ]);
    if (eRes.data) {
      setEvents(eRes.data);
      if (eRes.data.length > 0 && !selectedEventId) setSelectedEventId(eRes.data[0].id);
    }
    if (gRes.data) setGuests(gRes.data);
    if (iRes.data) setInvitations(iRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ensureInvited = async (guestId: string) => {
    if (!selectedEventId) {
      alert('Pilih panggung terlebih dahulu');
      return false;
    }
    const existing = invitations.find(i => i.event_id === selectedEventId && i.guest_id === guestId);
    if (!existing) {
      await supabase.from('invitations').insert([{ event_id: selectedEventId, guest_id: guestId }]);
      fetchData();
    }
    return true;
  };

  const getEventSlugLocal = () => {
    const ev = events.find(e => e.id === selectedEventId);
    if (!ev) return '';
    return getEventSlug(ev.title);
  };

  const handleCopyLink = async (guest: any) => {
    const success = await ensureInvited(guest.id);
    if (!success) return;
    const url = `${window.location.origin}/undangan/${guest.slug}-${getEventSlugLocal()}`;
    navigator.clipboard.writeText(url);
    alert('Link berhasil disalin: ' + url);
  };

  const handleSendWA = async (guest: any) => {
    if (!guest.whatsapp) return alert('Nomor WhatsApp tamu ini belum diisi.');
    const success = await ensureInvited(guest.id);
    if (!success) return;
    const url = `${window.location.origin}/undangan/${guest.slug}-${getEventSlugLocal()}`;
    
    let text = '';
    
    if (guest.category === 'Teater') {
      text = `*UNDANGAN PEMENTASAN TEATER DEKIK* 🎭\n\nHalo *${guest.name}*,\n\nKami mengundang Anda dan tim untuk hadir dalam pementasan terbaru kami — sebuah karya yang lahir dari proses panjang dan kolaborasi.\n\nKami percaya, kehadiran sesama pegiat teater akan memperkaya diskusi dan apresiasi karya ini.\n\n📍 Detail acara, lokasi, dan konfirmasi kehadiran (e-Tiket):\n👉 ${url}\n\nBersatu bersama dan terus berkarya, Teater Dekik Jaya! 🎭`;
    } else {
      const sapaan = guest.gender === 'Perempuan' ? 'Mbak' : 'Mas';
      text = `*UNDANGAN TEATER DEKIK* 🎭\n\nHalo ${sapaan} *${guest.name}*,\n\nKabar baik dari rumah kita dulu! Teater Dekik kembali naik panggung, dan sebagai bagian dari sejarah kami, kehadiran ${sapaan} akan sangat berarti bagi kami.\n\nYuk, lihat lagi karya-karya adik-adik yang meneruskan semangat ${sapaan} dulu.\n\n📍 Detail acara, lokasi, dan konfirmasi kehadiran (e-Tiket):\n👉 ${url}\n\nBersatu bersama dan terus berkarya, Teater Dekik Jaya! 🎭`;
    }

    const whatsappUrl = `https://wa.me/${guest.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const categories = ['Semua', ...Array.from(new Set(guests.map(g => g.category)))];

  const currentEventInvitations = invitations.filter(i => i.event_id === selectedEventId);
  const invitedGuestIds = currentEventInvitations.map(i => i.guest_id);
  const displayedGuests = guests.filter(g => {
    const matchCategory = filterCategory === 'Semua' || g.category === filterCategory;
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isInvited = invitedGuestIds.includes(g.id);
    const matchStatus = filterStatus === 'Semua' || (filterStatus === 'Sudah' ? isInvited : !isInvited);
    return matchCategory && matchSearch && matchStatus;
  });

  if (loading) return <Loader text="Menyiapkan Distribusi Undangan..." />;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in pb-20 duration-500">
      
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 w-full max-w-md mx-auto">
        <label className="text-[10px] uppercase tracking-widest font-medium text-neutral-400 shrink-0">Pilih Panggung:</label>
        <div className="relative w-full">
          <CustomSelect 
            value={selectedEventId} 
            onChange={(val) => setSelectedEventId(val)} 
            options={events.length === 0 
              ? [{ value: "", label: "-- Belum ada event terdaftar --" }]
              : events.map(ev => ({ value: ev.id, label: ev.title }))
            }
            placeholder="Pilih Panggung"
          />
        </div>
      </div>

      {selectedEventId ? (
        <div className="flex flex-col gap-4 mt-2">
          <div className="w-full">
            <DistributionToolbar 
              displayedCount={displayedGuests.length}
              invitedCount={invitedGuestIds.length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories as string[]}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          </div>
          <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl">
            <DistributionList 
              displayedGuests={displayedGuests}
              invitedGuestIds={invitedGuestIds}
              onCopyLink={handleCopyLink}
              onSendWA={handleSendWA}
            />
          </div>
        </div>
      ) : (
        <div className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-2xl text-neutral-400 flex flex-col items-center justify-center gap-4 text-center mt-4">
          <Circle className="w-8 h-8 text-neutral-600" />
          <p>Silakan tentukan Panggung terlebih dahulu untuk mulai mendistribusikan undangan.</p>
        </div>
      )}
    </div>
  );
}
