import React from 'react';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Check, 
  MessageSquare, 
  Wand2,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Page } from '../../types';

interface AIAssistantCardProps {
  onOpenAITool: (page: Page) => void;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ onOpenAITool }) => {
  const quickPrompts = [
    "✦ Tạo 10 câu trắc nghiệm Toán 12 mức Vận dụng cao",
    "✦ Thiết lập ma trận đề thi Giữa kì 2 Ngữ văn 10",
    "✦ Trích xuất câu hỏi trắc nghiệm Đúng/Sai từ file SGK",
    "✦ Phân tích ma trận chuẩn GDPT 2018 cho môn Tiếng Anh",
  ];

  return (
    <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#131326] via-[#10152A] to-[#0A0E1A] p-5 shadow-glow-sm overflow-hidden flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-glow-sm">
            <Bot className="w-5 h-5" />
            <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Trợ lý AI ExamGen 5.0</h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Gemini 3.7 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">Tôi có thể giúp bạn tạo đề thi, bảng đặc tả và tối ưu hóa ma trận.</p>
          </div>
        </div>

        {/* AI Capabilities Checklist */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-1">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sinh câu hỏi 4 mức độ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đúng chuẩn Bộ GD&ĐT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tự động cân bằng điểm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất file Word, PDF đẹp</span>
          </div>
        </div>

        {/* Quick prompt suggestions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Gợi ý lệnh nhanh:
          </span>
          <div className="space-y-1">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onOpenAITool('ai-tool')}
                className="w-full text-left px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/30 text-slate-300 hover:text-white text-xs transition-colors truncate"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-xs text-slate-400">Hỗ trợ giáo viên 24/7</span>
        <Button
          variant="gradient"
          size="sm"
          onClick={() => onOpenAITool('ai-tool')}
          className="shadow-glow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bắt đầu Chat với AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
