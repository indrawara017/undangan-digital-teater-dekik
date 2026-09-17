'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RSVPView } from './_components/RSVPView';
import { Loader } from '@/app/components/Loader';

export default function RSVPPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [eRes, iRes] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('invitations').select('*, guests(*)').order('created_at', { ascending: false })
      ]);
      if (eRes.data) {
        setEvents(eRes.data);
        if (eRes.data.length > 0 && !selectedEventId) setSelectedEventId(eRes.data[0].id);
      }
      if (iRes.data) setInvitations(iRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Menarik Daftar Buku Tamu..." />;

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <RSVPView 
        events={events} 
        invitations={invitations} 
        selectedEventId={selectedEventId} 
        setSelectedEventId={setSelectedEventId} 
      />
    </div>
  );
}
