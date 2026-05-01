import { AuthProvider, useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import TaskBoard from './components/TaskBoard';
import Pomodoro from './components/Pomodoro';
import Reflection from './components/Reflection';
import { Button } from './components/ui/button';
import { Progress, ProgressTrack, ProgressIndicator } from './components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card } from './components/ui/card';
import { Toaster } from './components/ui/sonner';
import { cn } from './lib/utils';
import { 
  BarChart3, 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  LogIn,
  Sun,
  Moon,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { GoogleGenAI } from "@google/genai";

function AppContent() {

  const { user, loading, signIn, logout } = useAuth();
  const { tasks } = useFirestore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [affirmation, setAffirmation] = useState('');

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  useEffect(() => {
    if (user && !affirmation) {
      const fetchAffirmation = async () => {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "أعطني توكيداً إيجابياً قصيراً جداً وملهماً لليوم باللغة العربية لشخص يريد تنظيم يومه.",
          });
          setAffirmation(response.text || '');
        } catch (e) {
          setAffirmation('يوم جديد، فرصة جديدة للإنجاز!');
        }
      };
      fetchAffirmation();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-emerald-600 w-12 h-12 rounded-full"
        />
      </div>
    );
  }

  // Login gate removed - app opens directly
  const displayName = user?.displayName || 'مُستخدم';
  const photoURL = user?.photoURL || '';

  return (
    <div className="min-h-screen pb-24 md:pb-8 flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col p-6 bg-white border-l border-slate-100 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-emerald-900">مُنظّم</span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarLink 
            icon={<LayoutDashboard />} 
            label="اللوحة الرئيسية" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            icon={<BarChart3 />} 
            label="أدوات التركيز" 
            active={activeTab === 'focus'} 
            onClick={() => setActiveTab('focus')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-100 bg-slate-100 overflow-hidden flex items-center justify-center">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-600 font-bold">G</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">{displayName}</span>
              {user ? (
                <button onClick={logout} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                  <LogOut className="w-3 h-3" />
                  تسجيل الخروج
                </button>
              ) : (
                <button onClick={signIn} className="text-xs text-emerald-500 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                  <LogIn className="w-3 h-3" />
                  تسجيل الدخول
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'}، {displayName.split(' ')[0]} 👋
            </h2>
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(), 'EEEE, d MMMM', { locale: ar })}</span>
            </div>
          </div>
          <div className="md:hidden">
            {user ? (
              <Button size="icon" variant="outline" className="rounded-full" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="icon" variant="outline" className="rounded-full" onClick={signIn}>
                <LogIn className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Affirmation Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <Wind className="w-10 h-10 mb-4 opacity-50 group-hover:rotate-12 transition-transform" />
                  <p className="text-2xl font-medium leading-relaxed max-w-md">
                    {affirmation || 'يوم مليء بالإبداع والتميز بانتظارك!'}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl -ml-12 -mb-12" />
              </motion.div>

              {/* Progress Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm p-6 bg-white rounded-2xl">
                  <span className="text-slate-400 text-sm font-medium mb-2 block">إنجاز اليوم</span>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-black text-emerald-600">{Math.round(progress)}%</span>
                    <span className="text-slate-400 text-sm mb-1">من المهام</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-emerald-50">
                    <ProgressTrack>
                      <ProgressIndicator className="bg-emerald-500" />
                    </ProgressTrack>
                  </Progress>
                </Card>

                <Card className="border-none shadow-sm p-6 bg-white rounded-2xl flex flex-col justify-center">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="text-orange-600 w-6 h-6" />
                     </div>
                     <div>
                        <span className="text-slate-800 font-bold block">{completedTasks} من {tasks.length}</span>
                        <span className="text-xs text-slate-400">مهام مكتملة</span>
                     </div>
                   </div>
                </Card>
              </div>

              <TaskBoard />
            </div>

            <div className="space-y-8">
              <Pomodoro />
              <Reflection />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <Pomodoro />
            <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-slate-100">
               <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400">إحصائيات الإنجاز قادمة قريباً...</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-4 z-50">
        <MobileNavLink 
          icon={<LayoutDashboard />} 
          label="الرئيسية" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <div className="w-16 h-16 -mt-12 bg-white rounded-full p-2 border-4 border-[#f8fafc]">
          <div className="bg-emerald-600 w-full h-full rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
             <Calendar className="w-6 h-6" />
          </div>
        </div>
        <MobileNavLink 
          icon={<BarChart3 />} 
          label="التركيز" 
          active={activeTab === 'focus'} 
          onClick={() => setActiveTab('focus')} 
        />
      </nav>
      
      <Toaster position="top-center" dir="rtl" />
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
        active ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {React.cloneElement(icon, { className: cn("w-5 h-5", active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600") })}
      <span>{label}</span>
    </button>
  );
}

function MobileNavLink({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-emerald-600" : "text-slate-400"
      )}
    >
      {React.cloneElement(icon, { className: "w-6 h-6" })}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
