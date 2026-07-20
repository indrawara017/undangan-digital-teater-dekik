'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { useRouter } from 'next/navigation';
import { FullScreenLoader } from '../components/Loader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/admin');
  };

  if (loading) return <FullScreenLoader text="Mempersiapkan Akses Admin..." />;

  if (!session) {
    return <Login onLoginSuccess={checkSession} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 flex flex-col pt-32 pb-16 relative">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
