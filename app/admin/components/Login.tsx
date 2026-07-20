'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      onLoginSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans text-white">
      <Card className="w-full max-w-md bg-neutral-950 border-neutral-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2 font-cormorant">Teater Dekik</CardTitle>
          <CardDescription>Masuk ke panel manajemen undangan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && <div className="text-red-400 text-sm p-3 bg-red-950/30 rounded-sm border border-red-900/50">{error}</div>}
            <div className="space-y-1">
              <label className="text-xs text-neutral-500 font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="admin@teaterdekik.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-500 font-medium">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="mt-2 w-full" size="lg" disabled={loading}>
              {loading ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
