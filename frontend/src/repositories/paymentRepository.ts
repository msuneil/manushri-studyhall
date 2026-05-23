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
import type { Payment } from '../types/models';
import { createMetadata, updateMetadata, createSoftDelete } from './baseRepository';

export const paymentRepository = {
  subscribePayments: (hallId: string, callback: (payments: Payment[]) => void) => {
    const q = query(
      collection(db, 'payments'),
      where('hallId', '==', hallId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const payments: Payment[] = [];
      snapshot.forEach((docSnap) => {
        payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
      });
      callback(payments);
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
  }
};

export default paymentRepository;
