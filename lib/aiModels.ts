export type AIProvider = 'gemini' | 'openai' | 'copilot' | 'claude' | 'deepseek';

export interface AIProviderInfo {
  id: AIProvider;
  name: string;
  company: string;
  logoColor: string;
  iconName: string;
  keyStorageKey: string;
  defaultEndpoint?: string;
  description: string;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderInfo> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    company: 'Google AI',
    logoColor: 'from-blue-600 via-indigo-600 to-purple-600',
    iconName: 'Sparkles',
    keyStorageKey: 'examgen_gemini_api_key',
    description: 'Thế hệ mô hình AI đa phương tiện hàng đầu từ Google AI Studio, tối ưu hóa cho ma trận đề thi GDPT 2018.'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    company: 'OpenAI Inc.',
    logoColor: 'from-emerald-600 to-teal-600',
    iconName: 'Bot',
    keyStorageKey: 'examgen_openai_api_key',
    defaultEndpoint: 'https://api.openai.com/v1',
    description: 'Dòng mô hình GPT-4o và o3/o1 nổi tiếng về khả năng suy luận logic, giải bài tập và phản hồi tự nhiên.'
  },
  copilot: {
    id: 'copilot',
    name: 'Microsoft Copilot',
    company: 'Microsoft / Azure AI',
    logoColor: 'from-sky-600 to-blue-700',
    iconName: 'Zap',
    keyStorageKey: 'examgen_copilot_api_key',
    defaultEndpoint: 'https://api.cognitive.microsoft.com',
    description: 'Mô hình AI bảo mật doanh nghiệp từ Microsoft Copilot & Azure OpenAI Services.'
  },
  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    company: 'Anthropic PBC',
    logoColor: 'from-amber-600 to-orange-600',
    iconName: 'Brain',
    keyStorageKey: 'examgen_anthropic_api_key',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    description: 'Mô hình Claude 3.5 Sonnet & Haiku nổi bật với khả năng lập luận sư phạm, hành văn tiếng Việt chuẩn xác và tạo đáp án chi tiết.'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek AI',
    company: 'DeepSeek AI',
    logoColor: 'from-blue-500 to-cyan-500',
    iconName: 'Cpu',
    keyStorageKey: 'examgen_deepseek_api_key',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    description: 'Mô hình DeepSeek-V3 và R1 mạnh mẽ về tư duy chuỗi (CoT), giải toán ứng dụng và tối ưu hóa chi phí API.'
  }
};

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  providerName: string;
  generation: string;
  badge: string;
  badgeType: 'latest' | 'reasoning' | 'fast' | 'stable' | 'auto';
  speed: string;
  accuracy: string;
  contextWindow: string;
  description: string;
  recommendedFor: string;
  isLatest?: boolean;
  isDefault?: boolean;
  supportsThinking?: boolean;
}

export const ALL_AI_MODELS: AIModelConfig[] = [
  // --- GOOGLE GEMINI ---
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 3.7',
    badge: 'MỚI NHẤT • KHUYÊN DÙNG',
    badgeType: 'latest',
    speed: 'Siêu tốc (0.4s - 0.9s)',
    accuracy: 'Tối ưu vượt trội (99.8%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Mô hình thế hệ 3.7 tối tân nhất của Google, kết hợp tốc độ cực nhanh với khả năng suy luận hybrid reasoning, chuẩn hóa cấu trúc ma trận và câu hỏi thi.',
    recommendedFor: 'Tất cả các môn học, tạo đề trắc nghiệm, ma trận CV 7991, Ngữ văn và tạo đề cương.',
    isLatest: true,
    isDefault: true,
    supportsThinking: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 3.1',
    badge: 'DEEP REASONING • TƯ DUY CAO',
    badgeType: 'reasoning',
    speed: 'Chuyên sâu (1.5s - 3.5s)',
    accuracy: 'Sư phạm chuyên sâu (99.9%)',
    contextWindow: '2,000,000 Tokens',
    description: 'Mô hình tư duy chuyên sâu thế hệ 3.1 Pro, tối ưu hóa cho bài toán vận dụng cao, đề thi học sinh giỏi, giải toán tích phân/hình học và nghị luận văn học nâng cao.',
    recommendedFor: 'Toán, Vật lý, Hóa học vận dụng cao, đề thi HSG, đề thi THPT Quốc gia phức tạp.',
    supportsThinking: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 3.1',
    badge: 'TIẾT KIỆM TOKEN • PHẢN HỒI NHANH',
    badgeType: 'fast',
    speed: 'Tức thì (< 0.3s)',
    accuracy: 'Rất cao (98.5%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Mô hình gọn nhẹ thế hệ mới, tối ưu chi phí token, tốc độ phản hồi cực nhanh cho các tác vụ xáo trộn đề, trích xuất dữ liệu và kiểm tra lỗi.',
    recommendedFor: 'Trộn đề thi số lượng lớn, trích xuất file thô, phân loại nhanh.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 2.5',
    badge: 'ỔN ĐỊNH CAO',
    badgeType: 'stable',
    speed: 'Nhanh (0.8s)',
    accuracy: 'Chuẩn sư phạm (98%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Phiên bản Flash 2.5 đã được kiểm chứng về độ ổn định, phù hợp làm việc hàng ngày.',
    recommendedFor: 'Ra đề cơ bản, kiểm tra 15 phút, giữa kỳ.',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 2.5',
    badge: 'ĐA NHIỆM CAO CẤP',
    badgeType: 'stable',
    speed: 'Tiêu chuẩn (2.0s)',
    accuracy: 'Cao cấp (99%)',
    contextWindow: '2,000,000 Tokens',
    description: 'Phiên bản Pro 2.5 với khả năng đọc hiểu tài liệu dài và xử lý file đính kèm đa phương tiện.',
    recommendedFor: 'Phân tích file đề thi cũ, đọc ảnh đề thi viết tay.',
  },

  // --- OPENAI ---
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    providerName: 'OpenAI',
    generation: 'GPT-4o',
    badge: 'ĐA NĂNG CAO CẤP',
    badgeType: 'latest',
    speed: 'Rất nhanh (0.8s - 1.2s)',
    accuracy: 'Sư phạm & Đa ngữ (99.6%)',
    contextWindow: '128,000 Tokens',
    description: 'Mô hình cờ đầu của OpenAI, xử lý ngữ cảnh đa ngôn ngữ tinh tế, lập luận tự nhiên và ra đề thi trắc nghiệm chuẩn xác.',
    recommendedFor: 'Tiếng Anh, Ngữ văn, Toán và tạo ma trận kiến thức chuẩn.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'openai',
    providerName: 'OpenAI',
    generation: 'GPT-4o',
    badge: 'SIÊU TỐC & TIẾT KIỆM',
    badgeType: 'fast',
    speed: 'Tức thì (< 0.4s)',
    accuracy: 'Cao (98.2%)',
    contextWindow: '128,000 Tokens',
    description: 'Mô hình tối ưu chi phí cực hiệu quả từ OpenAI, phản hồi siêu nhanh cho các câu hỏi kiểm tra thường xuyên.',
    recommendedFor: 'Tạo nhanh câu hỏi trắc nghiệm, xáo trộn câu hỏi và sửa bài.',
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'openai',
    providerName: 'OpenAI',
    generation: 'Series-O',
    badge: 'LOGIC & SUY LUẬN',
    badgeType: 'reasoning',
    speed: 'Tiêu chuẩn (1.2s - 2.5s)',
    accuracy: 'Logic toán học (99.7%)',
    contextWindow: '200,000 Tokens',
    description: 'Mô hình suy luận o3-mini tối ưu hóa cho bài tập tự luận, tính toán hóa học, vật lý và thuật toán lập trình.',
    recommendedFor: 'Toán học, Vật lý, Hóa học, Tin học.',
    supportsThinking: true,
  },
  {
    id: 'o1',
    name: 'OpenAI o1',
    provider: 'openai',
    providerName: 'OpenAI',
    generation: 'Series-O',
    badge: 'TƯ DUY ĐỈNH CAO',
    badgeType: 'reasoning',
    speed: 'Chuyên sâu (3.0s - 6.0s)',
    accuracy: 'Chuyên gia (99.9%)',
    contextWindow: '200,000 Tokens',
    description: 'Mô hình tư duy chuyên sâu cao cấp nhất của OpenAI cho các kỳ thi học sinh giỏi quốc gia và đề thi phân hóa.',
    recommendedFor: 'Bài tập Vận dụng cao 9-10 điểm, thi HSG.',
    supportsThinking: true,
  },

  // --- MICROSOFT COPILOT ---
  {
    id: 'copilot-gpt-4o',
    name: 'Microsoft Copilot GPT-4o',
    provider: 'copilot',
    providerName: 'Microsoft Copilot',
    generation: 'Azure GPT-4o',
    badge: 'DOANH NGHIỆP & GIÁO DỤC',
    badgeType: 'stable',
    speed: 'Ổn định (0.9s)',
    accuracy: 'Rất cao (99.4%)',
    contextWindow: '128,000 Tokens',
    description: 'Phiên bản Copilot được Microsoft tinh chỉnh bảo mật và tối ưu hạ tầng đám mây Azure AI.',
    recommendedFor: 'Đề thi trường học, kiểm duyệt nội dung an toàn.',
  },
  {
    id: 'copilot-gpt-4-turbo',
    name: 'Microsoft Copilot GPT-4 Turbo',
    provider: 'copilot',
    providerName: 'Microsoft Copilot',
    generation: 'Azure GPT-4',
    badge: 'BẢO MẬT & ĐỘ BỀN',
    badgeType: 'stable',
    speed: 'Tiêu chuẩn (1.5s)',
    accuracy: 'Cao (99.0%)',
    contextWindow: '128,000 Tokens',
    description: 'Hạ tầng Copilot kết nối Microsoft 365 Education, chịu tải cao cho đợt thi học kỳ toàn trường.',
    recommendedFor: 'Tạo đề thi quy mô lớn, kỳ thi tập trung toàn khối.',
  },

  // --- ANTHROPIC CLAUDE ---
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude 3.5',
    badge: 'SƯ PHẠM & NGỮ VĂN XUẤT SẮC',
    badgeType: 'latest',
    speed: 'Nhanh (0.8s - 1.5s)',
    accuracy: 'Văn phong đỉnh cao (99.8%)',
    contextWindow: '200,000 Tokens',
    description: 'Mô hình nổi tiếng của Anthropic với khả năng diễn đạt tiếng Việt trau chuốt, tự nhiên, soạn thảo đề Ngữ văn và đọc hiểu rất tinh tế.',
    recommendedFor: 'Môn Ngữ văn, Lịch sử, Địa lý, GDCD, Tiếng Anh.',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude 3.5',
    badge: 'PHẢN HỒI SIÊU NHANH',
    badgeType: 'fast',
    speed: 'Tức thì (< 0.4s)',
    accuracy: 'Sư phạm tốt (98.6%)',
    contextWindow: '200,000 Tokens',
    description: 'Tốc độ cực kỳ ấn tượng, tiết kiệm token, phù hợp cho bài tập trắc nghiệm ngắn và kiểm tra đáp án.',
    recommendedFor: 'Tạo câu hỏi trắc nghiệm nhanh, kiểm tra chính tả bài tập.',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude 3',
    badge: 'PHÂN TÍCH HỌC THUẬT SÂU',
    badgeType: 'reasoning',
    speed: 'Chuyên sâu (2.5s - 5.0s)',
    accuracy: 'Chuyên gia (99.7%)',
    contextWindow: '200,000 Tokens',
    description: 'Phiên bản Opus cao cấp phân tích toàn diện các văn bản dài, chuyên đề nghiên cứu sư phạm.',
    recommendedFor: 'Soạn thảo giáo án chuyên đề, đề cương ôn tập tổng hợp.',
  },

  // --- DEEPSEEK ---
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: 'deepseek',
    providerName: 'DeepSeek AI',
    generation: 'V3',
    badge: 'TOÁN HỌC & GIẢI THUẬT',
    badgeType: 'latest',
    speed: 'Siêu tốc (0.5s - 1.0s)',
    accuracy: 'Toán & Tự nhiên (99.5%)',
    contextWindow: '128,000 Tokens',
    description: 'Mô hình DeepSeek-V3 thế hệ mới với hiệu năng cực cao trên các môn Khoa học tự nhiên, chi phí API siêu tiết kiệm.',
    recommendedFor: 'Toán học, Vật lý, Hóa học, Sinh học, Tin học.',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'deepseek',
    providerName: 'DeepSeek AI',
    generation: 'R1 CoT',
    badge: 'REASONING & CHAIN-OF-THOUGHT',
    badgeType: 'reasoning',
    speed: 'Suy luận sâu (2.0s - 4.5s)',
    accuracy: 'Suy luận bước (99.8%)',
    contextWindow: '128,000 Tokens',
    description: 'Mô hình suy luận theo chuỗi tư duy (Chain-of-Thought) của DeepSeek, tự động kiểm chứng logic qua từng bước giải bài tập.',
    recommendedFor: 'Toán vận dụng cao, tự luận lý hóa, giải thích đáp án bài tập.',
    supportsThinking: true,
  }
];

export const DEFAULT_PRIMARY_MODEL = 'gemini-3.7-flash';

// Mặc định chuỗi mô hình dự phòng (Default Fallback Chain)
export const DEFAULT_FALLBACK_CHAIN: string[] = [
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'deepseek-v3',
  'gpt-4o-mini',
  'claude-3-5-haiku'
];

/**
 * Lấy danh sách API Key lưu trữ từ LocalStorage
 */
export function getStoredApiKeys(): Record<AIProvider, string> {
  const geminiKey = localStorage.getItem('examgen_gemini_api_key') || '';
  const openaiKey = localStorage.getItem('examgen_openai_api_key') || '';
  const copilotKey = localStorage.getItem('examgen_copilot_api_key') || '';
  const claudeKey = localStorage.getItem('examgen_anthropic_api_key') || '';
  const deepseekKey = localStorage.getItem('examgen_deepseek_api_key') || '';

  return {
    gemini: geminiKey,
    openai: openaiKey,
    copilot: copilotKey,
    claude: claudeKey,
    deepseek: deepseekKey
  };
}

/**
 * Lưu API Key cho một nhà cung cấp cụ thể
 */
export function saveStoredApiKey(provider: AIProvider, key: string): void {
  const info = AI_PROVIDERS[provider];
  if (info) {
    localStorage.setItem(info.keyStorageKey, key.trim());
  }
}
