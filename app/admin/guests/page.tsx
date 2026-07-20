'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GuestsTab } from '../tabs/GuestsTab';
import { Loader } from '../../components/Loader';

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
    if (data) setGuests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader text="Menarik Daftar Tamu..." />;

  return <GuestsTab guests={guests} fetchData={fetchData} />;
}
