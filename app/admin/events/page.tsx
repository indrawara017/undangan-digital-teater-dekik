'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader } from '@/app/components/Loader';
import { EventsToolbar, EventsList, EventsAdd } from './_components';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State from EventsView
  const [eventForm, setEventForm] = useState({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '', youtube_url: '', spotify_url: '' });
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    if (editingEvent) {
      const { error } = await supabase.from('events').update(eventForm).eq('id', editingEvent.id);
      if (error) alert(error.message);
      else { 
        setEditingEvent(null); 
        setEventForm({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '', youtube_url: '', spotify_url: '' }); 
        setIsModalOpen(false);
        fetchData(); 
      }
    } else {
      const { error } = await supabase.from('events').insert([eventForm]);
      if (error) alert(error.message);
      else { 
        setEventForm({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '', youtube_url: '', spotify_url: '' }); 
        setIsModalOpen(false);
        fetchData(); 
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Hapus panggung ini?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchData();
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setEventForm({ title: '', creator: '', date: '', location: '', description: '', gmaps_url: '', youtube_url: '', spotify_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (ev: any) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title,
      creator: ev.creator || '',
      date: ev.date || '',
      location: ev.location || '',
      description: ev.description || '',
      gmaps_url: ev.gmaps_url || '',
      youtube_url: ev.youtube_url || '',
      spotify_url: ev.spotify_url || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  if (loading) return <Loader text="Menyiapkan Jadwal Panggung..." />;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      
      {/* 1. Bagian Atas: Toolbar */}
      <div className="w-full">
        <EventsToolbar 
           events={events}
           onAddEvent={openAddModal}
        />
      </div>

      {/* 2. Bagian Tengah: Tabel Data */}
      <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl">
        <EventsList 
           events={events}
           onEditEvent={openEditModal}
           onDeleteEvent={handleDeleteEvent}
        />
      </div>

      {/* 3. Bagian Modal: Form Penambahan Data */}
      <EventsAdd 
         isOpen={isModalOpen}
         onClose={closeModal}
         eventForm={eventForm}
         setEventForm={setEventForm}
         isEditing={!!editingEvent}
         onSave={handleSaveEvent}
      />
    </div>
  );
}
