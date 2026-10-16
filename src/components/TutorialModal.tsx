import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Truck,
  Building2,
  Camera,
  CheckCircle2,
  Bell,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  ShieldCheck,
  Eye,
  Check,
  Layers,
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'logistik' | 'manager_ps'>('logistik');
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const logistikSteps = [
    {
      step: 1,
      badge: 'Langkah 1: Identitas',
      title: 'Pilih Nama & NIP Petugas (18 Petugas Terdaftar)',
      icon: '👷',
      color: 'amber',
      description:
        'Cukup pilih nama Anda dari 18 daftar petugas logistik yang tersedia. Nama dan NIP otomatis terisi ke dalam sistem tanpa perlu ketik manual!',
      tips: 'Tersedia tombol sentuh 1-klik untuk 18 petugas (Dadan, Elang, Sigit, Jamal, Hafid, Budi, Rian, Saipudin, Mahmud, Hermawan, Fariz, Rozi, Sulaiman, Faraz, Haerul, Asmoro, Anang, Handoko).',
    },
    {
      step: 2,
      badge: 'Langkah 2: Lokasi & Asal',
      title: 'Pilih Asal DC (Jababeka / Cikupa / dll)',
      icon: '🏭',
      color: 'blue',
      description:
        'Tekan salah satu tombol Asal DC: JABABEKA, CIKUPA, CIKANDE, STORE ALSUT, atau pilih STORE LAIN jika dari toko cabang lain.',
      tips: 'Jika memilih STORE LAIN, langsung muncul kolom teks untuk mengetik nama toko secara bebas!',
    },
    {
      step: 3,
      badge: 'Langkah 3: Pengelompokan Departemen',
      title: 'Pilih Departemen (Bisa Lebih dari 1 Departemen)',
      icon: '🏢',
      color: 'amber',
      description:
        'Pilihan 17 departemen langsung terpampang di layar. Anda dapat memilih lebih dari satu departemen sekaligus jika muatan barang campuran (misal: Sofa & Chair + Dining + Bedding). Sentuh departemen untuk menambah / membatalkan.',
      tips: 'Tersedia tombol "Pilih Semua (17)" dan daftar ringkasan departemen terpilih untuk kemudahan pengecekan bersama.',
    },
    {
      step: 4,
      badge: 'Langkah 4: Rincian Barang & Armada',
      title: 'Isi Barang & Pilih Jenis Armada',
      icon: '📦',
      color: 'emerald',
      description:
        'Masukkan nama barang dan jumlah koli/unit. Untuk Barang Keluar, pilihan jenis armada sangat simpel dan praktis, termasuk opsi Kendaraan Pribadi Customer.',
      tips: 'Tersedia pilihan cepat: Kendaraan Pribadi Customer, Blind Van, Truk Engkel, Double, Pickup, hingga Kurir Motor.',
    },
    {
      step: 5,
      badge: 'Langkah 5: Foto & Google Drive',
      title: 'Ambil Foto & Simpan Sesuai Tanggal di Drive',
      icon: '📸',
      color: 'purple',
      description:
        'Ambil foto bukti dengan kamera HP. Nama file foto otomatis diformat sesuai tanggal (YYYY-MM-DD_HHmmss) dan terhubung ke folder Google Drive monitoring.',
      tips: 'Foto otomatis diberi watermark GPS Alam Sutera dan nama petugas, siap disimpan langsung ke Google Drive.',
    },
    {
      step: 6,
      badge: 'Langkah 6: Selesai',
      title: 'Simpan & Auto Notifikasi Terkirim!',
      icon: '🔔',
      color: 'emerald',
      description:
        'Tekan tombol Simpan & Kirim Berita Acara. Notifikasi lonceng dan suara akan otomatis dikirim ke Manager & Tim PS Departemen.',
      tips: 'Anda tidak perlu menelpon tim toko karena sistem sudah otomatis memberi tahu kedatangan barang.',
    },
  ];

  const managerSteps = [
    {
      step: 1,
      badge: 'Pengecekan Departemen',
      title: 'Pilih Kategori Departemen Anda',
      icon: '🏢',
      color: 'blue',
      description:
        'Sebagai tim PS / Departemen, pilih departemen Anda (misal: Dining / Kitchen) untuk melihat kiriman yang baru tiba dari logistik.',
    },
    {
      step: 2,
      badge: 'Verifikasi Fisik',
      title: 'Periksa Bukti Foto & Serah Terima',
      icon: '🔍',
      color: 'amber',
      description:
        'Klik detail kegiatan untuk melihat foto bukti barang masuk, plat armada, dan nama petugas logistik yang mengantar.',
    },
    {
      step: 3,
      badge: 'Konfirmasi Penerimaan',
      title: 'Validasi & Berikan Tanda Tangan',
      icon: '✍️',
      color: 'emerald',
      description:
        'Pilih status "Sesuai Lengkap" atau "Ada Catatan", lalu simpan tanda tangan digital untuk verifikasi resmi.',
    },
    {
      step: 4,
      badge: 'Laporan Harian PDF',
      title: 'Download Rekap PDF Harian',
      icon: '📄',
      color: 'purple',
      description:
        'Manager dapat mengunduh laporan PDF harian siap cetak yang mencantumkan rekap barang masuk, barang keluar, armada, dan audit logistik.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-3 sm:p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              💡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-lg tracking-tight text-white">
                  Panduan Penggunaan Aplikasi
                </h3>
                <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Alsut Logistics
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
                Petunjuk praktis untuk Petugas Logistik Lapangan & Tim Departemen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-colors"
            title="Tutup Panduan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Role Switcher */}
        <div className="bg-slate-100 p-1.5 sm:p-2 border-b border-slate-200 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('logistik');
              setActiveStep(0);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'logistik'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">👷</span>
            <span>Tutorial Tim Logistik (Eksekutor)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manager_ps');
              setActiveStep(0);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manager_ps'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">🏢</span>
            <span>Tutorial Manager & Tim PS</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
          {activeTab === 'logistik' ? (
            <div>
              {/* Stepper Progress Indicator */}
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600">
                <span className="text-amber-800 uppercase tracking-wide">
                  Langkah {activeStep + 1} dari {logistikSteps.length}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {logistikSteps[activeStep].badge}
                </span>
              </div>

              {/* Step Dots */}
              <div className="grid grid-cols-6 gap-1 mb-3">
                {logistikSteps.map((s, idx) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeStep === idx
                        ? 'bg-amber-500 shadow-xs ring-2 ring-amber-300'
                        : activeStep > idx
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                    title={s.title}
                  />
                ))}
              </div>

              {/* Main Card for Active Step */}
              <div className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
                    {logistikSteps[activeStep].icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded">
                      {logistikSteps[activeStep].badge}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-950 mt-1 leading-snug">
                      {logistikSteps[activeStep].title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed">
                      {logistikSteps[activeStep].description}
                    </p>
                  </div>
                </div>

                {/* Useful Pro-Tip */}
                <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-950 font-semibold">
                  <span className="text-base">💡</span>
                  <span>{logistikSteps[activeStep].tips}</span>
                </div>
              </div>

              {/* Quick Navigation between steps */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activeStep === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </button>

                {activeStep < logistikSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.min(logistikSteps.length - 1, prev + 1))}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    Selanjutnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Saya Mengerti & Siap Pakai
                  </button>
                )}
              </div>

              {/* All Steps Quick Summary */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <h5 className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-2">
                  Daftar Alur Kegiatan Singkat:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {logistikSteps.map((s, idx) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        activeStep === idx
                          ? 'bg-amber-100 border-amber-400 font-black'
                          : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{s.icon}</span>
                        <div className="min-w-0">
                          <span className="text-[9px] text-slate-400 block font-bold leading-none">
                            Step {s.step}
                          </span>
                          <span className="text-[10px] font-bold truncate block">{s.title}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Manager & PS Guide */
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shrink-0">
                  🏢
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-950">
                    Alur Kerja Tim Monitoring & PS Toko
                  </h4>
                  <p className="text-xs text-blue-800">
                    Sistem ini terhubung secara real-time. Setiap kali logistik submit kegiatan, notifikasi akan langsung berdering!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {managerSteps.map((s) => (
                  <div
                    key={s.step}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center text-lg shrink-0">
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black text-slate-900">{s.title}</h5>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          {s.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>💡</span>
            <span>Anda dapat membuka tutorial ini kapan saja lewat tombol bantuan di atas.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
