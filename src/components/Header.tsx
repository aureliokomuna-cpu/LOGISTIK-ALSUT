import React from 'react';
import { UserRole, LogisticsOfficer, InAppNotification } from '../types/logistics';
import { GOOGLE_DRIVE_FOLDER_URL } from '../utils/driveUtils';
import { Truck, Bell, Volume2, VolumeX, ShieldCheck, User, Users, ClipboardCheck, FolderUp } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeOfficer: LogisticsOfficer;
  officers: LogisticsOfficer[];
  onSelectOfficer: (officer: LogisticsOfficer) => void;
  notifications: InAppNotification[];
  onOpenNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activeOfficer,
  officers,
  onSelectOfficer,
  notifications,
  onOpenNotifications,
  soundEnabled,
  onToggleSound,
  onOpenTutorial,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-4">
        {/* Top Row on Mobile: Brand, Officer Pill, Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Truck className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-lg tracking-tight text-white">ALSUT LOGISTICS</span>
                <span className="text-[8px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded">
                  HUB
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">Home Center Alam Sutera</p>
            </div>
          </div>

          {/* Actions & Officer on Mobile / Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Officer badge on mobile */}
            <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/90 border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <div className="text-left text-xs max-w-[110px] sm:max-w-none">
                <span className="text-[8px] sm:text-[10px] text-slate-400 block font-medium leading-none hidden sm:block">Petugas:</span>
                <select
                  value={activeOfficer.id}
                  onChange={(e) => {
                    const found = officers.find((o) => o.id === e.target.value);
                    if (found) onSelectOfficer(found);
                  }}
                  className="bg-transparent text-amber-300 sm:text-white font-bold text-[11px] sm:text-xs focus:outline-none cursor-pointer pr-1 truncate block w-full"
                  title="Pilih Petugas Logistik Aktif"
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id} className="bg-slate-800 text-white">
                      {off.name} ({off.badgeNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sound notification toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Suara Notifikasi Aktif' : 'Suara Notifikasi Senyap'}
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors border ${
                soundEnabled
                  ? 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-slate-700'
                  : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Tutorial & Panduan Button */}
            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-colors shadow-2xs"
                title="Panduan & Tutorial Penggunaan Aplikasi"
              >
                <span>💡</span>
                <span className="hidden sm:inline">Tutorial</span>
              </button>
            )}

            {/* Google Drive Folder Shortcut */}
            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-colors shadow-2xs"
              title="Buka Folder Google Drive Bukti Foto Logistik Alsut"
            >
              <FolderUp className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Drive Foto</span>
            </a>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              title="Pemberitahuan Otomatis Kedatangan Barang"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Row on Mobile / Center on Desktop: Role Switcher (Compact grid) */}
        <nav className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-800/90 p-0.5 sm:p-1 rounded-xl border border-slate-700/80 w-full sm:w-auto">
          <button
            onClick={() => onSelectRole('logistik')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              currentRole === 'logistik'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Truck className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden">1. Logistik</span>
            <span className="hidden sm:inline">1. Logistik (Eksekutor)</span>
          </button>

          <button
            onClick={() => onSelectRole('manager')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              currentRole === 'manager'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden">2. Manager</span>
            <span className="hidden sm:inline">2. Manager (Pantau)</span>
          </button>

          <button
            onClick={() => onSelectRole('ps')}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              currentRole === 'ps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <ClipboardCheck className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden">3. PS</span>
            <span className="hidden sm:inline">3. PS (Cek Dept)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
