import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
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
  Eye, 
  EyeOff, 
  Send,
  Search,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Trash2,
  Info
} from 'lucide-react';

export interface AIModelCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'apikeys' | 'models' | 'fallback' | 'sandbox';
}

export const AIModelCenterModal: React.FC<AIModelCenterModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'apikeys' 
}) => {
  const { advSettings, setAdvSettings } = useAdvancedSettings();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'apikeys' | 'models' | 'fallback' | 'sandbox'>(defaultTab);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<AIProvider | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  
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
  const [providerLatencies, setProviderLatencies] = useState<Record<AIProvider, number | null>>({
    gemini: null,
    openai: null,
    copilot: null,
    claude: null,
    deepseek: null
  });

  // Sandbox Test State
  const [testPrompt, setTestPrompt] = useState('Hãy tạo 1 câu hỏi trắc nghiệm Toán lớp 12 về Đạo hàm cùng 4 phương án A, B, C, D.');
  const [isTestingSandbox, setIsTestingSandbox] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Sync tab when modal opens with a specific defaultTab
  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Refresh api keys when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKeys(getStoredApiKeys());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentModelId = advSettings.aiModel || 'gemini-3.8-flash';
  const currentModel = ALL_AI_MODELS.find(m => m.id === currentModelId) || ALL_AI_MODELS[0];

  const handleSaveApiKey = (provider: AIProvider) => {
    const keyVal = (apiKeys[provider] || '').trim();
    saveStoredApiKey(provider, keyVal);
    // Also update current state
    setApiKeys(prev => ({ ...prev, [provider]: keyVal }));
    addToast(`Đã lưu Khóa API cho ${AI_PROVIDERS[provider].name}`);
  };

  const handleClearApiKey = (provider: AIProvider) => {
    saveStoredApiKey(provider, '');
    setApiKeys(prev => ({ ...prev, [provider]: '' }));
    setProviderStatuses(prev => ({ ...prev, [provider]: 'unknown' }));
    setProviderLatencies(prev => ({ ...prev, [provider]: null }));
    addToast(`Đã xóa Khóa API của ${AI_PROVIDERS[provider].name}`);
  };

  const handlePingProvider = async (provider: AIProvider) => {
    setTestingProvider(provider);
    try {
      const sampleModel = ALL_AI_MODELS.find(m => m.provider === provider && m.isDefault) || ALL_AI_MODELS.find(m => m.provider === provider) || ALL_AI_MODELS[0];
      const res = await safeGenerateContent({
        model: sampleModel.id,
        apiKey: apiKeys[provider],
        contents: 'Ping test API connection. Trả về chữ "OK".',
        enableFallback: false,
        maxRetries: 1
      });

      if (res.text) {
        setProviderStatuses(prev => ({ ...prev, [provider]: 'ok' }));
        setProviderLatencies(prev => ({ ...prev, [provider]: res.latencyMs }));
        addToast(`Kết nối ${AI_PROVIDERS[provider].name} THÀNH CÔNG! (${res.latencyMs}ms)`);
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

  const handleSelectModel = (model: AIModelConfig) => {
    setAdvSettings({ aiModel: model.id });
    addToast(`Đã kích hoạt module AI: ${model.name} (${model.providerName})`);
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

  // Filter models
  const filteredModels = ALL_AI_MODELS.filter(m => {
    // Provider filter
    if (selectedProviderFilter !== 'all' && m.provider !== selectedProviderFilter) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(query);
      const matchDesc = m.description.toLowerCase().includes(query);
      const matchProvider = m.providerName.toLowerCase().includes(query);
      const matchRec = m.recommendedFor?.toLowerCase().includes(query);
      if (!matchName && !matchDesc && !matchProvider && !matchRec) {
        return false;
      }
    }
    // Tag filter
    if (selectedTag === 'gdpt' && !m.recommendedFor?.includes('GDPT') && !m.description.includes('GDPT') && m.provider !== 'gemini') {
      return false;
    }
    if (selectedTag === 'reasoning' && !m.badgeType?.includes('reasoning') && !m.supportsThinking) {
      return false;
    }
    if (selectedTag === 'fast' && !m.badgeType?.includes('fast')) {
      return false;
    }
    if (selectedTag === 'math' && !m.recommendedFor?.includes('Toán') && !m.description.includes('Toán')) {
      return false;
    }
    if (selectedTag === 'lit' && !m.recommendedFor?.includes('Ngữ văn') && !m.description.includes('Ngữ văn')) {
      return false;
    }
    return true;
  });

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in-0">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-[#0B101D] rounded-2xl shadow-2xl border border-stone-200 dark:border-white/[0.1] my-auto overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white flex items-center justify-between border-b border-indigo-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg ring-2 ring-indigo-400/30">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Cấu Hình API Key & Lựa Chọn Module AI
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-mono font-semibold">
                  v5.0 Ultra Engine
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5 hidden sm:block">
                Tự do thay đổi API Key • Lựa chọn 16+ Module AI (Gemini, OpenAI, Claude, DeepSeek, Copilot) • Chuỗi dự phòng Auto-Fallback
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer text-sm font-bold"
            title="Đóng cửa sổ"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-stone-100 dark:bg-[#0F1523] border-b border-stone-200 dark:border-white/[0.08] overflow-x-auto text-xs font-semibold flex-shrink-0">
          <button
            onClick={() => setActiveTab('apikeys')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer flex-shrink-0 ${
              activeTab === 'apikeys'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-white/[0.06]'
            }`}
          >
            <KeySquare className="w-4 h-4 text-amber-300" />
            <span>Cấu hình API Key</span>
            {apiKeys.gemini && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer flex-shrink-0 ${
              activeTab === 'models'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-white/[0.06]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span>Lựa chọn Module AI ({ALL_AI_MODELS.length} Models)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-100 font-mono">
              {currentModel.name.split(' ')[0]}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fallback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer flex-shrink-0 ${
              activeTab === 'fallback'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-white/[0.06]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dự Phòng (Auto-Fallback)</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer flex-shrink-0 ${
              activeTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-white/[0.06]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Thử Nghiệm Sandbox</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: CẤU HÌNH API KEY */}
          {activeTab === 'apikeys' && (
            <div className="space-y-6">
              
              {/* FEATURED: GOOGLE GEMINI API KEY */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-[#0F1523] dark:to-purple-950/30 border-2 border-indigo-500/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-stone-900 dark:text-white">
                          Google Gemini API Key
                        </h3>
                        <Badge variant="default" className="bg-indigo-600 text-white text-[10px]">
                          Khóa Chính Khuyên Dùng
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-slate-300">
                        Tối ưu hóa toàn diện cho việc tạo ma trận, đặc tả và đề thi chuẩn Bộ GD&ĐT (GDPT 2018).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lấy API Key Miễn Phí Tại Google AI Studio</span>
                    </a>
                  </div>
                </div>

                {/* Key Status Alert */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  apiKeys.gemini 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {apiKeys.gemini ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    )}
                    <span>
                      {apiKeys.gemini ? (
                        <>Đã cài đặt API Key: <strong>{maskKey(apiKeys.gemini)}</strong> (Sẵn sàng hoạt động)</>
                      ) : (
                        <>Chưa có Khóa API Gemini. Bấm nút <strong>"Lấy API Key Miễn Phí"</strong> bên trên để lấy key dán vào đây.</>
                      )}
                    </span>
                  </div>

                  {providerLatencies.gemini !== null && (
                    <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      ⚡ Độ trễ: {providerLatencies.gemini}ms
                    </span>
                  )}
                </div>

                {/* Input form */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-stone-700 dark:text-slate-200">
                    Nhập Khóa Google Gemini API Key:
                  </Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKeys.gemini ? 'text' : 'password'}
                        placeholder="Dán mã API Key (bắt đầu bằng AIzaSy...)"
                        value={apiKeys.gemini}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                        className="text-xs pr-10 font-mono h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                        title={showKeys.gemini ? 'Ẩn khóa' : 'Hiện khóa'}
                      >
                        {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="gradient"
                        onClick={() => handleSaveApiKey('gemini')}
                        className="h-10 text-xs px-4 font-bold shadow-sm"
                      >
                        Lưu API Key
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={testingProvider === 'gemini'}
                        onClick={() => handlePingProvider('gemini')}
                        className="h-10 text-xs px-3 font-semibold"
                        title="Kiểm tra kết nối với Google AI Studio"
                      >
                        {testingProvider === 'gemini' ? (
                          <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Đang kiểm tra...</>
                        ) : (
                          <><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Kiểm tra kết nối</>
                        )}
                      </Button>

                      {apiKeys.gemini && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleClearApiKey('gemini')}
                          className="h-10 text-xs px-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Xóa khóa này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3 Step Tutorial */}
                <div className="p-3 bg-stone-50 dark:bg-white/[0.03] rounded-xl border border-stone-200/80 dark:border-white/[0.05] text-[11px] text-stone-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold text-stone-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500" /> Hướng dẫn 3 bước lấy API Key Gemini miễn phí:
                  </p>
                  <ol className="list-decimal list-inside pl-1 space-y-0.5">
                    <li>Bấm nút <strong>"Lấy API Key Miễn Phí"</strong> ở trên để truy cập Google AI Studio.</li>
                    <li>Đăng nhập bằng tài khoản Google bất kỳ rồi bấm <strong>"Create API key"</strong>.</li>
                    <li>Sao chép mã khóa, dán vào ô bên trên và bấm <strong>"Lưu API Key"</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* MULTI-PROVIDER KEYS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      Khóa API Các Nhà Cung Cấp Khác (Tùy chọn bổ sung)
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-slate-400">
                      Nếu bạn có tài khoản OpenAI, Anthropic Claude, DeepSeek hoặc Microsoft Copilot, hãy nhập mã khóa để hệ thống có thể chuyển đổi khi cần.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['openai', 'claude', 'deepseek', 'copilot'] as AIProvider[]).map((pKey) => {
                    const pInfo = AI_PROVIDERS[pKey];
                    const status = providerStatuses[pKey];
                    const isTesting = testingProvider === pKey;
                    const latency = providerLatencies[pKey];

                    return (
                      <div 
                        key={pKey}
                        className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/60 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${pInfo.logoColor} flex items-center justify-center text-white text-xs font-bold shadow-xs`}>
                              {pInfo.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-stone-800 dark:text-slate-100">
                                {pInfo.name}
                              </h4>
                              <span className="text-[10px] text-stone-500 dark:text-slate-400">
                                {pInfo.company}
                              </span>
                            </div>
                          </div>

                          {status === 'ok' && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {latency ? `${latency}ms` : 'Sẵn sàng'}
                            </span>
                          )}
                          {status === 'error' && (
                            <span className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Lỗi key/quota
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-600 dark:text-slate-300 line-clamp-2">
                          {pInfo.description}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <Label className="text-[11px] font-semibold text-stone-700 dark:text-slate-300">
                            Khóa API {pInfo.name}:
                          </Label>
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                              <Input
                                type={showKeys[pKey] ? 'text' : 'password'}
                                placeholder={`Nhập API Key ${pInfo.name}`}
                                value={apiKeys[pKey] || ''}
                                onChange={(e) => setApiKeys(prev => ({ ...prev, [pKey]: e.target.value }))}
                                className="text-xs pr-8 h-9 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKeys(prev => ({ ...prev, [pKey]: !prev[pKey] }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
              </div>

            </div>
          )}

          {/* TAB 2: LỰA CHỌN MODULE AI */}
          {activeTab === 'models' && (
            <div className="space-y-5">
              
              {/* Active Model Callout Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border-2 border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-indigo-700 dark:text-indigo-400 tracking-wider">
                        Module AI Đang Hoạt Động:
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đang dùng
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                      {currentModel.name}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-slate-300">
                      Hãng: <strong>{currentModel.providerName}</strong> • Tốc độ: <strong>{currentModel.speed}</strong> • Độ chính xác: <strong>{currentModel.accuracy}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 dark:text-slate-400 hidden sm:inline">
                    Ngữ cảnh: {currentModel.contextWindow}
                  </span>
                </div>
              </div>

              {/* Search & Provider Filter Bar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <Input
                      type="text"
                      placeholder="Tìm module AI theo tên, môn học (Toán, Văn, Lý, Hóa, GDPT 2018)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-xs h-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                    <button
                      onClick={() => setSelectedProviderFilter('all')}
                      className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer flex-shrink-0 ${
                        selectedProviderFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200'
                      }`}
                    >
                      Tất cả ({ALL_AI_MODELS.length})
                    </button>
                    {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((pKey) => {
                      const count = ALL_AI_MODELS.filter(m => m.provider === pKey).length;
                      return (
                        <button
                          key={pKey}
                          onClick={() => setSelectedProviderFilter(pKey)}
                          className={`px-3 py-2 rounded-xl font-semibold transition cursor-pointer flex-shrink-0 ${
                            selectedProviderFilter === pKey
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200'
                          }`}
                        >
                          {AI_PROVIDERS[pKey].name.split(' ')[1] || AI_PROVIDERS[pKey].name} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Tag Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-stone-600 dark:text-slate-400 pb-1">
                  <span className="font-semibold text-stone-500">Lọc nhanh:</span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'gdpt', label: '🎯 Chuẩn GDPT 2018' },
                    { id: 'reasoning', label: '🧠 Tư duy sâu (Reasoning)' },
                    { id: 'math', label: '📐 Toán & Tự nhiên' },
                    { id: 'lit', label: '📖 Ngữ văn & Xã hội' },
                    { id: 'fast', label: '⚡ Siêu tốc độ' },
                  ].map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTag(tag.id)}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex-shrink-0 ${
                        selectedTag === tag.id
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-800'
                          : 'hover:bg-stone-100 dark:hover:bg-white/[0.05] border border-transparent'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredModels.map((m) => {
                  const isCurrent = advSettings.aiModel === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectModel(m)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isCurrent
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                          : 'bg-white dark:bg-[#0F1523] border-stone-200 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header: Name & Provider */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div>
                            <span className="font-extrabold text-sm text-stone-900 dark:text-white leading-tight block">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-slate-400 font-mono">
                              {m.providerName} • Thế hệ {m.generation}
                            </span>
                          </div>

                          {isCurrent ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs flex-shrink-0">
                              <Check className="w-3 h-3" /> Đang dùng
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                              Chọn
                            </span>
                          )}
                        </div>

                        {/* Badge */}
                        {m.badge && (
                          <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 inline-block">
                            {m.badge}
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {m.description}
                        </p>

                        {/* Recommended For */}
                        {m.recommendedFor && (
                          <div className="text-[10px] text-stone-500 dark:text-slate-400 bg-stone-50 dark:bg-white/[0.02] p-2 rounded-lg border border-stone-100 dark:border-white/[0.04]">
                            <strong className="text-stone-700 dark:text-slate-300">Phù hợp:</strong> {m.recommendedFor}
                          </div>
                        )}
                      </div>

                      {/* Footer Metrics */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 dark:border-white/[0.06] text-[10px] text-stone-500 dark:text-slate-400 font-mono">
                        <span>⚡ {m.speed}</span>
                        <span>🎯 {m.accuracy}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredModels.length === 0 && (
                  <div className="col-span-full p-8 text-center text-stone-500 dark:text-slate-400">
                    <p className="text-sm font-semibold">Không tìm thấy module AI nào phù hợp với từ khóa.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedProviderFilter('all'); setSelectedTag('all'); }}
                      className="mt-2 text-xs text-indigo-600 hover:underline font-bold"
                    >
                      Xóa bộ lọc để xem tất cả
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: AUTO-FALLBACK CHAIN */}
          {activeTab === 'fallback' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-2">
                <h3 className="font-bold text-sm text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Chuỗi Mô Hình Dự Phòng Chống Nghẽn Hạn Ngạch (Auto-Fallback Chain)
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                  Khi mô hình chính gặp lỗi nghẽn tần suất (429 Rate Limit) hoặc hết hạn ngạch Token, hệ thống tự động gọi lần lượt các mô hình dự phòng kế tiếp trong chuỗi mà KHÔNG ngắt đoạn quá trình tạo đề thi của giáo viên.
                </p>
              </div>

              {/* Fallback Flow diagram */}
              <div className="p-4 bg-stone-50 dark:bg-slate-800/50 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-stone-700 dark:text-slate-200 uppercase tracking-wider">
                  Trình Tự Chuyển Đổi Mô Hình Tự Động
                </h4>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 overflow-x-auto py-2">
                  {DEFAULT_FALLBACK_CHAIN.map((fId, idx) => {
                    const mObj = ALL_AI_MODELS.find(m => m.id === fId);
                    return (
                      <React.Fragment key={fId}>
                        <div className="flex-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-1 min-w-[160px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              Ưu tiên #{idx + 1} {idx === 0 ? '(Mô hình chính)' : ''}
                            </span>
                          </div>
                          <span className="font-bold text-xs text-stone-800 dark:text-slate-100">
                            {mObj?.name || fId}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {mObj?.providerName}
                          </span>
                        </div>
                        {idx < DEFAULT_FALLBACK_CHAIN.length - 1 && (
                          <div className="text-stone-300 dark:text-slate-600 text-center font-bold">→</div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE SANDBOX TEST */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 space-y-2">
                <h3 className="font-bold text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  Thử Nghiệm Trực Tiếp Với Module Hiện Tại
                </h3>
                <p className="text-xs text-blue-800/80 dark:text-blue-200/70 leading-relaxed">
                  Kiểm tra xem API Key và Module AI đã hoạt động chính xác hay chưa bằng cách gửi 1 yêu cầu mẫu để đo độ trễ và chất lượng phản hồi.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                <span className="text-stone-500 font-semibold text-[11px]">Câu hỏi mẫu:</span>
                {[
                  'Hãy tạo 1 câu hỏi trắc nghiệm Toán lớp 12 về Đạo hàm cùng 4 phương án A, B, C, D.',
                  'Hãy tạo 1 câu hỏi đọc hiểu Ngữ văn 11 chuẩn đề minh họa Bộ GD&ĐT.',
                  'Tạo 1 câu hỏi Hóa học 12 dạng Đúng/Sai về este - lipit.',
                  'Tạo 1 câu hỏi trắc nghiệm Tiếng Anh 10 về thì Quá khứ hoàn thành.'
                ].map((sample, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => setTestPrompt(sample)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-700 dark:text-slate-300 text-[11px] truncate max-w-[200px]"
                    title={sample}
                  >
                    Mẫu #{sIdx + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập prompt thử nghiệm..."
                />

                <Button
                  onClick={handleRunSandboxTest}
                  disabled={isTestingSandbox}
                  variant="gradient"
                  className="w-full text-xs font-bold h-10"
                >
                  {isTestingSandbox ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang gửi yêu cầu tới {currentModel.name}...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Thực Thi Sandbox Với {currentModel.name}</>
                  )}
                </Button>
              </div>

              {/* Sandbox Result */}
              {sandboxResult && (
                <div className="p-4 rounded-2xl bg-stone-900 text-white text-xs space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-emerald-400 font-bold">
                      ✓ Phản hồi từ: {sandboxResult.modelUsed || currentModel.id}
                    </span>
                    <span className="text-stone-400">
                      Độ trễ: {sandboxResult.latencyMs}ms
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed text-stone-200 font-sans">
                    {sandboxResult.text || sandboxResult.error}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-[#0F1523] border-t border-stone-200 dark:border-white/[0.08] flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Đang sử dụng: <strong>{currentModel.name}</strong></span>
          </div>
          <Button onClick={onClose} variant="default" size="sm" className="text-xs px-4">
            Hoàn tất & Đóng
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AIModelCenterModal;
