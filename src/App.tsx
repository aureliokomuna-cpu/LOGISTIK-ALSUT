/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, LogisticsOfficer, LogisticsActivity, InAppNotification, PSVerification } from './types/logistics';
import {
  INITIAL_OFFICERS,
  INITIAL_FLEET,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
} from './data/initialData';
import { notificationService } from './utils/notification';
import { systemSync, SyncMessage } from './utils/systemSync';
import { Header } from './components/Header';
import { LogisticsFieldView } from './components/LogisticsFieldView';
import { ManagerDashboard } from './components/ManagerDashboard';
import { PSDepartmentView } from './components/PSDepartmentView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { DailyReportPreviewModal } from './components/DailyReportPreviewModal';
import { NotificationDrawer, ArrivalAlertBanner } from './components/NotificationBanner';
import { TutorialModal } from './components/TutorialModal';

export default function App() {
  // Current user role view
  const [currentRole, setCurrentRole] = useState<UserRole>('logistik');

  // Officers list and current logged-in officer
  const [officers] = useState<LogisticsOfficer[]>(INITIAL_OFFICERS);
  const [activeOfficer, setActiveOfficer] = useState<LogisticsOfficer>(() => {
    const saved = localStorage.getItem('alsut_active_officer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = INITIAL_OFFICERS.find(
          (o) => o.badgeNumber === parsed.badgeNumber || o.name?.toLowerCase() === parsed.name?.toLowerCase()
        );
        if (match) return match;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_OFFICERS[0];
  });

  // Fleets list
  const [fleets] = useState(INITIAL_FLEET);

  // Activities state with LocalStorage persistence
  const [activities, setActivities] = useState<LogisticsActivity[]>(() => {
    const saved = localStorage.getItem('alsut_logistics_activities_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed parsing activities from storage:', e);
      }
    }
    return INITIAL_ACTIVITIES;
  });

  // Notifications state with LocalStorage persistence
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('alsut_logistics_notifications_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed parsing notifications from storage:', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sound chime preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals & Drawers state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState<boolean>(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    return !localStorage.getItem('alsut_seen_tutorial');
  });

  // Auto arrival popup alert banner
  const [arrivalBanner, setArrivalBanner] = useState<InAppNotification | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('alsut_logistics_activities_v2', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('alsut_logistics_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('alsut_active_officer', JSON.stringify(activeOfficer));
  }, [activeOfficer]);

  // Unified System Synchronization across tabs, windows, and roles
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'alsut_logistics_activities_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setActivities(parsed);
        } catch (err) {
          console.warn('Storage sync parse error:', err);
        }
      }
      if (e.key === 'alsut_logistics_notifications_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setNotifications(parsed);
        } catch (err) {
          console.warn('Notification storage sync error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // BroadcastChannel sync listener
    const unsubscribe = systemSync.subscribe((msg: SyncMessage) => {
      if (msg.type === 'NEW_ACTIVITY') {
        setActivities((prev) => {
          if (prev.some((a) => a.id === msg.activity.id)) return prev;
          return [msg.activity, ...prev];
        });
      } else if (msg.type === 'ACTIVITY_VERIFIED') {
        setActivities((prev) =>
          prev.map((act) =>
            act.id === msg.activityId
              ? { ...act, status: 'verified_by_ps', psVerification: msg.verification }
              : act
          )
        );
      } else if (msg.type === 'ACTIVITIES_UPDATED') {
        setActivities(msg.activities);
      } else if (msg.type === 'NEW_NOTIFICATION') {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === msg.notification.id)) return prev;
          return [msg.notification, ...prev];
        });
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Request browser notification permission once
  useEffect(() => {
    notificationService.requestBrowserPermission();
  }, []);

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    notificationService.setSoundEnabled(nextVal);
    if (nextVal) {
      notificationService.playSuccessBeep();
    }
  };

  // Submit Activity from Field Logistics (Eksekutor)
  const handleSubmitActivity = (newActivity: LogisticsActivity) => {
    // Prepend to activities list
    setActivities((prev) => [newActivity, ...prev]);

    // Create automatic goods arrival notification
    const isDept = newActivity.type === 'serah_terima_departemen' || newActivity.type === 'barang_masuk';
    const notifTitle =
      newActivity.type === 'barang_masuk'
        ? `🔔 Kedatangan Barang Masuk: ${newActivity.targetDepartment || 'Gudang'}`
        : newActivity.type === 'barang_keluar'
        ? `🚚 Barang Keluar Dispatch: ${newActivity.recipientName || 'Customer'}`
        : `🏢 Barang Tiba di Departemen ${newActivity.targetDepartment}`;

    const notifMsg = `Petugas Logistik ${newActivity.officerName} telah menyerahkan ${newActivity.items
      .map((it) => `${it.qty} ${it.unit} ${it.name}`)
      .join(', ')}. Bukti foto & tracking lengkap.`;

    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: notifTitle,
      message: notifMsg,
      type: isDept ? 'incoming_goods' : 'dispatched',
      activityId: newActivity.id,
      read: false,
      department: newActivity.targetDepartment,
      officerName: newActivity.officerName,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Broadcast to unified system across all tabs & roles
    systemSync.broadcast({ type: 'NEW_ACTIVITY', activity: newActivity });
    systemSync.broadcast({ type: 'NEW_NOTIFICATION', notification: newNotif });

    // Trigger audible chime & browser notification
    notificationService.playArrivalChime();
    notificationService.sendBrowserNotification(notifTitle, notifMsg);

    // Show floating alert banner
    setArrivalBanner(newNotif);

    // Auto dismiss banner after 7 seconds
    setTimeout(() => {
      setArrivalBanner((current) => (current?.id === newNotif.id ? null : current));
    }, 7000);
  };

  // PS Department Verification Confirm
  const handleVerifyActivity = (activityId: string, verification: PSVerification) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId
          ? {
              ...act,
              status: 'verified_by_ps',
              psVerification: verification,
            }
          : act
      )
    );

    // Notify Manager & Officer
    const notifTitle = `✓ Pengecekan Selesai oleh PS ${verification.department}`;
    const notifMsg = `Barang pada referensi tersebut telah dicek & diverifikasi oleh ${verification.verifiedBy} (Hasil: ${verification.result.toUpperCase()}).`;

    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: notifTitle,
      message: notifMsg,
      type: 'verified',
      activityId,
      read: false,
      department: verification.department,
      officerName: verification.verifiedBy,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Broadcast verification to unified system
    systemSync.broadcast({ type: 'ACTIVITY_VERIFIED', activityId, verification });
    systemSync.broadcast({ type: 'NEW_NOTIFICATION', notification: newNotif });

    notificationService.playSuccessBeep();
    setArrivalBanner(newNotif);

    setTimeout(() => {
      setArrivalBanner((current) => (current?.id === newNotif.id ? null : current));
    }, 6000);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const activeSelectedActivity = activities.find((a) => a.id === selectedActivityId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header with Role Switcher & Audio Bell */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        activeOfficer={activeOfficer}
        officers={officers}
        onSelectOfficer={setActiveOfficer}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsDrawerOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* 2. Automatic Goods Arrival Pop-up Banner */}
      <ArrivalAlertBanner
        bannerData={arrivalBanner}
        onDismiss={() => setArrivalBanner(null)}
        onViewActivity={(id) => setSelectedActivityId(id)}
      />

      {/* 3. Main Workspace Area per Role */}
      <main className="flex-1 pb-16">
        {currentRole === 'logistik' && (
          <LogisticsFieldView
            activeOfficer={activeOfficer}
            officers={officers}
            onSelectOfficer={setActiveOfficer}
            fleets={fleets}
            onSubmitActivity={handleSubmitActivity}
            recentActivities={activities}
            onViewActivityDetail={(id) => setSelectedActivityId(id)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
          />
        )}

        {currentRole === 'manager' && (
          <ManagerDashboard
            activities={activities}
            officers={officers}
            fleets={fleets}
            onViewActivityDetail={(id) => setSelectedActivityId(id)}
            onOpenReportPreview={() => setIsReportPreviewOpen(true)}
          />
        )}

        {currentRole === 'ps' && (
          <PSDepartmentView
            activities={activities}
            onVerifyActivity={handleVerifyActivity}
            onViewActivityDetail={(id) => setSelectedActivityId(id)}
          />
        )}
      </main>

      {/* 4. Bottom Quick Role Helper Info (Clean Editorial) */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 px-6 text-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-200">Alsut Logistics Hub</span>
            <span className="mx-2">·</span>
            <span>Sistem Serah Terima Barang & Monitoring Dispatch Alam Sutera</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Mode Aktif: <strong className="text-amber-400 capitalize">{currentRole}</strong></span>
            <span>·</span>
            <span>Petugas: <strong className="text-slate-200">{activeOfficer.name}</strong></span>
            <span>·</span>
            <span>Auto-Notifikasi: <strong className={soundEnabled ? 'text-emerald-400' : 'text-slate-500'}>{soundEnabled ? 'Aktif 🔔' : 'Mute 🔕'}</strong></span>
          </div>
        </div>
      </footer>

      {/* 5. Modals and Drawers */}
      <ActivityDetailModal
        activity={activeSelectedActivity}
        onClose={() => setSelectedActivityId(null)}
      />

      <DailyReportPreviewModal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        activities={activities}
      />

      <NotificationDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onSelectNotification={(actId) => {
          setSelectedActivityId(actId);
          setIsNotificationsDrawerOpen(false);
        }}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          localStorage.setItem('alsut_seen_tutorial', 'true');
        }}
      />
    </div>
  );
}
