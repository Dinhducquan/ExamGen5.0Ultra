import React from 'react';
import { 
  FileUp, 
  BrainCircuit, 
  Table2, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Page } from '../../types';

interface AIWorkflowStepperProps {
  onNavigate: (page: Page) => void;
}

export const AIWorkflowStepper: React.FC<AIWorkflowStepperProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Thông tin Giáo viên & Đề thi',
      desc: 'Nạp file SGK, chuyên đề & cấu hình môn học',
      icon: <FileUp className="w-4 h-4" />,
      status: 'Sẵn sàng',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      page: 'general-config' as Page,
      active: false,
    },
    {
      step: '02',
      title: 'Phân tích sư phạm',
      desc: 'AI bóc tách YCCĐ & thang nhận thức',
      icon: <BrainCircuit className="w-4 h-4" />,
      status: 'Tự động',
      statusColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      page: 'exam-structure' as Page,
      active: false,
    },
    {
      step: '03',
      title: 'Ma trận đề thi',
      desc: 'Phân bổ số câu & tỷ lệ điểm chuẩn',
      icon: <Table2 className="w-4 h-4" />,
      status: 'Chuẩn GDPT',
      statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      page: 'exam-structure' as Page,
      active: true,
    },
    {
      step: '04',
      title: 'Bảng đặc tả',
      desc: 'Xác định tiêu chí từng câu hỏi',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      status: 'Khớp 100%',
      statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      page: 'exam-structure' as Page,
      active: false,
    },
    {
      step: '05',
      title: 'Ra đề & Hoàn thiện',
      desc: 'Gemini sinh câu hỏi & xuất đa mã đề',
      icon: <Sparkles className="w-4 h-4" />,
      status: 'AI Gemini',
      statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      page: 'ai-tool' as Page,
      active: false,
    },
  ];

  return (
    <div className="rounded-2xl border border-[#E7E1D8] dark:border-white/[0.08] bg-white/90 dark:bg-[#111827]/70 backdrop-blur-xl p-5 shadow-sm dark:shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EFEAE2] dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
              Quy trình Ra đề Thông minh AI 5-Bước
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-semibold">
                GDPT 2018
              </span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-400">Nhấp vào từng bước để trực tiếp chuyển đến module thiết lập tương ứng</p>
          </div>
        </div>
        <span className="text-[11px] text-stone-500 dark:text-slate-400 font-medium self-start sm:self-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Quy trình tự động hóa liên tục
        </span>
      </div>

      {/* Horizontal Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((s, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate(s.page)}
            className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left
              ${s.active 
                ? 'bg-indigo-50/70 dark:bg-gradient-to-b dark:from-indigo-900/30 dark:to-[#151B2B] border-indigo-500/40 shadow-xs dark:shadow-glow-sm ring-1 ring-indigo-500/30 scale-[1.02]' 
                : 'bg-[#FAF7F2] hover:bg-[#F3ECE1] dark:bg-[#151B2B]/60 dark:hover:bg-[#151B2B] border-[#E5DDD2] dark:border-white/[0.06] hover:border-indigo-400/40 dark:hover:border-white/[0.15] hover:-translate-y-0.5'
              }`}
          >
            {/* Top row: Number and Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-stone-500 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {s.step}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.statusColor}`}>
                {s.status}
              </span>
            </div>

            {/* Icon & Title */}
            <div className="space-y-1 my-1">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${s.active ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-stone-200/60 dark:bg-white/[0.04] text-stone-600 dark:text-slate-400 group-hover:text-stone-900 dark:group-hover:text-white'}`}>
                  {s.icon}
                </div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {s.title}
                </h4>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {s.desc}
              </p>
            </div>

            {/* Action arrow */}
            <div className="mt-3 pt-2 border-t border-[#EAE3D9] dark:border-white/[0.04] flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              <span>Mở bước này</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
