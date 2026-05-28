import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { Payment } from '../types/models';
import { createMetadata, updateMetadata, createSoftDelete } from './baseRepository';

export const paymentRepository = {
  subscribePayments: (hallId: string, callback: (payments: Payment[]) => void) => {
    const q = query(
      collection(db, 'payments'),
      where('hallId', '==', hallId),
      where('isActive', '==', true)
    );
    return onSnapshot(q, (snapshot) => {
      const payments: Payment[] = [];
      snapshot.forEach((docSnap) => {
        payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
      });
      payments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(payments);
    }, (error) => {
      console.error("subscribePayments error:", error);
      callback([]);
    });
  },

  createPayment: async (
    hallId: string, 
    operatorId: string, 
    paymentData: Omit<Payment, 'id' | 'hallId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'archivedAt' | 'deletedAt'>
  ) => {
    const payRef = doc(collection(db, 'payments'));
    const payDoc: Payment = {
      id: payRef.id,
      hallId,
      ...paymentData,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };
    await setDoc(payRef, payDoc);
    return payRef.id;
  },

  updatePayment: async (paymentId: string, operatorId: string, fields: Partial<Payment>) => {
    const payRef = doc(db, 'payments', paymentId);
    await updateDoc(payRef, {
      ...fields,
      ...updateMetadata(operatorId),
    });
  },

  softDeletePayment: async (paymentId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const payRef = doc(db, 'payments', paymentId);
    await updateDoc(payRef, {
      isActive: false,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });
  },

  getPaymentsByMonth: async (hallId: string, month: string): Promise<Payment[]> => {
    const q = query(
      collection(db, 'payments'),
      where('hallId', '==', hallId),
      where('month', '==', month),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    const payments: Payment[] = [];
    snap.forEach((docSnap) => {
      payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
    });
    return payments;
  },

  getPendingPayments: async (hallId: string): Promise<Payment[]> => {
    const q = query(
      collection(db, 'payments'),
      where('hallId', '==', hallId),
      where('status', '==', 'Pending'),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    const payments: Payment[] = [];
    snap.forEach((docSnap) => {
      payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
    });
    return payments;
  },

  getOverduePayments: async (hallId: string): Promise<Payment[]> => {
    const q = query(
      collection(db, 'payments'),
      where('hallId', '==', hallId),
      where('status', '==', 'Overdue'),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    const payments: Payment[] = [];
    snap.forEach((docSnap) => {
      payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
    });
    return payments;
  }
};

export default paymentRepository;
