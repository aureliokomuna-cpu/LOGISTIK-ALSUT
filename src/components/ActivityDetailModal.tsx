import React from 'react';
import { LogisticsActivity } from '../types/logistics';
import {
  X,
  Truck,
  Building2,
  Inbox,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  FileText,
  MapPin,
  PenTool,
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: LogisticsActivity | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
}) => {
  if (!activity) return null;

  const timeFormatted = new Date(activity.timestamp).toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-2.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
              activity.type === 'barang_masuk'
                ? 'bg-emerald-600'
                : activity.type === 'barang_keluar'
                ? 'bg-blue-600'
                : 'bg-amber-500 text-slate-950'
            }`}>
              {activity.type === 'barang_masuk' && <Inbox className="w-5 h-5 sm:w-6 sm:h-6" />}
              {activity.type === 'barang_keluar' && <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
              {activity.type === 'serah_terima_departemen' && <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                  {activity.trackingCode}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">
                  {activity.type === 'barang_masuk'
                    ? 'Barang Masuk'
                    : activity.type === 'barang_keluar'
                    ? 'Barang Keluar'
                    : 'Serah Terima Dept'}
                </span>
              </div>
              <h3 className="font-black text-sm sm:text-lg text-white mt-0.5 truncate">{activity.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
          {/* 1. Mandatory Logistics Officer Identity Block */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs">
                👷
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900 block">
                  PETUGAS EKSEKUTOR LOGISTIK LAPANGAN (WAJIB TRACKING)
                </span>
                <h4 className="text-base font-black text-slate-950">{activity.officerName}</h4>
                <p className="text-xs text-slate-600 font-medium">
                  NIP: <span className="font-mono font-bold text-slate-900">{activity.officerBadge}</span> · Hub Alam Sutera
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-slate-500 block">Waktu Pencatatan:</span>
              <strong className="text-slate-900 font-mono">{timeFormatted}</strong>
            </div>
          </div>

          {/* 2. Key Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activity.dcOrigin && (
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200">
                <span className="text-[10px] font-black text-blue-800 uppercase block mb-1">
                  Asal DC Pengirim:
                </span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  {activity.dcOrigin}
                </span>
              </div>
            )}

            {activity.targetDepartment && (
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-black text-amber-800 uppercase block mb-1">
                  Departemen / Kategori Produk:
                </span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  {activity.targetDepartment}
                </span>
              </div>
            )}

            {activity.recipientName && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Penerima / Customer:
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {activity.recipientName} {activity.recipientPhone ? `(${activity.recipientPhone})` : ''}
                </span>
              </div>
            )}

            {activity.fleetPlate && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Armada & Driver:
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  {activity.fleetName} ({activity.fleetPlate}) - Driver: {activity.driverName}
                </span>
              </div>
            )}

            {activity.destinationLocation && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Lokasi Tujuan:
                </span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  {activity.destinationLocation}
                </span>
              </div>
            )}
          </div>

          {/* 3. Items Table */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
              Daftar Barang yang Ditangani:
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Barang</th>
                    <th className="py-2.5 px-3 text-right">Jumlah</th>
                    <th className="py-2.5 px-3">Satuan</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activity.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{it.name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                        {it.qty}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{it.unit}</td>
                      <td className="py-2.5 px-3 text-slate-500">{it.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Quick Tags */}
          {activity.quickTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activity.quickTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          )}

          {/* 5. Complete Photo Proof Gallery (Semua Bukti Foto Lapangan) */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
              Galeri Bukti Foto Lapangan (Watermarked & Timestamped):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activity.photos.listBarangPhoto && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>Foto List Barang / Manifest</span>
                    <span className="text-[10px] text-slate-500">Bukti Fisik</span>
                  </div>
                  <img
                    src={activity.photos.listBarangPhoto}
                    alt="Foto List Barang"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {activity.photos.serahTerimaPhoto && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>Foto Serah Terima Fisik</span>
                    <span className="text-[10px] text-slate-500">Bongkar / Handover</span>
                  </div>
                  <img
                    src={activity.photos.serahTerimaPhoto}
                    alt="Foto Serah Terima"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {activity.photos.recipientPhoto && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>Foto Customer / Penerima</span>
                    <span className="text-[10px] text-slate-500">Bukti Penerimaan</span>
                  </div>
                  <img
                    src={activity.photos.recipientPhoto}
                    alt="Foto Penerima"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {activity.photos.fleetPhoto && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <div className="p-2.5 bg-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>Foto Armada & Plat Nomor</span>
                    <span className="text-[10px] text-slate-500">Transportasi</span>
                  </div>
                  <img
                    src={activity.photos.fleetPhoto}
                    alt="Foto Armada"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {activity.photos.departemenPhoto && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 sm:col-span-2">
                  <div className="p-2.5 bg-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>Foto Serah Terima ke Departemen Terkait</span>
                    <span className="text-[10px] text-slate-500">Internal Handover</span>
                  </div>
                  <img
                    src={activity.photos.departemenPhoto}
                    alt="Foto Serah Terima Departemen"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 6. Signature & Verification Details */}
          {(activity.recipientSignature || activity.psVerification) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {activity.recipientSignature && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block mb-2 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Tanda Tangan Penerima / Customer
                  </span>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                    <img
                      src={activity.recipientSignature}
                      alt="Signature"
                      className="h-20 object-contain"
                    />
                  </div>
                </div>
              )}

              {activity.psVerification && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900 block mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verifikasi Resmi Tim PS / Departemen
                  </span>
                  <p className="text-xs text-emerald-800">
                    Diverifikasi oleh: <strong>{activity.psVerification.verifiedBy}</strong>
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 italic">
                    "{activity.psVerification.notes}"
                  </p>
                  {activity.psVerification.signature && (
                    <div className="bg-white p-2 rounded-xl border border-emerald-200 mt-2 flex items-center justify-center">
                      <img
                        src={activity.psVerification.signature}
                        alt="Signature PS"
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
