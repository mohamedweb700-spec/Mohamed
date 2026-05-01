import { useState } from 'react';
import { useFirestore, Task } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Plus, Trash2, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function TaskBoard() {
  const { tasks, addTask, toggleTask, deleteTask } = useFirestore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, priority);
    setNewTaskTitle('');
    setPriority('medium');
  };

  const priorityMap = {
    high: { label: 'عاجل', color: 'bg-red-100 text-red-700 border-red-200' },
    medium: { label: 'مهم', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    low: { label: 'عادي', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-emerald-900">إضافة مهمة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="ماذا تريد إنجازه اليوم؟"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-white border-emerald-100 focus-visible:ring-emerald-500"
            />
            <div className="flex gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="bg-white border border-emerald-100 rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">عادي</option>
                <option value="medium">مهم</option>
                <option value="high">عاجل</option>
              </select>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group flex items-center justify-between p-4 bg-white rounded-xl border border- emerald-50 shadow-sm transition-all hover:shadow-md",
                task.completed && "opacity-60 bg-emerald-50/30"
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  className="text-emerald-500 hover:scale-110 transition-transform"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-lg font-medium transition-all",
                    task.completed && "line-through text-slate-400"
                  )}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityMap[task.priority].color)}>
                      {priorityMap[task.priority].label}
                    </Badge>
                    {task.createdAt && (
                      <span className="text-[10px] text-slate-400">
                        {format(task.createdAt.toDate(), 'HH:mm', { locale: ar })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">لا يوجد مهام حالياً. ابدأ بإضافة مهمة جديدة!</p>
          </div>
        )}
      </div>
    </div>
  );
}
