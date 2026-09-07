import { safeGenerateContent as unifiedSafeGenerateContent, GenerateOptions, GenerateResult } from "./aiProvider";

export interface SafeGenerateOptions {
  apiKey?: string;
  model?: string;
  contents: string | any[];
  systemInstruction?: string;
  generationConfig?: any;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

/**
 * Hàm safeGenerateContent trung tâm tương thích ngược toàn bộ hệ thống.
 * Tự động điều hướng qua Trung tâm 17 mô hình AI với 5 nhà cung cấp:
 * Google Gemini, OpenAI, Microsoft Copilot, Anthropic Claude và DeepSeek.
 * Tích hợp tự động thử lại (Exponential Backoff) và Chuỗi mô hình dự phòng (Auto-Fallback Chain).
 */
export async function safeGenerateContent(options: SafeGenerateOptions): Promise<{ text: string; usageMetadata?: any; modelUsed?: string; providerUsed?: string }> {
  const result = await unifiedSafeGenerateContent({
    apiKey: options.apiKey,
    model: options.model,
    contents: options.contents,
    systemInstruction: options.systemInstruction,
    generationConfig: options.generationConfig,
    reasoningEffort: options.reasoningEffort,
  });

  return {
    text: result.text,
    usageMetadata: result.usageMetadata,
    modelUsed: result.modelUsed,
    providerUsed: result.providerUsed
  };
}
