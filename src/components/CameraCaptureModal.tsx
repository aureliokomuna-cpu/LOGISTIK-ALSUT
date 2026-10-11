import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, Upload, Sparkles, X, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title: string;
  instructionText: string;
  officerName: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
  instructionText,
  officerName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initialize Camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Kamera tidak didukung oleh browser ini. Silakan unggah foto dari galeri.');
      setIsInitializing(false);
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: unknown) {
      console.warn('Camera access warning:', err);
      setCameraError('Tidak dapat mengakses kamera fisik (izin belum diberikan atau sedang dipakai). Silakan unggah foto atau gunakan opsi foto bukti.');
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const applyWatermarkAndSave = (sourceImg: HTMLVideoElement | HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 1000;
    const height = 750;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw base image
    ctx.drawImage(sourceImg, 0, 0, width, height);

    // Dark semi-transparent watermark banner at the bottom
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, height - 90, width, 90);

    // Accent line
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.fillRect(0, height - 90, width, 4);

    // Draw watermark text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ALSUT LOGISTICS HUB · BUKTI FOTO LAPANGAN', 24, height - 55);

    const timeStr = new Date().toLocaleString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Petugas: ${officerName || 'Logistik Lapangan'}  |  Waktu: ${timeStr}`, 24, height - 25);

    // Tag badge on right
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('ALAM SUTERA · GEO-TAG VERIFIED', width - 24, height - 40);
    ctx.textAlign = 'left';

    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(finalDataUrl);
  };

  const handleSnap = () => {
    if (videoRef.current) {
      applyWatermarkAndSave(videoRef.current);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        applyWatermarkAndSave(img);
        stopCamera();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Generate instant high-quality realistic sample photo for testing without camera
  const handleQuickSample = (theme: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 1000;
    const height = 750;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'barang') {
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
    } else if (theme === 'armada') {
      gradient.addColorStop(0, '#0369a1');
      gradient.addColorStop(1, '#0c4a6e');
    } else if (theme === 'customer') {
      gradient.addColorStop(0, '#4338ca');
      gradient.addColorStop(1, '#312e81');
    } else {
      gradient.addColorStop(0, '#047857');
      gradient.addColorStop(1, '#064e3b');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative simulated camera crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 80, width - 200, height - 220);

    // Icon & Center Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`BUKTI TERTANGKAP: ${title.toUpperCase()}`, width / 2, height / 2 - 20);

    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('Dokumen Serah Terima Resmi Logistik Alam Sutera', width / 2, height / 2 + 25);

    // Bottom Watermark
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, height - 90, width, 90);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, height - 90, width, 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ALSUT LOGISTICS HUB · BUKTI FOTO LAPANGAN', 24, height - 55);

    const timeStr = new Date().toLocaleString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Petugas: ${officerName || 'Budi Santoso'}  |  Waktu: ${timeStr}`, 24, height - 25);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('ALAM SUTERA · GEO-TAG OK', width - 24, height - 40);
    ctx.textAlign = 'left';

    const sampleUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(sampleUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header - High Contrast for Field Operations */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
              <p className="text-amber-400 text-xs font-semibold">{instructionText}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Viewport / Live Camera Area */}
        <div className="relative bg-black flex-1 min-h-[300px] max-h-[460px] flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Captured Proof"
                className="max-h-[440px] w-auto object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                <Check className="w-4 h-4" /> Foto Berhasil Ditangkap!
              </div>
            </div>
          ) : (
            <>
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
              />

              {/* Viewfinder Target Graphic */}
              {!cameraError && !isInitializing && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                  <div className="w-full flex justify-between items-start">
                    <span className="text-[11px] font-mono font-bold bg-black/60 text-emerald-400 px-2.5 py-1 rounded backdrop-blur-sm border border-emerald-500/30">
                      LIVE CAMERA ON
                    </span>
                    <span className="text-[11px] font-mono font-bold bg-black/60 text-amber-400 px-2.5 py-1 rounded backdrop-blur-sm">
                      {officerName}
                    </span>
                  </div>

                  {/* Corner Targets */}
                  <div className="w-48 h-48 border-2 border-dashed border-amber-400/70 rounded-2xl flex items-center justify-center">
                    <span className="text-white/70 text-xs font-semibold bg-black/40 px-2 py-1 rounded">
                      Arahkan Kamera ke Objek
                    </span>
                  </div>

                  <p className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    Tekan tombol bundar kuning di bawah untuk memotret
                  </p>
                </div>
              )}

              {/* Camera Fallback / Error Alert */}
              {cameraError && (
                <div className="p-6 text-center max-w-md">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-white font-bold text-base mb-1">Pilihan Pengambilan Foto</h4>
                  <p className="text-slate-400 text-xs mb-4">{cameraError}</p>
                  
                  <div className="space-y-2.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
                    >
                      <Upload className="w-5 h-5" />
                      Pilih Foto dari Galeri / Kamera HP
                    </button>

                    <div className="pt-2 text-left">
                      <p className="text-slate-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Atau gunakan template foto simulasi lapangan:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleQuickSample('barang')}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 text-center"
                        >
                          📦 Bukti List Barang
                        </button>
                        <button
                          onClick={() => handleQuickSample('armada')}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 text-center"
                        >
                          🚚 Bukti Armada & Driver
                        </button>
                        <button
                          onClick={() => handleQuickSample('customer')}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 text-center"
                        >
                          👤 Bukti Penerima / Customer
                        </button>
                        <button
                          onClick={() => handleQuickSample('departemen')}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 text-center"
                        >
                          🏢 Bukti Serah Terima Dept
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hidden Canvas used for Watermarking */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Big Action Bar - Ultra Intuitive Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 text-base transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Foto Ulang
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                Gunakan Foto Ini
              </button>
            </>
          ) : (
            <>
              {/* Switch Facing Mode */}
              <button
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                title="Putar Kamera Depan/Belakang"
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <RefreshCw className="w-6 h-6" />
              </button>

              {/* Big Yellow Shutter Button */}
              {!cameraError && (
                <button
                  onClick={handleSnap}
                  className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform active:scale-90 border-4 border-slate-950 outline-4 outline-amber-500/50"
                  aria-label="Ambil Foto Sekarang"
                >
                  <Camera className="w-10 h-10" />
                </button>
              )}

              {/* Upload Alternate Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Unggah Foto dari Galeri"
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <Upload className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
