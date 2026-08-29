import React from 'react';
import { 
  FileText, 
  Database, 
  BookOpen, 
  BrainCircuit, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface MetricItem {
  title: string;
  value: string;
  subtext: string;
  change: string;
  trend: 'up' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
  borderGlow: string;
}

export const DashboardMetricCards: React.FC = () => {
  const metrics: MetricItem[] = [
    {
      title: 'Đề thi đã tạo',
      value: '128',
      subtext: 'Đề kiểm tra & thi thử',
      change: '+14.2% so với tháng trước',
      trend: 'up',
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      gradient: 'from-indigo-500/10 via-purple-500/5 to-transparent',
      borderGlow: 'hover:border-indigo-500/40',
    },
    {
      title: 'Ngân hàng câu hỏi',
      value: '3,256',
      subtext: 'Đã chuẩn hóa 4 mức độ',
      change: '+85 câu hỏi tuần này',
      trend: 'up',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      gradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
      borderGlow: 'hover:border-purple-500/40',
    },
    {
      title: 'Môn học tích hợp',
      value: '9',
      subtext: 'Toán, Văn, Anh, KHTN, Lý, Hóa...',
      change: '100% Sách GDPT 2018',
      trend: 'neutral',
      icon: <GraduationCap className="w-5 h-5 text-blue-400" />,
      gradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
      borderGlow: 'hover:border-blue-500/40',
    },
    {
      title: 'Lượt sử dụng AI',
      value: '892',
      subtext: 'Gemini 3.7 & 3.1 Pro',
      change: '98.6% độ chính xác ma trận',
      trend: 'up',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/10 via-indigo-500/5 to-transparent',
      borderGlow: 'hover:border-cyan-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className={`group relative p-5 rounded-2xl border border-[#E7E1D8] dark:border-white/[0.08] bg-white/90 dark:bg-[#111827]/70 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${m.borderGlow} shadow-sm dark:shadow-lg overflow-hidden`}
        >
          {/* Subtle background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-40 group-hover:opacity-80 transition-opacity`} />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                {m.title}
              </span>
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-white/[0.04] border border-[#E0D8CD] dark:border-white/[0.08] group-hover:scale-110 transition-transform">
                {m.icon}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                {m.value}
              </div>
              <p className="text-xs text-stone-600 dark:text-slate-400 font-medium">{m.subtext}</p>
            </div>

            <div className="pt-2 border-t border-[#EFEAE2] dark:border-white/[0.05] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {m.change}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 dark:text-slate-600 group-hover:text-stone-700 dark:group-hover:text-slate-300 transition-colors" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
