import React from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  Table2, 
  BookOpen, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { Page } from '../../types';

interface QuickActionsProps {
  onNavigate: (page: Page) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      title: '✦ Tạo đề mới bằng AI',
      desc: 'Nạp chủ đề hoặc tải tài liệu, AI sinh đề thi hoàn chỉnh kèm đáp án',
      icon: <Sparkles className="w-5 h-5 text-purple-300" />,
      badge: 'Khuyên dùng',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      gradient: 'from-purple-900/30 via-indigo-900/20 to-[#111827]',
      borderHover: 'hover:border-purple-500/50',
      page: 'ai-tool' as Page,
    },
    {
      title: '↑ Tải lên tài liệu nguồn',
      desc: 'Tải file Word/PDF giáo án, đề mẫu hoặc chương trình học để bóc tách',
      icon: <UploadCloud className="w-5 h-5 text-blue-300" />,
      badge: 'Đa định dạng',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      gradient: 'from-blue-900/30 via-indigo-900/20 to-[#111827]',
      borderHover: 'hover:border-blue-500/50',
      page: 'general-config' as Page,
    },
    {
      title: '▦ Tạo ma trận nhanh',
      desc: 'Cấu hình khung ma trận 7991 hoặc tiểu học theo chuẩn công văn',
      icon: <Table2 className="w-5 h-5 text-indigo-300" />,
      badge: 'CV 7991',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      gradient: 'from-indigo-900/30 via-purple-900/20 to-[#111827]',
      borderHover: 'hover:border-indigo-500/50',
      page: 'exam-structure' as Page,
    },
    {
      title: '📖 Tạo đề cương ôn tập',
      desc: 'Tự động tạo câu hỏi lý thuyết, bài tập phân hóa cho học sinh ôn thi',
      icon: <BookOpen className="w-5 h-5 text-emerald-300" />,
      badge: 'Ôn tập',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      gradient: 'from-emerald-900/30 via-teal-900/20 to-[#111827]',
      borderHover: 'hover:border-emerald-500/50',
      page: 'outline' as Page,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Tạo nhanh
        </h3>
        <span className="text-xs text-stone-500 dark:text-slate-400">Lựa chọn phương thức bắt đầu công việc</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate(act.page)}
            className={`group relative p-5 rounded-2xl border border-[#E7E1D8] dark:border-white/[0.08] bg-white/90 dark:bg-[#111827] transition-all duration-200 hover:-translate-y-1 ${act.borderHover} shadow-sm dark:shadow-lg cursor-pointer flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-white/[0.06] border border-[#E0D8CD] dark:border-white/[0.1] group-hover:scale-110 transition-transform">
                  {act.icon}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${act.badgeColor}`}>
                  {act.badge}
                </span>
              </div>

              <h4 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors mb-1">
                {act.title}
              </h4>
              <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {act.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EFEAE2] dark:border-white/[0.05] flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-slate-400 group-hover:text-stone-950 dark:group-hover:text-white transition-colors">
              <span>Bắt đầu ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
