// lib/multiProviderService.ts
import { GoogleGenAI } from '@google/genai';

export type AIProvider = 'google' | 'openai' | 'anthropic' | 'deepseek' | 'microsoft';

export interface AIModelConfig {
  provider: AIProvider;
  modelName: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  providerUsed: AIProvider;
  modelUsed: string;
  raw?: any;
}

// Danh sách các model mới nhất theo tiêu chuẩn hiện hành
export const LATEST_AI_MODELS: Record<AIProvider, { id: string; name: string; contextWindow: string }[]> = {
  google: [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Khuyên dùng)', contextWindow: '1M tokens' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', contextWindow: '1M tokens' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Reasoning)', contextWindow: '2M tokens' }
  ],
  openai: [
    { id: 'gpt-6.1-sol', name: 'GPT-6.1 Sol (Flagship Coding & Work)', contextWindow: '1.05M tokens' },
    { id: 'gpt-6-astra', name: 'GPT-6 Astra (Advanced Reasoning)', contextWindow: '1.05M tokens' },
    { id: 'gpt-6-luna', name: 'GPT-6 Luna (High-speed & Lightweight)', contextWindow: '1.05M tokens' }
  ],
  anthropic: [
    { id: 'claude-opus-5.5', name: 'Claude Opus 5.5 (Default & Agentic)', contextWindow: '1M tokens' },
    { id: 'claude-sonnet-5.5', name: 'Claude Sonnet 5.5 (Fast & Balanced)', contextWindow: '1M tokens' },
    { id: 'claude-fable-5.1', name: 'Claude Fable 5.1 (Deep Research)', contextWindow: '1M tokens' },
    { id: 'claude-haiku-5.5', name: 'Claude Haiku 5.5 (High Speed)', contextWindow: '1M tokens' }
  ],
  deepseek: [
    { id: 'deepseek-v4-pro', name: 'DeepSeek-V4 Pro (Complex Reasoning)', contextWindow: '1M tokens' },
    { id: 'deepseek-v4-flash', name: 'DeepSeek-V4 Flash (High Speed / Cost-effective)', contextWindow: '1M tokens' }
  ],
  microsoft: [
    { id: 'azure-gpt-6-sol', name: 'Azure OpenAI GPT-6.1 Sol', contextWindow: '1.05M tokens' },
    { id: 'azure-gpt-4o', name: 'Azure OpenAI GPT-4o Enterprise', contextWindow: '128K tokens' }
  ]
};

// Quản lý API Key riêng trong localStorage
export const getStoredApiKey = (provider: AIProvider): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`examgen_apikey_${provider}`) || '';
};

export const setStoredApiKey = (provider: AIProvider, key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`examgen_apikey_${provider}`, key.trim());
};

// Hàm gọi API thực tế cho từng nhà cung cấp kèm xử lý JSON và Retry / Fallback
export async function callAIModelWithFallback(
  primaryConfig: AIModelConfig,
  prompt: string,
  systemInstruction?: string,
  expectJson: boolean = false
): Promise<AIResponse> {
  const providersSequence: AIModelConfig[] = [
    primaryConfig,
    // Chuỗi Fallback tự động khi nhà cung cấp chính gặp lỗi 429 (Rate Limit) hoặc hết Quota
    { provider: 'google', modelName: 'gemini-3.8-flash', apiKey: getStoredApiKey('google') },
    { provider: 'deepseek', modelName: 'deepseek-v4-flash', apiKey: getStoredApiKey('deepseek') },
    { provider: 'openai', modelName: 'gpt-6.1-sol', apiKey: getStoredApiKey('openai') }
  ];

  let lastError: any = null;

  for (const config of providersSequence) {
    const apiKey = config.apiKey || getStoredApiKey(config.provider);
    if (!apiKey && config.provider !== 'google') {
      continue; // Bỏ qua nếu chưa cấu hình API Key riêng cho hãng đó
    }

    try {
      let resultText = '';

      switch (config.provider) {
        case 'google': {
          const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: config.modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: expectJson ? 'application/json' : 'text/plain',
              temperature: config.temperature ?? 0.3
            }
          });
          resultText = response.text || '';
          break;
        }

        case 'openai':
        case 'microsoft': {
          const isAzure = config.provider === 'microsoft';
          const endpoint = isAzure 
            ? `${process.env.AZURE_OPENAI_ENDPOINT || 'https://api.microsoft.com/openai/v1'}/chat/completions`
            : 'https://api.openai.com/v1/chat/completions';

          const messages = [];
          if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
          messages.push({ role: 'user', content: prompt });

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: config.modelName,
              messages,
              response_format: expectJson ? { type: 'json_object' } : { type: 'text' },
              temperature: config.temperature ?? 0.3
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`OpenAI/Azure Error ${res.status}: ${errData.error?.message || res.statusText}`);
          }

          const data = await res.json();
          resultText = data.choices?.[0]?.message?.content || '';
          break;
        }

        case 'anthropic': {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
              model: config.modelName,
              max_tokens: config.maxTokens || 4096,
              system: systemInstruction,
              messages: [{ role: 'user', content: prompt }]
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`Anthropic Error ${res.status}: ${errData.error?.message || res.statusText}`);
          }

          const data = await res.json();
          resultText = data.content?.[0]?.text || '';
          break;
        }

        case 'deepseek': {
          const messages = [];
          if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
          messages.push({ role: 'user', content: prompt });

          const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: config.modelName,
              messages,
              response_format: expectJson ? { type: 'json_object' } : { type: 'text' },
              temperature: config.temperature ?? 0.3
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`DeepSeek Error ${res.status}: ${errData.error?.message || res.statusText}`);
          }

          const data = await res.json();
          resultText = data.choices?.[0]?.message?.content || '';
          break;
        }
      }

      if (resultText) {
        return {
          text: resultText,
          providerUsed: config.provider,
          modelUsed: config.modelName
        };
      }
    } catch (error: any) {
      console.warn(`[AI Fallback] Provider ${config.provider} (${config.modelName}) failed:`, error.message);
      lastError = error;
      
      // Nếu gặp lỗi 429 (Rate Limit) hoặc quá hạn mức, tiếp tục vòng lặp sang nhà cung cấp tiếp theo trong chuỗi fallback
      const isRateLimit = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate_limit');
      if (!isRateLimit && config.provider === primaryConfig.provider) {
        // Nếu là lỗi khác lỗi giới hạn, có thể throw ngay hoặc cho phép thử lại
        throw error;
      }
    }
  }

  throw new Error(`Tất cả các nhà cung cấp AI đều phản hồi lỗi hoặc chưa cấu hình API Key hợp lệ. Lỗi cuối: ${lastError?.message || 'Unknown'}`);
}
