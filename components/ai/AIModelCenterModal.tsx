import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { 
  ALL_AI_MODELS, 
  AI_PROVIDERS, 
  AIProvider, 
  AIModelConfig, 
  getStoredApiKeys, 
  saveStoredApiKey,
  DEFAULT_FALLBACK_CHAIN
} from '../../lib/aiModels';
import { safeGenerateContent } from '../../lib/aiProvider';
import { useAdvancedSettings } from '../../hooks/useAdvancedSettings';
import { useToast } from '../../hooks/useToast';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  KeySquare, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Bot, 
  Layers, 
  Sliders, 
  ChevronRight,
  Eye,
  EyeOff,
  Send
} from '../icons';

interface AIModelCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIModelCenterModal: React.FC<AIModelCenterModalProps> = ({ isOpen, onClose }) => {
  const { advSettings, setAdvSettings } = useAdvancedSettings();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'providers' | 'fallback' | 'retry' | 'sandbox'>('providers');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<AIProvider | 'all'>('all');
  
  // Api keys state
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>(() => getStoredApiKeys());
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    openai: false,
    copilot: false,
    claude: false,
    deepseek: false
  });
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<Record<AIProvider, 'unknown' | 'ok' | 'error'>>({
    gemini: 'unknown',
    openai: 'unknown',
    copilot: 'unknown',
    claude: 'unknown',
    deepseek: 'unknown'
  });

  // Sandbox Test State
  const [testPrompt, setTestPrompt] = useState('Hãy tạo 1 câu hỏi trắc nghiệm Toán lớp 12 về Đạo hàm cùng 4 phương án A, B, C, D.');
  const [isTestingSandbox, setIsTestingSandbox] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = (provider: AIProvider) => {
    saveStoredApiKey(provider, apiKeys[provider]);
    addToast(`Đã lưu Khóa API cho ${AI_PROVIDERS[provider].name}`);
  };

  const handlePingProvider = async (provider: AIProvider) => {
    setTestingProvider(provider);
    try {
      const sampleModel = ALL_AI_MODELS.find(m => m.provider === provider) || ALL_AI_MODELS[0];
      const res = await safeGenerateContent({
        model: sampleModel.id,
        apiKey: apiKeys[provider],
        contents: 'Ping test API connection. Trả về chữ "OK".',
        enableFallback: false,
        maxRetries: 1
      });

      if (res.text) {
        setProviderStatuses(prev => ({ ...prev, [provider]: 'ok' }));
        addToast(`Kết nối ${AI_PROVIDERS[provider].name} THÀNH CÔNG! Độ trễ: ${res.latencyMs}ms`);
      } else {
        setProviderStatuses(prev => ({ ...prev, [provider]: 'error' }));
        addToast(`Không nhận được phản hồi từ ${AI_PROVIDERS[provider].name}`);
      }
    } catch (err: any) {
      setProviderStatuses(prev => ({ ...prev, [provider]: 'error' }));
      addToast(`Thất bại (${AI_PROVIDERS[provider].name}): ${err?.message || 'Lỗi API Key hoặc hạn ngạch'}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleRunSandboxTest = async () => {
    setIsTestingSandbox(true);
    setSandboxResult(null);
    try {
      const res = await safeGenerateContent({
        model: advSettings.aiModel || 'gemini-3.8-flash',
        contents: testPrompt,
        enableFallback: true,
        maxRetries: 2
      });
      setSandboxResult(res);
      addToast(`Thực thi Sandbox hoàn tất trong ${res.latencyMs}ms (${res.modelUsed})`);
    } catch (err: any) {
      setSandboxResult({ error: err?.message || 'Lỗi xử lý yêu cầu' });
      addToast(`Thất bại: ${err?.message}`);
    } finally {
      setIsTestingSandbox(false);
    }
  };

  const filteredModels = selectedProviderFilter === 'all' 
    ? ALL_AI_MODELS 
    : ALL_AI_MODELS.filter(m => m.provider === selectedProviderFilter);

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in-0">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white flex items-center justify-between border-b border-indigo-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Trung Tâm Mô Hình AI & Khả Năng Chịu Tải
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-mono">
                  v5.0 Ultra Engine
                </span>
              </h2>
              <p className="text-xs text-indigo-200/80">
                Đa mô hình AI (5 Nhà cung cấp) • Tự động thử lại (Exponential Backoff) • Chuỗi dự phòng chống nghẽn (Auto-Fallback)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'providers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <KeySquare className="w-4 h-4" /> 5 Nhà Cung Cấp & Key ({ALL_AI_MODELS.length} Models)
          </button>

          <button
            onClick={() => setActiveTab('fallback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'fallback'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" /> Chuỗi Mô Hình Dự Phòng (Auto-Fallback)
          </button>

          <button
            onClick={() => setActiveTab('retry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'retry'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Cơ Chế Retry & Exponential Backoff
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Send className="w-4 h-4" /> Thử Nghiệm Trực Tiếp (Live Sandbox)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: 5 PROVIDERS & KEYS */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Quản Lý 5 Nhà Cung Cấp AI Hàng Đầu
                  </h3>
                  <p className="text-xs text-indigo-800/80 dark:text-indigo-200/70">
                    Cấu hình API Key độc lập cho Google Gemini, OpenAI, Microsoft Copilot, Anthropic Claude và DeepSeek để hệ thống linh hoạt chuyển đổi khi ra đề.
                  </p>
                </div>
              </div>

              {/* Providers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((pKey) => {
                  const pInfo = AI_PROVIDERS[pKey];
                  const status = providerStatuses[pKey];
                  const isTesting = testingProvider === pKey;

                  return (
                    <div 
                      key={pKey}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${pInfo.logoColor} flex items-center justify-center text-white text-xs font-bold shadow`}>
                            {pInfo.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                              {pInfo.name}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {pInfo.company}
                            </span>
                          </div>
                        </div>

                        {status === 'ok' && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Sẵn sàng
                          </span>
                        )}
                        {status === 'error' && (
                          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Sự cố/Chưa key
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {pInfo.description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <Label className="text-xs font-semibold">Khóa API Key ({pInfo.name})</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showKeys[pKey] ? 'text' : 'password'}
                              placeholder={pKey === 'gemini' ? 'Mặc định lấy từ môi trường / Google Studio' : `Nhập API Key ${pInfo.name}`}
                              value={apiKeys[pKey]}
                              onChange={(e) => setApiKeys(prev => ({ ...prev, [pKey]: e.target.value }))}
                              className="text-xs pr-8"
                            />
                            <button
                              type="button"
                              onClick={() => setShowKeys(prev => ({ ...prev, [pKey]: !prev[pKey] }))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showKeys[pKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleSaveApiKey(pKey)}
                            className="text-xs h-9 px-3"
                          >
                            Lưu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isTesting}
                            onClick={() => handlePingProvider(pKey)}
                            className="text-xs h-9 px-2.5"
                            title="Kiểm tra kết nối"
                          >
                            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Models by Provider */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    Danh Sách {ALL_AI_MODELS.length} Mô Hình AI Trong Hệ Thống ({filteredModels.length} mô hình)
                  </h3>

                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    <button
                      onClick={() => setSelectedProviderFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        selectedProviderFilter === 'all'
                          ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Tất cả ({ALL_AI_MODELS.length})
                    </button>
                    {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((pKey) => (
                      <button
                        key={pKey}
                        onClick={() => setSelectedProviderFilter(pKey)}
                        className={`px-2.5 py-1 rounded-md font-medium transition ${
                          selectedProviderFilter === pKey
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {AI_PROVIDERS[pKey].name.split(' ')[1] || AI_PROVIDERS[pKey].name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredModels.map((m) => {
                    const isCurrent = advSettings.aiModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setAdvSettings({ aiModel: m.id });
                          addToast(`Đã chọn mô hình chính: ${m.name}`);
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                              {m.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                              {m.providerName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                            {m.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                          <span>⚡ {m.speed}</span>
                          <span>🎯 {m.accuracy}</span>
                          {isCurrent && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓ Đang chọn</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FALLBACK CHAIN */}
          {activeTab === 'fallback' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-2">
                <h3 className="font-bold text-sm text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Chuỗi Mô Hình Dự Phòng Chống Nghẽn Hạn Ngạch (Auto-Fallback Chain)
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                  Khi mô hình chính gặp lỗi nghẽn tần suất (429 Rate Limit) hoặc hết hạn ngạch Token, hệ thống tự động gọi lần lượt các mô hình dự phòng kế tiếp trong chuỗi mà KHÔNG ngắt đoạn quá trình tạo đề thi của giáo viên.
                </p>
              </div>

              {/* Fallback Flow diagram */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Trình Tự Chuyển Đổi Mô Hình Tự Động
                </h4>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 overflow-x-auto py-2">
                  {DEFAULT_FALLBACK_CHAIN.map((fId, idx) => {
                    const mObj = ALL_AI_MODELS.find(m => m.id === fId);
                    return (
                      <React.Fragment key={fId}>
                        <div className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-1 min-w-[160px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              Ưu tiên #{idx + 1} {idx === 0 ? '(Mô hình chính)' : ''}
                            </span>
                          </div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                            {mObj?.name || fId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {mObj?.providerName}
                          </span>
                        </div>
                        {idx < DEFAULT_FALLBACK_CHAIN.length - 1 && (
                          <div className="flex items-center justify-center text-amber-500 font-bold">
                            <ChevronRight className="w-5 h-5 hidden md:block" />
                            <span className="md:hidden text-xs">↓ Chuyển tiếp nếu 429</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RETRY POLICY */}
          {activeTab === 'retry' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  Cơ Chế Tự Động Thử Lại VớI Exponential Backoff
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/70 leading-relaxed">
                  Khi gặp các sự cố tạm thời (như nghẽn mạng 503, 502 hoặc giới hạn 429), hệ thống tự động lặp lại yêu cầu với khoảng hoãn tăng dần theo hàm mũ (1s → 2s → 4s → 8s) để giúp API phục hồi tự nhiên.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" /> Số Lần Thử Lại Tối Đa (Max Retries)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Số lần hệ thống tự động thử lại một mô hình trước khi chuyển sang mô hình dự phòng tiếp theo.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="font-mono text-sm font-bold text-indigo-600">3 lần thử</span>
                    <Badge variant="outline" className="text-[10px]">Tiêu chuẩn tối ưu</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Khoảng Thời Gian Chờ Ban Đầu (Initial Delay)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Độ trễ bắt đầu thử lại, tăng gấp đôi sau mỗi lần thử không thành công.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="font-mono text-sm font-bold text-amber-600">1,000 ms (1 giây)</span>
                    <Badge variant="outline" className="text-[10px]">Exponential Backoff Factor = 2.0</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE SANDBOX TEST */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200/80 dark:border-purple-900/50 space-y-2">
                <h3 className="font-bold text-sm text-purple-950 dark:text-purple-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-600" />
                  Thử Nghiệm Trực Tiếp Hệ Thống Mô Hình AI (Live Sandbox)
                </h3>
                <p className="text-xs text-purple-800/80 dark:text-purple-200/70">
                  Gửi yêu cầu thử nghiệm để kiểm tra tốc độ phản hồi, mô hình thực thi và chuỗi dự phòng thực tế.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold">Prompt Thử Nghiệm</Label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Button
                  onClick={handleRunSandboxTest}
                  disabled={isTestingSandbox}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow"
                >
                  {isTestingSandbox ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi tới hệ thống AI Center...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Bắt Đầu Thử Nghiệm Live
                    </>
                  )}
                </Button>
              </div>

              {sandboxResult && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-100 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Kết quả phản hồi thực tế
                    </span>
                    <span className="text-slate-400">
                      Mô hình đã dùng: <strong className="text-indigo-300">{sandboxResult.modelUsed || 'N/A'}</strong> ({sandboxResult.latencyMs}ms)
                    </span>
                  </div>

                  {sandboxResult.fallbackTriggered && (
                    <div className="p-2.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-200 text-[11px]">
                      ⚠️ {sandboxResult.fallbackReason}
                    </div>
                  )}

                  <div className="max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-200">
                    {sandboxResult.text || sandboxResult.error}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Áp dụng đồng bộ cho toàn bộ hệ thống ExamGen Ultra 5.0</span>
          <Button onClick={onClose} variant="default" size="sm" className="text-xs">
            Hoàn tất & Đóng
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AIModelCenterModal;
