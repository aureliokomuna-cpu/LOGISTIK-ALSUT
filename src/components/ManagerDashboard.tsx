import React, { useState } from 'react';
import { LogisticsActivity, LogisticsOfficer, FleetVehicle } from '../types/logistics';
import { DEPARTMENTS } from '../data/initialData';
import { downloadDailyLogisticsPDF } from '../utils/pdfGenerator';
import {
  FileText,
  Download,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Inbox,
  Send,
  Building2,
  Eye,
  AlertTriangle,
  UserCheck,
  Calendar,
} from 'lucide-react';

interface ManagerDashboardProps {
  activities: LogisticsActivity[];
  officers: LogisticsOfficer[];
  fleets: FleetVehicle[];
  onViewActivityDetail: (activityId: string) => void;
  onOpenReportPreview: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  activities,
  officers,
  fleets,
  onViewActivityDetail,
  onOpenReportPreview,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOfficer, setFilterOfficer] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Metrics
  const totalKegiatan = activities.length;
  const barangMasukCount = activities.filter((a) => a.type === 'barang_masuk').length;
  const barangKeluarCount = activities.filter((a) => a.type === 'barang_keluar').length;
  const serahTerimaDeptCount = activities.filter((a) => a.type === 'serah_terima_departemen').length;
  const pendingCheckCount = activities.filter((a) => a.status === 'pending_dept_check').length;
  const verifiedCount = activities.filter(
    (a) => a.status === 'verified_by_ps' || a.status === 'completed'
  ).length;

  // Filtered List
  const filteredActivities = activities.filter((act) => {
    if (filterType !== 'all' && act.type !== filterType) return false;
    if (filterOfficer !== 'all' && act.officerName !== filterOfficer) return false;
    if (filterDepartment !== 'all' && act.targetDepartment !== filterDepartment) return false;
    if (filterStatus === 'pending' && act.status !== 'pending_dept_check') return false;
    if (filterStatus === 'verified' && act.status !== 'verified_by_ps') return false;
    if (filterStatus === 'delivered' && act.status !== 'delivered_to_customer') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTracking = act.trackingCode.toLowerCase().includes(q);
      const matchOfficer = act.officerName.toLowerCase().includes(q);
      const matchDept = act.targetDepartment?.toLowerCase().includes(q) || false;
      const matchRecipient = act.recipientName?.toLowerCase().includes(q) || false;
      const matchItem = act.items.some((it) => it.name.toLowerCase().includes(q));
      const matchFleet = act.fleetPlate?.toLowerCase().includes(q) || false;
      if (!matchTracking && !matchOfficer && !matchDept && !matchRecipient && !matchItem && !matchFleet) {
        return false;
      }
    }
    return true;
  });

  const handleDownloadPDF = () => {
    downloadDailyLogisticsPDF({
      activities: filteredActivities,
      generatedBy: 'Manager Operasional Logistik Alsut',
      dateFilter: new Date().toISOString().split('T')[0],
    });
  };

  // Group counts per department
  const departmentCounts: { [dept: string]: number } = {};
  activities.forEach((act) => {
    if (act.targetDepartment) {
      departmentCounts[act.targetDepartment] = (departmentCounts[act.targetDepartment] || 0) + 1;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-6 space-y-2.5 sm:space-y-5">
      {/* 1. Header & Actions (Compact on Mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-blue-100 text-blue-800 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase">
              PORTAL MANAGER OPERASIONAL
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Monitoring Real-Time & Audit Trail</span>
          </div>
          <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
            Pantauan Aktivitas Seluruh Logistik Alsut
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
            Setiap pergerakan barang wajib mencantumkan nama petugas logistik untuk akuntabilitas.
          </p>
        </div>

        {/* PDF Download Button & Print Preview */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenReportPreview}
            className="flex-1 sm:flex-none py-2 px-3 sm:px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            Pratinjau
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none py-2 px-3 sm:px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh PDF Harian
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Grid (Compact 2x2 on Mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold mb-1">
            <span>TOTAL AKTIVITAS</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
            {totalKegiatan}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
            Hari ini · Semua petugas
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-[10px] sm:text-xs font-bold mb-1">
            <span>BARANG MASUK</span>
            <Inbox className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-950 font-mono tabular-nums">
            {barangMasukCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-700 font-medium mt-0.5">
            Unloading supplier
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 text-[10px] sm:text-xs font-bold mb-1">
            <span>BARANG KELUAR</span>
            <Send className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-blue-950 font-mono tabular-nums">
            {barangKeluarCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-blue-700 font-medium mt-0.5">
            Dispatch armada
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-[10px] sm:text-xs font-bold mb-1">
            <span>SERAH TERIMA DEPT</span>
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-950 font-mono tabular-nums">
            {serahTerimaDeptCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-800 font-medium mt-0.5">
            {pendingCheckCount} menunggu cek PS
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang, nama petugas logistik, resi, plat mobil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-auto py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Jenis Kegiatan</option>
            <option value="barang_masuk">Barang Masuk (Inbound)</option>
            <option value="barang_keluar">Barang Keluar (Customer)</option>
            <option value="serah_terima_departemen">Serah Terima Departemen</option>
          </select>

          {/* Filter Officer (Wajib Mencantumkan Nama Logistik) */}
          <select
            value={filterOfficer}
            onChange={(e) => setFilterOfficer(e.target.value)}
            className="w-full md:w-auto py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Petugas Logistik</option>
            {officers.map((off) => (
              <option key={off.id} value={off.name}>
                Petugas: {off.name}
              </option>
            ))}
          </select>

          {/* Kolom Pemilihan Departemen (17 Departemen Home Center) */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full md:w-auto py-2 px-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
          >
            <option value="all">🏢 Semua Departemen (17 Dept)</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                🏢 {dept} {departmentCounts[dept] ? `(${departmentCounts[dept]})` : ''}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Cek PS</option>
            <option value="verified">Terverifikasi PS</option>
            <option value="delivered">Diterima Customer</option>
          </select>
        </div>

        {/* Quick Department Grouping Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
              Grup Departemen:
            </span>
            <button
              onClick={() => setFilterDepartment('all')}
              className={`text-[11px] font-bold px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                filterDepartment === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({activities.length})
            </button>
            {DEPARTMENTS.map((dept) => {
              const count = departmentCounts[dept] || 0;
              return (
                <button
                  key={dept}
                  onClick={() => setFilterDepartment(dept)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap transition-all border ${
                    filterDepartment === dept
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : count > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 opacity-60'
                  }`}
                >
                  {dept} {count > 0 && <span className="ml-1 font-mono">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Activity Table / Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Audit Trail & Riwayat Operasional
            </h3>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {filteredActivities.length} data
            </span>
            {filterDepartment !== 'all' && (
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Dept: {filterDepartment}
              </span>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Klik baris untuk melihat rincian foto & tanda tangan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Jam</th>
                <th className="py-3 px-4">Petugas Logistik</th>
                <th className="py-3 px-4">Kegiatan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4">Rincian Barang</th>
                <th className="py-3 px-4">Tujuan / Armada</th>
                <th className="py-3 px-4">Bukti Foto</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ditemukan aktivitas logistik yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const timeFormatted = new Date(act.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const photoCount = Object.values(act.photos).filter(Boolean).length;

                  return (
                    <tr
                      key={act.id}
                      onClick={() => onViewActivityDetail(act.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* Jam */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {timeFormatted}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {act.trackingCode}
                        </span>
                      </td>

                      {/* Petugas Logistik (MANDATORY REQUIREMENT) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs">
                            👷
                          </div>
                          <div>
                            <strong className="text-slate-900 block font-bold leading-tight">
                              {act.officerName}
                            </strong>
                            <span className="text-[10px] font-mono text-slate-500">
                              NIP: {act.officerBadge}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tipe Kegiatan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            act.type === 'barang_masuk'
                              ? 'bg-emerald-100 text-emerald-800'
                              : act.type === 'barang_keluar'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {act.type === 'barang_masuk' && <Inbox className="w-3.5 h-3.5" />}
                          {act.type === 'barang_keluar' && <Send className="w-3.5 h-3.5" />}
                          {act.type === 'serah_terima_departemen' && (
                            <Building2 className="w-3.5 h-3.5" />
                          )}
                          {act.type === 'barang_masuk'
                            ? 'Barang Masuk'
                            : act.type === 'barang_keluar'
                            ? 'Barang Keluar'
                            : 'Serah Terima'}
                        </span>
                      </td>

                      {/* Departemen (Kolom Pengelompokan Khusus) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          🏢 {act.targetDepartment || 'Umum'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {act.items.map((i) => `${i.name} (${i.qty} ${i.unit})`).join(', ')}
                        </p>
                        {act.notes && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {act.notes}
                          </p>
                        )}
                      </td>

                      {/* Tujuan / Armada */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {act.type === 'barang_keluar' ? (
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {act.fleetName || 'Armada'} ({act.fleetPlate})
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Penerima: {act.recipientName || 'Customer'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {act.targetDepartment || 'Gudang'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {act.recipientName ? `Penerima: ${act.recipientName}` : 'Area Hub'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Bukti Foto Thumbnails */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {photoCount > 0 ? (
                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              📷 {photoCount} Foto
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Tidak ada foto</span>
                          )}
                          {act.recipientSignature && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                              ✍️ TTD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {act.status === 'verified_by_ps' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Terverifikasi PS
                          </span>
                        ) : act.status === 'pending_dept_check' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Tunggu Cek PS
                          </span>
                        ) : act.status === 'delivered_to_customer' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3" /> Diterima Customer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            Selesai
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewActivityDetail(act.id);
                          }}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
