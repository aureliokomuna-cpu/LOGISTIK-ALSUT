/**
 * System-Wide Synchronization Utility
 * Ensures all inputs across officers, PS departments, and managers are unified in ONE shared system.
 * Uses BroadcastChannel and window StorageEvent for cross-tab and real-time syncing.
 */

import { LogisticsActivity, InAppNotification, PSVerification } from '../types/logistics';

export type SyncMessage =
  | { type: 'NEW_ACTIVITY'; activity: LogisticsActivity }
  | { type: 'ACTIVITY_VERIFIED'; activityId: string; verification: PSVerification }
  | { type: 'ACTIVITIES_UPDATED'; activities: LogisticsActivity[] }
  | { type: 'NEW_NOTIFICATION'; notification: InAppNotification };

class SystemSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: ((message: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('alsut_logistics_unified_system');
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization fallback:', err);
      }
    }
  }

  public subscribe(listener: (message: SyncMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(message: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public broadcast(message: SyncMessage) {
    this.notifyListeners(message);
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('Error broadcasting sync message:', err);
      }
    }
  }
}

export const systemSync = new SystemSyncService();
