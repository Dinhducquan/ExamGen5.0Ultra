import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { db } from "./firebase";

export interface SystemNotification {
  id: string;
  type: 'user_registration' | 'license_request' | 'system';
  title: string;
  message: string;
  userName?: string;
  userEmail?: string;
  school?: string;
  profGroup?: string;
  createdAt: string;
  read: boolean;
}

const NOTIFICATIONS_COLLECTION = "notifications";

/**
 * Creates a notification in Cloud Firestore (e.g., when a new user registers)
 */
export async function createAdminNotification(
  data: Omit<SystemNotification, 'id' | 'createdAt' | 'read'>
): Promise<SystemNotification> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const newNotif: SystemNotification = {
    ...data,
    id: notifId,
    createdAt: nowStr,
    read: false,
  };

  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notifId);
    await setDoc(docRef, newNotif);
  } catch (err) {
    console.warn("Failed to create admin notification on Firestore:", err);
  }

  // Save to local cache for instant offline access
  try {
    const local = localStorage.getItem("examgen_admin_notifications");
    const existing: SystemNotification[] = local ? JSON.parse(local) : [];
    localStorage.setItem("examgen_admin_notifications", JSON.stringify([newNotif, ...existing]));
  } catch (_) {}

  return newNotif;
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
    await updateDoc(docRef, { read: true });
  } catch (err) {
    console.warn("Failed to mark notification as read on Firestore:", err);
  }

  try {
    const local = localStorage.getItem("examgen_admin_notifications");
    if (local) {
      const existing: SystemNotification[] = JSON.parse(local);
      const updated = existing.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem("examgen_admin_notifications", JSON.stringify(updated));
    }
  } catch (_) {}
}

/**
 * Marks all notifications as read
 */
export async function markAllNotificationsAsRead(ids: string[]): Promise<void> {
  for (const id of ids) {
    await markNotificationAsRead(id);
  }
}

/**
 * Subscribes to real-time notification updates from Cloud Firestore
 */
export function subscribeAdminNotifications(
  onUpdate: (notifications: SystemNotification[]) => void
): Unsubscribe {
  const notifRef = collection(db, NOTIFICATIONS_COLLECTION);
  return onSnapshot(
    notifRef,
    (snapshot) => {
      const list: SystemNotification[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SystemNotification);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn("Real-time notifications subscription error:", err);
      try {
        const local = localStorage.getItem("examgen_admin_notifications");
        if (local) onUpdate(JSON.parse(local));
      } catch (_) {}
    }
  );
}
