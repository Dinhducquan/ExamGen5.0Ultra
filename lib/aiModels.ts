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
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 4 Argon',
    badge: 'THẾ HỆ 4 • ARGON MỚI NHẤT',
    badgeType: 'latest',
    speed: 'Siêu tốc (0.2s - 0.5s)',
    accuracy: 'Đột phá thế hệ 4 (99.95%)',
    contextWindow: '2,000,000 Tokens',
    description: 'Mô hình thế hệ Argon 4.0 mới nhất của Google, trang bị kiến trúc xử lý thế hệ mới, bứt phá năng lực tư duy đa phương tiện, tối ưu sâu sắc cho ma trận đề thi chuẩn CV 7991, phân hóa học sinh và giải đề tự luận khoa học phức tạp.',
    recommendedFor: 'Tất cả các môn học, ma trận đề thi phân hóa cao, STEM, tự luận phức tạp, học sinh giỏi và kỳ thi tốt nghiệp.',
    isLatest: true,
    isDefault: false,
    supportsThinking: true,
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 3.8',
    badge: 'MẶC ĐỊNH HỆ THỐNG • TỐI ƯU',
    badgeType: 'auto',
    speed: 'Siêu tốc (0.3s - 0.7s)',
    accuracy: 'Tối ưu vượt trội (99.9%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Mô hình thế hệ Gemini 3.8 Flash mặc định của hệ thống, tối ưu hóa tốc độ phản hồi cực nhanh cùng khả năng suy luận sắc bén, chuẩn hóa ma trận CV 7991 và tạo câu hỏi thi chính xác tuyệt đối.',
    recommendedFor: 'Tất cả các môn học, tạo đề trắc nghiệm, ma trận CV 7991, Ngữ văn, STEM và tạo đề cương.',
    isLatest: false,
    isDefault: true,
    supportsThinking: true,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'gemini',
    providerName: 'Google Gemini',
    generation: 'Gen 3.7',
    badge: 'TỐC ĐỘ CAO • ỔN ĐỊNH',
    badgeType: 'stable',
    speed: 'Siêu tốc (0.4s - 0.9s)',
    accuracy: 'Tối ưu vượt trội (99.8%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Mô hình thế hệ 3.7 của Google, kết hợp tốc độ cực nhanh với khả năng suy luận hybrid reasoning, chuẩn hóa cấu trúc ma trận và câu hỏi thi.',
    recommendedFor: 'Tất cả các môn học, tạo đề trắc nghiệm, ma trận CV 7991, Ngữ văn và tạo đề cương.',
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
    id: 'gpt-6.1-sol',
    name: 'OpenAI GPT-6.1 Sol',
    provider: 'openai',
    providerName: 'OpenAI',
    generation: 'GPT-6 Sol',
    badge: 'FLAGSHIP CODING & WORK',
    badgeType: 'latest',
    speed: 'Siêu tốc (0.6s - 1.0s)',
    accuracy: 'Chuẩn xác cao nhất (99.98%)',
    contextWindow: '1,050,000 Tokens',
    description: 'Thế hệ mô hình GPT-6.1 Sol mới nhất của OpenAI, năng lực xử lý đa nhiệm, soạn đề thi bám sát ma trận và giải thích sâu sắc.',
    recommendedFor: 'Tất cả các môn thi, soạn đề phân hóa cao, STEM và tự luận phức tạp.',
    isLatest: true,
    supportsThinking: true,
  },
  {
    id: 'gpt-6-astra',
    name: 'OpenAI GPT-6 Astra',
    provider: 'openai',
    providerName: 'OpenAI',
    generation: 'GPT-6 Astra',
    badge: 'ADVANCED REASONING',
    badgeType: 'reasoning',
    speed: 'Chuyên sâu (1.5s - 3.0s)',
    accuracy: 'Tư duy logic (99.9%)',
    contextWindow: '1,050,000 Tokens',
    description: 'Mô hình tư duy nâng cao của thế hệ GPT-6, chuyên trị các bài toán vận dụng cao, phân hóa điểm 9-10 và đề thi học sinh giỏi.',
    recommendedFor: 'Toán, Lý, Hóa, Sinh vận dụng cao và đề thi học sinh giỏi.',
    supportsThinking: true,
  },
  {
    id: 'gpt-6-luna',
    name: 'OpenAI GPT-6 Luna',
    provider: 'openai',
    providerName: 'OpenAI',
    generation: 'GPT-6 Luna',
    badge: 'LIGHTWEIGHT & HIGH SPEED',
    badgeType: 'fast',
    speed: 'Tức thì (< 0.3s)',
    accuracy: 'Xuất sắc (98.9%)',
    contextWindow: '1,050,000 Tokens',
    description: 'Phiên bản gọn nhẹ thế hệ GPT-6, tối ưu hóa tốc độ và tiết kiệm chi phí, phản hồi tức thì cho việc ra đề trắc nghiệm và trộn đề.',
    recommendedFor: 'Sinh đề trắc nghiệm nhanh, xáo trộn câu hỏi, kiểm tra bài làm.',
  },
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

  // --- MICROSOFT COPILOT & AZURE OPENAI ---
  {
    id: 'azure-gpt-6-sol',
    name: 'Azure OpenAI GPT-6.1 Sol',
    provider: 'copilot',
    providerName: 'Microsoft Copilot',
    generation: 'Azure GPT-6',
    badge: 'MICROSOFT FOUNDRY • MỚI NHẤT',
    badgeType: 'latest',
    speed: 'Siêu tốc (0.6s - 1.1s)',
    accuracy: 'Doanh nghiệp & Sư phạm (99.95%)',
    contextWindow: '1,050,000 Tokens',
    description: 'Phiên bản Azure OpenAI GPT-6.1 Sol bảo mật cấp doanh nghiệp từ Microsoft Foundry & Azure AI.',
    recommendedFor: 'Hệ thống thi trường học, ma trận chuẩn Bộ GD&ĐT, bảo mật thông tin tối đa.',
    isLatest: true,
  },
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
    id: 'claude-opus-5.5',
    name: 'Claude Opus 5.5',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude 5.5',
    badge: 'AGENTIC & MASTER • MỚI NHẤT',
    badgeType: 'latest',
    speed: 'Chuyên sâu (1.5s - 3.0s)',
    accuracy: 'Chuẩn mực học thuật (99.98%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Mô hình đầu bảng thế hệ Claude 5.5 của Anthropic, khả năng lập luận sư phạm đỉnh cao và hành văn chuẩn mực.',
    recommendedFor: 'Ngữ văn, Lịch sử, Địa lý, GDCD, bài thi học sinh giỏi và đề tự luận sâu.',
    isLatest: true,
  },
  {
    id: 'claude-sonnet-5.5',
    name: 'Claude Sonnet 5.5',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude 5.5',
    badge: 'FAST & BALANCED',
    badgeType: 'latest',
    speed: 'Rất nhanh (0.7s - 1.2s)',
    accuracy: 'Sư phạm tinh tế (99.9%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Cân bằng hoàn hảo giữa tốc độ phản hồi nhanh và chất lượng học thuật, phù hợp mọi môn học theo chương trình GDPT 2018.',
    recommendedFor: 'Mọi môn học, tạo đề kiểm tra 1 tiết, giữa kỳ và cuối kỳ.',
  },
  {
    id: 'claude-fable-5.1',
    name: 'Claude Fable 5.1',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude Fable',
    badge: 'DEEP RESEARCH & CONTEXT',
    badgeType: 'reasoning',
    speed: 'Nghiên cứu (1.8s - 3.5s)',
    accuracy: 'Độ tin cậy tuyệt đối (99.9%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Chuyên nghiên cứu tài liệu dài, trích xuất cấu trúc ma trận từ sách giáo khoa và giáo án dài tập.',
    recommendedFor: 'Soạn thảo giáo án chuyên đề, đề cương ôn tập tổng hợp.',
  },
  {
    id: 'claude-haiku-5.5',
    name: 'Claude Haiku 5.5',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude 5.5',
    badge: 'HIGH SPEED & COMPACT',
    badgeType: 'fast',
    speed: 'Tức thì (< 0.3s)',
    accuracy: 'Rất cao (99.0%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Tốc độ cực nhanh của dòng Claude 5.5, siêu tiết kiệm token và hiệu năng cao cho trắc nghiệm.',
    recommendedFor: 'Tạo trắc nghiệm nhanh, kiểm tra định dạng và đáp án.',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    generation: 'Claude 3.5',
    badge: 'SƯ PHẠM & NGỮ VĂN XUẤT SẮC',
    badgeType: 'stable',
    speed: 'Nhanh (0.8s - 1.5s)',
    accuracy: 'Văn phong đỉnh cao (99.8%)',
    contextWindow: '200,000 Tokens',
    description: 'Mô hình của Anthropic với khả năng diễn đạt tiếng Việt trau chuốt, tự nhiên, soạn thảo đề Ngữ văn và đọc hiểu rất tinh tế.',
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
    id: 'deepseek-v4-pro',
    name: 'DeepSeek-V4 Pro',
    provider: 'deepseek',
    providerName: 'DeepSeek AI',
    generation: 'V4 Pro',
    badge: 'COMPLEX REASONING • MỚI NHẤT',
    badgeType: 'latest',
    speed: 'Nhanh (0.8s - 1.5s)',
    accuracy: 'Toán học & Khoa học (99.95%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Mô hình thế hệ V4 Pro của DeepSeek với tư duy toán học và khoa học tự nhiên xuất sắc, suy luận từng bước chính xác.',
    recommendedFor: 'Toán học, Vật lý, Hóa học, Sinh học, Tin học, bài toán phân hóa vận dụng cao.',
    isLatest: true,
    supportsThinking: true,
  },
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek-V4 Flash',
    provider: 'deepseek',
    providerName: 'DeepSeek AI',
    generation: 'V4 Flash',
    badge: 'HIGH SPEED & COST-EFFECTIVE',
    badgeType: 'fast',
    speed: 'Siêu tốc (0.3s - 0.7s)',
    accuracy: 'Toán & Khoa học (99.2%)',
    contextWindow: '1,000,000 Tokens',
    description: 'Mô hình DeepSeek-V4 Flash thế hệ mới với hiệu năng cực cao, tốc độ tức thì và tối ưu chi phí tối đa.',
    recommendedFor: 'Trộn đề, tạo trắc nghiệm số lượng lớn, trích xuất ma trận nhanh.',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: 'deepseek',
    providerName: 'DeepSeek AI',
    generation: 'V3',
    badge: 'TOÁN HỌC & GIẢI THUẬT',
    badgeType: 'stable',
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

export const DEFAULT_PRIMARY_MODEL = 'gemini-3.8-flash';

// Mặc định chuỗi mô hình dự phòng (Default Fallback Chain)
export const DEFAULT_FALLBACK_CHAIN: string[] = [
  'gemini-3.8-flash',
  'gpt-6.1-sol',
  'claude-sonnet-5.5',
  'deepseek-v4-flash',
  'gemini-4-argon',
  'gemini-3.7-flash',
  'gpt-4o-mini',
  'claude-3-5-haiku'
];

/**
 * Lấy danh sách API Key lưu trữ từ LocalStorage (đồng bộ cả 2 chuẩn lưu trữ)
 */
export function getStoredApiKeys(): Record<AIProvider, string> {
  const geminiKey = localStorage.getItem('examgen_gemini_api_key') || localStorage.getItem('examgen_apikey_google') || '';
  const openaiKey = localStorage.getItem('examgen_openai_api_key') || localStorage.getItem('examgen_apikey_openai') || '';
  const copilotKey = localStorage.getItem('examgen_copilot_api_key') || localStorage.getItem('examgen_apikey_microsoft') || '';
  const claudeKey = localStorage.getItem('examgen_anthropic_api_key') || localStorage.getItem('examgen_apikey_anthropic') || '';
  const deepseekKey = localStorage.getItem('examgen_deepseek_api_key') || localStorage.getItem('examgen_apikey_deepseek') || '';

  return {
    gemini: geminiKey,
    openai: openaiKey,
    copilot: copilotKey,
    claude: claudeKey,
    deepseek: deepseekKey
  };
}

/**
 * Lưu API Key cho một nhà cung cấp cụ thể (đồng bộ cả 2 chuẩn lưu trữ)
 */
export function saveStoredApiKey(provider: AIProvider, key: string): void {
  const trimmed = key.trim();
  const info = AI_PROVIDERS[provider];
  if (info) {
    localStorage.setItem(info.keyStorageKey, trimmed);
  }
  // Đồng bộ khóa theo chuẩn examgen_apikey_${provider}
  const providerMapping: Record<AIProvider, string> = {
    gemini: 'google',
    openai: 'openai',
    copilot: 'microsoft',
    claude: 'anthropic',
    deepseek: 'deepseek'
  };
  const unifiedName = providerMapping[provider];
  if (unifiedName) {
    localStorage.setItem(`examgen_apikey_${unifiedName}`, trimmed);
  }
}
