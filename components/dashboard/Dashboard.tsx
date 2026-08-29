import React, { useState } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  ShieldCheck, 
  Zap, 
  Lock, 
  History, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  BookOpen,
  Phone
} from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';
import { Page, User } from '../../types';
import { AIWorkflowStepper } from './AIWorkflowStepper';
import { DashboardMetricCards } from './DashboardMetricCards';
import { DashboardCharts } from './DashboardCharts';
import { QuickActions } from './QuickActions';
import { UploadSimulationZone } from './UploadSimulationZone';
import { RecentDocuments } from './RecentDocuments';
import { AIAssistantCard } from './AIAssistantCard';
import RealtimeSettingsDashboard from './RealtimeSettingsDashboard';
import UserGuideModal from '../settings/UserGuideModal';

interface DashboardProps {
  setCurrentPage?: (page: Page) => void;
  currentUser?: User;
}

export default function Dashboard({ setCurrentPage = () => {}, currentUser }: DashboardProps) {
  const { t } = useI18n();
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* 1. Hero Section */}
      <div className="relative rounded-3xl border border-[#E7E1D8] dark:border-white/[0.08] bg-gradient-to-r from-[#FAF3EA] via-[#F5ECE0] to-[#EFE2D2] dark:from-[#121528] dark:via-[#0E1324] dark:to-[#0A0D1A] p-6 sm:p-8 shadow-sm dark:shadow-xl overflow-hidden transition-colors">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-transparent dark:from-purple-600/20 dark:via-indigo-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-cyan-300 animate-pulse" />
                <span>Phiên bản ExamGen Ultra 5.0 Pro</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                Chào mừng trở lại{currentUser?.name ? `, ${currentUser.name}` : ''}! 👋
              </h1>

              <p className="text-sm text-stone-600 dark:text-slate-300 max-w-2xl leading-relaxed font-normal">
                Hệ thống AI hỗ trợ tạo đề kiểm tra, đánh giá theo Chương trình GDPT 2018. Tích hợp mô hình ngôn ngữ lớn thế hệ mới, tối ưu hóa toàn diện cấu trúc ma trận và bảng đặc tả.
              </p>

              {/* Developer Contact Info Bar */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs text-stone-700 dark:text-slate-300 font-medium border-t border-stone-300/40 dark:border-white/[0.06] max-w-3xl">
                <span className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Nhà phát triển: Đinh Đức Quân
                </span>
                <span className="text-stone-300 dark:text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Zalo: <a href="https://zalo.me/0905247585" target="_blank" rel="noopener noreferrer" className="hover:underline">0905247585</a>
                </span>
                <span className="text-stone-300 dark:text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-medium bg-rose-500/10 dark:bg-rose-500/20 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                  <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Youtube: <a href="https://youtube.com/@dinhducquan64" target="_blank" rel="noopener noreferrer" className="hover:underline font-mono">youtube.com/@dinhducquan64</a>
                </span>
                <span className="text-stone-300 dark:text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                  <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook: <a href="https://facebook.com/quan.inh.264470" target="_blank" rel="noopener noreferrer" className="hover:underline font-mono">facebook.com/quan.inh.264470</a>
                </span>
              </div>
            </div>

            {/* Quick Action buttons on Hero */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center flex-shrink-0">
              <Button
                variant="gradient"
                size="default"
                onClick={() => setCurrentPage('ai-tool')}
                className="shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>✦ Tạo đề mới bằng AI</span>
              </Button>
              <Button
                variant="secondary"
                size="default"
                onClick={() => setCurrentPage('general-config')}
              >
                <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>↑ Nạp tài liệu nguồn</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => setIsGuideModalOpen(true)}
                className="border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-semibold"
              >
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>📖 Tài liệu hướng dẫn</span>
              </Button>
            </div>
          </div>

          {/* 4 AI Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-stone-300/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.05] text-xs text-stone-700 dark:text-slate-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="font-semibold">AI Thế hệ Mới (Gemini 3.7)</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.05] text-xs text-stone-700 dark:text-slate-300 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">Chuẩn GDPT 2018 (CV 7991)</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.05] text-xs text-stone-700 dark:text-slate-300 shadow-xs">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="font-semibold">Ra đề & Trộn đề Siêu tốc</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.05] text-xs text-stone-700 dark:text-slate-300 shadow-xs">
              <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
              <span className="font-semibold">Bảo mật & Lưu trữ Đám mây</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Workflow 5-Step Stepper */}
      <AIWorkflowStepper onNavigate={setCurrentPage} />

      {/* 3. Metric KPI Cards */}
      <DashboardMetricCards />

      {/* 4. Charts Section */}
      <DashboardCharts />

      {/* 5. Quick Actions Section */}
      <QuickActions onNavigate={setCurrentPage} />

      {/* 6. Upload Simulation Zone & Live Config Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UploadSimulationZone onStartCreation={setCurrentPage} />
        </div>
        <div className="lg:col-span-1">
          <RealtimeSettingsDashboard />
        </div>
      </div>

      {/* 7. Recent Documents Table & AI Assistant Co-pilot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDocuments onOpenExam={setCurrentPage} />
        </div>
        <div className="lg:col-span-1">
          <AIAssistantCard onOpenAITool={setCurrentPage} />
        </div>
      </div>

      <UserGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
    </div>
  );
}
