'use client';

import { Plus, Ticket } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';

interface TicketsToolbarProps {
  events: any[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  onAddTier: () => void;
  totalTiers: number;
}

export function TicketsToolbar({
  events,
  selectedEventId,
  setSelectedEventId,
  onAddTier,
  totalTiers,
}: TicketsToolbarProps) {
  const eventOptions = events.map(ev => ({
    value: ev.id,
    label: ev.title,
  }));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide">Kategori Tiket Pementasan</h2>
          <p className="text-[11px] text-neutral-400">
            {totalTiers} kategori tiket terdaftar untuk pementasan ini.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-full sm:w-64">
          <CustomSelect
            value={selectedEventId}
            onChange={setSelectedEventId}
            options={eventOptions}
            placeholder="Pilih Pementasan..."
          />
        </div>

        <button
          type="button"
          onClick={onAddTier}
          disabled={!selectedEventId}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tiket</span>
        </button>
      </div>
    </div>
  );
}
