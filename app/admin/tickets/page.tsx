'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader } from '@/app/components/Loader';
import { useToast } from '@/app/components/Toast';
import { 
  TicketsToolbar, 
  TicketsList, 
  TicketsModal, 
  type TicketTierForm 
} from './_components';

const EMPTY_TIER_FORM: TicketTierForm = {
  name: '',
  price: 0,
  quota: 50,
  available_quota: 50,
  max_per_order: 5,
  description: '',
  is_active: true,
  sort_order: 0,
};

export default function TicketsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [tiers, setTiers] = useState<TicketTierForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<TicketTierForm | null>(null);
  const [form, setForm] = useState<TicketTierForm>(EMPTY_TIER_FORM);

  const { showToast } = useToast();

  // 1. Fetch Events Master
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, date')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setEvents(data);
        setSelectedEventId(data[0].id);
      } else {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 2. Fetch Tiers for Selected Event
  const fetchTiers = useCallback(async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('price', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (err: any) {
      showToast('Gagal memuat kategori tiket: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, showToast]);

  useEffect(() => {
    if (selectedEventId) {
      fetchTiers();
    }
  }, [selectedEventId, fetchTiers]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingTier(null);
    setForm(EMPTY_TIER_FORM);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tier: TicketTierForm) => {
    setEditingTier(tier);
    setForm({ ...tier });
    setIsModalOpen(true);
  };

  // Save Tier (Add or Update)
  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('Nama tiket wajib diisi', 'error');
    if (!selectedEventId) return showToast('Pilih pementasan terlebih dahulu', 'error');

    setSaving(true);
    try {
      if (editingTier && editingTier.id) {
        // Update
        const { error } = await supabase
          .from('ticket_tiers')
          .update({
            name: form.name.trim(),
            price: form.price,
            quota: form.quota,
            available_quota: form.available_quota,
            max_per_order: form.max_per_order,
            description: form.description?.trim() || null,
            is_active: form.is_active,
            sort_order: form.sort_order || 0,
          })
          .eq('id', editingTier.id);

        if (error) throw error;
        showToast('Kategori tiket berhasil diperbarui!', 'success');
      } else {
        // Insert
        const { error } = await supabase
          .from('ticket_tiers')
          .insert([{
            event_id: selectedEventId,
            name: form.name.trim(),
            price: form.price,
            quota: form.quota,
            available_quota: form.available_quota,
            max_per_order: form.max_per_order,
            description: form.description?.trim() || null,
            is_active: form.is_active,
            sort_order: form.sort_order || 0,
          }]);

        if (error) throw error;
        showToast('Kategori tiket baru berhasil ditambahkan!', 'success');
      }

      setIsModalOpen(false);
      fetchTiers();
    } catch (err: any) {
      showToast('Gagal menyimpan tiket: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Tier
  const handleDeleteTier = async (id: string) => {
    if (!confirm('Hapus kategori tiket ini? Tiket yang telah dibeli mungkin terpengaruh.')) return;

    try {
      const { error } = await supabase
        .from('ticket_tiers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Kategori tiket berhasil dihapus', 'success');
      fetchTiers();
    } catch (err: any) {
      showToast('Gagal menghapus tiket: ' + err.message, 'error');
    }
  };

  if (loading && events.length === 0) {
    return <Loader text="Menyiapkan Panel Tiket..." />;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      {/* 1. Toolbar */}
      <TicketsToolbar
        events={events}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        onAddTier={handleOpenAdd}
        totalTiers={tiers.length}
      />

      {/* 2. List Tabel Tiket */}
      <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-2xl overflow-hidden shadow-2xl">
        <TicketsList
          tiers={tiers}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteTier}
          onAdd={handleOpenAdd}
        />
      </div>

      {/* 3. Modal Form */}
      <TicketsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        isEditing={!!editingTier}
        onSave={handleSaveTier}
        saving={saving}
      />
    </div>
  );
}
