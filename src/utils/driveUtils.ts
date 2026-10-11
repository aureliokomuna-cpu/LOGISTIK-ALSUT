/**
 * Google Drive Monitoring & Standardized File Naming Utility
 * Folder ID: 18iOezItIxr7uMDVyBZnxv-ZJOjm2aaJj
 * Folder URL: https://drive.google.com/drive/folders/18iOezItIxr7uMDVyBZnxv-ZJOjm2aaJj?usp=sharing
 */

import { LogisticsActivity, ActivityPhotos } from '../types/logistics';

export const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/18iOezItIxr7uMDVyBZnxv-ZJOjm2aaJj?usp=sharing';

export const GOOGLE_DRIVE_FOLDER_ID = '18iOezItIxr7uMDVyBZnxv-ZJOjm2aaJj';

/**
 * Format timestamp into YYYY-MM-DD_HHmmss
 */
export function formatTimestampForDrive(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
}

/**
 * Sanitize string for clean filenames (alphanumeric and underscores only)
 */
function sanitizeFileNamePart(str?: string, fallback: string = 'ALSUT'): string {
  if (!str) return fallback;
  return str
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 25);
}

/**
 * Generate standardized Google Drive monitoring filename according to date
 * Format: YYYY-MM-DD_HHmmss_[TIPE]_[DC/DEPT]_[PETUGAS]_[JENIS_FOTO].jpg
 */
export function generateDriveFileName(params: {
  timestamp?: string | Date;
  type?: string;
  dcOrigin?: string;
  targetDepartment?: string;
  officerName?: string;
  photoKey: keyof ActivityPhotos | string;
  customLabel?: string;
}): string {
  const dateStr = formatTimestampForDrive(params.timestamp);

  // Type short code
  let typeCode = 'LOG';
  if (params.type === 'barang_masuk') typeCode = 'MASUK';
  else if (params.type === 'barang_keluar') typeCode = 'KELUAR';
  else if (params.type === 'serah_terima_departemen') typeCode = 'DEPT';

  // DC or Department location code
  const locPart = sanitizeFileNamePart(
    params.dcOrigin || params.targetDepartment,
    'ALSUT'
  ).toUpperCase();

  // Officer name
  const officerPart = sanitizeFileNamePart(params.officerName, 'PETUGAS');

  // Photo category label
  let photoLabel = params.customLabel || 'BUKTI';
  if (params.photoKey === 'listBarangPhoto') photoLabel = 'MANIFEST_BARANG';
  else if (params.photoKey === 'serahTerimaPhoto') photoLabel = 'SERAH_TERIMA_FISIK';
  else if (params.photoKey === 'recipientPhoto') photoLabel = 'PENERIMA_CUSTOMER';
  else if (params.photoKey === 'fleetPhoto') photoLabel = 'ARMADA_TRANSPORT';
  else if (params.photoKey === 'departemenPhoto') photoLabel = 'STAF_DEPARTEMEN';

  return `${dateStr}_${typeCode}_${locPart}_${officerPart}_${photoLabel}.jpg`;
}

/**
 * Trigger immediate browser download of an image with the standardized Drive filename
 */
export function downloadPhotoWithDriveName(dataUrl: string, fileName: string) {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error downloading file:', err);
  }
}

/**
 * Open the specified Google Drive monitoring folder
 */
export function openGoogleDriveFolder() {
  if (typeof window !== 'undefined') {
    window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Generate all drive filenames for an activity's photos
 */
export function getActivityDriveFileNames(activity: LogisticsActivity): Record<string, string> {
  const result: Record<string, string> = {};
  const photoKeys: (keyof ActivityPhotos)[] = [
    'listBarangPhoto',
    'serahTerimaPhoto',
    'recipientPhoto',
    'fleetPhoto',
    'departemenPhoto',
  ];

  photoKeys.forEach((key) => {
    if (activity.photos[key]) {
      result[key] = generateDriveFileName({
        timestamp: activity.timestamp,
        type: activity.type,
        dcOrigin: activity.dcOrigin,
        targetDepartment: activity.targetDepartment,
        officerName: activity.officerName,
        photoKey: key,
      });
    }
  });

  return result;
}
