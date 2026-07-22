'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Search, Filter, Camera, UserCheck, Check, ShieldCheck } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';
import { QRScannerModal } from '../components/QRScannerModal';
import { supabase } from '@/lib/supabase';

export function RSVPTab({ 
  events, 
  invitations, 
  selectedEventId, 
  setSelectedEventId 
}: { 
  events: any[], 
  invitations: any[],
  selectedEventId: string, 
  setSelectedEventId: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [localInvitations, setLocalInvitations] = useState<any[]>(invitations);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalInvitations(invitations);
  }, [invitations]);

  const currentEventInvitations = localInvitations.filter(i => i.event_id === selectedEventId);
  
  const categories = ['Semua', ...Array.from(new Set(currentEventInvitations.map(i => i.guests?.category).filter(Boolean)))];
  
  const filteredInvitations = currentEventInvitations.filter(inv => {
    const matchCategory = filterCategory === 'Semua' || inv.guests?.category === filterCategory;
    const matchStatus = filterStatus === 'Semua' || 
                       (filterStatus === 'Sudah Check-in' && inv.checked_in) ||
                       (filterStatus === 'Hadir' && inv.rsvp_status === 'attending' && !inv.checked_in) ||
                       (filterStatus === 'Tidak Hadir' && inv.rsvp_status === 'declined') ||
                       (filterStatus === 'Belum Respon' && !inv.rsvp_status);
    const matchSearch = inv.guests?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  const handleCheckIn = async (invitationId: string) => {
    const targetInv = localInvitations.find(i => i.id === invitationId);
    if (!targetInv) {
      return {
        success: false,
        message: 'Tiket tidak ditemukan pada event ini.',
      };
    }

    const isAlreadyCheckedIn = !!targetInv.checked_in;
    const nowIso = new Date().toISOString();

    // Perform update in Supabase
    const { error } = await supabase
      .from('invitations')
      .update({ 
        rsvp_status: 'attending', 
        checked_in: true, 
        checked_in_at: nowIso 
      })
      .eq('id', invitationId);

    if (error) {
      console.error('Check-in error:', error);
      // Fallback try without checked_in column if DB schema isn't updated yet
      await supabase
        .from('invitations')
        .update({ rsvp_status: 'attending' })
        .eq('id', invitationId);
    }

    // Update local state for immediate UI feedback
    setLocalInvitations(prev =>
      prev.map(item =>
        item.id === invitationId
          ? { ...item, rsvp_status: 'attending', checked_in: true, checked_in_at: nowIso }
          : item
      )
    );

    return {
      success: true,
      alreadyCheckedIn: isAlreadyCheckedIn,
      message: isAlreadyCheckedIn ? 'Tamu sudah pernah check-in sebelumnya.' : 'Check-in sukses!',
      guestName: targetInv.guests?.name || 'Tamu',
      category: targetInv.guests?.category || 'Umum',
    };
  };

  const handleManualToggleCheckIn = async (inv: any) => {
    setUpdatingId(inv.id);
    const newCheckedInState = !inv.checked_in;
    const nowIso = newCheckedInState ? new Date().toISOString() : null;

    const updatePayload: any = {
      rsvp_status: newCheckedInState ? 'attending' : inv.rsvp_status,
      checked_in: newCheckedInState,
      checked_in_at: nowIso,
    };

    const { error } = await supabase
      .from('invitations')
      .update(updatePayload)
      .eq('id', inv.id);

    if (error) {
      console.error('Manual toggle error:', error);
      await supabase
        .from('invitations')
        .update({ rsvp_status: newCheckedInState ? 'attending' : inv.rsvp_status })
        .eq('id', inv.id);
    }

    setLocalInvitations(prev =>
      prev.map(item =>
        item.id === inv.id
          ? { ...item, ...updatePayload }
          : item
      )
    );
    setUpdatingId(null);
  };

  const getStatusBadge = (inv: any) => {
    if (inv.checked_in) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Sudah Check-in
        </span>
      );
    }

    switch (inv.rsvp_status) {
      case 'attending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-950/40 text-green-400 border border-green-900/50">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Konfirmasi Hadir
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/50 text-red-400 border border-red-900/50">
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Tidak Hadir
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Belum Respon
          </span>
        );
    }
  };

  const totalInvited = currentEventInvitations.length;
  const totalAttending = currentEventInvitations.filter(i => i.rsvp_status === 'attending').length;
  const totalCheckedIn = currentEventInvitations.filter(i => i.checked_in).length;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Header Selector & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-[10px] uppercase tracking-widest font-medium text-neutral-400 shrink-0">Pilih Panggung:</label>
          <div className="relative w-full sm:w-64">
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

        {selectedEventId && (
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs uppercase tracking-wider font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR Tiket</span>
          </button>
        )}
      </div>

      {selectedEventId ? (
        <div className="w-full border border-neutral-800 bg-neutral-900/40 rounded-xl overflow-hidden shadow-2xl mt-2">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-px bg-neutral-800/50">
            <div className="bg-neutral-900/80 p-5 text-center">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Total Diundang</p>
              <p className="text-3xl font-cormorant font-medium mt-1 text-white">{totalInvited}</p>
            </div>
            <div className="bg-neutral-900/80 p-5 text-center">
              <p className="text-xs text-green-500/70 font-medium uppercase tracking-wider">Konfirmasi Hadir</p>
              <p className="text-3xl font-cormorant font-medium mt-1 text-green-400">{totalAttending}</p>
            </div>
            <div className="bg-neutral-900/80 p-5 text-center">
              <p className="text-xs text-emerald-400/90 font-medium uppercase tracking-wider">Sudah Check-In</p>
              <p className="text-3xl font-cormorant font-medium mt-1 text-emerald-400">{totalCheckedIn}</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-auto flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Cari nama tamu..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-neutral-800 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center relative w-full sm:w-auto">
                <CustomSelect 
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  options={categories.map(c => ({ value: c as string, label: c as string }))}
                  icon={<Filter className="w-4 h-4 text-neutral-500" />}
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <CustomSelect 
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  options={[
                    { value: "Semua", label: "Semua Status" },
                    { value: "Sudah Check-in", label: "Sudah Check-in" },
                    { value: "Hadir", label: "Konfirmasi Hadir" },
                    { value: "Tidak Hadir", label: "Tidak Hadir" },
                    { value: "Belum Respon", label: "Belum Respon" }
                  ]}
                />
              </div>
            </div>
          </div>
          
          {/* Guest Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-neutral-800 text-neutral-400 bg-black/40">
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-5/12">Nama Tamu Undangan</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-4/12">Status Kehadiran</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] w-3/12 text-right">Aksi Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {currentEventInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-neutral-500">
                      <p>Belum ada tamu yang diundang ke event ini.</p>
                      <p className="text-xs mt-2">Gunakan menu Distribusi untuk mengundang tamu.</p>
                    </td>
                  </tr>
                ) : filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-neutral-500">
                      <p>Tidak ada tamu yang sesuai dengan filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map(inv => (
                    <tr key={inv.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{inv.guests?.name}</div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">{inv.guests?.category || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleManualToggleCheckIn(inv)}
                          disabled={updatingId === inv.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border ${
                            inv.checked_in
                              ? 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                              : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-800/80 hover:text-white'
                          }`}
                        >
                          {updatingId === inv.id ? (
                            'Memproses...'
                          ) : inv.checked_in ? (
                            'Batal Check-In'
                          ) : (
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" /> Check-In Manual
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 border border-neutral-800 bg-neutral-900/30 rounded-2xl text-neutral-400 flex flex-col items-center justify-center gap-4 text-center mt-4">
          <Clock className="w-8 h-8 text-neutral-600" />
          <p>Silakan tentukan Panggung (Event) terlebih dahulu untuk melihat konfirmasi kehadiran tamu.</p>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        invitations={currentEventInvitations}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
}
