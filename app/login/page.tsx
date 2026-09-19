'use client';

import Image from 'next/image';
import { LoginForm } from './_components';

export default function LoginPage() {
  return (
    <div className="h-screen h-dvh w-full flex flex-col items-center justify-center bg-black p-4 sm:p-6 md:p-10 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2a2a2a_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#1a1a1a_0%,transparent_60%)]" />
      </div>
      
      <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-6 relative z-10">
        <div className="flex items-center gap-3 self-center text-white">
          <div className="relative w-11 h-11 flex items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10">
            <Image 
              src="/logo.png" 
              alt="Teater Dekik Logo" 
              width={64} 
              height={64} 
              className="object-cover rounded-full"
              priority
            />
          </div>
          <span className="text-xl font-semibold tracking-wide">Teater Dekik</span>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}