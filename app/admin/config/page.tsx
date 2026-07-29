'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ConfigTab } from '../tabs/ConfigTab';

export default function ConfigPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
  };

  return <ConfigTab events={events} />;
}
