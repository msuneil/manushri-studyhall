import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { AppNotification } from '../types/models';
import { createMetadata, updateMetadata } from './baseRepository';

export const notificationRepository = {
  subscribeNotifications: (hallId: string, callback: (notifs: AppNotification[]) => void) => {
    const q = query(
      collection(db, 'notifications'),
      where('hallId', '==', hallId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
      });
      callback(notifs);
    });
  },

  createNotification: async (
    hallId: string, 
    operatorId: string, 
    title: string, 
    message: string, 
    type: AppNotification['type']
  ) => {
    const notifRef = doc(collection(db, 'notifications'));
    const notifDoc: AppNotification = {
      id: notifRef.id,
      hallId,
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      isRead: false,
      ...createMetadata(operatorId)
    };
    await setDoc(notifRef, notifDoc);
    return notifRef.id;
  },

  markNotificationAsRead: async (notifId: string, operatorId: string) => {
    const notifRef = doc(db, 'notifications', notifId);
    await updateDoc(notifRef, {
      isRead: true,
      ...updateMetadata(operatorId)
    });
  }
};

export default notificationRepository;
