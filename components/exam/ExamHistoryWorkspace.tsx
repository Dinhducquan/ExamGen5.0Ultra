import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Cloud, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Printer, 
  CheckCircle2, 
  Grid, 
  List, 
  Sparkles, 
  Shuffle, 
  BookOpen, 
  Sliders, 
  Copy,
  FileText,
  RotateCcw
} from '../icons';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { Page, GeneratedExamData, MixedExam } from '../../types';
import { 
  getExamHistory, 
  deleteExamHistoryItem, 
  restoreSampleExamHistory, 
  syncExamToDrive, 
  ExamHistoryItem 
} from '../../lib/examHistoryService';

interface ExamHistoryWorkspaceProps {
  setCurrentPage: (page: Page) => void;
  setExamData: (data: GeneratedExamData | null) => void;
  setMixedExamData?: (mixed: MixedExam[] | null) => void;
}

export default function ExamHistoryWorkspace({
  setCurrentPage,
  setExamData,
  setMixedExamData
}: ExamHistoryWorkspaceProps) {
  const { addToast } = useToast();

  const [historyItems, setHistoryItems] = useState<ExamHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [activeItem, setActiveItem] = useState<ExamHistoryItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'exam' | 'answer' | 'matrix' | 'mixed'>('exam');
  const [selectedMixedCode, setSelectedMixedCode] = useState<string>('101');
  
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    setHistoryItems(getExamHistory());
  }, []);

  const handleRestoreSamples = () => {
    if (window.confirm('Khôi phục danh sách đề thi mẫu ban đầu?')) {
      const restored = restoreSampleExamHistory();
      setHistoryItems(restored);
      addToast('Đã khôi phục các đề thi mẫu ban đầu thành công!', 'success');
    }
  };

  const handleDeleteItem = (item: ExamHistoryItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi đề thi "${item.title}"?`)) {
      const updated = deleteExamHistoryItem(item.id);
      setHistoryItems(updated);
      if (activeItem?.id === item.id) setActiveItem(null);
      addToast(`Đã xóa đề thi "${item.title}" khỏi lịch sử.`, 'success');
    }
  };

  const handleSyncToDrive = async (item: ExamHistoryItem) => {
    setSyncingId(item.id);
    try {
      const res = await syncExamToDrive(item);
      setHistoryItems(getExamHistory());
      addToast(`Đã lưu "${res.name || item.title}" lên Google Drive!`, 'success');
    } catch (err: any) {
      console.error('Sync to Drive error:', err);
      addToast(err.message || 'Không thể đồng bộ với Google Drive', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const handleLoadExamToWorkspace = (item: ExamHistoryItem) => {
    if (item.examData) {
      setExamData(item.examData);
    } else {
      setExamData({
        topics: [],
        examContent: item.examContent || '<p>Chưa có nội dung đề thi</p>',
        answerContent: item.answerContent || '<p>Chưa có đáp án</p>'
      });
    }

    if (setMixedExamData) {
      setMixedExamData(item.mixedExamData || null);
    }

    addToast(`Đã tải đề thi "${item.title}" vào trình xem và xuất bản!`, 'success');
    setCurrentPage('results');
  };

  const handleExportJsonBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyItems, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Lich_su_tao_de_ExamGen_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Đã xuất file sao lưu lịch sử tạo đề thành công!', 'success');
    } catch (e) {
      addToast('Không thể xuất file JSON sao lưu', 'error');
    }
  };

  const handlePrintExam = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let contentToPrint = '';
    if (activeModalTab === 'exam') {
      contentToPrint = activeItem?.examContent || '<p>Không có nội dung</p>';
    } else if (activeModalTab === 'answer') {
      contentToPrint = activeItem?.answerContent || '<p>Không có đáp án</p>';
    } else if (activeModalTab === 'mixed' && activeItem?.mixedExamData) {
      const currentMixed = activeItem.mixedExamData.find(m => m.code === selectedMixedCode);
      contentToPrint = currentMixed ? currentMixed.examContent : '<p>Không có mã đề này</p>';
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeItem?.title || 'In Đề Thi'}</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 20mm; font-size: 13pt; line-height: 1.5; color: #000; }
            h1, h2, h3, h4 { text-align: center; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${contentToPrint}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Đã sao chép nội dung vào bộ nhớ tạm!', 'success');
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return historyItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.schoolName && item.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.creatorName && item.creatorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
      const matchesMethod = selectedMethod === 'all' || item.method === selectedMethod;

      return matchesSearch && matchesSubject && matchesMethod;
    });
  }, [historyItems, searchQuery, selectedSubject, selectedMethod]);

  const stats = useMemo(() => {
    return {
      totalExams: historyItems.length,
      totalQuestions: historyItems.reduce((acc, cur) => acc + (cur.questionCount || 0), 0),
      syncedDrive: historyItems.filter(i => i.isDriveSynced).length,
      mixedCount: historyItems.filter(i => i.method === 'mixed' || (i.mixedExamData && i.mixedExamData.length > 0)).length
    };
  }, [historyItems]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set(historyItems.map(i => i.subject));
    return Array.from(set);
  }, [historyItems]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <BarChart2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lịch sử Tạo đề & Mã đề</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tập trung toàn bộ đề thi đã khởi tạo, các phiên bản mã đề đã trộn, ma trận & hướng dẫn chấm chi tiết.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setCurrentPage('general-config')}
            className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Tạo đề thi mới</span>
          </Button>

          <Button
            onClick={() => setCurrentPage('mix-exam')}
            variant="outline"
            className="text-xs font-medium cursor-pointer"
          >
            <Shuffle size={15} className="text-purple-500" />
            <span>Trộn đề thi</span>
          </Button>

          <Button
            onClick={handleExportJsonBackup}
            variant="secondary"
            className="text-xs font-medium cursor-pointer"
            title="Xuất file sao lưu dữ liệu dạng JSON"
          >
            <Download size={15} />
            <span>Sao lưu</span>
          </Button>

          <Button
            onClick={handleRestoreSamples}
            variant="ghost"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            title="Nạp lại các mẫu đề mặc định"
          >
            <RotateCcw size={14} />
            <span>Mẫu</span>
          </Button>
        </div>
      </div>

      {/* Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số bộ đề</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalExams}</div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">Lưu trữ trong hệ thống</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số câu hỏi đã tạo</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.totalQuestions}</div>
          <div className="text-[11px] text-slate-400">Bao gồm TN, ĐS, TLN, TL</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Đồng bộ Google Drive</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.syncedDrive}</div>
          <div className="text-[11px] text-emerald-500 mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={12} /> Google Docs
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Đề thi đã trộn mã</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.mixedCount}</div>
          <div className="text-[11px] text-slate-400">Sẵn sàng in ấn</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên đề thi, môn học, giáo viên, trường..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Method */}
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="auto">AI Tự động</option>
              <option value="semiAuto">Bán tự động</option>
              <option value="mixed">Trộn đề thi</option>
              <option value="manual">Tạo thủ công</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                title="Dạng lưới"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                title="Dạng danh sách"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả môn học
          </button>

          {uniqueSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <BarChart2 size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Không tìm thấy lịch sử tạo đề</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc tạo một đề thi mới bằng công cụ ra đề AI.
          </p>
          <Button onClick={() => { setSearchQuery(''); setSelectedSubject('all'); setSelectedMethod('all'); }} variant="outline" size="sm" className="text-xs">
            Xóa bộ lọc
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all shadow-xs flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    item.method === 'auto' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400' :
                    item.method === 'mixed' ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400' :
                    item.method === 'semiAuto' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.methodLabel}
                  </span>

                  {item.isDriveSynced ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Cloud size={10} /> Đã lưu Drive
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Lưu cục bộ</span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2.5 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="space-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Môn: <strong className="text-slate-700 dark:text-slate-300">{item.subject} - Lớp {item.grade}</strong></span>
                    <span>Số câu: <strong className="text-indigo-600 dark:text-indigo-400">{item.questionCount} câu</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{item.schoolName || 'THPT'}</span>
                    <span>{item.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => { setActiveItem(item); setActiveModalTab('exam'); }}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>Xem</span>
                  </Button>

                  <Button
                    onClick={() => handleLoadExamToWorkspace(item)}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold cursor-pointer"
                    title="Nạp vào màn hình Kết quả để in/xuất Word"
                  >
                    <Sliders size={13} />
                    <span>Nạp đề</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSyncToDrive(item)}
                    disabled={syncingId === item.id}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    title="Lưu file lên Google Drive"
                  >
                    <Cloud size={15} className={syncingId === item.id ? "animate-spin text-emerald-500" : ""} />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Xóa đề thi"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="p-3.5 pl-4">Tên đề thi</th>
                  <th className="p-3.5">Môn / Lớp</th>
                  <th className="p-3.5">Phương thức</th>
                  <th className="p-3.5">Số câu / Thang điểm</th>
                  <th className="p-3.5">Ngày tạo</th>
                  <th className="p-3.5">Google Drive</th>
                  <th className="p-3.5 text-right pr-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 pl-4 font-semibold text-slate-900 dark:text-slate-100 max-w-md">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-indigo-600 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      {item.subject} - Lớp {item.grade}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.methodLabel}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {item.questionCount} câu ({item.totalScore}đ)
                    </td>
                    <td className="p-3.5 text-slate-500">{item.createdAt}</td>
                    <td className="p-3.5">
                      {item.isDriveSynced ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Cloud size={13} /> Đã đồng bộ
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Chưa đẩy</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleLoadExamToWorkspace(item)}
                          className="px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[11px] transition-all cursor-pointer"
                        >
                          Nạp đề
                        </button>
                        <button
                          onClick={() => { setActiveItem(item); setActiveModalTab('exam'); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleSyncToDrive(item)}
                          disabled={syncingId === item.id}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          title="Đồng bộ Google Drive"
                        >
                          <Cloud size={14} className={syncingId === item.id ? "animate-spin text-emerald-500" : ""} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Xóa đề thi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXAM PREVIEW & DETAIL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {activeItem.subject} - Lớp {activeItem.grade}
                  </span>
                  <span className="text-xs text-slate-400">{activeItem.createdAt}</span>
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                  {activeItem.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrintExam}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold cursor-pointer"
                >
                  <Printer size={14} />
                  <span>In đề</span>
                </Button>

                <Button
                  onClick={() => handleLoadExamToWorkspace(activeItem)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  <Sliders size={14} />
                  <span>Chỉnh sửa trong Workspace</span>
                </Button>

                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-2 p-2 px-6 bg-slate-100/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
              <button
                onClick={() => setActiveModalTab('exam')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeModalTab === 'exam'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                📄 Nội dung Đề thi
              </button>

              <button
                onClick={() => setActiveModalTab('answer')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeModalTab === 'answer'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🔑 Đáp án & Hướng dẫn chấm
              </button>

              {activeItem.mixedExamData && activeItem.mixedExamData.length > 0 && (
                <button
                  onClick={() => setActiveModalTab('mixed')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    activeModalTab === 'mixed'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🔀 Các mã đề đã trộn ({activeItem.mixedExamData.length})
                </button>
              )}
            </div>

            {/* Modal Main Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-950">
              {activeModalTab === 'exam' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium">Nội dung đề thi gốc</span>
                    <Button
                      onClick={() => handleCopyContent(activeItem.examContent || '')}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <Copy size={13} />
                      <span>Sao chép HTML</span>
                    </Button>
                  </div>
                  <div 
                    className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeItem.examContent || '<p>Chưa có nội dung đề thi.</p>' }}
                  />
                </div>
              )}

              {activeModalTab === 'answer' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium">Đáp án và Thang điểm chấm</span>
                    <Button
                      onClick={() => handleCopyContent(activeItem.answerContent || '')}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <Copy size={13} />
                      <span>Sao chép HTML</span>
                    </Button>
                  </div>
                  <div 
                    className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeItem.answerContent || '<p>Chưa có đáp án.</p>' }}
                  />
                </div>
              )}

              {activeModalTab === 'mixed' && activeItem.mixedExamData && (
                <div className="space-y-4">
                  {/* Mixed Codes Switcher */}
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500">Chọn mã đề:</span>
                    {activeItem.mixedExamData.map((m) => (
                      <button
                        key={m.code}
                        onClick={() => setSelectedMixedCode(m.code)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedMixedCode === m.code
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        Mã đề {m.code}
                      </button>
                    ))}
                  </div>

                  {/* Selected Mixed Code Content */}
                  {(() => {
                    const currentMixed = activeItem.mixedExamData.find(m => m.code === selectedMixedCode) || activeItem.mixedExamData[0];
                    if (!currentMixed) return <p className="text-xs text-slate-500">Không có nội dung mã đề này.</p>;

                    return (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-bold text-sm text-amber-600 dark:text-amber-400 mb-2">ĐỀ THI MÃ DỄ {currentMixed.code}</h4>
                          <div 
                            className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 prose dark:prose-invert max-w-none text-xs"
                            dangerouslySetInnerHTML={{ __html: currentMixed.examContent }}
                          />
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2">ĐÁP ÁN MÃ ĐỀ {currentMixed.code}</h4>
                          <div 
                            className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 prose dark:prose-invert max-w-none text-xs"
                            dangerouslySetInnerHTML={{ __html: currentMixed.answerContent }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <div>
                Tạo bởi: <strong>{activeItem.creatorName}</strong> ({activeItem.schoolName || 'Trường THPT'})
              </div>
              <Button onClick={() => setActiveItem(null)} variant="outline" size="sm" className="text-xs">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
