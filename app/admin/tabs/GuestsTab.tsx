'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Edit2, Trash2, Plus, X, Filter, Search } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

export function GuestsTab({ guests, fetchData }: { guests: any[], fetchData: () => void }) {
  const [guestForm, setGuestForm] = useState({ name: '', whatsapp: '', category: 'Alumni', gender: 'Laki-laki' });
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Alumni', 'Teater'];

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.name.trim()) return;
    
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
        setEditingGuest(null); 
        setGuestForm({ name: '', whatsapp: '', category: 'Alumni', gender: 'Laki-laki' }); 
        setIsModalOpen(false);
        fetchData(); 
      }
    } else {
      const baseSlug = guestForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let finalSlug = baseSlug;
      
      // Cek duplikasi
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
        setGuestForm({ name: '', whatsapp: '', category: 'Alumni', gender: 'Laki-laki' }); 
        setIsModalOpen(false);
        fetchData(); 
      }
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Hapus tamu ini seumur hidup? (Semua undangan miliknya akan terhapus)')) return;
    await supabase.from('guests').delete().eq('id', id);
    fetchData();
  };

  const getCategoryBadgeColor = (category: string) => {
    switch(category) {
      case 'Alumni': return 'bg-blue-950/50 text-blue-400 border-blue-900/50';
      case 'Teater': return 'bg-purple-950/50 text-purple-400 border-purple-900/50';
      default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const openAddModal = () => {
    setEditingGuest(null);
    setGuestForm({ name: '', whatsapp: '', category: 'Alumni', gender: 'Laki-laki' });
    setIsModalOpen(true);
  };

  const openEditModal = (g: any) => {
    setEditingGuest(g);
    setGuestForm({ name: g.name, whatsapp: g.whatsapp || '', category: g.category || 'Alumni', gender: g.gender || 'Laki-laki' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
  };

  const statCards = [
    { label: 'Total Tamu', categoryId: null, count: guests.length, color: 'text-white' },
    { label: 'Alumni', categoryId: 'Alumni', count: guests.filter(g => g.category === 'Alumni').length, color: 'text-blue-400' },
    { label: 'Teater', categoryId: 'Teater', count: guests.filter(g => g.category === 'Teater').length, color: 'text-purple-400' },
  ];

  const filteredGuests = guests.filter(g => {
    const matchCategory = filterCategory 
      ? (g.category === filterCategory)
      : true;
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Table Container */}
      <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Table Toolbar / Header */}
        <div className="p-4 md:p-5 border-b border-neutral-800 flex flex-col xl:flex-row xl:items-center justify-between bg-black/40 gap-4">
          
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {statCards.map(stat => {
              const isActive = filterCategory === stat.categoryId;
              return (
                <button 
                  key={stat.label} 
                  onClick={() => setFilterCategory(stat.categoryId)}
                  className={`shrink-0 flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-medium uppercase tracking-wider transition-all duration-300 ${
                    isActive 
                      ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                      : 'border border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {stat.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] md:text-[10px] ${isActive ? 'bg-black/10' : 'bg-neutral-800'}`}>
                    {stat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Cari nama tamu..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900/60 border border-neutral-800 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
            <Button onClick={openAddModal} size="sm" className="h-10 shrink-0 shadow-lg">
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Tamu
            </Button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-black/50">
                <th className="p-4 font-medium">Nama</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Gender</th>
                <th className="p-4 font-medium">WhatsApp</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredGuests.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-neutral-500">Belum ada data tamu untuk kategori ini.</td></tr>
              )}
              {filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 font-medium text-white">{g.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider ${getCategoryBadgeColor(g.category || 'Alumni')}`}>
                      {g.category || 'Alumni'}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400">{g.category === 'Teater' ? '-' : (g.gender || '-')}</td>
                  <td className="p-4 text-neutral-400">{g.whatsapp || '-'}</td>
                  <td className="p-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditModal(g)}
                    >
                      <Edit2 className="w-3 h-3 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDeleteGuest(g.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-neutral-800/50">
          {filteredGuests.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">Belum ada data tamu.</div>
          ) : (
            filteredGuests.map((g) => (
              <div key={g.id} className="flex flex-col gap-3 p-4 hover:bg-neutral-800/30 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-white text-base leading-tight">{g.name}</span>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border uppercase tracking-wider ${getCategoryBadgeColor(g.category || 'Alumni')}`}>
                    {g.category || 'Alumni'}
                  </span>
                </div>
                <div className="text-sm text-neutral-400">
                  {g.whatsapp || 'Tidak ada WhatsApp'}
                </div>
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-neutral-800/50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditModal(g)}
                    className="flex-1 h-9"
                  >
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDeleteGuest(g.id)}
                    className="flex-1 h-9"
                  >
                    <Trash2 className="w-3 h-3 mr-2" /> Hapus
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h3 className="text-lg font-medium text-white">
                {editingGuest ? 'Edit Data Tamu' : 'Tambah Tamu Baru'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveGuest} className="p-5 flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-neutral-400 font-medium block">Nama Lengkap</label>
                <Input 
                  type="text" 
                  placeholder="Masukkan Nama Lengkap" 
                  value={guestForm.name} 
                  onChange={(e) => setGuestForm({...guestForm, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm text-neutral-400 font-medium block">No. WhatsApp</label>
                <Input 
                  type="text" 
                  placeholder="Masukkan No WhatsApp" 
                  value={guestForm.whatsapp} 
                  onChange={(e) => setGuestForm({...guestForm, whatsapp: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm text-neutral-400 font-medium block">Kategori Tamu</label>
                <div className="relative w-full">
                  <CustomSelect 
                    value={guestForm.category}
                    onChange={(val) => setGuestForm({...guestForm, category: val})}
                    options={categories.map(c => ({ value: c, label: c }))}
                  />
                </div>
              </div>

              {guestForm.category === 'Alumni' && (
                <div className="space-y-1.5">
                  <label className="text-sm text-neutral-400 font-medium block">Gender</label>
                  <div className="relative w-full">
                    <CustomSelect 
                      value={guestForm.gender}
                      onChange={(val) => setGuestForm({...guestForm, gender: val})}
                      options={[{value: 'Laki-laki', label: 'Laki-laki'}, {value: 'Perempuan', label: 'Perempuan'}]}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t border-neutral-800 mt-2">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  {editingGuest ? 'Simpan' : 'Tambah'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
