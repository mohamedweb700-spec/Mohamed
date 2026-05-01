import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: any;
  userId: string;
}

export interface Reflection {
  id: string;
  content: string;
  date: string;
  userId: string;
  createdAt: any;
}

export function useFirestore() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  // Use guest ID from localStorage if not logged in
  const guestId = typeof window !== 'undefined' ? localStorage.getItem('guest_id') || 'guest_default' : 'guest_default';
  const effectiveUserId = user?.uid || guestId;

  useEffect(() => {
    const tasksQuery = query(
      collection(db, `users/${effectiveUserId}/tasks`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(fetchedTasks);
    });

    const reflectionsQuery = query(
      collection(db, `users/${effectiveUserId}/reflections`),
      orderBy('date', 'desc')
    );

    const unsubscribeReflections = onSnapshot(reflectionsQuery, (snapshot) => {
      const fetchedReflections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reflection[];
      setReflections(fetchedReflections);
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeReflections();
    };
  }, [effectiveUserId]);

  const addTask = async (title: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: string) => {
    await addDoc(collection(db, `users/${effectiveUserId}/tasks`), {
      title,
      completed: false,
      priority,
      dueDate: dueDate || null,
      userId: effectiveUserId,
      createdAt: serverTimestamp(),
    });
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    const taskRef = doc(db, `users/${effectiveUserId}/tasks`, taskId);
    await updateDoc(taskRef, {
      completed: !currentStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteTask = async (taskId: string) => {
    const taskRef = doc(db, `users/${effectiveUserId}/tasks`, taskId);
    await deleteDoc(taskRef);
  };

  const addReflection = async (content: string, date: string) => {
    await addDoc(collection(db, `users/${effectiveUserId}/reflections`), {
      content,
      date,
      userId: effectiveUserId,
      createdAt: serverTimestamp(),
    });
  };

  return { tasks, reflections, loading, addTask, toggleTask, deleteTask, addReflection };
}
