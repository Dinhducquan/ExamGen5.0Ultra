import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Bell, 
  Settings, 
  Printer, 
  Sparkles, 
  Users, 
  LogOut, 
  KeySquare, 
  Languages, 
  Check, 
  ChevronDown,
  Command,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Zap,
  Maximize,
  Minimize
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { Page, User } from "../../types";
import { useI18n } from "../../hooks/useI18n";
import LicenseStatusModal from "../auth/LicenseStatusModal";
import { checkIsUserLicensed } from "../../lib/licenseService";
import { ModelSelectorMenu } from "../ai/ModelSelectorMenu";
import { CommandSearchModal } from "./CommandSearchModal";
import AIModelCenterModal from "../ai/AIModelCenterModal";

import { subscribeAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead, SystemNotification } from "../../lib/notificationService";

interface HeaderNavProps {
  setCurrentPage: (page: Page) => void;
  handleLogout: () => void;
  currentUser: User;
  handleRequestActivation: () => void;
}

export default function HeaderNav({ setCurrentPage, handleLogout, currentUser, handleRequestActivation }: HeaderNavProps) {
  const { addToast } = useToast();
  const { t, language, setLanguage } = useI18n();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyModalTab, setApiKeyModalTab] = useState<'apikeys' | 'models'>('apikeys');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(() => {
    return !!localStorage.getItem('examgen_gemini_api_key');
  });

  useEffect(() => {
    const unsub = subscribeAdminNotifications((items) => {
      setNotifications(items);
    });
    return () => unsub();
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    const handleStorageChange = () => {
      setHasGeminiKey(!!localStorage.getItem('examgen_gemini_api_key'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const elem = document.documentElement as any;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } else {
        const doc = document as any;
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
      addToast(isFullscreen ? "Không thể thoát toàn màn hình" : "Trình duyệt hoặc khung nhúng giới hạn chế độ toàn màn hình");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isLicensed = checkIsUserLicensed(currentUser);
  const isTrialUser = currentUser.role === 'Giáo viên' && !isLicensed;

  return (
    <>
      <header id="top-navbar" className="w-full h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[#E7E1D8] dark:border-white/[0.08] bg-[#FAF8F5]/90 dark:bg-[#080B14]/90 backdrop-blur-xl transition-all duration-200 flex-shrink-0 relative z-40 no-print">
        {/* Left spacer / contextual container */}
        <div className="flex items-center gap-2"></div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
          {/* Dynamic Gemini Model Selection Pill */}
          <ModelSelectorMenu 
            variant="header" 
            onOpenConfig={(tab) => {
              setApiKeyModalTab(tab || 'models');
              setIsApiKeyModalOpen(true);
            }}
          />

          {/* Dedicated Header Button: Cấu hình API Key & Module AI */}
          <button
            type="button"
            onClick={() => {
              setApiKeyModalTab('apikeys');
              setIsApiKeyModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 hover:from-amber-500/20 hover:via-indigo-500/20 hover:to-purple-500/20 border border-indigo-200/90 dark:border-indigo-800/80 text-stone-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all shadow-xs cursor-pointer group flex-shrink-0"
            title={t('header.configApiKeyTitle', 'Cấu hình API Key & Lựa chọn Module AI')}
          >
            <KeySquare className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t('header.configApiKey', 'Cấu hình API key')}</span>
            <span className="sm:hidden">API Key</span>
            <span 
              className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-500 ring-1 ring-emerald-300 dark:ring-emerald-800' : 'bg-amber-500 animate-pulse'}`}
              title={hasGeminiKey ? 'Đã cài đặt API Key' : 'Chưa có API Key'}
            />
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('header.exitFullscreen', 'Thoát toàn màn hình (Esc)') : t('header.enterFullscreen', 'Toàn màn hình')}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label={isFullscreen ? t('header.exitFullscreen', 'Thoát toàn màn hình') : t('header.enterFullscreen', 'Toàn màn hình')}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          {/* Print / Export Tool */}
          <button
            onClick={handlePrint}
            title={t('header.exportPrint', "Xuất file / In ấn")}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-200/50 border border-[#E0D8CD] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:border-white/[0.06] transition-colors bg-white/60 dark:bg-transparent"
            >
              <Languages className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
              <span className="font-semibold">{language === 'vi' ? 'VN' : 'EN'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400 dark:text-slate-500" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-[#0F1523] border border-[#E0D8CD] dark:border-white/[0.12] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setLanguage('vi'); setIsLangMenuOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    language === 'vi' ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-900 dark:text-indigo-300 font-semibold' : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <span>Tiếng Việt</span>
                  {language === 'vi' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
                <button
                  onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    language === 'en' ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-900 dark:text-indigo-300 font-semibold' : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Notification Menu */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.06] transition-colors"
              title={t('header.notifications', 'Thông báo')}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-[#FAF8F5] dark:ring-[#080B14] animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500/50 ring-2 ring-[#FAF8F5] dark:ring-[#080B14]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-[360px] sm:w-[480px] md:w-[520px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white dark:bg-[#0F1523] border border-[#E0D8CD] dark:border-white/[0.12] shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-stone-900 dark:text-white">{t('header.notifications', 'Thông báo hệ thống')}</span>
                    {unreadCount > 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-500/30">
                        {unreadCount} chưa đọc
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-500/30">
                        v5.0 Ultra
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium transition-colors"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                <div className="py-2.5 space-y-2.5 max-h-96 overflow-y-auto pr-0.5">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) markNotificationAsRead(notif.id);
                          if (notif.type === 'user_registration') {
                            setCurrentPage('users');
                            setIsNotificationsOpen(false);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          !notif.read
                            ? 'bg-amber-50/70 dark:bg-indigo-950/30 border-amber-200 dark:border-indigo-500/40 shadow-xs hover:border-amber-300 dark:hover:border-indigo-400'
                            : 'bg-[#FAF7F2] dark:bg-white/[0.03] border-[#EAE3D9] dark:border-white/[0.05] opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-slate-100 text-xs sm:text-sm">
                            {notif.type === 'user_registration' && <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                            <span>{notif.title}</span>
                          </div>
                          {!notif.read && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1 ring-4 ring-rose-500/20" />}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.type === 'user_registration' && (
                          <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                              <span>▶ Mở trang Quản lý người dùng</span>
                            </span>
                            <span className="text-[11px] text-stone-400 dark:text-slate-500">{notif.createdAt}</span>
                          </div>
                        )}
                        {notif.type !== 'user_registration' && (
                          <span className="text-[11px] text-stone-400 dark:text-slate-500 mt-1.5 block text-right">{notif.createdAt}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.03] border border-[#EAE3D9] dark:border-white/[0.05]">
                        <p className="font-semibold text-stone-900 dark:text-slate-200 text-xs sm:text-sm">{t('header.notif1Title', 'Giao diện Warm Light + AI Gradient')}</p>
                        <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 leading-relaxed">{t('header.notif1Desc', 'Tone màu ấm thanh lịch, dịu mắt chuẩn SaaS cao cấp đã kích hoạt.')}</p>
                        <span className="text-[11px] text-stone-400 dark:text-slate-500 mt-1.5 block text-right">{t('header.notif1Time', 'Vừa xong')}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-white/[0.03] border border-[#EAE3D9] dark:border-white/[0.05]">
                        <p className="font-semibold text-stone-900 dark:text-slate-200 text-xs sm:text-sm">{t('header.notif2Title', 'Chuẩn GDPT 2018 sẵn sàng')}</p>
                        <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 leading-relaxed">{t('header.notif2Desc', 'Cập nhật ma trận và bảng đặc tả các môn THCS & THPT.')}</p>
                        <span className="text-[11px] text-stone-400 dark:text-slate-500 mt-1.5 block text-right">{t('header.notif2Time', '1 giờ trước')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* License Status & Info button */}
          <button
            onClick={() => setIsLicenseModalOpen(true)}
            className={`p-2 rounded-xl transition-colors ${
              isLicensed
                ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.06]'
            }`}
            title={isLicensed ? 'Bản quyền PRO Vĩnh viễn (Đã kích hoạt)' : 'Thông tin bản quyền & Kích hoạt'}
          >
            {isLicensed ? <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <KeySquare className="w-4 h-4" />}
          </button>

          {/* Activation pill for trial teachers */}
          {isTrialUser && (
            <button
              onClick={handleRequestActivation}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors shadow-xs"
              title="Kích hoạt Bản quyền PRO ngay (Không cần mã máy)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{t('header.activateAccountButton', 'Kích hoạt PRO')}</span>
            </button>
          )}

          {/* User Profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
              className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-stone-200/50 dark:hover:bg-white/[0.06] border border-transparent hover:border-[#E0D8CD] dark:hover:border-white/[0.06] transition-colors cursor-pointer"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#080B14]" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-stone-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">{currentUser.name}</p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400 font-medium leading-none">{currentUser.role === 'Quản trị hệ thống' ? t('userManagement.role.admin', 'Admin') : t('userManagement.role.teacher', 'Giáo viên')}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-slate-400 hidden sm:block" />
            </button>

            {isProfileMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#0F1523] border border-[#E0D8CD] dark:border-white/[0.12] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#EFEAE2] dark:border-white/[0.06]">
                  <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-mono truncate">{currentUser.email}</p>
                </div>
                <div className="py-1 space-y-0.5 text-xs">
                  <button
                    onClick={() => { setCurrentPage('my-account'); setIsProfileMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-xl transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> 
                    <span>{t('header.myAccount', 'Tài khoản của tôi')}</span>
                  </button>

                  <button
                    onClick={() => { 
                      setApiKeyModalTab('apikeys');
                      setIsApiKeyModalOpen(true); 
                      setIsProfileMenuOpen(false); 
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-xl transition-colors font-medium"
                  >
                    <KeySquare className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> 
                    <span>{t('header.configApiKeyMenu', 'Cấu hình API Key & Module AI')}</span>
                  </button>

                  {currentUser.role === 'Quản trị hệ thống' && (
                    <button
                      onClick={() => { setCurrentPage('settings'); setIsProfileMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-xl transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" /> 
                      <span>{t('header.systemSettings', 'Cài đặt hệ thống')}</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('header.logout', 'Đăng xuất')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <LicenseStatusModal 
        isOpen={isLicenseModalOpen} 
        onClose={() => setIsLicenseModalOpen(false)} 
        currentUser={currentUser}
        onOpenActivation={handleRequestActivation}
        onOpenLicenseManager={() => setCurrentPage('users')}
      />
      <CommandSearchModal 
        isOpen={isCommandModalOpen} 
        onClose={() => setIsCommandModalOpen(false)} 
        onSelectPage={(p) => setCurrentPage(p)} 
      />
      <AIModelCenterModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => {
          setIsApiKeyModalOpen(false);
          setHasGeminiKey(!!localStorage.getItem('examgen_gemini_api_key'));
        }} 
        defaultTab={apiKeyModalTab}
      />
    </>
  );
}
