import { GoogleGenAI } from "@google/genai";
import { ALL_AI_MODELS, AIModelConfig, AIProvider, getStoredApiKeys, AI_PROVIDERS, DEFAULT_FALLBACK_CHAIN } from "./aiModels";

export interface GenerateOptions {
  apiKey?: string;
  model?: string;
  contents: string | any[];
  systemInstruction?: string;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    [key: string]: any;
  };
  reasoningEffort?: 'low' | 'medium' | 'high';
  fallbackChain?: string[];
  enableFallback?: boolean;
  maxRetries?: number;
  initialDelayMs?: number;
  onFallback?: (failedModel: string, nextModel: string, reason: string) => void;
}

export interface GenerateResult {
  text: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  modelUsed: string;
  providerUsed: AIProvider;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  latencyMs: number;
}

/**
 * Kiểm tra xem lỗi có phải do nghẽn hạn ngạch (429 / Quota / Rate Limit / Unavailable) hay không.
 */
export function isQuotaOrRateLimitError(error: any): boolean {
  if (!error) return false;
  const msg = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
  const status = error.status || error.statusCode || error.response?.status;

  if (status === 429 || status === 503 || status === 500 || status === 502 || status === 504) {
    return true;
  }

  const errorKeywords = [
    '429',
    'RESOURCE_EXHAUSTED',
    'QUOTA_EXCEEDED',
    'quota',
    'rate limit',
    'rate_limit',
    'too many requests',
    'overloaded',
    'temporarily unavailable',
    'capacity'
  ];

  return errorKeywords.some(kw => msg.toLowerCase().includes(kw));
}

/**
 * Helper: Sleep ms
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Thực thi gọi AI cho một mô hình cụ thể thuộc 1 trong 5 Nhà cung cấp (Gemini, OpenAI, Copilot, Claude, DeepSeek)
 */
async function callSingleProvider(
  modelConfig: AIModelConfig,
  promptText: string,
  systemInstruction?: string,
  generationConfig?: any,
  providedApiKey?: string,
  reasoningEffort?: 'low' | 'medium' | 'high'
): Promise<{ text: string; usageMetadata?: any }> {
  const providerKeys = getStoredApiKeys();
  const apiKey = (providedApiKey && providedApiKey !== 'DEMO_INITIAL_KEY' ? providedApiKey : '') 
    || providerKeys[modelConfig.provider] 
    || (modelConfig.provider === 'gemini' ? (process.env.GEMINI_API_KEY || '') : '');

  // 1. GOOGLE GEMINI
  if (modelConfig.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: apiKey || 'demo_key' });
    const config: any = { ...generationConfig };
    if (systemInstruction) config.systemInstruction = systemInstruction;

    if (modelConfig.id.includes('4-argon') || modelConfig.id.includes('3.8-flash') || modelConfig.id.includes('3.7-flash') || modelConfig.id.includes('3.1-pro') || modelConfig.id.includes('2.5-pro')) {
      if (reasoningEffort === 'low') config.thinkingConfig = { thinkingBudget: 1024 };
      else if (reasoningEffort === 'high') config.thinkingConfig = { thinkingBudget: 4096 };
    }

    try {
      const response = await ai.models.generateContent({
        model: modelConfig.id,
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config
      });

      return {
        text: response.text || '',
        usageMetadata: response.usageMetadata
      };
    } catch (apiErr: any) {
      if (modelConfig.id === 'gemini-4-argon' && (apiErr?.message?.includes('not found') || apiErr?.message?.includes('404') || apiErr?.status === 404)) {
        console.warn(`[Gemini 4 Argon] Model endpoint fallback to gemini-3.8-flash:`, apiErr?.message);
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          config
        });
        return {
          text: fallbackResponse.text || '',
          usageMetadata: fallbackResponse.usageMetadata
        };
      }
      throw apiErr;
    }
  }

  // Format messages array for standard Chat Completions API
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: promptText });

  // 2. OPENAI (GPT-4o, GPT-4o-mini, o3-mini, o1)
  if (modelConfig.provider === 'openai') {
    if (!apiKey) {
      throw new Error(`Chưa cấu hình API Key cho nhà cung cấp ${modelConfig.providerName}. Vui lòng nhập Key trong Cài đặt AI.`);
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages,
        temperature: generationConfig?.temperature ?? 0.7,
        max_tokens: generationConfig?.maxOutputTokens ?? 4096,
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `Lỗi API OpenAI (${res.status})`;
      throw new Error(msg);
    }

    const data = await res.json();
    const outputText = data.choices?.[0]?.message?.content || '';
    const usage = data.usage ? {
      promptTokenCount: data.usage.prompt_tokens,
      candidatesTokenCount: data.usage.completion_tokens,
      totalTokenCount: data.usage.total_tokens
    } : undefined;

    return { text: outputText, usageMetadata: usage };
  }

  // 3. MICROSOFT COPILOT / AZURE OPENAI
  if (modelConfig.provider === 'copilot') {
    if (!apiKey) {
      throw new Error(`Chưa cấu hình API Key cho Microsoft Copilot / Azure AI. Vui lòng nhập Key trong Cài đặt AI.`);
    }

    // Copilot Azure OpenAI compatible endpoint or custom endpoint
    const endpoint = localStorage.getItem('examgen_copilot_endpoint') || 'https://api.openai.com/v1';
    const targetModel = modelConfig.id.replace('copilot-', '');

    const res = await fetch(`${endpoint.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'api-key': apiKey
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: generationConfig?.temperature ?? 0.7,
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi Microsoft Copilot API (${res.status})`);
    }

    const data = await res.json();
    const outputText = data.choices?.[0]?.message?.content || '';
    return {
      text: outputText,
      usageMetadata: data.usage ? {
        promptTokenCount: data.usage.prompt_tokens,
        candidatesTokenCount: data.usage.completion_tokens,
        totalTokenCount: data.usage.total_tokens
      } : undefined
    };
  }

  // 4. ANTHROPIC CLAUDE
  if (modelConfig.provider === 'claude') {
    if (!apiKey) {
      throw new Error(`Chưa cấu hình API Key cho Anthropic Claude. Vui lòng nhập Key trong Cài đặt AI.`);
    }

    const claudeModelMap: Record<string, string> = {
      'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku': 'claude-3-5-haiku-20241022',
      'claude-3-opus': 'claude-3-opus-20240229'
    };

    const targetModel = claudeModelMap[modelConfig.id] || 'claude-3-5-sonnet-20241022';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: generationConfig?.maxOutputTokens ?? 4096,
        system: systemInstruction || undefined,
        messages: [{ role: 'user', content: promptText }]
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi Anthropic Claude API (${res.status})`);
    }

    const data = await res.json();
    const outputText = data.content?.[0]?.text || '';
    const usage = data.usage ? {
      promptTokenCount: data.usage.input_tokens,
      candidatesTokenCount: data.usage.output_tokens,
      totalTokenCount: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
    } : undefined;

    return { text: outputText, usageMetadata: usage };
  }

  // 5. DEEPSEEK (DeepSeek-V3, DeepSeek-R1)
  if (modelConfig.provider === 'deepseek') {
    if (!apiKey) {
      throw new Error(`Chưa cấu hình API Key cho DeepSeek AI. Vui lòng nhập Key trong Cài đặt AI.`);
    }

    const targetModel = modelConfig.id === 'deepseek-r1' ? 'deepseek-reasoner' : 'deepseek-chat';

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: generationConfig?.temperature ?? 0.7,
        max_tokens: generationConfig?.maxOutputTokens ?? 4096,
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi DeepSeek API (${res.status})`);
    }

    const data = await res.json();
    const outputText = data.choices?.[0]?.message?.content || '';
    const usage = data.usage ? {
      promptTokenCount: data.usage.prompt_tokens,
      candidatesTokenCount: data.usage.completion_tokens,
      totalTokenCount: data.usage.total_tokens
    } : undefined;

    return { text: outputText, usageMetadata: usage };
  }

  throw new Error(`Nhà cung cấp AI không được hỗ trợ: ${modelConfig.provider}`);
}

/**
 * Hàm gọi sinh nội dung AI Trung Tâm:
 * - Hỗ trợ 5 Nhà cung cấp (Gemini, OpenAI, Copilot, Claude, DeepSeek)
 * - Tự động thử lại (Exponential Backoff) khi gặp lỗi 429 / Quota / Rate limit
 * - Tự động chuyển chuỗi mô hình dự phòng (Auto-Fallback Chain)
 */
export async function safeGenerateContent(options: GenerateOptions): Promise<GenerateResult> {
  const startTime = Date.now();
  const {
    apiKey,
    model = 'gemini-3.8-flash',
    contents,
    systemInstruction,
    generationConfig,
    reasoningEffort = 'medium',
    fallbackChain = DEFAULT_FALLBACK_CHAIN,
    enableFallback = true,
    maxRetries = 3,
    initialDelayMs = 1000,
    onFallback
  } = options;

  // Normalize prompt string
  let promptText = '';
  if (typeof contents === 'string') {
    promptText = contents;
  } else if (Array.isArray(contents)) {
    promptText = contents
      .map(item => {
        if (typeof item === 'string') return item;
        if (item.parts) return item.parts.map((p: any) => p.text || '').join('\n');
        return JSON.stringify(item);
      })
      .join('\n');
  } else {
    promptText = JSON.stringify(contents);
  }

  // Prepare candidate list starting with primary requested model
  const candidateModelIds: string[] = [model];
  if (enableFallback) {
    fallbackChain.forEach(id => {
      if (!candidateModelIds.includes(id)) {
        candidateModelIds.push(id);
      }
    });
  }

  let lastError: any = null;
  let fallbackTriggered = false;
  let fallbackReason = '';

  for (let cIdx = 0; cIdx < candidateModelIds.length; cIdx++) {
    const candidateId = candidateModelIds[cIdx];
    const modelConfig = ALL_AI_MODELS.find(m => m.id === candidateId) || ALL_AI_MODELS[0];

    if (cIdx > 0) {
      fallbackTriggered = true;
      fallbackReason = `Mô hình ${candidateModelIds[cIdx - 1]} bị quá tải/hạn ngạch. Đã tự động chuyển sang mô hình dự phòng ${modelConfig.name}.`;
      console.warn(`[AI Center Fallback] ${fallbackReason}`);
      if (onFallback) {
        onFallback(candidateModelIds[cIdx - 1], candidateId, fallbackReason);
      }
    }

    // Try executing with Exponential Backoff Auto-Retry for this candidate model
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const res = await callSingleProvider(
          modelConfig,
          promptText,
          systemInstruction,
          generationConfig,
          apiKey,
          reasoningEffort
        );

        const latencyMs = Date.now() - startTime;
        return {
          text: res.text,
          usageMetadata: res.usageMetadata,
          modelUsed: modelConfig.id,
          providerUsed: modelConfig.provider,
          fallbackTriggered,
          fallbackReason: fallbackTriggered ? fallbackReason : undefined,
          latencyMs
        };
      } catch (err: any) {
        lastError = err;
        const isQuotaErr = isQuotaOrRateLimitError(err);
        attempt++;

        if (isQuotaErr && attempt < maxRetries) {
          const delay = initialDelayMs * Math.pow(2, attempt - 1);
          console.warn(`[AI Rate Limit / Quota] ${modelConfig.name} gặp sự cố (Lần thử ${attempt}/${maxRetries}). Đợi ${delay}ms để thử lại... Lỗi: ${err?.message}`);
          await sleep(delay);
          continue;
        }

        // If not quota error or exhausted retries for this model, break loop to test next candidate fallback
        break;
      }
    }
  }

  // If all candidate models in fallback chain failed
  throw lastError || new Error('Tất cả mô hình trong chuỗi dự phòng AI đều quá tải hoặc chưa cấu hình API Key.');
}
