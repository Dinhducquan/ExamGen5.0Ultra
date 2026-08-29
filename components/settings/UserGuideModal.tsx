import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  Shuffle, 
  Printer, 
  KeySquare, 
  HelpCircle, 
  X, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  UploadCloud, 
  FileSpreadsheet, 
  Layers,
  Info,
  ExternalLink,
  Copy,
  Printer as PrintIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../hooks/useToast';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'matrix' | 'ocr' | 'mixing' | 'export' | 'api' | 'faq'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
    addToast('Đã mở lệnh in tài liệu hướng dẫn');
  };

  const tabs = [
    { id: 'overview', label: '🚀 Giới thiệu Ultra 5.0', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'workflow', label: '⚡ Quy trình 5 bước AI', icon: <Zap className="w-4 h-4" /> },
    { id: 'matrix', label: '📊 Ma trận & Đã đặc tả', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'ocr', label: '📄 Nạp tài liệu & OCR', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'mixing', label: '🔀 Trộn đề & Ngân hàng', icon: <Shuffle className="w-4 h-4" /> },
    { id: 'export', label: '🖨️ Xuất file Word / PDF', icon: <Printer className="w-4 h-4" /> },
    { id: 'api', label: '⚙️ Gemini API & Cấu hình', icon: <KeySquare className="w-4 h-4" /> },
    { id: 'faq', label: '❓ FAQ & Sự cố', icon: <HelpCircle className="w-4 h-4" /> },
  ] as const;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-white dark:bg-[#0C1120] text-stone-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/10 bg-stone-50/80 dark:bg-[#0A0E1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">
                  Tài liệu Hướng dẫn Sử dụng ExamGen Ultra 5.0
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Cẩm nang toàn diện ra đề kiểm tra, ma trận & bóc tách AI theo Công văn 7991/BGDĐT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 text-xs border-stone-300 dark:border-white/10"
            >
              <PrintIcon className="w-3.5 h-3.5" />
              <span>In hướng dẫn</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Filter */}
        <div className="px-6 py-3 border-b border-stone-200/80 dark:border-white/5 bg-stone-100/50 dark:bg-[#0E1424]/50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" />
            <Input 
              type="text" 
              placeholder="Tìm kiếm chủ đề hướng dẫn (VD: Trộn đề, LaTeX, Gemini API, Xuất Word)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs bg-white dark:bg-[#151C2E] border-stone-200 dark:border-white/10 rounded-xl"
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="text-xs text-stone-500 dark:text-slate-400 hover:underline cursor-pointer"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>

        {/* Main Workspace Layout (Sidebar + Content) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-64 border-r border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-[#0A0E1A]/40 p-3 space-y-1 overflow-y-auto hidden sm:block">
            <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
              Danh mục Hướng dẫn
            </div>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 hover:bg-stone-200/50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Right Detailed Content Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-200 dark:border-indigo-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                    <Sparkles className="w-5 h-5" />
                    <span>ExamGen Ultra 5.0 — Hệ thống AI Ra đề & Đánh giá Giáo dục Thế hệ mới</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-slate-300 leading-relaxed">
                    ExamGen Ultra 5.0 là nền tảng trí tuệ nhân tạo chuyên biệt thiết kế dành riêng cho Giáo viên, Tổ bộ môn và Quản lý giáo dục tại Việt Nam. Hệ thống tích hợp mô hình ngôn ngữ lớn thế hệ mới <strong>Gemini 3.7 Pro</strong>, tự động hóa toàn bộ quy trình từ xây dựng ma trận đặc tả, sinh đề kiểm tra đa dạng dạng thức đến trộn đề thi và xuất bản file Word/PDF theo chuẩn <strong>Công văn 7991/BGDĐT</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Chuẩn GDPT 2018 & Công văn 7991</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                      Phân chia chính xác 4 mức độ nhận thức (Nhận biết - Thông hiểu - Vận dụng - Vận dụng cao). Đầy đủ 4 dạng câu hỏi: Trắc nghiệm 4 đáp án, Trắc nghiệm Đúng/Sai, Trả lời ngắn, Tự luận.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                      <Zap className="w-4 h-4" />
                      <span>Tốc độ sinh đề Siêu tốc</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                      Chỉ mất 15-30 giây để khởi tạo hoàn chỉnh 1 bộ đề thi 40 câu hỏi kèm bảng đáp án chi tiết và hướng dẫn giải từng câu.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                      <Shuffle className="w-4 h-4" />
                      <span>Thuật toán Trộn đề Kháng lặp</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                      Hoán vị thông minh câu hỏi và phương án A-B-C-D, tự động sinh mã đề (101, 102...), bảng ma trận đáp án soi chiếu cực kỳ chính xác.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <Printer className="w-4 h-4" />
                      <span>Xuất bản Đa định dạng</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                      Xuất trực tiếp file Word (.DOCX) đẹp mắt giữ nguyên công thức toán LaTeX, file PDF chuẩn in ấn, bảng tính Excel (.CSV) và gói bài thi LMS (Moodle / Google Classroom).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Mẹo bắt đầu nhanh:
                  </h4>
                  <p className="text-xs text-indigo-800 dark:text-indigo-200">
                    Truy cập tab <strong>"Tạo đề AI (CV 7991)"</strong> trên thanh menu bên trái, chọn môn học và khối lớp để bắt đầu quy trình sinh đề tự động trong 5 bước đơn giản!
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: WORKFLOW */}
            {activeTab === 'workflow' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quy trình 5 Bước Ra đề Thi bằng Trí tuệ Nhân tạo AI
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        Bước 1: Cấu hình Chung Đề thi
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono">General Config</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-slate-300">
                      Chọn Môn học (Toán, Vật lý, Hóa học, Ngữ văn, Tiếng Anh, Lịch sử, Địa lý, Sinh học, GDCD/GDKT-PL), Khối lớp (Lớp 10, 11, 12), Loại kỳ thi (Thường xuyên, Giữa kỳ, Cuối kỳ) và Thời gian làm bài (45 phút, 60 phút, 90 phút).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                        Bước 2: Thiết lập Ma trận & Bảng đặc tả GDPT 2018
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono font-semibold">Matrix Spec</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-slate-300">
                      Phân bổ số lượng câu hỏi theo 4 mức độ nhận thức: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%). Chọn chủ đề kiến thức từng chương/bài.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                        Bước 3: AI Sinh Đề thi & Đáp án Chi tiết
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-semibold">Gemini 3.7 Generation</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-slate-300">
                      Nhấn nút <strong>"Khởi tạo bằng AI"</strong>. Hệ thống tự động kích hoạt Gemini 3.7 Pro để viết từng câu hỏi trắc nghiệm, tạo ngữ liệu đọc hiểu, xây dựng bảng phương án Đúng/Sai và hướng dẫn giải từng bước.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                        Bước 4: Xem trước & Tinh chỉnh Câu hỏi
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono font-semibold">Preview & Edit</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-slate-300">
                      Kiểm tra toàn bộ danh sách câu hỏi. Giáo viên có thể trực tiếp sửa lại câu chữ, thay đổi đáp án đúng, yêu cầu AI sinh lại (Regenerate) 1 câu chưa đạt hoặc dán công thức toán KaTeX/LaTeX.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        Bước 5: Trộn đề & Xuất bản Đa định dạng
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-semibold">Export & Print</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-slate-300">
                      Tạo các mã đề ngẫu nhiên (VD: Mã 101, 102, 103, 104), tải xuống file Word .DOCX chuẩn trang in A4, in ấn trực tiếp hoặc xuất ra gói bài thi LMS.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MATRIX SPEC */}
            {activeTab === 'matrix' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                  Hướng dẫn Xây dựng Ma trận & Bảng đặc tả GDPT 2018
                </h3>

                <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                  Bảng ma trận đặc tả là trái tim của việc xây dựng đề thi theo Công văn 7991/BGDĐT. ExamGen Ultra 5.0 hỗ trợ tự động tính toán số câu, số điểm và tỉ lệ % nhận thức chuẩn xác.
                </p>

                <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 dark:bg-white/5 border-b border-stone-200 dark:border-white/10 text-stone-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Mức độ nhận thức</th>
                        <th className="py-2.5 px-3">Tỉ lệ điểm chuẩn</th>
                        <th className="py-2.5 px-3">Đặc điểm câu hỏi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/60 dark:divide-white/5 text-stone-600 dark:text-slate-400">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">1. Nhận biết</td>
                        <td className="py-2.5 px-3 font-mono font-bold">40% (4.0 điểm)</td>
                        <td className="py-2.5 px-3">Tái hiện kiến thức, định nghĩa, công thức, sự kiện lịch sử cơ bản.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-cyan-600 dark:text-cyan-400">2. Thông hiểu</td>
                        <td className="py-2.5 px-3 font-mono font-bold">30% (3.0 điểm)</td>
                        <td className="py-2.5 px-3">Giải thích, phân loại, áp dụng công thức vào bài tập đơn giản 1 bước.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-amber-600 dark:text-amber-400">3. Vận dụng</td>
                        <td className="py-2.5 px-3 font-mono font-bold">20% (2.0 điểm)</td>
                        <td className="py-2.5 px-3">Giải quyết vấn đề mới, tổng hợp kiến thức nhiều bài, tính toán biến đổi.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-rose-600 dark:text-rose-400">4. Vận dụng cao</td>
                        <td className="py-2.5 px-3 font-mono font-bold">10% (1.0 điểm)</td>
                        <td className="py-2.5 px-3">Bài toán thực tế, tư duy phản biện, phân tích sâu, phân hóa học sinh giỏi.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-300">
                  <strong>💡 Lưu ý quan trọng:</strong> Khi thay đổi số lượng câu hỏi thuộc một chương, hệ thống sẽ tự động cân bằng tỉ lệ % tổng điểm của toàn bộ bài thi để không bị lệch khung chuẩn.
                </div>
              </div>
            )}

            {/* TAB 4: OCR & UPLOAD */}
            {activeTab === 'ocr' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-500" />
                  Nạp Tài liệu Nguồn & Trích xuất AI (OCR)
                </h3>

                <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                  Nếu bạn đã có sẵn giáo án, đè cương chi tiết dạng file PDF hoặc Microsoft Word (.DOCX), bạn có thể nạp trực tiếp vào ExamGen Ultra 5.0 để AI phân tích và tự bóc tách câu hỏi.
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#111726] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white mb-1">Kéo thả File vào Khung Upload</h4>
                      <p className="text-xs text-stone-600 dark:text-slate-400">Hỗ trợ các file định dạng PDF (.pdf), Microsoft Word (.docx), Văn bản thuần (.txt) có dung lượng tối đa 50MB.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#111726] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white mb-1">AI Tự động Phân tích Cấu trúc (OCR & Parsing)</h4>
                      <p className="text-xs text-stone-600 dark:text-slate-400">Gemini 3.7 Vision tự động nhận diện các đoạn văn bản, câu hỏi trắc nghiệm, hình vẽ và công thức toán học.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#111726] flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white mb-1">Chuyển đổi thành Bộ đề Chuẩn hoá</h4>
                      <p className="text-xs text-stone-600 dark:text-slate-400">Nội dung sau khi phân tích sẽ được đưa trực tiếp vào giao diện xem trước để thầy cô xem và sửa đổi.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MIXING & BANK */}
            {activeTab === 'mixing' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-amber-500" />
                  Hướng dẫn Trộn đề Thi & Quản lý Ngân hàng Câu hỏi
                </h3>

                <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                  Tính năng trộn đề thông minh giúp tạo ra nhiều mã đề ngẫu nhiên để chống gian lận trong giờ kiểm tra trên lớp.
                </p>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-[#111726] space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">Các tùy chọn trộn đề:</h4>
                  <ul className="space-y-2 text-xs text-stone-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span><strong>Trộn vị trí câu hỏi:</strong> Đáo ngẫu nhiên thứ tự các câu trong cùng một phần.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span><strong>Trộn phương án A, B, C, D:</strong> Hoán vị đáp án lựa chọn để tránh việc học sinh chép bài nhau.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span><strong>Tự động sinh Ma trận Đáp án:</strong> Xuất bảng tổng hợp đáp án các mã đề 101, 102, 103, 104 để giáo viên chấm thi cực nhanh.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 6: EXPORT */}
            {activeTab === 'export' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-500" />
                  Xuất bản File Word, PDF & Hệ thống Học tập LMS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#111726] space-y-2">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Xuất Microsoft Word (.DOCX)</div>
                    <p className="text-xs text-stone-600 dark:text-slate-400">Giữ nguyên định dạng font chữ, căn lề A4, khung bảng điểm và công thức toán học MathType/LaTeX.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#111726] space-y-2">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">In ấn trực tiếp & PDF</div>
                    <p className="text-xs text-stone-600 dark:text-slate-400">Tối ưu trang in sạch sẽ, không chứa quảng cáo hay watermark, hỗ trợ in hai mặt giấy tiết kiệm.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#111726] space-y-2">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Xuất LMS Moodle / Google Classroom</div>
                    <p className="text-xs text-stone-600 dark:text-slate-400">Xuất gói câu hỏi định dạng GIFT hoặc CSV để nhập trực tiếp vào hệ thống thi trực tuyến.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: API KEY */}
            {activeTab === 'api' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <KeySquare className="w-4 h-4 text-indigo-500" />
                  Hướng dẫn Cài đặt Gemini API Key & Cấu hình AI
                </h3>

                <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                  ExamGen Ultra 5.0 kết nối trực tiếp với dịch vụ Google Gemini AI. Để phần mềm hoạt động ổn định và có tốc độ sinh đề cao nhất, quý thầy cô nên chuẩn bị Gemini API Key cá nhân.
                </p>

                <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#111726] space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">Các bước lấy API Key miễn phí từ Google:</h4>
                  <ol className="space-y-2 text-xs text-stone-600 dark:text-slate-300 list-decimal pl-4">
                    <li>Truy cập trang web <strong>Google AI Studio</strong> (https://aistudio.google.com).</li>
                    <li>Đăng nhập bằng tài khoản Google (Gmail) của bạn.</li>
                    <li>Nhấn nút <strong>"Get API key"</strong> -&gt; Chọn <strong>"Create API key in new project"</strong>.</li>
                    <li>Sao chép mã Key có dạng <code>AIzaSy...</code></li>
                    <li>Vào mục <strong>Cài đặt -&gt; Trí tuệ nhân tạo</strong> trong phần mềm này và dán mã Key vào ô cấu hình.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 8: FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-500" />
                  Các câu hỏi thường gặp (FAQ) & Xử lý sự cố
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726]">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      Q: Tại sao bấm "Sinh đề AI" mà hệ thống báo lỗi hoặc đứng yên?
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-slate-400">
                      A: Kiểm tra kết nối mạng Internet hoặc kiểm tra lại API Key Gemini trong mục Cài đặt. Nếu hết quota miễn phí, bạn có thể tạo 1 API Key mới trên Google AI Studio.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726]">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      Q: Công thức toán học trong file Word bị lỗi hiển thị thì làm sao?
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-slate-400">
                      A: Mở file Word, chọn toàn bộ văn bản (Ctrl + A) và nhấn phím tắt <code>Alt + =</code> để Microsoft Word tự động render lại toàn bộ công thức LaTeX thành dạng MathType chuẩn.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/70 dark:bg-[#111726]">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      Q: Đề thi tạo ra có chuẩn 100% chương trình mới GDPT 2018 không?
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-slate-400">
                      A: Đúng. Ma trận đề thi được xây dựng theo đúng các yêu cầu định hướng năng lực và cấu trúc 4 mức độ nhận thức quy định bởi Bộ Giáo dục & Đào tạo.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#0A0E1A] flex items-center justify-between text-xs text-stone-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ExamGen Ultra 5.0 • Hệ thống Hỗ trợ Ra đề GDPT 2018</span>
          </div>
          <Button size="sm" onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
            Đã hiểu & Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
export default UserGuideModal;
