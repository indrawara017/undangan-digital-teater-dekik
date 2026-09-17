'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AnggotaToolbar, AnggotaList, AnggotaAdd, CastMember } from './_components';

export default function AnggotaPage() {
  const [masterCast, setMasterCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CastMember | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchMasterCast();
  }, []);

  const fetchMasterCast = async () => {
    setLoading(true);
    try {
      const { data: masterData } = await supabase.storage.from('assets').download('global/cast_members.json');
      let loadedMaster: CastMember[] = [];
      if (masterData) {
        try {
          const text = await masterData.text();
          const parsed = JSON.parse(text);
          loadedMaster = parsed.map((m: any) => ({ id: m.id, name: m.name, photoUrl: m.photoUrl }));
        } catch (e) { }
      }
      setMasterCast(loadedMaster);
    } catch (err) {
      console.error('Error loading anggota data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setNameInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsFormOpen(true);
  };

  const openEditModal = (member: CastMember) => {
    setEditingMember(member);
    setNameInput(member.name);
    setSelectedFile(null);
    setPreviewUrl(member.photoUrl);
    setIsFormOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSaving(true);
    try {
      const memberId = editingMember ? editingMember.id : `cast-${Date.now()}`;
      let photoUrl = editingMember ? editingMember.photoUrl : '';

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `global/cast-avatars/${memberId}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, selectedFile, {
          upsert: true,
          cacheControl: '3600'
        });

        if (uploadError) {
          alert('Gagal mengunggah foto profil: ' + uploadError.message);
          setSaving(false);
          return;
        }

        photoUrl = supabase.storage.from('assets').getPublicUrl(filePath).data.publicUrl + `?t=${Date.now()}`;
      }

      const updatedMember: CastMember = {
        id: memberId,
        name: nameInput.trim(),
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
      };

      let newMasterList: CastMember[] = [];
      if (editingMember) {
        newMasterList = masterCast.map(m => (m.id === editingMember.id ? updatedMember : m));
      } else {
        newMasterList = [...masterCast, updatedMember];
      }

      const jsonBlob = new Blob([JSON.stringify(newMasterList, null, 2)], { type: 'application/json' });
      await supabase.storage.from('assets').upload('global/cast_members.json', jsonBlob, { upsert: true });

      setMasterCast(newMasterList);
      setIsFormOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan anggota: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Hapus anggota ini dari Database Master?')) return;

    const newMasterList = masterCast.filter(m => m.id !== id);
    const jsonBlob = new Blob([JSON.stringify(newMasterList, null, 2)], { type: 'application/json' });
    await supabase.storage.from('assets').upload('global/cast_members.json', jsonBlob, { upsert: true });

    setMasterCast(newMasterList);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="w-full">
        <AnggotaToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalMembers={masterCast.length}
          onAddMember={openAddModal}
        />
      </div>
      <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl">
        <AnggotaList
          members={masterCast}
          loading={loading}
          searchQuery={searchQuery}
          onResetSearch={() => setSearchQuery('')}
          onEditMember={openEditModal}
          onDeleteMember={handleDeleteMember}
          onAddMember={openAddModal}
        />
      </div>

      <AnggotaAdd
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingMember={editingMember}
        nameInput={nameInput}
        setNameInput={setNameInput}
        previewUrl={previewUrl}
        onFileChange={handleFileChange}
        onSave={handleSaveMember}
        saving={saving}
      />
    </div>
  );
}
