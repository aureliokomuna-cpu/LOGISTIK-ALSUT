import React from 'react';
import { InAppNotification } from '../types/logistics';
import { Bell, CheckCheck, X, ArrowRight, Package, Clock, ShieldAlert } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (activityId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Notifikasi Otomatis</h3>
              <p className="text-xs text-slate-300">Update Kedatangan & Serah Terima Barang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action strip */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            {notifications.length} Pesan Masuk
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50 stroke-1" />
              <p className="text-sm font-semibold">Belum ada notifikasi kedatangan barang</p>
              <p className="text-xs mt-1">Notifikasi otomatis berbunyi saat barang masuk diserahkan.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const timeFormatted = new Date(notif.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.activityId) onSelectNotification(notif.activityId);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 leading-snug">
                      {notif.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {timeFormatted}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">
                      Petugas: <strong className="text-slate-900">{notif.officerName}</strong>
                    </span>
                    {notif.activityId && (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        Lihat Detail <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Automatic Toast Arrival Banner shown when a new activity is submitted
interface ArrivalAlertBannerProps {
  bannerData: InAppNotification | null;
  onDismiss: () => void;
  onViewActivity: (id: string) => void;
}

export const ArrivalAlertBanner: React.FC<ArrivalAlertBannerProps> = ({
  bannerData,
  onDismiss,
  onViewActivity,
}) => {
  if (!bannerData) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto animate-in slide-in-from-top duration-300">
      <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-500 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md shadow-amber-500/30">
          <Bell className="w-6 h-6 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
              NOTIFIKASI OTOMATIS
            </span>
            <span className="text-slate-400 text-xs">Baru Saja Tiba</span>
          </div>

          <h4 className="font-bold text-sm text-white mt-0.5 truncate">{bannerData.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
            {bannerData.message}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            {bannerData.activityId && (
              <button
                onClick={() => {
                  onViewActivity(bannerData.activityId!);
                  onDismiss();
                }}
                className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                Cek Bukti & Detail <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onDismiss}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
