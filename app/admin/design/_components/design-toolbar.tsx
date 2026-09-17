'use client';

import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { CustomSelect } from '@/app/components/CustomSelect';

interface DesignToolbarProps {
  events: any[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
}

export function DesignToolbar({ events, selectedEventId, setSelectedEventId }: DesignToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Selector and Badge Counter */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-white tracking-wide shrink-0">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>Pilih Panggung:</span>
        </div>
        
        <div className="relative w-full sm:w-72">
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
      </div>

      {/* Right: Preview Button */}
      {selectedEventId && (
        <Button 
          variant="outline"
          className="h-10 shrink-0 px-4 bg-neutral-900/60 hover:bg-white text-white hover:text-black border border-neutral-800 hover:border-white transition-all shadow-lg rounded-lg text-sm self-start sm:self-auto"
          onClick={() => window.open(`/preview?event=${selectedEventId}`, '_blank')}
        >
          <Eye className="w-4 h-4 mr-1.5" /> Preview Undangan
        </Button>
      )}
    </div>
  );
}
