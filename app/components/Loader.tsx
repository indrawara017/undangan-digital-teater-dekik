'use client';

export function Loader({ text = "Membuka Tirai..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[50vh] w-full text-center animate-in fade-in duration-1000">
      {/* Cinematic glowing interlocking rings */}
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-[1.5px] border-l-[1.5px] border-white/90 animate-[spin_2s_cubic-bezier(0.68,-0.55,0.26,1.55)_infinite] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
        <div className="absolute inset-2 rounded-full border-r-[1.5px] border-b-[1.5px] border-neutral-500/60 animate-[spin_2.5s_cubic-bezier(0.68,-0.55,0.26,1.55)_reverse_infinite]" />
        <div className="absolute inset-4 rounded-full border-t-[1.5px] border-white/30 animate-[spin_3s_linear_infinite]" />
      </div>
      
      {/* Elegant pulsing text */}
      <p className="font-cormorant text-lg md:text-xl text-neutral-300 tracking-[0.2em] animate-pulse">
        {text}
      </p>
    </div>
  );
}

export function FullScreenLoader({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950">
      {/* Ambient Depth for Fullscreen Loader */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
      <Loader text={text} />
    </div>
  );
}
