'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/app/components/Toast';
import { 
  MerchandiseToolbar, 
  MerchandiseList, 
  MerchandiseModal, 
  type MerchandiseItem 
} from './_components';

const EMPTY_MERCH_FORM: MerchandiseItem = {
  name: '',
  description: '',
  price: 85000,
  stock: 25,
  category: 'Kaos & Pakaian',
  image_url: '',
  image_urls: [],
  variants: ['S', 'M', 'L', 'XL'],
  event_id: null,
  is_active: true,
  is_featured: false,
};

export default function AdminMerchandisePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchandiseItem | null>(null);
  const [form, setForm] = useState<MerchandiseItem>(EMPTY_MERCH_FORM);

  const { showToast } = useToast();

  // 1. Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, date')
        .order('created_at', { ascending: false });

      if (data) {
        setEvents(data);
      }
    };
    fetchEvents();
  }, []);

  // 2. Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('merchandise')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          stock,
          category,
          image_url,
          image_urls,
          variants,
          event_id,
          is_active,
          is_featured,
          sort_order,
          created_at,
          events (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedEventId === 'general') {
        query = query.is('event_id', null);
      } else if (selectedEventId !== 'all') {
        query = query.eq('event_id', selectedEventId);
      }

      if (selectedCategory !== 'Semua Kategori') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts((data as any[]) || []);
    } catch (err: any) {
      console.error('Error fetching merchandise:', err);
      showToast('Gagal memuat merchandise: ' + (err.message || 'Coba lagi'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedCategory, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Open Modal for Add / Edit
  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      ...EMPTY_MERCH_FORM,
      event_id: selectedEventId !== 'all' && selectedEventId !== 'general' ? selectedEventId : null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MerchandiseItem) => {
    setEditingItem(item);
    setForm({
      ...item,
      image_urls: Array.isArray(item.image_urls) ? item.image_urls : (item.image_url ? [item.image_url] : []),
      variants: Array.isArray(item.variants) ? item.variants : [],
    });
    setIsModalOpen(true);
  };

  // 4. Save Product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return showToast('Nama merchandise wajib diisi.', 'error');
    }

    setSaving(true);
    try {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const payload = {
        name: form.name.trim(),
        slug: slug || `merch-${Date.now()}`,
        description: form.description?.trim() || null,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        category: form.category || 'Umum',
        image_url: form.image_urls?.[0] || form.image_url || null,
        image_urls: form.image_urls || [],
        variants: form.variants || [],
        event_id: form.event_id || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };

      if (editingItem?.id) {
        const { error } = await supabase
          .from('merchandise')
          .update(payload)
          .eq('id', editingItem.id);

        if (error) throw error;
        showToast('Merchandise berhasil diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('merchandise').insert([payload]);
        if (error) throw error;
        showToast('Merchandise baru berhasil ditambahkan!', 'success');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving merchandise:', err);
      showToast('Gagal menyimpan: ' + (err.message || 'Coba lagi'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // 5. Delete Product
  const handleDelete = async (item: MerchandiseItem) => {
    if (!confirm(`Hapus merchandise "${item.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('merchandise').delete().eq('id', item.id);
      if (error) throw error;
      showToast('Merchandise berhasil dihapus.', 'success');
      fetchProducts();
    } catch (err: any) {
      console.error('Error deleting merchandise:', err);
      showToast('Gagal menghapus: ' + (err.message || 'Coba lagi'), 'error');
    }
  };

  // 6. Quick Toggle Active
  const handleToggleActive = async (item: MerchandiseItem) => {
    try {
      const newState = !item.is_active;
      const { error } = await supabase
        .from('merchandise')
        .update({ is_active: newState })
        .eq('id', item.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, is_active: newState } : p))
      );
      showToast(`Status "${item.name}" diubah ke ${newState ? 'Aktif' : 'Nonaktif'}.`, 'success');
    } catch (err: any) {
      console.error('Error toggling status:', err);
      showToast('Gagal mengubah status: ' + (err.message || 'Coba lagi'), 'error');
    }
  };

  // Filter local search
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.events?.title && p.events.title.toLowerCase().includes(q))
    );
  });

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  return (
    <div className="space-y-6">
      <MerchandiseToolbar
        events={events}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddProduct={handleOpenAdd}
        totalProducts={filteredProducts.length}
        totalStock={totalStock}
      />

      <MerchandiseList
        products={filteredProducts}
        onEditProduct={handleOpenEdit}
        onDeleteProduct={handleDelete}
        onToggleActive={handleToggleActive}
        loading={loading}
      />

      <MerchandiseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        isEditing={!!editingItem}
        onSave={handleSave}
        saving={saving}
        events={events}
      />
    </div>
  );
}
