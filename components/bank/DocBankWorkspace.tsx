import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Upload, 
  RefreshCw, 
  ExternalLink, 
  Cloud, 
  Trash2, 
  Eye, 
  FileText, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Grid, 
  List, 
  Download,
  FolderOpen
} from '../icons';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { useSettings } from '../../hooks/useSettings';
import { 
  listExamGenFolderFiles, 
  uploadRawFileToDrive, 
  deleteDriveFile, 
  getExamGenFolderDetails, 
  googleSignInForDrive, 
  getDriveAccessToken,
  DriveDocFile 
} from '../../lib/googleDriveService';

export interface DocumentItem {
  id: string;
  name: string;
  category: 'exam' | 'matrix' | 'bank' | 'outline' | 'upload';
  categoryLabel: string;
  mimeType?: string;
  webViewLink?: string;
  createdTime: string;
  subject?: string;
  grade?: string;
  size?: string;
  isDriveSynced: boolean;
  description?: string;
}

const STORAGE_KEY = 'examgen_doc_repository_v1';

const INITIAL_SAMPLE_DOCS: DocumentItem[] = [
  {
    id: 'sample-doc-1',
    name: 'Đề thi minh họa Ngữ văn 12 - Chuẩn GDPT 2018',
    category: 'exam',
    categoryLabel: 'Đề thi & Đáp án',
    mimeType: 'application/vnd.google-apps.document',
    createdTime: new Date(Date.now() - 3600000 * 24 * 2).toLocaleDateString('vi-VN'),
    subject: 'Ngữ văn',
    grade: '12',
    size: '48 KB',
    isDriveSynced: true,
    description: 'Đề thi kèm đáp án và thang điểm chấm chi tiết theo cấu trúc mới nhất Bộ GD&ĐT.'
  },
  {
    id: 'sample-doc-2',
    name: 'Ma trận & Bảng đặc tả Toán 12 - Học kỳ 1',
    category: 'matrix',
    categoryLabel: 'Ma trận & Bảng đặc tả',
    mimeType: 'application/vnd.google-apps.document',
    createdTime: new Date(Date.now() - 3600000 * 24 * 5).toLocaleDateString('vi-VN'),
    subject: 'Toán',
    grade: '12',
    size: '35 KB',
    isDriveSynced: true,
    description: 'Bảng đặc tả cấp độ tư duy (Nhận biết, Thông hiểu, Vận dụng) Công văn 7991.'
  },
  {
    id: 'sample-doc-3',
    name: 'Ngân hàng câu hỏi Lịch sử 11 (Chủ đề 1 & 2)',
    category: 'bank',
    categoryLabel: 'Ngân hàng câu hỏi',
    mimeType: 'application/vnd.google-apps.document',
    createdTime: new Date(Date.now() - 3600000 * 24 * 7).toLocaleDateString('vi-VN'),
    subject: 'Lịch sử',
    grade: '11',
    size: '120 KB',
    isDriveSynced: true,
    description: 'Tập hợp 150 câu hỏi trắc nghiệm và tự luận chọn lọc.'
  },
  {
    id: 'sample-doc-4',
    name: 'Đề cương ôn tập kiểm tra Cuối kỳ 1 Tiếng Anh 10',
    category: 'outline',
    categoryLabel: 'Đề cương ôn tập',
    mimeType: 'application/vnd.google-apps.document',
    createdTime: new Date(Date.now() - 3600000 * 24 * 10).toLocaleDateString('vi-VN'),
    subject: 'Tiếng Anh',
    grade: '10',
    size: '62 KB',
    isDriveSynced: true,
    description: 'Đề cương tổng hợp lý thuyết, từ vựng và bài tập tự luyện.'
  }
];

export default function DocBankWorkspace() {
  const { addToast } = useToast();
  const { settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading local doc bank:', e);
    }
    return INITIAL_SAMPLE_DOCS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [folderUrl, setFolderUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const isConnected = !!getDriveAccessToken();

  // Save docs to local storage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save docs to localStorage', e);
    }
  }, [docs]);

  // Load Folder details on start if token exists
  useEffect(() => {
    if (isConnected) {
      getExamGenFolderDetails()
        .then(res => setFolderUrl(res.webViewLink))
        .catch(err => console.warn('Could not fetch folder details:', err));
    }
  }, [isConnected]);

  const handleAuthorizeDrive = async () => {
    try {
      setIsAuthorizing(true);
      const res = await googleSignInForDrive();
      addToast(`Đã kết nối Google Drive thành công! (${res.user.email})`, 'success');
      
      const folderRes = await getExamGenFolderDetails();
      setFolderUrl(folderRes.webViewLink);

      // Auto sync files after authorization
      await handleSyncWithDrive();
    } catch (err: any) {
      addToast(err.message || 'Kết nối Google Drive thất bại', 'error');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSyncWithDrive = async () => {
    setIsSyncing(true);
    try {
      const driveFiles: DriveDocFile[] = await listExamGenFolderFiles();
      
      // Convert DriveDocFile[] into DocumentItem[]
      const syncedDocs: DocumentItem[] = driveFiles.map((df) => {
        let category: DocumentItem['category'] = 'upload';
        let categoryLabel = 'Tài liệu tải lên';

        const nameLower = df.name.toLowerCase();
        if (nameLower.includes('ngân hàng') || nameLower.includes('câu hỏi')) {
          category = 'bank';
          categoryLabel = 'Ngân hàng câu hỏi';
        } else if (nameLower.includes('ma trận') || nameLower.includes('bảng đặc tả')) {
          category = 'matrix';
          categoryLabel = 'Ma trận & Bảng đặc tả';
        } else if (nameLower.includes('đề thi') || nameLower.includes('đáp án')) {
          category = 'exam';
          categoryLabel = 'Đề thi & Đáp án';
        } else if (nameLower.includes('đề cương')) {
          category = 'outline';
          categoryLabel = 'Đề cương ôn tập';
        }

        return {
          id: df.id,
          name: df.name,
          category,
          categoryLabel,
          mimeType: df.mimeType,
          webViewLink: df.webViewLink,
          createdTime: df.createdTime ? new Date(df.createdTime).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          subject: settings.subject || 'Tổng hợp',
          grade: settings.grade || '12',
          size: df.size ? `${Math.round(parseInt(df.size) / 1024)} KB` : 'Google Doc',
          isDriveSynced: true,
          description: 'Tài liệu lưu trữ trực tiếp trên Google Drive folder "Tài liệu lưu trữ ExamGen Ultra 5.0"'
        };
      });

      // Merge drive files with local docs to avoid losing unique entries
      setDocs(prev => {
        const map = new Map<string, DocumentItem>();
        // Add existing docs first
        prev.forEach(d => map.set(d.id, d));
        // Update/overwrite with real Drive files
        syncedDocs.forEach(d => map.set(d.id, d));
        return Array.from(map.values());
      });

      addToast(`Đồng bộ thành công ${driveFiles.length} tài liệu từ Google Drive!`, 'success');
    } catch (err: any) {
      console.error('Sync Drive error:', err);
      addToast(err.message || 'Có lỗi xảy ra khi đồng bộ từ Google Drive', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const res = await uploadRawFileToDrive(file, 'Tài liệu tham khảo');
      
      const newDoc: DocumentItem = {
        id: res.id || `doc-${Date.now()}`,
        name: res.name || file.name,
        category: 'upload',
        categoryLabel: 'Tài liệu tải lên',
        mimeType: file.type,
        webViewLink: res.webViewLink,
        createdTime: new Date().toLocaleDateString('vi-VN'),
        subject: settings.subject || 'Khác',
        grade: settings.grade || '12',
        size: `${Math.round(file.size / 1024)} KB`,
        isDriveSynced: true,
        description: `Tài liệu "${file.name}" đã được đẩy trực tiếp lên thư mục Google Drive.`
      };

      setDocs(prev => [newDoc, ...prev]);
      addToast(`Đã tải file "${file.name}" lên thư mục "Tài liệu lưu trữ ExamGen Ultra 5.0" thành công!`, 'success');
    } catch (err: any) {
      console.error('Upload file error:', err);
      addToast(err.message || 'Có lỗi xảy ra khi tải file lên Google Drive', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (docToDelete: DocumentItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${docToDelete.name}"?`)) {
      return;
    }

    try {
      if (docToDelete.isDriveSynced && docToDelete.id && !docToDelete.id.startsWith('sample-')) {
        await deleteDriveFile(docToDelete.id);
      }
      setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
      addToast(`Đã xóa tài liệu "${docToDelete.name}"`, 'success');
    } catch (err: any) {
      console.error('Delete doc error:', err);
      addToast(err.message || 'Không thể xóa tài liệu', 'error');
    }
  };

  const openDriveFolder = () => {
    if (folderUrl) {
      window.open(folderUrl, '_blank');
    } else {
      handleAuthorizeDrive();
    }
  };

  // Filtered documents calculation
  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (doc.subject && doc.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;

      return matchesSearch && matchesCategory && matchesSubject;
    });
  }, [docs, searchQuery, selectedCategory, selectedSubject]);

  const stats = useMemo(() => {
    return {
      total: docs.length,
      exam: docs.filter(d => d.category === 'exam').length,
      matrix: docs.filter(d => d.category === 'matrix').length,
      bank: docs.filter(d => d.category === 'bank').length,
      outline: docs.filter(d => d.category === 'outline').length,
      synced: docs.filter(d => d.isDriveSynced).length,
    };
  }, [docs]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hidden File Input for Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".docx,.doc,.pdf,.txt,.html,.json"
      />

      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg">
              <BookOpen size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kho Tài liệu & Lưu trữ Cloud</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tập trung Ma trận, Bảng đặc tả, Đề thi, Đáp án & Ngân hàng câu hỏi trong thư mục <strong>"Tài liệu lưu trữ ExamGen Ultra 5.0"</strong> trên Google Drive.
          </p>
        </div>

        {/* Google Drive Status & Folder Link */}
        <div className="flex flex-wrap items-center gap-2">
          {folderUrl && (
            <Button
              onClick={openDriveFolder}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              <FolderOpen size={15} />
              <span>Mở thư mục Google Drive</span>
              <ExternalLink size={13} />
            </Button>
          )}

          <Button
            onClick={handleAuthorizeDrive}
            disabled={isAuthorizing}
            variant="outline"
            className="text-xs font-medium cursor-pointer"
          >
            <Cloud size={15} className={isConnected ? "text-emerald-500" : "text-amber-500"} />
            <span>{isConnected ? "Đã kết nối Google Drive" : "Ủy quyền Google Drive"}</span>
          </Button>

          <Button
            onClick={handleSyncWithDrive}
            disabled={isSyncing}
            variant="secondary"
            className="text-xs font-medium cursor-pointer"
            title="Tải danh sách tài liệu mới nhất từ Google Drive"
          >
            <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "Đang đồng bộ..." : "Làm mới"}</span>
          </Button>
        </div>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng tài liệu</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">Kho lưu trữ sẵn sàng</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Đề thi & Đáp án</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.exam}</div>
          <div className="text-[11px] text-slate-400">File Google Docs</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Ma trận & Đặc tả</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.matrix}</div>
          <div className="text-[11px] text-slate-400">Công văn 7991</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Ngân hàng câu hỏi</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.bank}</div>
          <div className="text-[11px] text-slate-400">Đã lưu Drive</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Trạng thái Google Drive</div>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Tự động đồng bộ</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Thư mục ExamGen Ultra 5.0</div>
        </div>
      </div>

      {/* Controls Bar: Search, Category Tabs, Upload, View Toggle */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu theo tên, môn học, chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Upload size={14} className={isUploading ? "animate-bounce" : ""} />
              <span>{isUploading ? "Đang tải lên..." : "Tải tài liệu lên Drive"}</span>
            </Button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                title="Chế độ lưới"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                title="Chế độ danh sách"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {[
            { id: 'all', label: 'Tất cả tài liệu' },
            { id: 'exam', label: 'Đề thi & Đáp án' },
            { id: 'matrix', label: 'Ma trận & Bảng đặc tả' },
            { id: 'bank', label: 'Ngân hàng câu hỏi' },
            { id: 'outline', label: 'Đề cương ôn tập' },
            { id: 'upload', label: 'Tài liệu tải lên' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Không tìm thấy tài liệu phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Tải tài liệu lên Drive" để thêm tài liệu mới vào kho.
          </p>
          <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} variant="outline" size="sm" className="text-xs">
            Xóa bộ lọc tìm kiếm
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all shadow-xs flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    doc.category === 'exam' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' :
                    doc.category === 'matrix' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400' :
                    doc.category === 'bank' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {doc.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Cloud size={10} /> Google Doc
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2.5 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {doc.name}
                </h3>

                {doc.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Môn: <strong>{doc.subject || 'Tổng hợp'}</strong></span>
                  <span>Lớp: <strong>{doc.grade || '12'}</strong></span>
                  <span>{doc.createdTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setPreviewDoc(doc)}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Chi tiết</span>
                </Button>

                <div className="flex items-center gap-1">
                  {doc.webViewLink && (
                    <a
                      href={doc.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      <span>Mở Google Docs</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <button
                    onClick={() => handleDeleteDoc(doc)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Xóa tài liệu"
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
                  <th className="p-3.5 pl-4">Tên tài liệu</th>
                  <th className="p-3.5">Phân loại</th>
                  <th className="p-3.5">Môn / Lớp</th>
                  <th className="p-3.5">Ngày tạo</th>
                  <th className="p-3.5">Định dạng</th>
                  <th className="p-3.5 text-right pr-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 pl-4 font-semibold text-slate-900 dark:text-slate-100 max-w-md">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-teal-600 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {doc.categoryLabel}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {doc.subject} - Lớp {doc.grade}
                    </td>
                    <td className="p-3.5 text-slate-500">{doc.createdTime}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Cloud size={12} /> Google Docs
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {doc.webViewLink && (
                          <a
                            href={doc.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-all cursor-pointer"
                          >
                            <span>Mở Docs</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Xem thông tin chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Xóa tài liệu"
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

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-teal-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Thông tin Tài liệu</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <label className="text-slate-400 font-medium">Tên tài liệu:</label>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">{previewDoc.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-slate-400">Phân loại:</label>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{previewDoc.categoryLabel}</div>
                </div>
                <div>
                  <label className="text-slate-400">Định dạng:</label>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">Google Docs</div>
                </div>
                <div>
                  <label className="text-slate-400">Môn học / Lớp:</label>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{previewDoc.subject} - Lớp {previewDoc.grade}</div>
                </div>
                <div>
                  <label className="text-slate-400">Ngày tạo:</label>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{previewDoc.createdTime}</div>
                </div>
              </div>

              {previewDoc.description && (
                <div>
                  <label className="text-slate-400 font-medium">Mô tả chi tiết:</label>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 mt-1">
                    {previewDoc.description}
                  </div>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px]">
                📌 Vị trí lưu trữ: Thư mục <strong>"Tài liệu lưu trữ ExamGen Ultra 5.0"</strong> trên Google Drive của bạn.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setPreviewDoc(null)} variant="outline" size="sm" className="text-xs">
                Đóng
              </Button>
              {previewDoc.webViewLink && (
                <a
                  href={previewDoc.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  <span>Mở trên Google Drive</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
