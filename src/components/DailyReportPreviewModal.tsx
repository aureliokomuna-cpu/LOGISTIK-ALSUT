import React, { useState } from 'react';
import { LogisticsActivity } from '../types/logistics';
import { downloadDailyLogisticsPDF } from '../utils/pdfGenerator';
import { Download, Printer, X, Calendar, CheckCircle2 } from 'lucide-react';

interface DailyReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: LogisticsActivity[];
}

export const DailyReportPreviewModal: React.FC<DailyReportPreviewModalProps> = ({
  isOpen,
  onClose,
  activities,
}) => {
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const filteredActivities = activities;

  const totalKegiatan = filteredActivities.length;
  const barangMasuk = filteredActivities.filter((a) => a.type === 'barang_masuk').length;
  const barangKeluar = filteredActivities.filter((a) => a.type === 'barang_keluar').length;
  const serahTerimaDept = filteredActivities.filter((a) => a.type === 'serah_terima_departemen').length;
  const verifiedCount = filteredActivities.filter(
    (a) => a.status === 'verified_by_ps' || a.status === 'completed'
  ).length;

  const handleDownloadPDF = () => {
    downloadDailyLogisticsPDF({
      activities: filteredActivities,
      generatedBy: 'Manager Logistik Alsut',
      dateFilter: reportDate,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-2.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-xl">📄</span>
            <div>
              <h3 className="font-bold text-xs sm:text-base">Pratinjau Laporan Harian</h3>
              <p className="text-[10px] sm:text-xs text-slate-300 hidden sm:block">Format Resmi Siap Download PDF / Cetak</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-2.5 sm:py-2 sm:px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="py-1.5 px-3 sm:py-2 sm:px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-sm transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" /> Unduh PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Header Document */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex justify-between items-start">
              <div>
                <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
                  HOME CENTER ALAM SUTERA
                </span>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  ALSUT LOGISTICS HUB & DISPATCH
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Laporan Harian Serah Terima Barang, Armada & Verifikasi Departemen
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">TANGGAL LAPORAN</span>
                <strong className="text-sm font-bold text-slate-900">{reportDate}</strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Status: FINAL / AUDITED
                </span>
              </div>
            </div>

            {/* Stat Summary Row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 block">TOTAL KEGIATAN</span>
                <span className="text-xl font-black text-slate-900 font-mono">{totalKegiatan}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-emerald-700 block">BARANG MASUK</span>
                <span className="text-xl font-black text-emerald-950 font-mono">{barangMasuk}</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-blue-700 block">BARANG KELUAR</span>
                <span className="text-xl font-black text-blue-950 font-mono">{barangKeluar}</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-amber-700 block">TERVERIFIKASI PS</span>
                <span className="text-xl font-black text-amber-950 font-mono">
                  {verifiedCount}/{totalKegiatan}
                </span>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="mb-6">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-2 border border-slate-700">No</th>
                    <th className="p-2 border border-slate-700">Jam</th>
                    <th className="p-2 border border-slate-700">Petugas Logistik</th>
                    <th className="p-2 border border-slate-700">Kegiatan</th>
                    <th className="p-2 border border-slate-700">Departemen</th>
                    <th className="p-2 border border-slate-700">Rincian Barang</th>
                    <th className="p-2 border border-slate-700">Tujuan / Armada</th>
                    <th className="p-2 border border-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredActivities.map((act, index) => {
                    const timeStr = new Date(act.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={act.id}>
                        <td className="p-2 text-center font-mono border border-slate-200">
                          {index + 1}
                        </td>
                        <td className="p-2 font-mono border border-slate-200">{timeStr}</td>
                        <td className="p-2 font-bold text-slate-900 border border-slate-200">
                          {act.officerName}
                        </td>
                        <td className="p-2 border border-slate-200">
                          {act.type === 'barang_masuk'
                            ? 'Barang Masuk'
                            : act.type === 'barang_keluar'
                            ? 'Barang Keluar'
                            : 'Serah Terima Dept'}
                        </td>
                        <td className="p-2 font-bold text-amber-900 bg-amber-50/50 border border-slate-200">
                          {act.targetDepartment || 'Umum'}
                        </td>
                        <td className="p-2 border border-slate-200">
                          {act.items.map((it) => `${it.name} (${it.qty} ${it.unit})`).join(', ')}
                        </td>
                        <td className="p-2 border border-slate-200">
                          {act.type === 'barang_keluar'
                            ? `${act.fleetName || 'Armada'} (${act.fleetPlate || '-'})`
                            : act.dcOrigin
                            ? `DC: ${act.dcOrigin}`
                            : act.targetDepartment || '-'}
                        </td>
                        <td className="p-2 text-center font-bold border border-slate-200">
                          {act.status === 'verified_by_ps'
                            ? 'Terverifikasi PS'
                            : act.status === 'pending_dept_check'
                            ? 'Tunggu Cek PS'
                            : 'Selesai'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
              <div>
                <p className="font-semibold text-slate-600 mb-12">Petugas Logistik Lapangan,</p>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  ( Tim Logistik Alsut )
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-600 mb-12">Supervisor PS / Departemen,</p>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  ( Tim Pengecek PS )
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-600 mb-12">Manager Operasional Logistik,</p>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  ( Manager Logistik )
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
