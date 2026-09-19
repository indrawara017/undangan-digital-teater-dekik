'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: any[];
  onCheckIn: (invitationId: string) => Promise<{ success: boolean; message: string; guestName?: string; category?: string; alreadyCheckedIn?: boolean }>;
}

export function QRScannerModal({ isOpen, onClose, invitations, onCheckIn }: QRScannerModalProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    subtitle?: string;
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      // Wait for DOM to render container
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const startScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Preferred back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanDecoded,
        () => {
          // ignore scan frame errors
        }
      );
      setScannerActive(true);
    } catch (err: any) {
      console.error('Kamera gagal diakses:', err);
      setScanResult({
        type: 'error',
        title: 'Kamera Tidak Dapat Diberikan Akses',
        subtitle: 'Pastikan Anda telah memberikan izin kamera pada peramban/HP Anda.',
      });
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScannerActive(false);
  };

  const onScanDecoded = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      let invitationId = decodedText.trim();
      
      // Support JSON payload or raw invitation ID
      if (decodedText.startsWith('{')) {
        try {
          const parsed = JSON.parse(decodedText);
          invitationId = parsed.qr_hash || parsed.ticket_code || parsed.invId || parsed.id || decodedText;
        } catch (e) {
          // fallback to raw text
        }
      }

      const res = await onCheckIn(invitationId);
      
      if (res.success) {
        if (res.alreadyCheckedIn) {
          setScanResult({
            type: 'warning',
            title: `Tamu Sudah Check-In!`,
            subtitle: `${res.guestName || 'Tamu'} (${res.category || 'Umum'}) - Tiket sudah pernah di-scan sebelumnya.`,
          });
        } else {
          setScanResult({
            type: 'success',
            title: `CHECK-IN BERHASIL!`,
            subtitle: `Selamat datang, ${res.guestName || 'Tamu'} (${res.category || 'Umum'})`,
          });
        }
      } else {
        setScanResult({
          type: 'error',
          title: `Tiket Tidak Valid / Tidak Ditemukan`,
          subtitle: res.message || 'QR Code tidak terdaftar dalam database event ini.',
        });
      }
    } catch (err: any) {
      setScanResult({
        type: 'error',
        title: `Gagal Memproses Tiket`,
        subtitle: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      // Pause scanner briefly so visual result can be read clearly
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-white">Pemindai E-Tiket QR</h3>
            </div>
            <button
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner Body */}
          <div className="p-6 flex flex-col items-center justify-center relative min-h-[320px]">
            {/* Target Reader Viewport */}
            <div className="w-full max-w-[280px] overflow-hidden rounded-xl border-2 border-neutral-800 bg-black relative shadow-inner">
              <div id={scannerContainerId} className="w-full h-full" />
            </div>

            <p className="text-xs text-neutral-400 mt-4 text-center">
              Arahkan kamera HP ke QR Code pada E-Tiket tamu untuk check-in.
            </p>

            {/* SILENT VISUAL NOTIFICATION OVERLAY (TANPA BUNYI) */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 w-full p-4 rounded-xl border text-center flex flex-col items-center gap-2 shadow-2xl transition-all ${
                    scanResult.type === 'success'
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                      : scanResult.type === 'warning'
                      ? 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                      : 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {scanResult.type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />}
                    {scanResult.type === 'warning' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                    {scanResult.type === 'error' && <XCircle className="w-6 h-6 text-rose-400" />}
                    <span className="font-bold text-sm uppercase tracking-wider">{scanResult.title}</span>
                  </div>
                  {scanResult.subtitle && (
                    <p className="text-xs opacity-90 font-light">{scanResult.subtitle}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-900/40 flex justify-between items-center text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Scanner Aktif (Hening)
            </span>
            <button
              onClick={() => {
                setScanResult(null);
                startScanner();
              }}
              className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset View
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
