'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DistributionTab } from '../tabs/DistributionTab';
import { Loader } from '@/app/components/Loader';

export default function DistributionPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [eRes, gRes, iRes] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('created_at', { ascending: false }),
      supabase.from('invitations').select('*, guests(*)').order('created_at', { ascending: false })
    ]);
    if (eRes.data) {
      setEvents(eRes.data);
      if (eRes.data.length > 0 && !selectedEventId) setSelectedEventId(eRes.data[0].id);
    }
    if (gRes.data) setGuests(gRes.data);
    if (iRes.data) setInvitations(iRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader text="Menyiapkan Distribusi Undangan..." />;

  return (
    <DistributionTab 
      events={events} 
      guests={guests} 
      invitations={invitations} 
      selectedEventId={selectedEventId} 
      setSelectedEventId={setSelectedEventId} 
      fetchData={fetchData} 
    />
  );
}
