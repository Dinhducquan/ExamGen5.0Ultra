import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  FileCode,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Page } from '../../types';

interface UploadSimulationZoneProps {
  onStartCreation: (page: Page) => void;
}

export const UploadSimulationZone: React.FC<UploadSimulationZoneProps> = ({ onStartCreation }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const steps = [
    { text: 'Đang tải & đọc tài liệu nguồn...', done: false },
    { text: 'Đã nhận diện: Toán 12 – Bộ sách Kết nối tri thức', done: false },
    { text: 'Đã bóc tách YCCĐ Chương: Nguyên hàm, Tích phân & Ứng dụng', done: false },
    { text: 'Đã thiết lập khung ma trận 4 mức độ nhận thức (4:3:2:1)', done: false },
    { text: 'Sẵn sàng chuyển sang Bảng đặc tả & Sinh đề thi AI!', done: false },
  ];

  const handleSimulateAnalysis = (fileName: string) => {
    setSelectedFile(fileName);
    setIsAnalyzing(true);
    setAnalysisStep(1);

    const timers = [
      setTimeout(() => setAnalysisStep(2), 700),
      setTimeout(() => setAnalysisStep(3), 1500),
      setTimeout(() => setAnalysisStep(4), 2300),
      setTimeout(() => {
        setAnalysisStep(5);
        setIsAnalyzing(false);
      }, 3100),
    ];

    return () => timers.forEach(clearTimeout);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Nạp tài liệu & Phân tích AI Tự động
          </CardTitle>
          <p className="text-xs text-stone-600 dark:text-slate-400">
            Hỗ trợ kéo thả PDF, DOCX, TXT chương trình học, đề cương hoặc giáo án môn học
          </p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
          Auto OCR & Parse
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files[0];
              if (file) handleSimulateAnalysis(file.name);
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer
              ${dragActive 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                : 'border-[#E0D8CD] dark:border-white/[0.12] bg-[#FAF7F2]/80 dark:bg-[#151B2B]/40 hover:bg-[#F3ECE1] dark:hover:bg-[#151B2B]/80 hover:border-indigo-500/50'
              }`}
            onClick={() => handleSimulateAnalysis("De_cuong_Toan_12_Hoc_Ky_2.pdf")}
          >
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <UploadCloud className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-stone-900 dark:text-white mb-1">
              Kéo thả file vào đây hoặc <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4">Chọn từ máy tính</span>
            </p>
            <p className="text-xs text-stone-600 dark:text-slate-400 max-w-sm mx-auto">
              Hỗ trợ định dạng .PDF, .DOCX, .TXT dung lượng tới 50MB. AI sẽ tự động phân tích ma trận và câu hỏi.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-slate-500">
              <span className="px-2 py-0.5 rounded bg-stone-200/50 dark:bg-white/[0.05] font-medium">Word / Docs</span>
              <span className="px-2 py-0.5 rounded bg-stone-200/50 dark:bg-white/[0.05] font-medium">PDF Giáo án</span>
              <span className="px-2 py-0.5 rounded bg-stone-200/50 dark:bg-white/[0.05] font-medium">Dán văn bản trực tiếp</span>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F1523] border border-[#E0D8CD] dark:border-white/[0.08] shadow-xs space-y-4">
            {/* File header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2] dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">{selectedFile}</h4>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">1.8 MB • Phân tích bằng Gemini 3.7 Pro</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedFile(null); setAnalysisStep(0); }}
                className="text-xs text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Nạp file khác
              </button>
            </div>

            {/* Analysis Progress Steps */}
            <div className="space-y-2.5">
              {steps.map((s, idx) => {
                const isCurrent = analysisStep === idx + 1;
                const isPassed = analysisStep > idx + 1;
                const isUpcoming = analysisStep < idx + 1;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs p-2.5 rounded-xl transition-all duration-200
                      ${isPassed ? 'text-stone-800 dark:text-slate-200 bg-emerald-500/10' : isCurrent ? 'text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 font-bold' : 'text-stone-500 dark:text-slate-500'}`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-stone-300 dark:border-slate-600 flex-shrink-0" />
                    )}
                    <span className="flex-1 font-medium">{s.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Complete button */}
            {analysisStep === 5 && (
              <div className="pt-3 border-t border-[#EFEAE2] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Bóc tách dữ liệu thành công
                </span>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => onStartCreation('exam-structure')}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chuyển sang Ma trận & Ra đề</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
