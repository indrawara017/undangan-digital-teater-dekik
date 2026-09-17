'use client';

import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';

interface EventsToolbarProps {
  events: any[];
  onAddEvent: () => void;
}

export function EventsToolbar({ events, onAddEvent }: EventsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white tracking-wide">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>Jadwal Panggung</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-neutral-900/60 border border-neutral-800 text-xs font-medium text-neutral-400">
          Total: <strong className="text-white ml-0.5">{events.length}</strong> Panggung
        </span>
      </div>

      <Button onClick={onAddEvent} size="sm" className="h-10 shrink-0 shadow-lg px-4 self-start sm:self-auto">
        <Plus className="w-4 h-4 mr-1.5" /> Tambah Panggung
      </Button>
    </div>
  );
}
