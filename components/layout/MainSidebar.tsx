import React from "react";
import { 
  BarChart3, 
  Sliders, 
  FileText, 
  Sparkles, 
  Shuffle, 
  BookOpen, 
  Database, 
  History, 
  Users, 
  Bell, 
  Settings, 
  Sun, 
  Moon, 
  ChevronRight,
  Hexagon,
  GraduationCap
} from "lucide-react";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";
import { NAV_ITEMS, ADMIN_ONLY_PAGES } from "../../constants";
import { Page, User, NavItem } from "../../types";
import { useI18n } from "../../hooks/useI18n";
import { Badge } from "../ui/Badge";

interface MainSidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentUser: User;
}

// Icon mapping helper for crisp Lucide rendering
const getIconForPath = (path: string, isActive: boolean) => {
  const iconProps = {
    className: `w-4 h-4 transition-transform duration-200 ${
      isActive ? "text-indigo-600 dark:text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] scale-110" : "text-stone-500 dark:text-slate-400 group-hover:text-stone-900 dark:group-hover:text-slate-200"
    }`
  };

  switch (path) {
    case 'dashboard': return <BarChart3 {...iconProps} />;
    case 'general-config': return <Sliders {...iconProps} />;
    case 'exam-structure': return <FileText {...iconProps} />;
    case 'ai-tool': return <Sparkles {...iconProps} />;
    case 'mix-exam': return <Shuffle {...iconProps} />;
    case 'results': return <BarChart3 {...iconProps} />;
    case 'outline': return <BookOpen {...iconProps} />;
    case 'question-bank': return <Database {...iconProps} />;
    case 'doc-bank': return <BookOpen {...iconProps} />;
    case 'exam-history': return <History {...iconProps} />;
    case 'analytics': return <BarChart3 {...iconProps} />;
    case 'users':
    case 'user-list': return <Users {...iconProps} />;
    case 'system-instruction': return <Bell {...iconProps} />;
    case 'settings': return <Settings {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

const SECTION_TRANSLATIONS: Record<string, string> = {
  'TỔNG QUAN': 'sidebar.section.overview',
  'TẠO ĐỀ THI': 'sidebar.section.examCreation',
  'NGÂN HÀNG & DỮ LIỆU': 'sidebar.section.bankAndData',
  'THỐNG KÊ & BÁO CÁO': 'sidebar.section.analytics',
  'HỆ THỐNG': 'sidebar.section.system',
};

export default function MainSidebar({ currentPage, setCurrentPage, currentUser }: MainSidebarProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const accessibleNavItems = NAV_ITEMS.filter(item => 
      !ADMIN_ONLY_PAGES.includes(item.path as Page) || (currentUser && currentUser.role === 'Quản trị hệ thống')
  );

  // Group items by section
  const sections: { [key: string]: NavItem[] } = {};
  accessibleNavItems.forEach(item => {
    const sec = item.section || 'TỔNG QUAN';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  });

  return (
    <aside id="main-sidebar" className="flex flex-col h-screen w-64 border-r border-[#E7E1D8] dark:border-white/[0.08] bg-[#F4EFEA] dark:bg-[#0C1120] text-stone-800 dark:text-slate-200 transition-colors duration-200 flex-shrink-0 z-30 select-none no-print">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[#E7E1D8] dark:border-white/[0.08] bg-[#EFE9E2] dark:bg-[#0A0E1A]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 shadow-md">
            <Hexagon className="w-5 h-5 text-white" strokeWidth={2.2} />
            <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-200 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-white">ExamGen</span>
              <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">5.0</span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-slate-400 font-semibold tracking-wide uppercase">AI Assessment</p>
          </div>
        </div>
      </div>

      {/* Navigation List with Categorized Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {Object.entries(sections).map(([sectionTitle, items]) => (
          <div key={sectionTitle} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-stone-500 dark:text-slate-500 uppercase">
              {t(SECTION_TRANSLATIONS[sectionTitle] as any, sectionTitle)}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = currentPage === item.path;
                return (
                  <button
                    key={item.path}
                    id={`sidebar-nav-${item.path}`}
                    onClick={() => setCurrentPage(item.path as Page)}
                    className={`group relative flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left cursor-pointer
                      ${isActive 
                        ? 'bg-white dark:bg-[#1A1535] dark:bg-gradient-to-r dark:from-purple-900/60 dark:via-indigo-900/50 dark:to-purple-950/70 text-indigo-950 dark:text-purple-100 font-bold border-l-2 border-indigo-600 dark:border-purple-400 dark:border dark:border-purple-500/30 shadow-sm dark:shadow-[0_0_12px_rgba(168,85,247,0.2)]' 
                        : 'text-stone-600 dark:text-slate-400 hover:text-stone-950 dark:hover:text-slate-100 hover:bg-stone-200/40 dark:hover:bg-white/[0.04]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getIconForPath(item.path, isActive)}
                      <span className="truncate">{t(item.tKey as any, item.title)}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        item.isAi 
                          ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-sm' 
                          : 'bg-[#EAE3D9] dark:bg-white/[0.08] text-stone-700 dark:text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Quick Info & Theme Switcher Footer */}
      <div className="p-3 border-t border-[#E7E1D8] dark:border-white/[0.08] bg-[#EFE9E2]/90 dark:bg-[#0A0E1A]/80 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/60 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.05]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
            <span className="text-[11px] text-stone-700 dark:text-slate-300 font-medium truncate">
              {currentUser.role === 'Quản trị hệ thống' ? 'Admin Mode' : 'Teacher Mode'}
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono font-semibold">
            GDPT 2018
          </span>
        </div>

        <button
          id="theme-toggle-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-200/50 dark:hover:bg-white/[0.05] border border-[#E0D8CD] dark:border-white/[0.06] transition-colors cursor-pointer bg-white/40 dark:bg-transparent"
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{theme === "dark" ? t('sidebar.lightMode' as any, 'Chế độ sáng (Warm)') : t('sidebar.darkMode' as any, 'Chế độ tối (Dark)')}</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-slate-500 uppercase">{theme}</span>
        </button>
      </div>
    </aside>
  );
}
