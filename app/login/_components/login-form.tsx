'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!username) {
      setErrorMsg("Username tidak boleh kosong");
      setLoading(false);
      return;
    }
    if (!password) {
      setErrorMsg("Password tidak boleh kosong");
      setLoading(false);
      return;
    }
    if (username.includes(' ')) {
      setErrorMsg("Username tidak valid");
      setLoading(false);
      return;
    }

    const dummyEmail = `${username}@teaterdekik.local`;

    const { error } = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
    if (error) {
      setErrorMsg("Username atau password salah");
    } else {
      router.push('/admin/guests');
    }
    setLoading(false);
  };

  return (
    <div className={`flex flex-col gap-6 ${className || ''}`} {...props}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-neutral-950/60 border border-neutral-800 rounded-3xl shadow-3xl overflow-hidden backdrop-blur-md"
      >
        <div className="p-6 md:p-8">
          <div className="text-center mb-6 space-y-1.5">
            <h1 className="text-xl font-semibold text-white tracking-tight">Selamat Datang</h1>
            <p className="text-sm text-neutral-400">
              Masuk ke Undangan Digital Teater Dekik
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs text-center p-3 rounded-xl mb-4"
            >
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white">
                Username
              </label>
              <input
                type="text"
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-black/50 border border-neutral-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">
                  Password
                </label>
                <span className="text-sm text-neutral-500 cursor-not-allowed">
                  Lupa password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-neutral-800 text-white text-sm rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all placeholder:text-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-white text-black hover:bg-neutral-200 font-medium text-sm transition-all flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Masuk"
              )}
            </Button>

          </form>
        </div>
      </motion.div>

      <div className="text-center text-[13px] text-neutral-500 px-6">
        <p className="">
          &copy; {new Date().getFullYear()} Undangan Digital Teater Dekik.
        </p>
        <p className="">
          Development by Indra Wardana.
        </p>
      </div>
    </div>
  );
}
