import React from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Layers
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Page } from '../../types';

interface RecentDocumentsProps {
  onOpenExam: (page: Page) => void;
}

export const RecentDocuments: React.FC<RecentDocumentsProps> = ({ onOpenExam }) => {
  const documents = [
    {
      id: 'EX-2026-001',
      title: 'Đề kiểm tra Giữa kỳ II – Toán 12 (Chuẩn Bộ GD&ĐT)',
      subject: 'Toán học',
      grade: 'Lớp 12',
      format: 'Trắc nghiệm 4 lựa chọn + Đúng/Sai + Trả lời ngắn',
      updated: '10 phút trước',
      questions: 35,
      status: 'Hoàn thành',
      statusVariant: 'success' as const,
      model: 'Gemini 3.7 Pro',
    },
    {
      id: 'EX-2026-002',
      title: 'Đề thi Thử Tốt nghiệp THPT 2026 – Ngữ văn',
      subject: 'Ngữ văn',
      grade: 'Lớp 12',
      format: 'Đọc hiểu ngữ liệu ngoài SGK + Viết Nghị luận',
      updated: '2 giờ trước',
      questions: 6,
      status: 'Đã xuất bản',
      statusVariant: 'ai' as const,
      model: 'Gemini 3.7 Pro',
    },
    {
      id: 'EX-2026-003',
      title: 'Kiểm tra 1 tiết – Vật lí 11: Từ trường & Cảm ứng điện từ',
      subject: 'Vật lí',
      grade: 'Lớp 11',
      format: 'Trắc nghiệm nhiều lựa chọn + Điền khuyết',
      updated: 'Hôm qua',
      questions: 28,
      status: 'Đang trộn 4 mã đề',
      statusVariant: 'warning' as const,
      model: 'Gemini 3.1 Pro',
    },
    {
      id: 'EX-2026-004',
      title: 'Đề khảo sát Năng lực – Tiếng Anh 10 (Global Success)',
      subject: 'Tiếng Anh',
      grade: 'Lớp 10',
      format: 'Trắc nghiệm phát âm, trọng âm, đọc hiểu, viết lại câu',
      updated: '3 ngày trước',
      questions: 50,
      status: 'Hoàn thành',
      statusVariant: 'success' as const,
      model: 'Gemini 3.7 Pro',
    },
  ];

  return (
    <div className="rounded-2xl border border-[#E7E1D8] dark:border-white/[0.08] bg-white/90 dark:bg-[#111827]/70 backdrop-blur-xl p-5 shadow-sm dark:shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2] dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white tracking-tight">Tài liệu & Đề thi gần đây</h3>
            <p className="text-xs text-stone-600 dark:text-slate-400">Danh sách các bộ đề kiểm tra, ma trận đã khởi tạo gần nhất</p>
          </div>
        </div>

        <button
          onClick={() => onOpenExam('results')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modern Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E7E1D8] dark:border-white/[0.08] text-stone-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Tên đề thi & Cấu trúc</th>
              <th className="py-2.5 px-3">Môn & Khối</th>
              <th className="py-2.5 px-3">Số câu</th>
              <th className="py-2.5 px-3">Trạng thái</th>
              <th className="py-2.5 px-3">AI Model</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EAE1] dark:divide-white/[0.04]">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-stone-500/[0.04] dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                onClick={() => onOpenExam('results')}
              >
                <td className="py-3 px-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-stone-100 dark:bg-white/[0.04] border border-[#E0D8CD] dark:border-white/[0.06] text-indigo-600 dark:text-indigo-400 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5 line-clamp-1">{doc.format}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <span className="font-semibold text-stone-800 dark:text-slate-200">{doc.subject}</span>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">{doc.grade}</p>
                </td>

                <td className="py-3 px-3 font-mono font-semibold text-stone-800 dark:text-slate-200">
                  {doc.questions} câu
                </td>

                <td className="py-3 px-3">
                  <Badge variant={doc.statusVariant}>
                    {doc.status}
                  </Badge>
                </td>

                <td className="py-3 px-3">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    {doc.model}
                  </span>
                </td>

                <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onOpenExam('results')}
                      title="Mở kết quả"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenExam('mix-exam')}
                      title="Trộn đề"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
