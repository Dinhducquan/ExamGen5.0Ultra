import React, { useState, useEffect } from 'react';
import { 
  Database, Search, Plus, Download, Upload, Cloud, RefreshCw, Filter, 
  Trash2, Edit, CheckCircle2, Sparkles, FolderDown, FileSpreadsheet, 
  ChevronDown, HelpCircle, Layers, Tag, BookOpen, AlertCircle, ExternalLink, ShieldCheck
} from '../icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useI18n } from '../../hooks/useI18n';
import { useToast } from '../../hooks/useToast';
import { 
  uploadQuestionBankToDrive, 
  googleSignInForDrive, 
  getDriveAccessToken, 
  initDriveAuth 
} from '../../lib/googleDriveService';
import { User as FirebaseUser } from 'firebase/auth';

export interface BankQuestion {
  id: string;
  subject: string;
  grade: string;
  topic: string;
  type: 'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'essay';
  level: 'biet' | 'hieu' | 'vd' | 'vdCao';
  content: string;
  options?: string[];
  answer: string;
  explanation?: string;
  createdAt: string;
}

const SAMPLE_QUESTIONS: BankQuestion[] = [
  {
    id: 'QB-101',
    subject: 'Toán học',
    grade: 'Lớp 12',
    topic: 'Ứng dụng đạo hàm để khảo sát hàm số',
    type: 'multipleChoice',
    level: 'biet',
    content: 'Cho hàm số y = f(x) có bảng biến thiên trên đoạn [-2; 3]. Giá trị cực đại của hàm số đã cho bằng bao nhiêu?',
    options: ['A. 3', 'B. -2', 'C. 5', 'D. 0'],
    answer: 'C. 5',
    explanation: 'Dựa vào bảng biến thiên, tại x = 1 hàm số đạt cực đại và y_CĐ = 5.',
    createdAt: '2026-08-25'
  },
  {
    id: 'QB-102',
    subject: 'Toán học',
    grade: 'Lớp 12',
    topic: 'Nguyên hàm - Tích phân',
    type: 'multipleChoice',
    level: 'hieu',
    content: 'Tính tích phân I = ∫₀¹ (2x + 1) dx.',
    options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
    answer: 'B. 2',
    explanation: 'Họ nguyên hàm F(x) = x² + x. Do đó I = F(1) - F(0) = (1 + 1) - 0 = 2.',
    createdAt: '2026-08-26'
  },
  {
    id: 'QB-103',
    subject: 'Ngữ văn',
    grade: 'Lớp 12',
    topic: 'Thơ hiện đại Việt Nam',
    type: 'essay',
    level: 'vdCao',
    content: 'Phân tích vẻ đẹp trữ tình và tinh thần bi hoành của hình tượng người lính trong đoạn thơ 1 bài "Tây Tiến" (Quang Dũng).',
    answer: 'Yêu cầu làm rõ nét hào hoa, lãng mạn kết hợp chất bi hùng của lính Tây Tiến qua nhịp thơ và từ ngữ hán việt.',
    explanation: 'Đánh giá theo thang điểm 4 cấp độ GDPT 2018.',
    createdAt: '2026-08-26'
  },
  {
    id: 'QB-104',
    subject: 'Tiếng Anh',
    grade: 'Lớp 12',
    topic: 'Grammar - Tenses & Clause',
    type: 'shortAnswer',
    level: 'hieu',
    content: 'Complete the sentence: "If I ________ (know) your phone number, I would have called you yesterday."',
    answer: 'had known',
    explanation: 'Câu điều kiện loại 3 diễn tả giả định trái ngược với quá khứ.',
    createdAt: '2026-08-26'
  },
  {
    id: 'QB-105',
    subject: 'Vật lý',
    grade: 'Lớp 12',
    topic: 'Dao động cơ học',
    type: 'trueFalse',
    level: 'biet',
    content: 'Cho các phát biểu về dao động điều hòa của con lắc lò xo:',
    options: [
      'a) Chu kỳ dao động tỷ lệ thuận với khối lượng m.',
      'b) Gia tốc luôn ngược hướng với ly độ.',
      'c) Cơ năng được bảo toàn khi không có ma sát.',
      'd) Động năng đạt cực đại ở vị trí biên.'
    ],
    answer: 'a-Sai, b-Đúng, c-Đúng, d-Sai',
    explanation: 'a) T = 2π√(m/k) nên T tỷ lệ với √m. d) Động năng cực đại tại VTCB.',
    createdAt: '2026-08-27'
  }
];

const LOCAL_STORAGE_KEY = 'examgen_question_bank_data';

export default function QuestionBankWorkspace() {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [questions, setQuestions] = useState<BankQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : SAMPLE_QUESTIONS;
    } catch (e) {
      return SAMPLE_QUESTIONS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');
  const [selectedGrade, setSelectedGrade] = useState<string>('Tất cả');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả');
  const [selectedType, setSelectedType] = useState<string>('Tất cả');

  // Modal State & Drive State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [isAuthorizingDrive, setIsAuthorizingDrive] = useState(false);
  const [lastUploadedLink, setLastUploadedLink] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('examgen_drive_last_sync') || null;
  });

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = initDriveAuth();
    return () => unsubscribe();
  }, []);

  // Form State
  const [newSubject, setNewSubject] = useState('Toán học');
  const [newGrade, setNewGrade] = useState('Lớp 12');
  const [newTopic, setNewTopic] = useState('');
  const [newType, setNewType] = useState<'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'essay'>('multipleChoice');
  const [newLevel, setNewLevel] = useState<'biet' | 'hieu' | 'vd' | 'vdCao'>('biet');
  const [newContent, setNewContent] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newExplanation, setNewExplanation] = useState('');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to save questions to localStorage', e);
    }
  }, [questions]);

  // Filters calculation
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'Tất cả' || q.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'Tất cả' || q.grade === selectedGrade;
    const matchesLevel = selectedLevel === 'Tất cả' || q.level === selectedLevel;
    const matchesType = selectedType === 'Tất cả' || q.type === selectedType;

    return matchesSearch && matchesSubject && matchesGrade && matchesLevel && matchesType;
  });

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !newAnswer.trim()) {
      addToast('Vui lòng điền nội dung câu hỏi và đáp án chuẩn', 'error');
      return;
    }

    const options = newType === 'multipleChoice' 
      ? [`A. ${newOptA}`, `B. ${newOptB}`, `C. ${newOptC}`, `D. ${newOptD}`]
      : undefined;

    const newQ: BankQuestion = {
      id: `QB-${Date.now().toString().slice(-4)}`,
      subject: newSubject,
      grade: newGrade,
      topic: newTopic || 'Chủ đề chung',
      type: newType,
      level: newLevel,
      content: newContent,
      options,
      answer: newAnswer,
      explanation: newExplanation,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQuestions(prev => [newQ, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
    addToast(`Thêm câu hỏi mới ${newQ.id} thành công!`, 'success');
  };

  const resetForm = () => {
    setNewTopic('');
    setNewContent('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewAnswer('');
    setNewExplanation('');
  };

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa câu hỏi ${id}?`)) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      addToast(`Đã xóa câu hỏi ${id}`, 'info');
    }
  };

  const handleAuthorizeDrive = async () => {
    try {
      setIsAuthorizingDrive(true);
      const res = await googleSignInForDrive();
      addToast(`Ủy quyền Google Drive thành công! (${res.user.email})`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Ủy quyền Google Drive thất bại', 'error');
    } finally {
      setIsAuthorizingDrive(false);
    }
  };

  const handleSaveToDrive = async () => {
    setIsDriveSyncing(true);
    try {
      const res = await uploadQuestionBankToDrive(questions);
      const now = new Date().toLocaleString('vi-VN');
      setLastSyncTime(now);
      localStorage.setItem('examgen_drive_last_sync', now);
      if (res.webViewLink) {
        setLastUploadedLink(res.webViewLink);
      }
      addToast(`Đã xuất và tạo file Google Tài liệu (${questions.length} câu hỏi) trong thư mục "Tài liệu lưu trữ ExamGen Ultra 5.0" trên Google Drive!`, 'success');
    } catch (err: any) {
      console.error('Error uploading to Drive:', err);
      addToast(err.message || 'Có lỗi xảy ra khi tải file lên Google Drive', 'error');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NganHangCauHoi_ExamGen_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Xuất dữ liệu ngân hàng câu hỏi thành file JSON thành công!', 'success');
  };

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'biet': return { label: 'Nhận biết', bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' };
      case 'hieu': return { label: 'Thông hiểu', bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' };
      case 'vd': return { label: 'Vận dụng', bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' };
      case 'vdCao': return { label: 'Vận dụng cao', bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' };
      default: return { label: lvl, bg: 'bg-stone-100 text-stone-700' };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multipleChoice': return 'Trắc nghiệm 4 PA';
      case 'trueFalse': return 'Đúng / Sai';
      case 'shortAnswer': return 'Trả lời ngắn';
      case 'essay': return 'Tự luận';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-indigo-950 text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Database size={13} /> Ngân hàng câu hỏi tập trung
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Cloud size={13} /> Google Drive Sync
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Ngân hàng câu hỏi GDPT 2018
          </h1>
          <p className="text-xs text-stone-300 max-w-2xl">
            Lưu trữ, phân loại và quản lý toàn bộ câu hỏi trắc nghiệm, đúng/sai, trả lời ngắn, tự luận. Đồng bộ trực tiếp về Google Drive cá nhân của giáo viên.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleAuthorizeDrive}
            disabled={isAuthorizingDrive}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold cursor-pointer"
          >
            <ShieldCheck size={14} className={isAuthorizingDrive ? "animate-spin text-amber-300" : "text-emerald-400"} />
            <span>{isAuthorizingDrive ? 'Đang xác thực...' : 'Ủy quyền Google Drive'}</span>
          </Button>

          <Button
            onClick={handleSaveToDrive}
            disabled={isDriveSyncing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md border border-emerald-400/30 cursor-pointer"
            title="Lưu toàn bộ ngân hàng dưới dạng Google Tài liệu (Google Docs)"
          >
            <RefreshCw size={14} className={isDriveSyncing ? "animate-spin" : ""} />
            <span>{isDriveSyncing ? 'Đang tạo Google Doc...' : 'Lưu dạng Google Tài liệu'}</span>
          </Button>

          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold cursor-pointer"
          >
            <FolderDown size={14} />
            <span>Xuất JSON</span>
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Thêm câu hỏi</span>
          </Button>
        </div>
      </div>

      {/* Sync Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 text-xs font-medium text-indigo-900 dark:text-indigo-200">
        <div className="flex flex-wrap items-center gap-2">
          <Cloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            Google Drive API: <strong className="font-bold text-emerald-700 dark:text-emerald-400">Đã kích hoạt & Ủy quyền OAuth</strong>
            {lastSyncTime && <span className="ml-2 text-[11px] opacity-80">(Lần lưu gần nhất: {lastSyncTime})</span>}
          </span>
        </div>

        {lastUploadedLink ? (
          <a
            href={lastUploadedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <span>Mở file trên Google Drive</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-semibold">
            Tài khoản cá nhân tự động bảo mật
          </span>
        )}
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 shadow-xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-slate-400">Tổng số câu hỏi</p>
          <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-1">{questions.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 shadow-xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-slate-400">Trắc nghiệm 4 PA</p>
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {questions.filter(q => q.type === 'multipleChoice').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 shadow-xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-slate-400">Đúng / Sai & Trả lời ngắn</p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {questions.filter(q => q.type === 'trueFalse' || q.type === 'shortAnswer').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 shadow-xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-slate-400">Tự luận & Vận dụng cao</p>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {questions.filter(q => q.type === 'essay' || q.level === 'vdCao').length}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Tìm kiếm từ khóa câu hỏi, mã ID, chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#151B2B] text-xs font-semibold text-stone-800 dark:text-slate-200"
            >
              <option value="Tất cả">Tất cả môn</option>
              <option value="Toán học">Toán học</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Vật lý">Vật lý</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Sinh học">Sinh học</option>
              <option value="Lịch sử">Lịch sử</option>
              <option value="Địa lý">Địa lý</option>
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#151B2B] text-xs font-semibold text-stone-800 dark:text-slate-200"
            >
              <option value="Tất cả">Tất cả lớp</option>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#151B2B] text-xs font-semibold text-stone-800 dark:text-slate-200"
            >
              <option value="Tất cả">Tất cả mức độ</option>
              <option value="biet">Nhận biết</option>
              <option value="hieu">Thông hiểu</option>
              <option value="vd">Vận dụng</option>
              <option value="vdCao">Vận dụng cao</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#151B2B] text-xs font-semibold text-stone-800 dark:text-slate-200"
            >
              <option value="Tất cả">Tất cả dạng</option>
              <option value="multipleChoice">Trắc nghiệm 4 PA</option>
              <option value="trueFalse">Đúng / Sai</option>
              <option value="shortAnswer">Trả lời ngắn</option>
              <option value="essay">Tự luận</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 space-y-2">
            <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="text-sm font-bold text-stone-700 dark:text-slate-300">Không tìm thấy câu hỏi phù hợp</p>
            <p className="text-xs text-stone-500">Thử thay đổi bộ lọc tìm kiếm hoặc thêm câu hỏi mới vào ngân hàng.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const levelInfo = getLevelLabel(q.level);
            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all space-y-3"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-white/10 text-stone-800 dark:text-slate-200">
                      {q.id}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {q.subject} - {q.grade}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs font-medium text-stone-600 dark:text-slate-400">
                      Chủ đề: <strong className="text-stone-800 dark:text-slate-200">{q.topic}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${levelInfo.bg}`}>
                      {levelInfo.label}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-white/10">
                      {getTypeLabel(q.type)}
                    </span>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-2 cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="text-sm font-semibold text-stone-900 dark:text-slate-100 leading-relaxed">
                  {idx + 1}. {q.content}
                </div>

                {/* Options if MC */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl text-xs font-medium border ${
                          q.answer.startsWith(opt.substring(0, 2))
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-stone-50/60 dark:bg-white/[0.02] border-stone-200/80 dark:border-white/5 text-stone-700 dark:text-slate-300'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer & Explanation */}
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Đáp án chuẩn: {q.answer}</span>
                  </div>
                  {q.explanation && (
                    <p className="text-amber-800/80 dark:text-amber-200/80 italic pl-5">
                      Hướng dẫn giải: {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Question */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F1523] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Thêm câu hỏi mới vào Ngân hàng</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Môn học</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#151B2B] text-xs font-semibold"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Lịch sử">Lịch sử</option>
                    <option value="Địa lý">Địa lý</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Khối lớp</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#151B2B] text-xs font-semibold"
                  >
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Dạng câu hỏi</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#151B2B] text-xs font-semibold"
                  >
                    <option value="multipleChoice">Trắc nghiệm 4 PA</option>
                    <option value="trueFalse">Đúng / Sai</option>
                    <option value="shortAnswer">Trả lời ngắn</option>
                    <option value="essay">Tự luận</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Mức độ nhận thức</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#151B2B] text-xs font-semibold"
                  >
                    <option value="biet">Nhận biết</option>
                    <option value="hieu">Thông hiểu</option>
                    <option value="vd">Vận dụng</option>
                    <option value="vdCao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Tên Chủ đề / Bài học</label>
                <Input
                  placeholder="Ví dụ: Đạo hàm & Khảo sát hàm số"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Nội dung câu hỏi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập nội dung câu hỏi..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#151B2B] text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {newType === 'multipleChoice' && (
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200 dark:border-white/5">
                  <div>
                    <label className="font-bold text-stone-700 dark:text-slate-300 block mb-1">Phương án A</label>
                    <Input placeholder="Giá trị A" value={newOptA} onChange={(e) => setNewOptA(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 dark:text-slate-300 block mb-1">Phương án B</label>
                    <Input placeholder="Giá trị B" value={newOptB} onChange={(e) => setNewOptB(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 dark:text-slate-300 block mb-1">Phương án C</label>
                    <Input placeholder="Giá trị C" value={newOptC} onChange={(e) => setNewOptC(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 dark:text-slate-300 block mb-1">Phương án D</label>
                    <Input placeholder="Giá trị D" value={newOptD} onChange={(e) => setNewOptD(e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Đáp án đúng *</label>
                <Input
                  placeholder={newType === 'multipleChoice' ? 'Ví dụ: A. 3 hoặc C' : 'Nhập đáp án hoặc hướng dẫn chấm'}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 dark:text-slate-200 block mb-1">Lời giải chi tiết / Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Nhập hướng dẫn giải (không bắt buộc)..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#151B2B] text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Lưu vào Ngân hàng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
