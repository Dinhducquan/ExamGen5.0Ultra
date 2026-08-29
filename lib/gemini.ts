import { GoogleGenAI } from "@google/genai";
import { DEFAULT_GEMINI_MODEL } from "./geminiModels";

/**
 * Thử lại một hàm không đồng bộ với cơ chế Exponential Backoff.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || '';
      const isRateLimit = errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED");
      
      if (isRateLimit && retries < maxRetries) {
        const delay = initialDelay * Math.pow(2, retries);
        console.warn(`Gemini API Rate Limit (429). Đang thử lại lần ${retries + 1} sau ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      throw error;
    }
  }
}

export interface SafeGenerateOptions {
  apiKey: string;
  model?: string;
  contents: string | any[];
  systemInstruction?: string;
  generationConfig?: any;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

/**
 * Hàm gọi Gemini API an toàn với cơ chế tự động thử lại khi gặp lỗi quota hoặc độ trễ mạng.
 * Hỗ trợ các dòng mô hình mới nhất: gemini-3.7-flash, gemini-3.1-pro-preview, gemini-3.1-flash-lite.
 */
export async function safeGenerateContent(options: SafeGenerateOptions): Promise<{ text: string; usageMetadata?: any }> {
  const { apiKey, model = DEFAULT_GEMINI_MODEL, contents, systemInstruction, generationConfig, reasoningEffort } = options;
  
  const ai = new GoogleGenAI({ apiKey });

  // Thiết lập cấu hình nâng cao
  const config: any = {
    ...generationConfig,
  };

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  // Cấu hình thinking cho các mô hình hỗ trợ
  if (model.includes('3.7-flash') || model.includes('3.1-pro') || model.includes('2.5-pro')) {
    if (reasoningEffort === 'low') {
      config.thinkingConfig = { thinkingBudget: 1024 };
    } else if (reasoningEffort === 'high') {
      config.thinkingConfig = { thinkingBudget: 4096 };
    }
  }

  return retryWithBackoff(async () => {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: contents }] }],
        config,
      });
      
      return {
        text: response.text || '',
        usageMetadata: response.usageMetadata,
      };
    } catch (primaryError: any) {
      // Fallback tự động nếu mô hình preview tạm thời bận
      if (model !== 'gemini-3.7-flash' && model !== 'gemini-2.5-flash' && primaryError?.status === 404) {
        console.warn(`Mô hình ${model} không khả dụng, tự động chuyển về gemini-3.7-flash...`);
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: contents }] }],
          config,
        });
        return {
          text: fallbackResponse.text || '',
          usageMetadata: fallbackResponse.usageMetadata,
        };
      }
      throw primaryError;
    }
  });
}
