import { LogisticsOfficer, FleetVehicle, LogisticsActivity, InAppNotification } from '../types/logistics';

export const INITIAL_OFFICERS: LogisticsOfficer[] = [
  {
    id: 'off-1',
    name: 'Budi Santoso',
    badgeNumber: 'LOG-001',
    phone: '0812-3456-7890',
    shift: 'Shift 1 (07:00 - 15:00)',
  },
  {
    id: 'off-2',
    name: 'Agus Setiawan',
    badgeNumber: 'LOG-002',
    phone: '0813-9876-5432',
    shift: 'Shift 1 (07:00 - 15:00)',
  },
  {
    id: 'off-3',
    name: 'Rudi Hartono',
    badgeNumber: 'LOG-003',
    phone: '0811-2233-4455',
    shift: 'Shift 2 (14:00 - 22:00)',
  },
  {
    id: 'off-4',
    name: 'Dedi Kurniawan',
    badgeNumber: 'LOG-004',
    phone: '0819-5566-7788',
    shift: 'Shift 2 (14:00 - 22:00)',
  },
];

export const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: 'flt-1',
    name: 'Grand Max Box 01',
    plateNumber: 'B 9182 VBN',
    type: 'Daihatsu Gran Max Box',
    driverName: 'Pak Yanto',
    status: 'tersedia',
  },
  {
    id: 'flt-2',
    name: 'Blind Van 04',
    plateNumber: 'B 9341 SUT',
    type: 'Gran Max Blind Van',
    driverName: 'Pak Joko',
    status: 'dalam_pengiriman',
  },
  {
    id: 'flt-3',
    name: 'Engkel Box C2',
    plateNumber: 'B 9801 ALS',
    type: 'Isuzu Elf 4-Roda Box',
    driverName: 'Pak Heru',
    status: 'tersedia',
  },
  {
    id: 'flt-4',
    name: 'Motor Kargo Quick 03',
    plateNumber: 'B 4210 TNG',
    type: 'Motor Roda 3 Kargo',
    driverName: 'Mas Dika',
    status: 'tersedia',
  },
];

export const DC_OPTIONS = [
  'JABABEKA',
  'CIKUPA',
  'CIKANDE',
  'STORE ALSUT',
  'STORE LAIN',
];

export const DEPARTMENTS = [
  'Sofa & Chair',
  'Table & Cabinet',
  'Home Textile',
  'Home Decore',
  'Home Organizer',
  'Home Galleria',
  'Bathroom',
  'Fashion Bags',
  'Dining',
  'Kitchen',
  'Home Classic',
  'Homeware',
  'Decorative Lighting',
  'All Kells',
  'Office',
  'Office Seating',
  'Commercial & Bussines',
];

// Helper to generate clear sample photo cards with watermark
function createMockPhotoDataUrl(label: string, sublabel: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${color}"/>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
    <rect width="600" height="400" fill="url(#grid)" />
    <circle cx="300" cy="170" r="48" fill="rgba(255,255,255,0.2)"/>
    <path d="M280 155 L320 155 L325 165 L335 165 C340 165 345 170 345 175 L345 195 C345 200 340 205 335 205 L265 205 C260 205 255 200 255 195 L255 175 C255 170 260 165 265 165 L275 165 Z" fill="#ffffff" />
    <circle cx="300" cy="185" r="14" fill="${color}" stroke="#ffffff" stroke-width="3"/>
    
    <text x="300" y="250" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#ffffff" text-anchor="middle">${label}</text>
    <text x="300" y="278" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.85)" text-anchor="middle">${sublabel}</text>
    
    <!-- Watermark Stamp -->
    <rect x="20" y="340" width="560" height="42" rx="6" fill="rgba(0,0,0,0.65)"/>
    <text x="35" y="362" font-family="monospace" font-size="11" font-weight="bold" fill="#38bdf8">BUKTI TERVERIFIKASI ALSUT LOGISTICS HUB</text>
    <text x="35" y="375" font-family="monospace" font-size="10" fill="#ffffff">ALAM SUTERA TANGERANG · GPS: -6.2238, 106.6521</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_ACTIVITIES: LogisticsActivity[] = [
  {
    id: 'act-001',
    trackingCode: 'ALS-IN-20261011-01',
    type: 'barang_masuk',
    title: 'Penerimaan Batch Sofa Recliner & Kursi Santai',
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    officerId: 'off-1',
    officerName: 'Budi Santoso',
    officerBadge: 'LOG-001',
    targetDepartment: 'Sofa & Chair',
    recipientName: 'Gudang Pusat Alsut',
    items: [
      { id: 'it-1', name: 'Sofa 3-Seater Nordic Grey', qty: 4, unit: 'Unit', notes: 'Kardus tebal' },
      { id: 'it-2', name: 'Armchair Leather Brown', qty: 6, unit: 'Unit', notes: 'Segel QC' },
      { id: 'it-3', name: 'Ottoman Stool Minimalis', qty: 10, unit: 'Unit', notes: 'Koli aman' },
    ],
    photos: {
      listBarangPhoto: createMockPhotoDataUrl('FOTO DAFTAR BARANG MASUK', 'Manifest DO Supplier #INV-9921', '#1e293b'),
      serahTerimaPhoto: createMockPhotoDataUrl('FOTO BONGKAR & CEK BARANG', 'Proses Unloading Area Loading Dock A', '#047857'),
      conditionPhoto: createMockPhotoDataUrl('FOTO KONDISI BOX UTUH', 'Pemeriksaan Segel Pabrik Sempurna', '#0f766e'),
    },
    quickTags: ['Barang Lengkap', 'Kondisi Segel Utuh', 'Packing Kayu Aman'],
    notes: 'Kedatangan kontainer supplier Cikarang. Semua koli utuh tanpa penyok.',
    status: 'verified_by_ps',
    psVerification: {
      verifiedBy: 'Handi Wijaya (PS Sofa & Chair)',
      department: 'Sofa & Chair',
      verifiedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      result: 'sesuai',
      notes: 'Fisik barang dicek bersama Pak Budi Santoso. Jumlah dan kondisi 100% cocok dengan manifest.',
    },
  },
  {
    id: 'act-002',
    trackingCode: 'ALS-OUT-20261011-02',
    type: 'barang_keluar',
    title: 'Pengiriman Pesanan Customer Apartemen Saumata',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    officerId: 'off-2',
    officerName: 'Agus Setiawan',
    officerBadge: 'LOG-002',
    targetDepartment: 'Dining',
    recipientName: 'Ibu Melissa Chandra',
    recipientPhone: '0811-9283-7711',
    destinationLocation: 'Apartemen Saumata Alsut, Tower 1 Lt. 18',
    fleetId: 'flt-2',
    fleetPlate: 'B 9341 SUT',
    fleetName: 'Blind Van 04',
    driverName: 'Pak Joko',
    items: [
      { id: 'it-4', name: 'Set Meja Makan Scandinavian 4 Kursi', qty: 1, unit: 'Set' },
      { id: 'it-5', name: 'Dining Chair Solid Oak', qty: 4, unit: 'Unit' },
    ],
    photos: {
      listBarangPhoto: createMockPhotoDataUrl('FOTO LIST BARANG KELUAR', 'Surat Jalan Dispatch #SJ-8802', '#0369a1'),
      fleetPhoto: createMockPhotoDataUrl('FOTO ARMADA & DRIVER', 'Blind Van 04 (B 9341 SUT) Driver: Pak Joko', '#1d4ed8'),
      recipientPhoto: createMockPhotoDataUrl('FOTO CUSTOMER PENERIMA', 'Ibu Melissa Chandra di Lokasi Tujuan', '#4338ca'),
      serahTerimaPhoto: createMockPhotoDataUrl('FOTO SERAH TERIMA BARANG', 'Handover Langsung ke Customer', '#15803d'),
    },
    quickTags: ['Muatan Terikat Rapi', 'Customer Sudah Dikonfirmasi', 'Tanda Tangan Lengkap'],
    notes: 'Customer request pengiriman sebelum jam 12 siang. Sudah diterima dan tanda tangan.',
    status: 'delivered_to_customer',
  },
  {
    id: 'act-003',
    trackingCode: 'ALS-DEPT-20261011-03',
    type: 'serah_terima_departemen',
    title: 'Serah Terima Lampu Hias & Chandelier Kristal',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    officerId: 'off-1',
    officerName: 'Budi Santoso',
    officerBadge: 'LOG-001',
    targetDepartment: 'Decorative Lighting',
    recipientName: 'Kiki Ramadhan (SPV Decorative Lighting)',
    items: [
      { id: 'it-6', name: 'Chandelier Kristal Modern 60cm', qty: 2, unit: 'Box' },
      { id: 'it-7', name: 'Standing Floor Lamp Nordic Brass', qty: 5, unit: 'Unit' },
      { id: 'it-8', name: 'Lampu Meja Ceramic Warm White', qty: 8, unit: 'Pcs' },
    ],
    photos: {
      listBarangPhoto: createMockPhotoDataUrl('FOTO LIST DECORATIVE LIGHTING', 'Form Transfer Internal DL-401', '#475569'),
      departemenPhoto: createMockPhotoDataUrl('FOTO SERAH TERIMA DEPARTEMEN', 'Staf Kiki R. & Logistik Budi S.', '#ea580c'),
      conditionPhoto: createMockPhotoDataUrl('FOTO KONDISI KACA LAMPU', 'Packing Kayu & Buble Wrap Tebal', '#334155'),
    },
    quickTags: ['Barang Lengkap', 'Serah Terima di Area Display', 'Menunggu Pengecekan PS'],
    notes: 'Barang baru datang dari ekspedisi, langsung diantar ke lantai 1 departemen Decorative Lighting.',
    status: 'pending_dept_check',
  },
  {
    id: 'act-004',
    trackingCode: 'ALS-IN-20261011-04',
    type: 'barang_masuk',
    title: 'Unloading Peralatan Masak & Rak Dapur Premium',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    officerId: 'off-3',
    officerName: 'Rudi Hartono',
    officerBadge: 'LOG-003',
    targetDepartment: 'Kitchen',
    recipientName: 'Area Loading Dock Barat',
    items: [
      { id: 'it-9', name: 'Cookware Set Granite Non-Stick 7 Pcs', qty: 15, unit: 'Set' },
      { id: 'it-10', name: 'Kitchen Organizer Stainless Wall Rack', qty: 20, unit: 'Pcs' },
    ],
    photos: {
      listBarangPhoto: createMockPhotoDataUrl('FOTO LIST BARANG KITCHEN', 'Manifest DO Supplier #KIT-2044', '#0f766e'),
      serahTerimaPhoto: createMockPhotoDataUrl('FOTO BONGKAR KITCHEN', 'Bongkar Muatan Palet Dapur', '#059669'),
    },
    quickTags: ['Barang Lengkap', 'Segel QC Pabrik', 'Kondisi Box Baik'],
    notes: 'Barang masuk untuk restock display Kitchen akhir pekan.',
    status: 'pending_dept_check',
  },
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    title: 'Barang Baru Sampai di Departemen Kitchen',
    message: 'Petugas Logistik Rudi Hartono telah menerima 15 Set Cookware & 20 Pcs Organizer untuk Dept Kitchen.',
    type: 'incoming_goods',
    activityId: 'act-004',
    read: false,
    department: 'Kitchen',
    officerName: 'Rudi Hartono',
  },
  {
    id: 'notif-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    title: 'Barang Baru Sampai di Decorative Lighting',
    message: 'Petugas Logistik Budi Santoso telah menyerahkan Chandelier Kristal & Standing Floor Lamp ke Dept Decorative Lighting.',
    type: 'handover_pending',
    activityId: 'act-003',
    read: false,
    department: 'Decorative Lighting',
    officerName: 'Budi Santoso',
  },
  {
    id: 'notif-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    title: 'Pengecekan Selesai oleh PS Sofa & Chair',
    message: 'Barang masuk Sofa Recliner telah diverifikasi lengkap oleh Handi Wijaya (PS Sofa & Chair).',
    type: 'verified',
    activityId: 'act-001',
    read: true,
    department: 'Sofa & Chair',
    officerName: 'Budi Santoso',
  },
];
