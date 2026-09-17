'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto w-full bg-neutral-950/80 backdrop-blur-xl border border-neutral-850 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden relative group"
            >
              {/* Subtle top border highlight */}
              <div 
                className={`absolute top-0 inset-x-0 h-[2px] ${
                  toast.type === 'success' 
                    ? 'bg-gradient-to-r from-emerald-500/50 via-emerald-400 to-emerald-500/50' 
                    : 'bg-gradient-to-r from-red-500/50 via-red-400 to-red-500/50'
                }`} 
              />
              
              <div className="p-4 flex items-start gap-3.5">
                <div className="shrink-0 mt-0.5">
                  {toast.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white tracking-wide font-sans leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-neutral-500 hover:text-neutral-200 transition-colors focus:outline-none p-0.5 hover:bg-white/5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (message: string, type: ToastType = 'success') => {
        console.log(`[Toast Fallback - ${type}]: ${message}`);
        if (typeof window !== 'undefined') {
          window.alert(message);
        }
      },
    };
  }
  return context;
};
