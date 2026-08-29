import React, { useState, useEffect } from 'react';
import { Search, Sparkles, FileText, Sliders, Shuffle, BookOpen, Database, ArrowRight, X } from 'lucide-react';
import { Page } from '../../types';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: Page) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({ isOpen, onClose, onSelectPage }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Tạo đề thi mới bằng AI', desc: 'Sinh câu hỏi trắc nghiệm & tự luận theo chuẩn GDPT 2018', icon: <Sparkles className="w-4 h-4 text-purple-400" />, page: 'ai-tool' as Page, tag: 'AI Action' },
    { title: 'Thiết lập Ma trận đề thi', desc: 'Cấu hình ma trận nhận biết - thông hiểu - vận dụng', icon: <FileText className="w-4 h-4 text-indigo-400" />, page: 'exam-structure' as Page, tag: 'Matrix' },
    { title: 'Cấu hình Thông tin Giáo viên & Đề thi', desc: 'Thiết lập thông tin đơn vị, giáo viên, môn học và cấu hình đề thi', icon: <Sliders className="w-4 h-4 text-blue-400" />, page: 'general-config' as Page, tag: 'Setup' },
    { title: 'Trộn đề thi trắc nghiệm', desc: 'Xáo trộn câu hỏi và các phương án, xuất nhiều mã đề', icon: <Shuffle className="w-4 h-4 text-amber-400" />, page: 'mix-exam' as Page, tag: 'Tool' },
    { title: 'Tạo đề cương ôn tập tự động', desc: 'Trích xuất tóm tắt lý thuyết và dạng bài trọng tâm', icon: <BookOpen className="w-4 h-4 text-emerald-400" />, page: 'outline' as Page, tag: 'Study' },
    { title: 'Kết quả & Xem trước', desc: 'Xem lại đề thi đã tạo, xuất file DOCX, PDF, in ấn', icon: <FileText className="w-4 h-4 text-cyan-400" />, page: 'results' as Page, tag: 'Report' },
  ];

  const filtered = quickActions.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0F1523] border border-white/[0.12] shadow-2xl overflow-hidden text-slate-100">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08] bg-[#0A0E1A]">
          <Search className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Tìm kiếm chức năng, ma trận, đề thi... (Esc để thoát)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500 font-medium"
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Lối tắt & Chức năng nhanh
          </div>

          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Không tìm thấy kết quả phù hợp cho "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectPage(item.page);
                  onClose();
                }}
                className="group flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 flex items-center gap-2">
                      {item.title}
                      <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-400">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0A0E1A] border-t border-white/[0.06] text-[11px] text-slate-500">
          <span>Dùng phím mũi tên hoặc nhấp để chọn</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] text-slate-400 border border-white/[0.08]">Esc</kbd> Đóng
          </span>
        </div>
      </div>
    </div>
  );
};
