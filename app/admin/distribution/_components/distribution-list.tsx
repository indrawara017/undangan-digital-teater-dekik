'use client';

import { Link2, MessageCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';

interface DistributionListProps {
  displayedGuests: any[];
  invitedGuestIds: string[];
  onCopyLink: (guest: any) => void;
  onSendWA: (guest: any) => void;
}

export function DistributionList({
  displayedGuests,
  invitedGuestIds,
  onCopyLink,
  onSendWA
}: DistributionListProps) {
  return (
    <div className="max-h-[600px] overflow-y-auto divide-y divide-neutral-800/50 custom-scrollbar">
      {displayedGuests.length === 0 && (
        <div className="p-12 text-center text-neutral-500">Belum ada data tamu untuk kategori ini.</div>
      )}
      {displayedGuests.map(g => {
        const isInvited = invitedGuestIds.includes(g.id);
        return (
          <div key={g.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-neutral-800/30 transition-colors gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${isInvited ? 'text-white' : 'text-neutral-300'}`}>{g.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 border border-neutral-700 rounded bg-neutral-900 text-neutral-400 font-medium tracking-wider uppercase">
                    {g.category || 'Umum'}
                  </span>
                  {isInvited && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-white text-black font-bold tracking-widest uppercase">
                      Terkirim
                    </span>
                  )}
                </div>
                {g.whatsapp && <p className="text-xs text-neutral-500 mt-1 font-mono">WA: {g.whatsapp}</p>}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 pl-0">
              <Button variant="outline" size="sm" onClick={() => onCopyLink(g)} className="h-8 border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300">
                <Link2 className="w-3.5 h-3.5 mr-1.5" /> Salin Link
              </Button>
              {g.whatsapp && (
                <Button 
                  className="bg-green-950/40 text-green-400 border border-green-900/50 hover:bg-green-900/80 h-8 text-xs font-medium" 
                  size="sm"
                  onClick={() => onSendWA(g)}
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Kirim WA
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}
