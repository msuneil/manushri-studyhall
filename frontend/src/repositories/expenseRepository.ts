import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { Expense } from '../types/models';
import { createMetadata } from './baseRepository';

export const expenseRepository = {
  subscribeExpenses: (hallId: string, callback: (expenses: Expense[]) => void) => {
    const q = query(
      collection(db, 'expenses'),
      where('hallId', '==', hallId)
    );
    return onSnapshot(q, (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.forEach((docSnap) => {
        expenses.push({ id: docSnap.id, ...docSnap.data() } as Expense);
      });
      expenses.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(expenses);
    }, (error) => {
      console.error("subscribeExpenses error:", error);
      callback([]);
    });
  },

  createExpense: async (
    hallId: string, 
    operatorId: string, 
    category: string, 
    amount: number, 
    date: string, 
    description: string, 
    month: string
  ) => {
    const expRef = doc(collection(db, 'expenses'));
    const expDoc: Expense = {
      id: expRef.id,
      hallId,
      category,
      amount,
      date,
      description,
      month,
      ...createMetadata(operatorId)
    };
    await setDoc(expRef, expDoc);
    return expRef.id;
  }
};

export default expenseRepository;
