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
import type { Task } from '../types/models';
import { createMetadata, updateMetadata, createSoftDelete } from './baseRepository';

export const taskRepository = {
  subscribeTasks: (hallId: string, callback: (tasks: Task[]) => void) => {
    const q = query(
      collection(db, 'tasks'),
      where('hallId', '==', hallId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      callback(tasks);
    });
  },

  createTask: async (hallId: string, operatorId: string, title: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => {
    const taskRef = doc(collection(db, 'tasks'));
    const taskDoc: Task = {
      id: taskRef.id,
      hallId,
      title,
      isCompleted: false,
      dueDate,
      priority,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };
    await setDoc(taskRef, taskDoc);
    return taskRef.id;
  },

  updateTask: async (taskId: string, operatorId: string, fields: Partial<Task>) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...fields,
      ...updateMetadata(operatorId),
    });
  },

  softDeleteTask: async (taskId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      isActive: false,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });
  }
};

export default taskRepository;
