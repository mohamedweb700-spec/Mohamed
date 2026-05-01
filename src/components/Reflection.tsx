import { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Sparkles, MessageSquareQuote } from 'lucide-react';
import { motion } from 'motion/react';

export default function Reflection() {
  const { reflections, addReflection } = useFirestore();
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayArabic = format(new Date(), 'EEEE, d MMMM', { locale: ar });

  const existingReflection = reflections.find(r => r.date === today);

  const handleSave = async () => {
    if (!content.trim()) return;
    await addReflection(content, today);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            تأملات اليوم
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">{todayArabic}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingReflection ? (
          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
            <MessageSquareQuote className="w-8 h-8 text-amber-200 mb-2" />
            <p className="text-lg leading-relaxed text-slate-700 italic">
              {existingReflection.content}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="كيف كان يومك؟ ما هي الإنجازات التي تفتخر بها؟ وما هي الدروس المستفادة؟"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] bg-white border-slate-100 focus-visible:ring-amber-400 text-lg leading-relaxed"
            />
            <Button 
              onClick={handleSave} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12"
              disabled={!content.trim()}
            >
              {isSaved ? "تم الحفظ!" : "حفظ تأملات اليوم"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
