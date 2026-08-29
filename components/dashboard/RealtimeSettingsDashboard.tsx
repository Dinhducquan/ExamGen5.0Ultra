import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Sliders, CheckCircle, Sparkles, BookOpen, Layers, Target, Users } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { useExamCreation } from '../../hooks/useExamCreation';
import { STUDENT_TARGETS } from '../../lib/studentTargetPrompt';

const InfoRow = ({ label, value, icon }: { label: string, value: React.ReactNode, icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center text-xs py-2 border-b border-stone-200/60 dark:border-white/[0.04] last:border-none">
    <span className="text-stone-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
      {icon}
      {label}
    </span>
    <span className="font-semibold text-stone-900 dark:text-slate-100 text-right">{value}</span>
  </div>
);

export default function RealtimeSettingsDashboard() {
  const { settings, saveSettings } = useSettings();
  const { examSettings } = useExamCreation();

  const creationMethod = examSettings.creationMethod;
  const isManual = creationMethod === 'manual';
  const activeConfig = (creationMethod === 'auto' || creationMethod === 'semiAuto') ? examSettings[creationMethod] : examSettings.auto;

  const creationMethodMap = {
    'auto': 'Tự động (AI Gemini)',
    'semiAuto': 'Bán tự động',
    'manual': 'Thủ công'
  };

  const matrixTypeMap: { [key: string]: string } = {
    'm1': 'Tiểu học',
    'm2': 'CV 7991 (Chuẩn)',
    'm3': 'Ngữ văn GDPT',
    'm4': 'Tùy chỉnh'
  };
  
  const cognitiveDist = isManual 
    ? 'Theo chủ đề' 
    : `${activeConfig.distNhanBiet}% / ${activeConfig.distThongHieu}% / ${activeConfig.distVanDung}% / ${activeConfig.distVdCao}%`;

  let questionStructure: React.ReactNode = 'Tự do';
  if (!isManual) {
    if (settings.subject === 'Ngữ văn') {
      const docHieuCount = activeConfig.nguVanTuDongDocHieuPart?.soCau || 4;
      const vietCount = activeConfig.nguVanTuDongVietPart?.soCau || 2;
      questionStructure = `Đọc hiểu: ${docHieuCount} | Viết: ${vietCount}`;
    } else {
      const parts = [];
      if (parseInt(activeConfig.cauHoiTracNghiem?.cau || '0') > 0) parts.push(`TN: ${activeConfig.cauHoiTracNghiem.cau}`);
      if (parseInt(activeConfig.cauHoiDungSai?.cau || '0') > 0) parts.push(`Đ/S: ${activeConfig.cauHoiDungSai.cau}`);
      if (parseInt(activeConfig.cauHoiTraLoiNgan?.cau || '0') > 0) parts.push(`TLN: ${activeConfig.cauHoiTraLoiNgan.cau}`);
      if (parseInt(activeConfig.cauHoiTuLuan?.cau || '0') > 0) parts.push(`TL: ${activeConfig.cauHoiTuLuan.cau}`);
      questionStructure = parts.length ? parts.join(' | ') : '12 TN | 4 Đ/S | 6 TLN';
    }
  }

  const handleStudentTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveSettings({ ...settings, studentTarget: e.target.value });
  };
  
  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-stone-200/60 dark:border-white/[0.06]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-stone-900 dark:text-white">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Thiết lập Hiện hành
            </CardTitle>
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-slate-400">Trạng thái cấu hình ma trận & thông số ra đề</p>
        </CardHeader>
        <CardContent className="pt-3 space-y-0.5">
          <InfoRow 
            icon={<BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />} 
            label="Môn học" 
            value={<span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold">{settings.subject || 'Toán học'}</span>} 
          />
          <InfoRow 
            icon={<Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />} 
            label="Chế độ ra đề" 
            value={<span className="text-stone-900 dark:text-slate-100">{creationMethodMap[creationMethod]}</span>} 
          />
          <InfoRow 
            icon={<Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />} 
            label="Kiểu Ma trận" 
            value={<span className="text-stone-900 dark:text-slate-100">{isManual ? 'Không áp dụng' : matrixTypeMap[activeConfig.matrixType] || 'CV 7991'}</span>} 
          />
          <InfoRow 
            icon={<Target className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />} 
            label="Tỷ lệ (NB/TH/VD/VDC)" 
            value={<span className="font-mono text-stone-900 dark:text-slate-200">{cognitiveDist}</span>} 
          />
          <InfoRow 
            icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />} 
            label="Cấu trúc câu hỏi" 
            value={<span className="text-[11px] text-stone-800 dark:text-slate-300 font-mono">{questionStructure}</span>} 
          />
          <InfoRow 
            icon={<Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />} 
            label="Cá Nhân Hóa Đề Thi" 
            value={
              <select 
                value={settings.studentTarget || 'Phổ thông'} 
                onChange={handleStudentTargetChange}
                className="text-xs py-1 px-2 rounded border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
              >
                {STUDENT_TARGETS.map((target) => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </select>
            } 
          />
        </CardContent>
      </div>

      <div className="p-3 m-4 rounded-xl bg-stone-100/70 dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/[0.06] text-[11px] text-stone-600 dark:text-slate-400 flex items-center justify-between">
        <span>Tự động đồng bộ hóa</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">100% Đồng bộ</span>
      </div>
    </Card>
  );
}
