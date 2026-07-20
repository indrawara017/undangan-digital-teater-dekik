'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DesignTab } from '../tabs/DesignTab';
import { Loader } from '@/app/components/Loader';

export default function DesignPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) {
      setEvents(data);
      if (data.length > 0 && !selectedEventId) setSelectedEventId(data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && events.length === 0) return <Loader text="Memuat Visual & Desain..." />;

  return <DesignTab events={events} selectedEventId={selectedEventId} setSelectedEventId={setSelectedEventId} fetchData={fetchData} />;
}
