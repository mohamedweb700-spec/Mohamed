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

  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(
      collection(db, `users/${user.uid}/tasks`),
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
      collection(db, `users/${user.uid}/reflections`),
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
  }, [user]);

  const addTask = async (title: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: string) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/tasks`), {
      title,
      completed: false,
      priority,
      dueDate: dueDate || null,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, taskId);
    await updateDoc(taskRef, {
      completed: !currentStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, taskId);
    await deleteDoc(taskRef);
  };

  const addReflection = async (content: string, date: string) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/reflections`), {
      content,
      date,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  return { tasks, reflections, loading, addTask, toggleTask, deleteTask, addReflection };
}
