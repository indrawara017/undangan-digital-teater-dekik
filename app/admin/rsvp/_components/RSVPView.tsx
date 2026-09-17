'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Camera, 
  ShieldCheck, 
  Calendar,
  X 
} from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';
import { QRScannerModal } from '@/app/components/QRScannerModal';
import { supabase } from '@/lib/supabase';

export function RSVPView({ 
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
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [localInvitations, setLocalInvitations] = useState<any[]>(invitations);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalInvitations(invitations);
  }, [invitations]);

  const currentEventInvitations = localInvitations.filter(i => i.event_id === selectedEventId);

  const filteredInvitations = currentEventInvitations.filter(inv => {
    const matchStatus = 
      filterStatus === 'Semua' || 
      (filterStatus === 'Sudah Check-in' && inv.checked_in) ||
      (filterStatus === 'Hadir' && inv.rsvp_status === 'attending' && !inv.checked_in) ||
      (filterStatus === 'Tidak Hadir' && inv.rsvp_status === 'declined') ||
      (filterStatus === 'Belum Respon' && !inv.rsvp_status);
      
    const matchSearch = inv.guests?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
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
      await supabase
        .from('invitations')
        .update({ rsvp_status: 'attending' })
        .eq('id', invitationId);
    }

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
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium inline-flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Sudah Check-in
        </span>
      );
    }

    switch (inv.rsvp_status) {
      case 'attending':
        return (
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[11px] font-medium inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Hadir
          </span>
        );
      case 'declined':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-medium inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Tidak Hadir
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/10 text-[11px] font-medium inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Belum Respon
          </span>
        );
    }
  };

  const totalInvited = currentEventInvitations.length;
  const totalAttending = currentEventInvitations.filter(i => i.rsvp_status === 'attending').length;
  const totalCheckedIn = currentEventInvitations.filter(i => i.checked_in).length;

  const statusOptions = ['Semua', 'Sudah Check-in', 'Hadir', 'Tidak Hadir', 'Belum Respon'];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Selector & Stats in one clean line */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-white tracking-wide shrink-0">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span>Panggung:</span>
          </div>
          
          <div className="relative w-full sm:w-64">
            <CustomSelect 
              value={selectedEventId} 
              onChange={(val) => setSelectedEventId(val)} 
              options={events.length === 0 
                ? [{ value: "", label: "-- Belum ada panggung terdaftar --" }]
                : events.map(ev => ({ value: ev.id, label: ev.title }))
              }
              placeholder="Pilih Panggung"
            />
          </div>

          {selectedEventId && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 px-3 py-1.5 rounded-xl bg-neutral-900/60 border border-neutral-800 shrink-0">
              <span>Total: <strong className="text-white">{totalInvited}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>Hadir: <strong className="text-green-400">{totalAttending}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>Check-in: <strong className="text-emerald-400">{totalCheckedIn}</strong></span>
            </div>
          )}
        </div>

        {/* Right: Scan QR Ticket Button */}
        {selectedEventId && (
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR Tiket</span>
          </button>
        )}
      </div>

      {/* Main Table Card */}
      {selectedEventId ? (
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Cari nama tamu..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8.5 pl-8 pr-8 bg-black/40 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {statusOptions.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    filterStatus === st
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {currentEventInvitations.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Belum ada tamu yang diundang ke panggung ini.
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Tidak ada tamu yang sesuai dengan filter atau pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                    <th className="py-2.5 px-3">Nama Tamu Undangan</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Status Konfirmasi</th>
                    <th className="py-2.5 px-3 text-right w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40">
                  {filteredInvitations.map((inv, idx) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 text-center text-neutral-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {inv.guests?.name || 'Tamu'}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        {inv.guests?.category || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {getStatusBadge(inv)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleManualToggleCheckIn(inv)}
                          disabled={updatingId === inv.id}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            inv.checked_in
                              ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                          }`}
                        >
                          {updatingId === inv.id ? (
                            '...'
                          ) : inv.checked_in ? (
                            'Batal'
                          ) : (
                            'Check-In'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 border border-neutral-800 bg-neutral-900/40 rounded-2xl text-center text-xs text-neutral-500">
          Silakan tentukan Panggung terlebih dahulu untuk melihat daftar konfirmasi kehadiran tamu.
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
