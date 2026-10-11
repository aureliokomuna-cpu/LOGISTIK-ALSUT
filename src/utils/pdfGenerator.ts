import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LogisticsActivity } from '../types/logistics';

export interface PDFReportOptions {
  dateFilter?: string;
  activities: LogisticsActivity[];
  generatedBy: string;
}

export function generateDailyLogisticsPDF(options: PDFReportOptions): jsPDF {
  const { activities, generatedBy, dateFilter } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const reportDate = dateFilter || new Date().toISOString().split('T')[0];
  const dateFormatted = new Date(reportDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate summary metrics
  const totalKegiatan = activities.length;
  const barangMasuk = activities.filter((a) => a.type === 'barang_masuk').length;
  const barangKeluar = activities.filter((a) => a.type === 'barang_keluar').length;
  const serahTerimaDept = activities.filter((a) => a.type === 'serah_terima_departemen').length;
  const verifiedCount = activities.filter((a) => a.status === 'verified_by_ps' || a.status === 'completed').length;

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('ALSUT LOGISTICS - HOME CENTER ALAM SUTERA', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Laporan Harian Operasional Serah Terima, Dispatch Armada & Verifikasi Departemen', 14, 21);

  // Subheader Info Card
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`RINGKASAN OPERASIONAL - ${dateFormatted.toUpperCase()}`, 14, 38);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Oleh: ${generatedBy}`, 14, 43);

  // Summary Stat Boxes
  const statBoxY = 47;
  const boxWidth = 43;
  const boxHeight = 16;

  const stats = [
    { label: 'TOTAL KEGIATAN', val: totalKegiatan.toString(), color: [241, 245, 249] },
    { label: 'BARANG MASUK', val: barangMasuk.toString(), color: [220, 252, 231] },
    { label: 'BARANG KELUAR', val: barangKeluar.toString(), color: [224, 242, 254] },
    { label: 'TERVERIFIKASI PS', val: `${verifiedCount}/${activities.length}`, color: [254, 243, 199] },
  ];

  stats.forEach((st, idx) => {
    const xPos = 14 + idx * (boxWidth + 4);
    doc.setFillColor(st.color[0], st.color[1], st.color[2]);
    doc.roundedRect(xPos, statBoxY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(xPos, statBoxY, boxWidth, boxHeight, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(st.label, xPos + 4, statBoxY + 5);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(st.val, xPos + 4, statBoxY + 12);
  });

  // Table Data Preparation
  const tableRows = activities.map((act, index) => {
    const timeStr = new Date(act.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const typeLabel =
      act.type === 'barang_masuk'
        ? 'Barang Masuk'
        : act.type === 'barang_keluar'
        ? 'Barang Keluar'
        : 'Serah Terima Dept';

    const itemsSummary = act.items
      .map((item) => `${item.name} (${item.qty} ${item.unit})`)
      .join(', ');

    const destinationOrFleet =
      act.type === 'barang_keluar'
        ? `${act.fleetName || 'Armada'} (${act.fleetPlate || '-'})`
        : act.targetDepartment || 'Gudang Pusat';

    const departmentName = act.targetDepartment || 'Umum';

    const statusLabel =
      act.status === 'verified_by_ps'
        ? 'Terverifikasi PS'
        : act.status === 'pending_dept_check'
        ? 'Tunggu Cek PS'
        : act.status === 'delivered_to_customer'
        ? 'Diterima Customer'
        : 'Selesai';

    return [
      (index + 1).toString(),
      timeStr,
      act.trackingCode,
      act.officerName, // MANDATORY: Nama Logistik
      typeLabel,
      departmentName, // DEPARTEMEN HOME CENTER
      itemsSummary,
      destinationOrFleet,
      statusLabel,
    ];
  });

  autoTable(doc, {
    startY: 68,
    head: [[
      'No',
      'Jam',
      'Kode Ref',
      'Petugas Logistik',
      'Kegiatan',
      'Departemen',
      'Rincian Barang',
      'Tujuan / Armada',
      'Status',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 1.8,
      font: 'helvetica',
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 11, halign: 'center' },
      2: { cellWidth: 19, fontStyle: 'bold' },
      3: { cellWidth: 23, fontStyle: 'bold' }, // Officer Name emphasized
      4: { cellWidth: 20 },
      5: { cellWidth: 25, fontStyle: 'bold' }, // Department emphasized
      6: { cellWidth: 41 },
      7: { cellWidth: 24 },
      8: { cellWidth: 18, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Calculate position after table
  // @ts-expect-error autoTable plugin attaches lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 200;

  // Officer & Department Recap summary
  const officerCounts: { [key: string]: number } = {};
  const deptCounts: { [key: string]: number } = {};
  activities.forEach((act) => {
    officerCounts[act.officerName] = (officerCounts[act.officerName] || 0) + 1;
    if (act.targetDepartment) {
      deptCounts[act.targetDepartment] = (deptCounts[act.targetDepartment] || 0) + 1;
    }
  });

  // Check if we need a new page for signature block
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = finalY;

  if (currentY + 55 > pageHeight) {
    doc.addPage();
    currentY = 20;
  }

  // Rekap Petugas Logistik & Departemen
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('REKAP PER PETUGAS LOGISTIK:', 14, currentY);

  currentY += 4;
  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'normal');
  const officerSummaryText = Object.entries(officerCounts)
    .map(([name, count]) => `• ${name}: ${count} transaksi`)
    .join('   |   ');
  doc.text(officerSummaryText || 'Tidak ada data petugas.', 14, currentY);

  currentY += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAP PENGELOMPOKAN DEPARTEMEN:', 14, currentY);

  currentY += 4;
  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'normal');
  const deptSummaryText = Object.entries(deptCounts)
    .map(([dept, count]) => `• ${dept}: ${count}`)
    .join('   |   ');
  doc.text(deptSummaryText || 'Belum ada data departemen.', 14, currentY);

  currentY += 14;

  // Signature Block
  const sigBoxWidth = 55;
  const sigPositions = [14, 78, 142];

  // 1. Petugas Logistik Lapangan
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Dibuat & Diserahkan:', sigPositions[0], currentY);
  doc.text('Petugas Logistik Lapangan', sigPositions[0], currentY + 4);
  doc.line(sigPositions[0], currentY + 22, sigPositions[0] + sigBoxWidth, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`( Tim Logistik Alsut )`, sigPositions[0], currentY + 26);

  // 2. Tim PS / Departemen
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Diterima & Dicek:', sigPositions[1], currentY);
  doc.text('Tim PS / Departemen Terkait', sigPositions[1], currentY + 4);
  doc.line(sigPositions[1], currentY + 22, sigPositions[1] + sigBoxWidth, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`( Supervisor / PS Dept )`, sigPositions[1], currentY + 26);

  // 3. Manager Logistik
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Mengetahui & Menyetujui:', sigPositions[2], currentY);
  doc.text('Manager Operasional Logistik', sigPositions[2], currentY + 4);
  doc.line(sigPositions[2], currentY + 22, sigPositions[2] + sigBoxWidth, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`( Manager Logistik Alsut )`, sigPositions[2], currentY + 26);

  // Footer note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Dokumen ini dicetak otomatis dari Sistem Logistik Alsut. Seluruh bukti foto tersimpan di server cloud.',
    14,
    pageHeight - 8
  );

  return doc;
}

export function downloadDailyLogisticsPDF(options: PDFReportOptions) {
  const doc = generateDailyLogisticsPDF(options);
  const dateStr = options.dateFilter || new Date().toISOString().split('T')[0];
  doc.save(`Laporan_Harian_Logistik_Alsut_${dateStr}.pdf`);
}
