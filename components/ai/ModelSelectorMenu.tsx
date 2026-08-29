import React, { useState, useEffect, useRef } from 'react';
import { GEMINI_MODELS, GeminiModelConfig, syncGeminiModelRegistry, ModelSyncStatus } from '../../lib/geminiModels';
import { useAdvancedSettings } from '../../hooks/useAdvancedSettings';
import { Sparkles, Brain, CheckCircle2, Zap, Loader2 } from '../icons';
import { useToast } from '../../hooks/useToast';

interface ModelSelectorMenuProps {
  variant?: 'compact' | 'full' | 'header' | 'inline';
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export const ModelSelectorMenu: React.FC<ModelSelectorMenuProps> = ({
  variant = 'compact',
  onModelChange,
  className = '',
}) => {
  const { advSettings, setAdvSettings } = useAdvancedSettings();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<ModelSyncStatus | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModelId = advSettings.aiModel || 'gemini-3.7-flash';
  const currentModel = GEMINI_MODELS.find(m => m.id === currentModelId) || GEMINI_MODELS[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (model: GeminiModelConfig) => {
    setAdvSettings({ aiModel: model.id });
    if (onModelChange) {
      onModelChange(model.id);
    }
    setIsOpen(false);
    addToast(`Đã chuyển sang mô hình: ${model.name}`);
  };

  const handleSyncModels = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSyncing(true);
    try {
      const apiKey = localStorage.getItem('examgen_gemini_api_key') || undefined;
      const status = await syncGeminiModelRegistry(apiKey);
      setSyncStatus(status);
      setAdvSettings({ aiLastSyncTime: status.lastChecked });
      addToast(status.message);
    } catch (err: any) {
      addToast('Lỗi khi đồng bộ danh sách mô hình.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getBadgeClass = (badgeType: string) => {
    switch (badgeType) {
      case 'latest':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      case 'reasoning':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30';
      case 'fast':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      case 'auto':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30';
    }
  };

  // Header pill presentation
  if (variant === 'header') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 dark:from-indigo-950/60 to-purple-50 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-800 dark:text-indigo-200 hover:shadow-md transition-all cursor-pointer"
          title="Chọn mô hình AI Gemini"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="truncate max-w-[130px] sm:max-w-[170px]">{currentModel.name.split(' (')[0]}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 font-mono">
            {currentModel.generation}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Mô hình Gemini AI (v4.4)
                </span>
              </div>
              <button
                onClick={handleSyncModels}
                disabled={isSyncing}
                className="text-[11px] flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : '⟳'} Tự động cập nhật
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
              {GEMINI_MODELS.map((model) => {
                const isSelected = model.id === currentModelId;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700 shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>
                          {model.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getBadgeClass(model.badgeType)}`}>
                        {model.generation}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                      <span>⚡ {model.speed}</span>
                      <span>🎯 {model.accuracy}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Đang áp dụng cho toàn hệ thống</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">ExamGen 5.0 Ultra</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full / inline interactive card format
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentModel.name}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getBadgeClass(currentModel.badgeType)}`}>
                {currentModel.badge}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
              {currentModel.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleSyncModels}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm transition"
          >
            {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
            <span>Đồng bộ mô hình</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {GEMINI_MODELS.map((model) => {
          const isSelected = model.id === currentModelId;
          return (
            <div
              key={model.id}
              onClick={() => handleSelectModel(model)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-50/90 to-purple-50/60 dark:from-indigo-950/80 dark:to-purple-950/50 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {model.name}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Đang dùng
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeClass(model.badgeType)}`}>
                    {model.generation}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono gap-y-1">
                <span>⚡ {model.speed}</span>
                <span>🎯 {model.accuracy}</span>
                <span>📦 {model.contextWindow}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelectorMenu;
