import React, { useState } from 'react';
import {
  LogisticsOfficer,
  FleetVehicle,
  LogisticsActivity,
  ActivityType,
  ActivityItem,
  ActivityPhotos,
} from '../types/logistics';
import { DEPARTMENTS, DC_OPTIONS } from '../data/initialData';
import {
  GOOGLE_DRIVE_FOLDER_URL,
  generateDriveFileName,
  downloadPhotoWithDriveName,
  formatTimestampForDrive,
} from '../utils/driveUtils';
import { CameraCaptureModal } from './CameraCaptureModal';
import { SignatureModal } from './SignatureModal';
import {
  Inbox,
  Send,
  Building2,
  Camera,
  CheckCircle2,
  User,
  Truck,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  FileText,
  Calendar,
  AlertCircle,
  PenTool,
  Check,
  HelpCircle,
  FolderUp,
  ExternalLink,
  Download,
  Globe,
  Radio,
} from 'lucide-react';

interface LogisticsFieldViewProps {
  activeOfficer: LogisticsOfficer;
  officers: LogisticsOfficer[];
  onSelectOfficer: (officer: LogisticsOfficer) => void;
  fleets: FleetVehicle[];
  onSubmitActivity: (activity: LogisticsActivity) => void;
  recentActivities: LogisticsActivity[];
  onViewActivityDetail: (activityId: string) => void;
  onOpenTutorial?: () => void;
}

export const LogisticsFieldView: React.FC<LogisticsFieldViewProps> = ({
  activeOfficer,
  officers,
  onSelectOfficer,
  fleets,
  onSubmitActivity,
  recentActivities,
  onViewActivityDetail,
  onOpenTutorial,
}) => {
  // Wizard Modal state
  const [activeType, setActiveType] = useState<ActivityType | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [targetDepartment, setTargetDepartment] = useState(DEPARTMENTS[0]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientSignature, setRecipientSignature] = useState<string | undefined>(undefined);
  const [selectedFleetId, setSelectedFleetId] = useState<string>(fleets[0]?.id || '');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Barang Lengkap', 'Kondisi Segel Utuh']);

  // Dynamic Items list
  const [items, setItems] = useState<ActivityItem[]>([
    { id: '1', name: '', qty: 1, unit: 'Unit', notes: '' },
  ]);

  // Photos collection
  const [photos, setPhotos] = useState<ActivityPhotos>({});

  // Active Camera Capture Target
  const [cameraTarget, setCameraTarget] = useState<{
    key: keyof ActivityPhotos;
    title: string;
    instruction: string;
  } | null>(null);

  // Signature Modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Quick preset tags
  const QUICK_TAGS = [
    'Barang Lengkap',
    'Kondisi Segel Utuh',
    'Packing Kayu Aman',
    'Siap Display',
    'Muatan Terikat Rapi',
    'Prioritas Cepat',
  ];

  // Filter for activities and Unified System view
  const [filterMyDept, setFilterMyDept] = useState<string>('all');
  const [filterDc, setFilterDc] = useState<string>('all');
  const [systemViewScope, setSystemViewScope] = useState<'all' | 'mine'>('all');

  // Asal DC state (JABABEKA, CIKUPA, CIKANDE, STORE ALSUT, STORE LAIN)
  const [selectedDc, setSelectedDc] = useState<string>('JABABEKA');
  const [customDc, setCustomDc] = useState<string>('');

  // Explicit Officer State for this task/activity (By Ketikan Langsung: Dikosongkan agar petugas isi sendiri tanpa ribet hapus)
  const [taskOfficerName, setTaskOfficerName] = useState<string>('');
  const [taskOfficerNip, setTaskOfficerNip] = useState<string>('');
  const [taskOfficerId, setTaskOfficerId] = useState<string>('');

  const handleStartTask = (type: ActivityType) => {
    setActiveType(type);
    setCurrentStep(1);
    setPhotos({});
    setRecipientSignature(undefined);
    setNotes('');
    
    // Nama logistik kosongkan saja agar mereka yang isi sendiri langsung tanpa hapus teks
    setTaskOfficerName('');
    setTaskOfficerNip('');
    setTaskOfficerId('');
    setSelectedDc('JABABEKA');
    setCustomDc('');

    // Semua kolom isian menggunakan nilai bersih (placeholder akan memberi contoh tanpa harus dihapus)
    setRecipientName('');
    setRecipientPhone('');
    setDestinationLocation('');
    setItems([{ id: '1', name: '', qty: 1, unit: 'Unit', notes: '' }]);

    if (type === 'barang_masuk') {
      setTitle('Penerimaan Barang Masuk');
      setTargetDepartment(DEPARTMENTS[0]); // 'Sofa & Chair'
    } else if (type === 'barang_keluar') {
      setTitle('Pengiriman Dispatch Customer');
      setTargetDepartment(DEPARTMENTS[8]); // 'Dining'
    } else {
      setTitle('Serah Terima Internal Departemen');
      setTargetDepartment(DEPARTMENTS[0]); // 'Sofa & Chair'
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', qty: 1, unit: 'Unit' },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: keyof ActivityItem, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFinalSubmit = () => {
    if (!activeType) return;

    // Filter valid items
    const validItems = items.filter((it) => it.name.trim() !== '');
    if (validItems.length === 0) {
      validItems.push({ id: '1', name: 'Paket Logistik Standar', qty: 1, unit: 'Koli' });
    }

    const selectedFleet = fleets.find((f) => f.id === selectedFleetId);

    // Resolve DC Origin for barang masuk & barang keluar
    const resolvedDc =
      activeType === 'barang_masuk' || activeType === 'barang_keluar'
        ? selectedDc === 'STORE LAIN'
          ? customDc.trim() || 'STORE LAIN'
          : selectedDc
        : undefined;

    // Explicit Officer Resolution (By Ketikan: Nama & NIP)
    const resolvedOfficerName = taskOfficerName.trim() || activeOfficer.name;
    const resolvedNip = taskOfficerNip.trim() || activeOfficer.badgeNumber || 'LOG-001';
    const matchedOfficer = officers.find(
      (o) => o.name.toLowerCase() === resolvedOfficerName.toLowerCase() || o.id === taskOfficerId
    );
    const resolvedId = matchedOfficer?.id || taskOfficerId || activeOfficer.id;

    // Sync active officer if changed
    if (matchedOfficer && matchedOfficer.id !== activeOfficer.id) {
      onSelectOfficer(matchedOfficer);
    }

    const newActivity: LogisticsActivity = {
      id: `act-${Date.now()}`,
      trackingCode: `ALS-${activeType === 'barang_masuk' ? 'IN' : activeType === 'barang_keluar' ? 'OUT' : 'DEPT'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      type: activeType,
      title: title || 'Aktivitas Logistik Lapangan',
      timestamp: new Date().toISOString(),
      officerId: resolvedId,
      officerName: resolvedOfficerName, // MANDATORY: Nama Petugas Logistik (By Ketikan)
      officerBadge: resolvedNip,       // NIP Logistik (By Ketikan)
      dcOrigin: resolvedDc,
      targetDepartment: targetDepartment || DEPARTMENTS[0],
      recipientName: recipientName.trim() || undefined,
      recipientPhone: recipientPhone.trim() || undefined,
      recipientSignature,
      fleetId: activeType === 'barang_keluar' ? selectedFleet?.id : undefined,
      fleetPlate: activeType === 'barang_keluar' ? selectedFleet?.plateNumber : undefined,
      fleetName: activeType === 'barang_keluar' ? selectedFleet?.name : undefined,
      driverName: activeType === 'barang_keluar' ? selectedFleet?.driverName : undefined,
      destinationLocation: destinationLocation.trim() || undefined,
      items: validItems,
      photos,
      quickTags: selectedTags,
      notes,
      status: activeType === 'barang_keluar' ? 'delivered_to_customer' : 'pending_dept_check',
    };

    onSubmitActivity(newActivity);
    setActiveType(null);
  };

  // Filter activities: Unified System (Semua Input Terhubung dalam Satu Sistem) or Officer's own
  const displayedActivities = recentActivities
    .filter((a) => {
      if (systemViewScope === 'mine') {
        const myName = (taskOfficerName || activeOfficer.name).trim().toLowerCase();
        return (
          a.officerName.toLowerCase().includes(myName) ||
          a.officerId === activeOfficer.id
        );
      }
      return true; // Default 'all': Semua terhubung dalam satu sistem terpadu
    })
    .filter((a) => (filterMyDept === 'all' ? true : a.targetDepartment === filterMyDept))
    .filter((a) => (filterDc === 'all' ? true : a.dcOrigin === filterDc));

  const myActivities = recentActivities.filter(
    (a) =>
      a.officerName.toLowerCase() === activeOfficer.name.toLowerCase() ||
      a.officerId === activeOfficer.id
  );

  return (
    <div className="max-w-5xl mx-auto px-2.5 sm:px-4 py-2 sm:py-5 space-y-2.5 sm:space-y-4">
      {/* 1. Identity & Officer Header Banner (Ultra Compact on mobile, no wasted vertical scroll) */}
      <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-white shadow-sm border border-slate-700/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base sm:text-xl shadow-sm shrink-0">
            👷
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-black text-white truncate">{activeOfficer.name}</span>
              <span className="text-[9px] sm:text-[10px] bg-slate-800 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono shrink-0">
                {activeOfficer.badgeNumber}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
              NIP: <span className="font-mono text-amber-300 font-bold">{activeOfficer.badgeNumber}</span> · <span className="text-emerald-400 font-semibold">Aktif Melayani</span>
            </p>
          </div>
        </div>

        {/* Change Officer Switcher (Inline Compact) */}
        <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl shrink-0">
          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <div className="text-left">
            <label className="text-[8px] text-slate-400 block font-medium leading-none hidden sm:block">Ganti:</label>
            <select
              value={activeOfficer.id}
              onChange={(e) => {
                const found = officers.find((o) => o.id === e.target.value);
                if (found) {
                  onSelectOfficer(found);
                  setTaskOfficerName(found.name);
                  setTaskOfficerNip(found.badgeNumber);
                  setTaskOfficerId(found.id);
                }
              }}
              className="bg-transparent text-amber-300 sm:text-white font-bold text-[11px] sm:text-xs focus:outline-none cursor-pointer max-w-[95px] sm:max-w-none truncate block"
              title="Ganti Petugas Logistik"
            >
              {officers.map((o) => (
                <option key={o.id} value={o.id} className="bg-slate-900 text-white">
                  {o.name} ({o.badgeNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Big Action Buttons - Compact Viewport Height on Mobile (No scrolling required) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
          <div>
            <h3 className="text-xs sm:text-base font-black text-slate-900 tracking-tight">PILIH TUGAS LOGISTIK</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
              Tekan salah satu tombol di bawah untuk mencatat serah terima & foto:
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="text-[9px] sm:text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 active:scale-95 px-2 sm:px-2.5 py-1 rounded-lg border border-amber-500 shadow-2xs flex items-center gap-1 transition-all"
                title="Buka Tutorial & Panduan Penggunaan"
              >
                <span>💡</span>
                <span>Tutorial Cara Pakai</span>
              </button>
            )}
            <span className="text-[9px] sm:text-xs font-bold text-amber-800 bg-amber-100 px-2 sm:px-2.5 py-0.5 rounded-full hidden sm:inline">
              Sentuh Layar Untuk Mulai
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {/* ACTION 1: BARANG MASUK */}
          <button
            onClick={() => handleStartTask('barang_masuk')}
            className="group relative bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center sm:text-left shadow-sm sm:shadow-md transition-all border-2 border-emerald-500 flex flex-col justify-between items-center sm:items-start min-h-[76px] sm:min-h-[175px]"
          >
            <div className="flex items-center sm:items-start justify-between w-full">
              <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner mx-auto sm:mx-0">
                <Inbox className="w-4 h-4 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-950/40 text-emerald-200 px-1.5 py-0.2 rounded hidden sm:inline">
                INBOUND
              </span>
            </div>

            <div className="mt-1 sm:mt-3 w-full">
              <h4 className="text-[11px] sm:text-xl font-black leading-tight">1. MASUK</h4>
              <p className="text-xs text-emerald-100 font-medium mt-0.5 hidden sm:block">
                Foto surat jalan & foto kondisi barang diterima dari supplier.
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-white/20 w-full hidden sm:flex items-center justify-between text-xs font-bold">
              <span>Ambil Foto Masuk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* ACTION 2: BARANG KELUAR */}
          <button
            onClick={() => handleStartTask('barang_keluar')}
            className="group relative bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center sm:text-left shadow-sm sm:shadow-md transition-all border-2 border-blue-500 flex flex-col justify-between items-center sm:items-start min-h-[76px] sm:min-h-[175px]"
          >
            <div className="flex items-center sm:items-start justify-between w-full">
              <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner mx-auto sm:mx-0">
                <Send className="w-4 h-4 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-blue-950/40 text-blue-200 px-1.5 py-0.2 rounded hidden sm:inline">
                DISPATCH
              </span>
            </div>

            <div className="mt-1 sm:mt-3 w-full">
              <h4 className="text-[11px] sm:text-xl font-black leading-tight">2. KELUAR</h4>
              <p className="text-xs text-blue-100 font-medium mt-0.5 hidden sm:block">
                Foto list keluar, foto armada pembawa, dan foto customer.
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-white/20 w-full hidden sm:flex items-center justify-between text-xs font-bold">
              <span>Foto Armada & Customer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* ACTION 3: SERAH TERIMA DEPARTEMEN */}
          <button
            onClick={() => handleStartTask('serah_terima_departemen')}
            className="group relative bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center sm:text-left shadow-sm sm:shadow-md transition-all border-2 border-amber-400 flex flex-col justify-between items-center sm:items-start min-h-[76px] sm:min-h-[175px]"
          >
            <div className="flex items-center sm:items-start justify-between w-full">
              <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-black/10 backdrop-blur-xs flex items-center justify-center text-slate-950 shadow-inner mx-auto sm:mx-0">
                <Building2 className="w-4 h-4 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-amber-950/20 text-slate-950 px-1.5 py-0.2 rounded hidden sm:inline">
                INTERNAL
              </span>
            </div>

            <div className="mt-1 sm:mt-3 w-full">
              <h4 className="text-[11px] sm:text-xl font-black leading-tight">3. KE DEPT</h4>
              <p className="text-xs text-slate-800 font-medium mt-0.5 hidden sm:block">
                Foto serah terima fisik barang ke staf departemen toko.
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-950/20 w-full hidden sm:flex items-center justify-between text-xs font-bold text-slate-950">
              <span>Serahkan ke Tim PS</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. Wizard Modal for Guided Execution */}
      {activeType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header (Compact) */}
            <div className="p-2.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  {activeType === 'barang_masuk' && <Inbox className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {activeType === 'barang_keluar' && <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
                  {activeType === 'serah_terima_departemen' && <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-lg text-white leading-tight">
                    {activeType === 'barang_masuk' && 'Penerimaan Barang Masuk'}
                    {activeType === 'barang_keluar' && 'Pengiriman Dispatch Customer'}
                    {activeType === 'serah_terima_departemen' && 'Serah Terima ke Departemen'}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-amber-400 font-semibold">
                    Petugas: {taskOfficerName} (NIP: {taskOfficerNip})
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveType(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stepper Bar (Compact) */}
            <div className="px-3 py-1.5 sm:py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-1.5 ${
                    currentStep === 1 ? 'text-amber-800 font-black' : 'text-slate-500'
                  }`}
                >
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 1 ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    1
                  </span>
                  Data & Petugas
                </button>
                <span>→</span>
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`flex items-center gap-1.5 ${
                    currentStep === 2 ? 'text-amber-800 font-black' : 'text-slate-500'
                  }`}
                >
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === 2 ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    2
                  </span>
                  Ambil Foto Wajib
                </button>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-500">Langkah {currentStep} dari 2</span>
            </div>

            {/* Modal Body (Compact spacing so no long scroll) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-3.5">
              {currentStep === 1 ? (
                <>
                  {/* SEKSI PENGISIAN PETUGAS LOGISTIK (HANYA 2 KOLOM KETIKAN: NAMA & NIP, TANPA SHIFT, KOSONGKAN AWAL) */}
                  <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-2 sm:p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] sm:text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        PENGISIAN PETUGAS LOGISTIK (KETIK NAMA & NIP):
                      </label>
                      <span className="text-[9px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                        2 Kolom Bersih
                      </span>
                    </div>

                    {/* 2 Kolom Berdampingan (Nama & NIP - Hemat Tempat di Layar HP) */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Kolom 1: Nama Petugas (By Ketikan - Kosong Langsung Ketik) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5 truncate">
                          1. Nama Logistik:
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Budi Santoso / Agus..."
                          value={taskOfficerName}
                          onChange={(e) => setTaskOfficerName(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                        />
                      </div>

                      {/* Kolom 2: NIP Petugas (By Ketikan - Kosong Langsung Ketik) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5 truncate">
                          2. NIP Logistik:
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: LOG-001..."
                          value={taskOfficerNip}
                          onChange={(e) => setTaskOfficerNip(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Quick fill chip from profile (optional) & Stempel Tracking Preview */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-slate-800 bg-white/90 px-2 py-0.5 rounded border border-amber-200 truncate">
                        <span className="shrink-0">📌 Stempel Berita Acara:</span>
                        <strong className="text-amber-900 truncate">{taskOfficerName || '(Ketik nama Anda)'}</strong>
                        <span className="font-mono text-slate-600 shrink-0">· NIP: {taskOfficerNip || '-'}</span>
                      </div>

                      {activeOfficer?.name && (
                        <button
                          type="button"
                          onClick={() => {
                            setTaskOfficerName(activeOfficer.name);
                            setTaskOfficerNip(activeOfficer.badgeNumber);
                          }}
                          className="text-[9px] text-amber-800 hover:text-amber-950 hover:underline font-bold self-start sm:self-auto"
                        >
                          ⚡ Isi cepat profil ({activeOfficer.name})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SEKSI 1: ASAL DC (JABABEKA, CIKUPA, CIKANDE, STORE ALSUT, STORE LAIN) */}
                  {(activeType === 'barang_masuk' || activeType === 'barang_keluar') && (
                    <div className="p-2 sm:p-2.5 bg-blue-50/80 border border-blue-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] sm:text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                          <Truck className="w-3.5 h-3.5 text-blue-700" />
                          ASAL DC:
                        </label>
                        <span className="text-[9px] font-extrabold bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-mono">
                          Pilih Asal DC
                        </span>
                      </div>

                      {/* 5 Tombol Pilihan DC: JABABEKA, CIKUPA, CIKANDE, STORE ALSUT, STORE LAIN */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {DC_OPTIONS.map((dc) => {
                          const isSelected = selectedDc === dc;
                          return (
                            <button
                              key={dc}
                              type="button"
                              onClick={() => setSelectedDc(dc)}
                              className={`p-1.5 sm:p-2 rounded-lg text-center transition-all border flex flex-col items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300 font-black'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 font-bold'
                              }`}
                            >
                              <span className="text-xs sm:text-sm">
                                {dc === 'STORE ALSUT' ? '🏢' : dc === 'STORE LAIN' ? '🏬' : '🏭'}
                              </span>
                              <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5">{dc}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Jika STORE LAIN dipilih -> Muncul kolom ketik sendiri */}
                      {selectedDc === 'STORE LAIN' && (
                        <div className="pt-1 animate-in fade-in duration-150">
                          <label className="text-[10px] font-bold text-blue-950 block mb-0.5">
                            ✍️ Isi Nama Store Lain / DC Sendiri:
                          </label>
                          <input
                            type="text"
                            placeholder="Ketik nama store / DC (cth: STORE KELAPA GADING / DC BOGOR)..."
                            value={customDc}
                            onChange={(e) => setCustomDc(e.target.value)}
                            className="w-full p-2 bg-white border border-blue-400 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                            autoFocus
                          />
                        </div>
                      )}

                      {/* Indikator Terpilih */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-950 bg-white/90 px-2 py-0.5 rounded border border-blue-200">
                        <span>📍 Asal DC Terpilih:</span>
                        <strong className="text-blue-800">
                          {selectedDc === 'STORE LAIN' ? (customDc.trim() ? customDc : '(Ketik nama store)') : selectedDc}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* SEKSI 2: BARANG DEPARTEMEN (PILIHAN LANGSUNG MUNCUL 17 DEPARTEMEN) */}
                  <div className="p-2 sm:p-2.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] sm:text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                        <Building2 className="w-3.5 h-3.5 text-amber-700" />
                        BARANG DEPARTEMEN:
                      </label>
                      <span className="text-[9px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono truncate max-w-[150px]">
                        Terpilih: {targetDepartment}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium">
                      Pilihan 17 departemen langsung muncul di bawah, sentuh salah satu kategori:
                    </p>

                    {/* 17 Departemen Langsung Muncul di Layar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 sm:max-h-56 overflow-y-auto pr-0.5">
                      {DEPARTMENTS.map((dept) => {
                        const isSelected = targetDepartment === dept;
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => setTargetDepartment(dept)}
                            className={`p-1.5 sm:p-2 rounded-lg text-left text-[11px] sm:text-xs transition-all border flex items-center justify-between gap-1 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs ring-2 ring-amber-300 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/70 hover:border-amber-300 font-bold'
                            }`}
                          >
                            <span className="truncate">{dept}</span>
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer / Destination Info when Barang Keluar */}
                  {activeType === 'barang_keluar' && (
                    <div className="space-y-2 p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Nama Customer / Penerima:
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Contoh: Ibu Sandra / Bapak Rian"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Nomor HP Customer:
                          </label>
                          <input
                            type="text"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="0812-xxxx-xxxx"
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Alamat / Lokasi Tujuan:
                          </label>
                          <input
                            type="text"
                            value={destinationLocation}
                            onChange={(e) => setDestinationLocation(e.target.value)}
                            placeholder="Contoh: Sutera Lavender No. 12"
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Fleet Selection */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Pilih Armada & Driver:
                        </label>
                        <select
                          value={selectedFleetId}
                          onChange={(e) => setSelectedFleetId(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        >
                          {fleets.map((flt) => (
                            <option key={flt.id} value={flt.id}>
                              🚚 {flt.name} ({flt.plateNumber}) - Driver: {flt.driverName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* List of Goods (Daftar Barang - Compact) */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] sm:text-xs font-bold text-slate-800">
                        Rincian Barang yang Ditangani:
                      </label>
                      <button
                        onClick={handleAddItem}
                        type="button"
                        className="text-[10px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                      >
                        <Plus className="w-3 h-3" /> Tambah Baris
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <span className="text-[10px] font-mono font-bold text-slate-400 w-4 text-center">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Nama / Jenis Barang"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            className="flex-1 p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 1)
                            }
                            className="w-12 p-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-center focus:outline-none"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                            className="p-1.5 bg-white border border-slate-200 rounded text-[11px] font-semibold focus:outline-none"
                          >
                            <option value="Unit">Unit</option>
                            <option value="Koli">Koli</option>
                            <option value="Box">Box</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Set">Set</option>
                            <option value="Palet">Palet</option>
                          </select>
                          {items.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* One-Tap Quick Presets (Horizontal Scrollable Pills) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Kondisi Cepat (Sentuh Cepat):
                    </label>
                    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
                      {QUICK_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md border shrink-0 transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {selectedTags.includes(tag) ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Step 2: Wajib Foto Bukti (Ultra Compact 2-Col Grid on Mobile, No Endless Scroll) */
                <div className="space-y-2.5">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                      <p className="text-[11px] sm:text-xs text-blue-900 font-semibold">
                        Stempel foto: <strong>{taskOfficerName}</strong> (NIP: {taskOfficerNip})
                      </p>
                    </div>
                    <span className="text-[9px] font-mono bg-blue-200 text-blue-950 px-1.5 py-0.2 rounded font-bold">
                      WATERMARK
                    </span>
                  </div>

                  {/* Photo Slots Grid: 2 Columns Always on Mobile & Desktop */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* Slot 1: Foto List Barang */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                          1. List / Manifest
                        </span>
                        {photos.listBarangPhoto ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            ✓ Ada
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                            Wajib
                          </span>
                        )}
                      </div>

                      {photos.listBarangPhoto ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-300">
                          <img
                            src={photos.listBarangPhoto}
                            alt="List Barang"
                            className="w-full h-20 sm:h-28 object-cover"
                          />
                          <button
                            onClick={() =>
                              setCameraTarget({
                                key: 'listBarangPhoto',
                                title: 'Foto List Barang',
                                instruction: 'Foto surat jalan atau manifest barang dengan jelas',
                              })
                            }
                            className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded"
                          >
                            Ubah
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setCameraTarget({
                              key: 'listBarangPhoto',
                              title: 'Foto List Barang',
                              instruction: 'Foto surat jalan atau manifest barang dengan jelas',
                            })
                          }
                          className="w-full py-3 sm:py-5 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors"
                        >
                          <Camera className="w-5 h-5 text-amber-600" />
                          <span className="text-[10px] font-bold">Ambil Foto List</span>
                        </button>
                      )}
                    </div>

                    {/* Slot 2: Foto Serah Terima Fisik */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                          2. Serah Terima
                        </span>
                        {photos.serahTerimaPhoto ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            ✓ Ada
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                            Wajib
                          </span>
                        )}
                      </div>

                      {photos.serahTerimaPhoto ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-300">
                          <img
                            src={photos.serahTerimaPhoto}
                            alt="Serah Terima"
                            className="w-full h-20 sm:h-28 object-cover"
                          />
                          <button
                            onClick={() =>
                              setCameraTarget({
                                key: 'serahTerimaPhoto',
                                title: 'Foto Serah Terima',
                                instruction: 'Foto proses penyerahan barang di lapangan',
                              })
                            }
                            className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded"
                          >
                            Ubah
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setCameraTarget({
                              key: 'serahTerimaPhoto',
                              title: 'Foto Serah Terima',
                              instruction: 'Foto proses penyerahan barang di lapangan',
                            })
                          }
                          className="w-full py-3 sm:py-5 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors"
                        >
                          <Camera className="w-5 h-5 text-amber-600" />
                          <span className="text-[10px] font-bold">Foto Serah Terima</span>
                        </button>
                      )}
                    </div>

                    {/* Slot 3: Jika Barang Keluar -> Foto Customer & Foto Armada */}
                    {activeType === 'barang_keluar' && (
                      <>
                        {/* Foto Customer Penerima */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                              3. Customer
                            </span>
                            {photos.recipientPhoto ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                ✓ Ada
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                                Wajib
                              </span>
                            )}
                          </div>

                          {photos.recipientPhoto ? (
                            <div className="relative rounded-lg overflow-hidden border border-slate-300">
                              <img
                                src={photos.recipientPhoto}
                                alt="Penerima Customer"
                                className="w-full h-20 sm:h-28 object-cover"
                              />
                              <button
                                onClick={() =>
                                  setCameraTarget({
                                    key: 'recipientPhoto',
                                    title: 'Foto Customer Penerima',
                                    instruction: 'Arahkan kamera ke customer / perwakilan yang menerima barang',
                                  })
                                }
                                className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded"
                              >
                                Ubah
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setCameraTarget({
                                  key: 'recipientPhoto',
                                  title: 'Foto Customer Penerima',
                                  instruction: 'Arahkan kamera ke customer / perwakilan yang menerima barang',
                                })
                              }
                              className="w-full py-3 sm:py-5 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors"
                            >
                              <Camera className="w-5 h-5 text-blue-600" />
                              <span className="text-[10px] font-bold">Foto Customer</span>
                            </button>
                          )}
                        </div>

                        {/* Foto Armada Pembawa */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                              4. Armada
                            </span>
                            {photos.fleetPhoto ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                ✓ Ada
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                                Wajib
                              </span>
                            )}
                          </div>

                          {photos.fleetPhoto ? (
                            <div className="relative rounded-lg overflow-hidden border border-slate-300">
                              <img
                                src={photos.fleetPhoto}
                                alt="Armada Pembawa"
                                className="w-full h-20 sm:h-28 object-cover"
                              />
                              <button
                                onClick={() =>
                                  setCameraTarget({
                                    key: 'fleetPhoto',
                                    title: 'Foto Armada & Plat Nomor',
                                    instruction: 'Foto armada kendaraan dan plat nomor pembawa barang',
                                  })
                                }
                                className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded"
                              >
                                Ubah
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setCameraTarget({
                                  key: 'fleetPhoto',
                                  title: 'Foto Armada & Plat Nomor',
                                  instruction: 'Foto armada kendaraan dan plat nomor pembawa barang',
                                })
                              }
                              className="w-full py-3 sm:py-5 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors"
                            >
                              <Truck className="w-5 h-5 text-blue-600" />
                              <span className="text-[10px] font-bold">Foto Armada</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* Slot 4: Jika Serah Terima Departemen -> Foto Serah Terima Departemen */}
                    {activeType === 'serah_terima_departemen' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
                            3. Foto Bersama Tim Dept {targetDepartment}
                          </span>
                          {photos.departemenPhoto ? (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                              ✓ Ada
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                              Wajib Dept
                            </span>
                          )}
                        </div>

                        {photos.departemenPhoto ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-300">
                            <img
                              src={photos.departemenPhoto}
                              alt="Departemen Photo"
                              className="w-full h-24 sm:h-32 object-cover"
                            />
                            <button
                              onClick={() =>
                                setCameraTarget({
                                  key: 'departemenPhoto',
                                  title: 'Foto Serah Terima ke Departemen',
                                  instruction: 'Foto proses serah terima bersama perwakilan staf departemen',
                                })
                              }
                              className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded"
                            >
                              Ubah
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setCameraTarget({
                                key: 'departemenPhoto',
                                title: 'Foto Serah Terima ke Departemen',
                                instruction: 'Foto proses serah terima bersama perwakilan staf departemen',
                              })
                            }
                            className="w-full py-3.5 sm:py-5 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-700 transition-colors"
                          >
                            <Building2 className="w-5 h-5 text-amber-600" />
                            <span className="text-[10px] font-bold">Foto Serah Terima Dept</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Customer Signature Box (Touch Screen Signature - Compact) */}
                  {activeType === 'barang_keluar' && (
                    <div className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-800">
                          Tanda Tangan Digital Customer (Opsional):
                        </span>
                        {recipientSignature && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            Tersimpan
                          </span>
                        )}
                      </div>

                      {recipientSignature ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={recipientSignature}
                            alt="Tanda Tangan"
                            className="h-10 border border-slate-300 rounded bg-white p-0.5"
                          />
                          <button
                            onClick={() => setIsSignatureModalOpen(true)}
                            className="text-[10px] font-bold text-blue-600 underline"
                          >
                            Ganti Tanda Tangan
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsSignatureModalOpen(true)}
                          className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[10px] sm:text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
                        >
                          <PenTool className="w-3.5 h-3.5 text-blue-600" />
                          Minta Tanda Tangan di Layar
                        </button>
                      )}
                    </div>
                  )}

                  {/* Notes / Catatan Tambahan (Compact) */}
                  <div>
                    <input
                      type="text"
                      placeholder="Catatan Singkat Lapangan (Opsional): contoh loading dock timur"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Controls (Sticky & Compact) */}
            <div className="p-2.5 sm:p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
              {currentStep === 1 ? (
                <>
                  <button
                    onClick={() => setActiveType(null)}
                    className="py-2.5 px-3.5 bg-white border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-2.5 sm:py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-md transition-transform active:scale-98"
                  >
                    Lanjut: Ambil Foto Bukti
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="py-2.5 px-3.5 bg-white border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    className="flex-1 py-2.5 sm:py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-md transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    SIMPAN & KIRIM BUKTI (SELESAI)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Active Camera Capture Modal */}
      {cameraTarget && (
        <CameraCaptureModal
          isOpen={true}
          onClose={() => setCameraTarget(null)}
          title={cameraTarget.title}
          instructionText={cameraTarget.instruction}
          officerName={taskOfficerName || activeOfficer.name}
          onCapture={(dataUrl) => {
            setPhotos((prev) => ({
              ...prev,
              [cameraTarget.key]: dataUrl,
            }));
          }}
        />
      )}

      {/* 5. Customer Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        signerName={recipientName || 'Customer / Penerima'}
        roleDescription="Penerima Barang Alsut"
        onSave={(dataUrl) => setRecipientSignature(dataUrl)}
      />

      {/* 6. Officer's Recent Activities Today (Compact & Clear on Mobile) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              PEKERJAAN SAYA HARI INI ({activeOfficer.name})
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500">
              Setiap catatan otomatis tercantum nama petugas logistik untuk audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Department Filter for grouping */}
            <select
              value={filterMyDept}
              onChange={(e) => setFilterMyDept(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Departemen</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg whitespace-nowrap">
              {myActivities.length} Data
            </span>
          </div>
        </div>

        {myActivities.length === 0 ? (
          <div className="py-6 text-center text-slate-400">
            <p className="text-xs sm:text-sm font-semibold">Belum ada kegiatan untuk departemen ini hari ini.</p>
            <p className="text-[10px] sm:text-xs mt-0.5">Pilih salah satu dari 3 tombol di atas untuk mulai mencatat.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myActivities.map((act) => {
              const timeFormatted = new Date(act.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={act.id}
                  onClick={() => onViewActivityDetail(act.id)}
                  className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 px-1 sm:px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                      act.type === 'barang_masuk'
                        ? 'bg-emerald-600'
                        : act.type === 'barang_keluar'
                        ? 'bg-blue-600'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      {act.type === 'barang_masuk' && <Inbox className="w-4 h-4" />}
                      {act.type === 'barang_keluar' && <Send className="w-4 h-4" />}
                      {act.type === 'serah_terima_departemen' && <Building2 className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">{act.title}</span>
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                          {act.trackingCode}
                        </span>
                        {act.dcOrigin && (
                          <span className="text-[9px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 px-1 py-0.2 rounded">
                            DC: {act.dcOrigin}
                          </span>
                        )}
                        {act.targetDepartment && (
                          <span className="text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 px-1 py-0.2 rounded">
                            {act.targetDepartment}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Petugas: <span className="font-semibold text-slate-700">{act.officerName}</span> (NIP: {act.officerBadge}) · {act.items.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-semibold text-slate-600 block">
                      {timeFormatted}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                      act.status === 'verified_by_ps'
                        ? 'bg-emerald-100 text-emerald-700'
                        : act.status === 'pending_dept_check'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {act.status === 'verified_by_ps' ? '✓ PS OK' : act.status === 'pending_dept_check' ? 'Cek PS' : 'Selesai'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
