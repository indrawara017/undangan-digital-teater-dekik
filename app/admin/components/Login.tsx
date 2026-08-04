'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, Theater, Eye, EyeOff } from 'lucide-react';

export function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/assets/global/app-logo.png`;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });
      if (error) {
        setError(error.message);
      } else {
        // Melakukan auto-login langsung setelah registrasi berhasil
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) {
          // Jika gagal auto-login (misal karena konfirmasi email masih aktif di Supabase), tampilkan pesan verifikasi
          setError('Registrasi berhasil. Silakan cek email Anda untuk verifikasi atau aktifkan login tanpa verifikasi di Supabase.');
        } else {
          onLoginSuccess();
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        onLoginSuccess();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2a2a2a_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#1a1a1a_0%,transparent_50%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center rounded-2xl shadow-inner overflow-hidden p-2">
                {!logoError ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo Teater" 
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Theater className="w-8 h-8 text-neutral-300" />
                )}
              </div>
            </div>
            
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-cormorant font-medium mb-2 tracking-wide">Teater Dekik</h1>
              <p className="text-sm text-neutral-400 font-light">
                {isRegister ? 'Daftar Akun Admin Baru' : 'Masuk ke Panel Manajemen Undangan'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="flex flex-col gap-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-400 text-xs p-4 bg-red-950/30 rounded-lg border border-red-900/50 text-center"
                >
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Alamat Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full bg-neutral-900/50 border border-neutral-800 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-all placeholder:text-neutral-600"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Kata Sandi" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="w-full bg-neutral-900/50 border border-neutral-800 text-white text-sm rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-all placeholder:text-neutral-600"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 mt-2 rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold tracking-wide text-sm transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    {isRegister ? 'Mendaftarkan...' : 'Memeriksa Akses...'}
                  </span>
                ) : (
                  <>
                    {isRegister ? 'Daftar Akun' : 'Masuk ke Dasbor'}
                    <KeyRound className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </Button>
              
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {isRegister 
                    ? 'Sudah punya akun? Masuk di sini' 
                    : 'Belum punya akun? Daftar di sini'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-neutral-900/40 p-4 text-center border-t border-neutral-800/50">
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
              Restricted Area • Admin Only
            </p>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="mt-8 text-center text-xs text-neutral-600 font-medium tracking-wide">
          <p>&copy; {new Date().getFullYear()} Undangan Digital Teater Dekik.</p>
          <p className="mt-1 opacity-70">Development by Indra Wardana.</p>
        </div>
      </motion.div>
    </div>
  );
}
