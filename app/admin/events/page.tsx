'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EventsTab } from '../tabs/EventsTab';
import { Loader } from '../../components/Loader';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader text="Menyiapkan Jadwal Panggung..." />;

  return <EventsTab events={events} fetchData={fetchData} />;
}
