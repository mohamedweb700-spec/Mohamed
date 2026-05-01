import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notification
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (mode === 'work' ? (25 * 60 - timeLeft) / (25 * 60) : (5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <Card className="border-none shadow-lg bg-white overflow-hidden relative">
      <div 
        className={cn(
          "absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-1000",
          mode === 'break' && "bg-orange-400"
        )} 
        style={{ width: `${progress}%` }} 
      />
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-slate-500 font-medium">مؤقت التركيز</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-8">
        <div className="flex gap-4 mb-8">
          <Button
            variant={mode === 'work' ? 'default' : 'ghost'}
            className={cn(
              "rounded-full px-6 transition-all",
              mode === 'work' ? "bg-emerald-600 hover:bg-emerald-700" : "text-emerald-600"
            )}
            onClick={() => switchMode('work')}
          >
            <Brain className="w-4 h-4 ml-2" />
            تركيز
          </Button>
          <Button
            variant={mode === 'break' ? 'default' : 'ghost'}
            className={cn(
              "rounded-full px-6 transition-all",
              mode === 'break' ? "bg-orange-500 hover:bg-orange-600" : "text-orange-500"
            )}
            onClick={() => switchMode('break')}
          >
            <Coffee className="w-4 h-4 ml-2" />
            استراحة
          </Button>
        </div>

        <motion.div 
          key={timeLeft}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black mb-10 font-mono tracking-tighter text-slate-800"
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>

        <div className="flex gap-4">
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-slate-100"
            onClick={resetTimer}
          >
            <RotateCcw className="w-6 h-6 text-slate-400" />
          </Button>
          <Button
            size="lg"
            className={cn(
              "w-24 h-24 rounded-full shadow-lg transition-transform active:scale-95",
              isActive ? "bg-slate-800 hover:bg-slate-900" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            )}
            onClick={toggleTimer}
          >
            {isActive ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white mr-1" />}
          </Button>
          <div className="w-16 h-16" /> {/* Spacer */}
        </div>
      </CardContent>
    </Card>
  );
}
