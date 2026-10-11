export type UserRole = 'logistik' | 'manager' | 'ps';

export type ActivityType = 'barang_masuk' | 'barang_keluar' | 'serah_terima_departemen';

export type ActivityStatus = 
  | 'pending_dept_check' 
  | 'verified_by_ps' 
  | 'in_transit' 
  | 'delivered_to_customer' 
  | 'completed';

export interface LogisticsOfficer {
  id: string;
  name: string;
  badgeNumber: string;
  phone: string;
  avatar?: string;
  shift: string;
}

export interface FleetVehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: string;
  driverName: string;
  status: 'tersedia' | 'dalam_pengiriman' | 'maintenance';
}

export interface ActivityItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  notes?: string;
}

export interface ActivityPhotos {
  serahTerimaPhoto?: string;     // Foto serah terima
  listBarangPhoto?: string;      // Foto list barang diterima / keluar
  recipientPhoto?: string;       // Foto customer / penerima
  fleetPhoto?: string;           // Foto armada yang membawa barang
  departemenPhoto?: string;      // Foto serah terima ke departemen
  conditionPhoto?: string;       // Foto fisik / kondisi kemasan
}

export interface PSVerification {
  verifiedBy: string;
  department: string;
  verifiedAt: string;
  result: 'sesuai' | 'sebagian' | 'ada_masalah';
  notes: string;
  signature?: string;
}

export interface LogisticsActivity {
  id: string;
  trackingCode: string;
  type: ActivityType;
  title: string;
  timestamp: string;
  
  // MANDATORY: Nama Petugas Logistik
  officerId: string;
  officerName: string;
  officerBadge: string;
  
  // DC & Origin / Destination
  dcOrigin?: string;
  targetDepartment?: string;
  
  // Recipient / Customer details
  recipientName?: string;
  recipientRoleOrDept?: string;
  recipientPhone?: string;
  recipientSignature?: string;
  
  // Fleet & Armada
  fleetId?: string;
  fleetPlate?: string;
  fleetName?: string;
  driverName?: string;
  destinationLocation?: string;
  
  // Goods info
  items: ActivityItem[];
  photos: ActivityPhotos;
  quickTags: string[];
  notes?: string;
  
  // Status & Verification
  status: ActivityStatus;
  psVerification?: PSVerification;
}

export interface InAppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'incoming_goods' | 'handover_pending' | 'verified' | 'dispatched';
  activityId?: string;
  read: boolean;
  department?: string;
  officerName: string;
}
