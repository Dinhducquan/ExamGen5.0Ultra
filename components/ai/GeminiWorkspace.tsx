import React, { useEffect, useRef, useState } from "react";
import { safeGenerateContent } from "../../lib/gemini";
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Brain, 
  Bot, 
  User as UserIcon, 
  Copy, 
  Check, 
  Zap, 
  Sliders, 
  HelpCircle,
  CornerDownLeft
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Preset, Message } from "../../types";
import { useToast } from "../../hooks/useToast";
import { useSystemInstruction } from "../../hooks/useSystemInstruction";
import { useAdvancedSettings } from "../../hooks/useAdvancedSettings";
import { GEMINI_MODELS } from "../../lib/geminiModels";
import { ModelSelectorMenu } from "./ModelSelectorMenu";

const PRESETS: Preset[] = [
  { id: "gen_exam_40q_hh", title: "✦ Tạo đề 40 câu trắc nghiệm (Hóa 10)", prompt: "Tạo 3 đề trắc nghiệm 40 câu cho Hóa học 10 Chương 2, phân bố theo ma trận (Nhận biết:30%, Thông hiểu:40%, Vận dụng:30%), kèm đáp án và chỉ rõ mức độ từng câu." },
  { id: "gen_toan_12_tichphan", title: "✦ 10 câu Vận dụng cao Tích phân (Toán 12)", prompt: "Tạo 10 câu hỏi trắc nghiệm Đúng/Sai và Trả lời ngắn về Ứng dụng Tích phân tính diện tích, thể tích thực tế (Toán 12) chuẩn GDPT 2018 có lời giải chi tiết." },
  { id: "refine_balance", title: "✦ Tinh chỉnh phân hóa ma trận", prompt: "Phân tích ngân hàng câu hỏi hiện có và đề xuất bổ sung các câu hỏi mức độ Vận dụng và Vận dụng cao theo tỷ lệ chuẩn 4:3:2:1." },
  { id: "gen_nguvan_dochieu", title: "✦ Đọc hiểu ngữ liệu ngoài SGK (Văn 11)", prompt: "Trích dẫn 1 văn bản thơ hiện đại ngoài SGK và thiết lập 5 câu hỏi Đọc hiểu theo 4 mức độ nhận thức cùng 1 câu Viết đoạn văn 200 chữ." },
];

const CHAT_STORAGE_KEY = 'form_gemini_workspace_v5';

interface GeminiWorkspaceProps {
  updateTokenUsage: (count: number) => void;
}

const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.role === "user";
  const isLoading = msg.text === "Đang xử lý...";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"} py-2`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-glow-sm mt-1">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`group relative max-w-[85%] sm:max-w-[78%] px-4 py-3 rounded-2xl break-words transition-all
        ${isUser 
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm shadow-md" 
          : "bg-[#151B2B] text-slate-100 border border-white/[0.08] rounded-bl-sm shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] opacity-70 mb-1 pb-1 border-b border-white/10">
          <span className="font-semibold">{isUser ? "Bạn" : "Gemini 3.7 Pro"}</span>
          {!isLoading && (
            <button 
              onClick={handleCopy} 
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-white"
              title="Sao chép nội dung"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Đã chép" : "Sao chép"}</span>
            </button>
          )}
        </div>

        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {isLoading ? (
            <div className="flex items-center gap-2 text-indigo-300 py-1 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Đang tư duy và sinh nội dung chuẩn GDPT 2018...</span>
            </div>
          ) : (
            msg.text
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#1C2438] border border-white/[0.1] flex items-center justify-center text-indigo-400 mt-1">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default function GeminiWorkspace({ updateTokenUsage }: GeminiWorkspaceProps) {
  const { addToast } = useToast();
  const { systemInstruction } = useSystemInstruction();
  const { advSettings } = useAdvancedSettings();

  const [chatState, setChatState] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) { console.error(e); }
    return {
      input: "",
      messages: [
        { id: "system-welcome", role: "assistant", text: `Chào Thầy/Cô! Đây là AI Co-pilot (ExamGen Ultra 5.0). Tôi có thể hỗ trợ sinh câu hỏi, bóc tách tài liệu và tối ưu bảng đặc tả chuẩn Chương trình GDPT 2018.`, meta: "System" },
      ],
      selectedPreset: null,
    };
  });

  const { input, messages, selectedPreset } = chatState;
  
  const updateChatState = (newState: Partial<typeof chatState>) => {
    setChatState((prev: typeof chatState) => ({ ...prev, ...newState }));
  };
  
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatState));
  }, [chatState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callAI = async (promptText: string) => {
    if (loading) return;
    setLoading(true);
    
    const userMsg: Message = { id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role: "user", text: promptText, meta: "Bạn" };
    const loadingMsg: Message = { id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role: "assistant", text: "Đang xử lý...", meta: "Gemini" };

    updateChatState({
      input: "",
      selectedPreset: null,
      messages: [...messages, userMsg, loadingMsg],
    });

    try {
      const userApiKey = localStorage.getItem('examgen_gemini_api_key');
      if (!userApiKey) {
        throw new Error("API Key not found.");
      }

      const response = await safeGenerateContent({
        apiKey: userApiKey,
        model: advSettings.aiModel || 'gemini-3.7-flash',
        contents: promptText,
        systemInstruction: systemInstruction.instruction,
        reasoningEffort: advSettings.aiReasoningEffort,
      });

      if (response.usageMetadata) {
        updateTokenUsage(response.usageMetadata.totalTokenCount);
      }

      const aiText = response.text;
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === loadingMsg.id ? { ...m, text: aiText } : m
        ),
      }));
    } catch (error: any) {
      console.error("Lỗi khi gọi Gemini API:", error);
      let errorText = "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra API Key hoặc kết nối mạng.";
      
      if (error.message?.includes("API Key not found")) {
        errorText = "Không tìm thấy API Key. Vui lòng vào Cài đặt > Trí tuệ nhân tạo để thiết lập key.";
      } else if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        errorText = "Cảnh báo: Bạn đã vượt quá giới hạn lượt gọi (Quota) của Gemini API. Vui lòng chờ 1-2 phút rồi thử lại.";
      }
      
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === loadingMsg.id ? { ...m, text: errorText } : m
        ),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    callAI(input.trim());
  };

  const handlePreset = (preset: Preset) => {
    updateChatState({ selectedPreset: preset.id, input: preset.prompt });
  };

  const activeModelObj = GEMINI_MODELS.find(m => m.id === advSettings.aiModel) || GEMINI_MODELS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[500px]">
      <div className="flex-grow flex gap-4 overflow-hidden">
        {/* Left Side Sidebar / Models & Presets */}
        <aside className="w-80 hidden lg:block flex-shrink-0 space-y-4 overflow-y-auto pr-1">
          <Card>
            <CardHeader className="pb-3 border-b border-white/[0.06]">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Mô hình AI Gemini
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  v5.0 Pro
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              <ModelSelectorMenu variant="header" className="w-full" />
              
              <div className="p-3 rounded-xl bg-[#151B2B] text-xs space-y-1.5 border border-white/[0.06]">
                <div className="font-semibold text-slate-100 flex items-center justify-between">
                  <span>{activeModelObj.name}</span>
                  <span className="text-[10px] text-indigo-400 font-mono">{activeModelObj.generation}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {activeModelObj.description}
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/[0.04]">
                  <span>⚡ {activeModelObj.speed}</span>
                  <span>🎯 {activeModelObj.accuracy}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 border-b border-white/[0.06]">
              <CardTitle className="text-sm font-bold">Mẫu câu lệnh gợi ý</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all border text-xs cursor-pointer ${
                    selectedPreset === p.id 
                      ? "bg-indigo-600/20 border-indigo-500/40 text-white shadow-glow-sm" 
                      : "bg-[#151B2B]/60 hover:bg-[#151B2B] border-white/[0.06] hover:border-white/[0.12] text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.prompt}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Chat Canvas Section */}
        <section className="flex-1 bg-[#0F1523] rounded-2xl p-4 sm:p-5 flex flex-col border border-white/[0.08] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Trò chuyện cùng AI ExamGen</h3>
                <p className="text-[11px] text-slate-400">Tự do yêu cầu soạn đề, giải chi tiết hoặc điều chỉnh ma trận</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Online
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
            {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="relative flex items-center">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => updateChatState({ input: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhập yêu cầu sinh đề thi, bảng đặc tả... (Enter để gửi, Shift+Enter xuống dòng)"
                className="w-full bg-[#151B2B] text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-white/[0.1] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 px-3.5 py-3 pr-24 resize-none transition-colors"
                disabled={loading}
              />
              <div className="absolute right-2 flex items-center gap-1">
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="sm"
                  variant="gradient"
                  className="rounded-lg h-8 px-3 text-xs shadow-glow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Gửi</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
