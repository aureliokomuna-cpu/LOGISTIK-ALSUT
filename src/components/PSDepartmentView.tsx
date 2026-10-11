import React, { useState } from 'react';
import { LogisticsActivity, PSVerification } from '../types/logistics';
import { DEPARTMENTS } from '../data/initialData';
import { SignatureModal } from './SignatureModal';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Eye,
  Camera,
  Check,
  Sparkles,
  UserCheck,
  PenTool,
} from 'lucide-react';

interface PSDepartmentViewProps {
  activities: LogisticsActivity[];
  onVerifyActivity: (activityId: string, verification: PSVerification) => void;
  onViewActivityDetail: (activityId: string) => void;
}

export const PSDepartmentView: React.FC<PSDepartmentViewProps> = ({
  activities,
  onVerifyActivity,
  onViewActivityDetail,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [verifyingActivity, setVerifyingActivity] = useState<LogisticsActivity | null>(null);

  // Verification Form states
  const [verifierName, setVerifierName] = useState<string>('Reza Fahmi (Staff IT Living World)');
  const [checkResult, setCheckResult] = useState<'sesuai' | 'sebagian' | 'ada_masalah'>('sesuai');
  const [verificationNotes, setVerificationNotes] = useState<string>('Fisik barang dicek bersama. Sesuai dan utuh.');
  const [psSignature, setPsSignature] = useState<string | undefined>(undefined);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);

  // Checklist items state
  const [checklist, setChecklist] = useState({
    qtyMatches: true,
    conditionGood: true,
    locationReady: true,
  });

  // Filter activities that belong to department handover or incoming goods
  const deptActivities = activities.filter((act) => {
    if (act.type === 'barang_keluar') return false;
    if (selectedDept !== 'all' && act.targetDepartment !== selectedDept) return false;
    return true;
  });

  const pendingVerificationList = deptActivities.filter(
    (act) => act.status === 'pending_dept_check'
  );
  const alreadyVerifiedList = deptActivities.filter(
    (act) => act.status === 'verified_by_ps' || act.status === 'completed'
  );

  const handleOpenVerifyModal = (act: LogisticsActivity) => {
    setVerifyingActivity(act);
    setCheckResult('sesuai');
    setVerificationNotes(`Fisik barang diperiksa bersama Petugas Logistik (${act.officerName}). Kondisi baik dan jumlah lengkap.`);
    setChecklist({ qtyMatches: true, conditionGood: true, locationReady: true });
    setPsSignature(undefined);
  };

  const handleConfirmVerification = () => {
    if (!verifyingActivity) return;

    const verificationData: PSVerification = {
      verifiedBy: verifierName || 'Tim PS Departemen',
      department: verifyingActivity.targetDepartment || 'Departemen Terkait',
      verifiedAt: new Date().toISOString(),
      result: checkResult,
      notes: verificationNotes,
      signature: psSignature,
    };

    onVerifyActivity(verifyingActivity.id, verificationData);
    setVerifyingActivity(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-6 space-y-2.5 sm:space-y-5">
      {/* 1. Header & Department Selection (Compact on Mobile) */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase">
              PORTAL TIM PS & DEPARTEMEN PENERIMA
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Verifikasi Fisik Kedatangan Barang</span>
          </div>
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengecekan Serah Terima Barang Masuk
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
            Tim PS memeriksa bukti foto logistik, mencocokkan jumlah fisik, dan memberikan konfirmasi serah terima.
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-200 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-emerald-600 ml-1 shrink-0" />
          <div className="flex-1">
            <label className="text-[9px] sm:text-[10px] text-slate-500 block font-semibold leading-none mb-0.5">Filter Departemen:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer w-full"
            >
              <option value="all">Semua Departemen (17 Dept)</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick 17-Department Tab Buttons for PS */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
            Pilih Cepat Departemen:
          </span>
          <button
            onClick={() => setSelectedDept('all')}
            className={`text-[11px] font-bold px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              selectedDept === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({deptActivities.length})
          </button>
          {DEPARTMENTS.map((dept) => {
            const count = deptActivities.filter((a) => a.targetDepartment === dept).length;
            const pending = pendingVerificationList.filter((a) => a.targetDepartment === dept).length;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap transition-all border ${
                  selectedDept === dept
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : pending > 0
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {dept}
                {pending > 0 ? (
                  <span className="ml-1 bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-mono text-[10px]">
                    {pending} Baru
                  </span>
                ) : count > 0 ? (
                  <span className="ml-1 text-slate-400 font-mono text-[10px]">({count})</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Pending Verification Section (Hero Area for PS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              BARANG KEDATANGAN MENUNGGU PENGECEKAN PS ({pendingVerificationList.length})
            </h3>
          </div>
          {pendingVerificationList.length > 0 && (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full animate-pulse">
              🔔 Perlu Dicek Segera
            </span>
          )}
        </div>

        {pendingVerificationList.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-base text-slate-800">Semua Serah Terima Sudah Dicek</h4>
            <p className="text-xs text-slate-500 mt-1">
              Tidak ada antrean kedatangan barang baru yang belum diverifikasi untuk departemen ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingVerificationList.map((act) => {
              const timeFormatted = new Date(act.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md shadow-amber-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
                        {act.targetDepartment || 'Departemen'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        Jam: {timeFormatted}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 leading-tight mb-1">
                      {act.title}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Ref: {act.trackingCode}
                    </span>

                    {/* Officer Responsible */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-base shrink-0">
                        👷
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold leading-none">
                          Diserahkan oleh Petugas Logistik:
                        </span>
                        <strong className="text-xs font-bold text-slate-900 mt-0.5 block">
                          {act.officerName} ({act.officerBadge})
                        </strong>
                      </div>
                    </div>

                    {/* Goods Summary */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 block">Daftar Barang:</span>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        {act.items.map((it) => (
                          <div
                            key={it.id}
                            className="text-xs font-semibold text-slate-800 flex justify-between"
                          >
                            <span>• {it.name}</span>
                            <span className="font-mono text-slate-600">
                              {it.qty} {it.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photo proof thumbnails */}
                    <div className="mt-3 flex items-center gap-2">
                      {act.photos.serahTerimaPhoto && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={act.photos.serahTerimaPhoto}
                            alt="Serah Terima"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {act.photos.listBarangPhoto && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={act.photos.listBarangPhoto}
                            alt="List Barang"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-[11px] text-slate-500 font-medium">
                        {Object.values(act.photos).filter(Boolean).length} Foto Bukti Tersedia
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onViewActivityDetail(act.id)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                    </button>

                    <button
                      onClick={() => handleOpenVerifyModal(act)}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-98"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      CEK & VERIFIKASI BARANG INI
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Already Verified History */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-base font-black text-slate-900 tracking-tight mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          RIWAYAT BARANG YANG SUDAH DIVERIFIKASI PS ({alreadyVerifiedList.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {alreadyVerifiedList.map((act) => (
            <div
              key={act.id}
              onClick={() => onViewActivityDetail(act.id)}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{act.title}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {act.targetDepartment}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Petugas Logistik: <strong>{act.officerName}</strong> · Diverifikasi oleh:{' '}
                  <strong>{act.psVerification?.verifiedBy || 'Tim PS'}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-block">
                  ✓ Selesai Diverifikasi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Verification Action Modal */}
      {verifyingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Formulir Verifikasi Tim PS</h3>
                  <p className="text-xs text-slate-300">
                    Departemen: {verifyingActivity.targetDepartment}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerifyingActivity(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Activity Info Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{verifyingActivity.title}</span>
                  <span className="font-mono text-slate-500">{verifyingActivity.trackingCode}</span>
                </div>
                <p className="text-xs text-slate-600">
                  Petugas Logistik Penyerah: <strong>{verifyingActivity.officerName}</strong> (
                  {verifyingActivity.officerBadge})
                </p>
                <div className="mt-2 text-xs font-semibold text-slate-700">
                  Barang: {verifyingActivity.items.map((it) => `${it.name} (${it.qty} ${it.unit})`).join(', ')}
                </div>
              </div>

              {/* Physical Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Checklist Pemeriksaan Fisik di Lokasi:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.qtyMatches}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, qtyMatches: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Jumlah fisik barang sesuai dengan catatan & surat jalan
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.conditionGood}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, conditionGood: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Kondisi kemasan utuh, tidak penyok/basah, dan segel aman
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.locationReady}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, locationReady: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Barang telah diletakkan di ruang/gudang departemen yang tepat
                    </span>
                  </label>
                </div>
              </div>

              {/* Verification Verdict */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Hasil Verifikasi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckResult('sesuai')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      checkResult === 'sesuai'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✓ Sesuai (100% OK)
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckResult('sebagian')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      checkResult === 'sebagian'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚠️ Sebagian
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckResult('ada_masalah')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      checkResult === 'ada_masalah'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✕ Ada Masalah
                  </button>
                </div>
              </div>

              {/* Verifier Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Petugas PS / Penerima Departemen:
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="Nama & Jabatan Anda"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan Verifikasi:
                </label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              {/* PS Signature */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Tanda Tangan Digital PS:
                  </span>
                  {psSignature && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Tersimpan
                    </span>
                  )}
                </div>

                {psSignature ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={psSignature}
                      alt="Tanda Tangan PS"
                      className="h-12 border border-slate-300 rounded-lg bg-white p-1"
                    />
                    <button
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="text-xs font-bold text-emerald-700 underline"
                    >
                      Ubah Tanda Tangan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
                  >
                    <PenTool className="w-4 h-4 text-emerald-600" />
                    Bubuhi Tanda Tangan Konfirmasi
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setVerifyingActivity(null)}
                className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVerification}
                className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-transform active:scale-95"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                KONFIRMASI SERAH TERIMA DITERIMA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        signerName={verifierName}
        roleDescription="Tim PS Departemen Alsut"
        onSave={(dataUrl) => setPsSignature(dataUrl)}
      />
    </div>
  );
};
