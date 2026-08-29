import { GeneratedExamData, MixedExam } from '../types';
import { uploadHtmlDocumentToDrive } from './googleDriveService';

export interface ExamHistoryItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  examType: string;
  schoolName: string;
  province?: string;
  creatorName: string;
  createdAt: string;
  timestamp: number;
  questionCount: number;
  totalScore: number | string;
  method: 'auto' | 'semiAuto' | 'manual' | 'mixed' | 'ai';
  methodLabel: string;
  
  examData?: GeneratedExamData;
  mixedExamData?: MixedExam[];
  
  examContent?: string;
  answerContent?: string;
  
  isDriveSynced?: boolean;
  driveFileId?: string;
  driveLink?: string;
  description?: string;
}

const STORAGE_KEY = 'examgen_exam_history_v1';

const INITIAL_SAMPLE_HISTORY: ExamHistoryItem[] = [
  {
    id: 'exam-hist-sample-1',
    title: 'Đề thi Giữa học kỳ I - Ngữ văn 12 (Chuẩn GDPT 2018)',
    subject: 'Ngữ văn',
    grade: '12',
    examType: 'Kiểm tra Giữa học kỳ I',
    schoolName: 'THPT Chuyên Lê Khiết',
    province: 'Quảng Ngãi',
    creatorName: 'ThS. Nguyễn Văn Quản',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toLocaleString('vi-VN'),
    timestamp: Date.now() - 3600000 * 24 * 1,
    questionCount: 5,
    totalScore: '10.0',
    method: 'auto',
    methodLabel: 'AI Tự động (Gemini 3.7)',
    isDriveSynced: true,
    driveLink: 'https://drive.google.com',
    description: 'Đề thi cấu trúc 2 phần (I. Đọc hiểu 4 câu 3.0đ, II. Viết 1 câu 7.0đ) kèm biểu điểm đáp án chi tiết.',
    examContent: `<div style="font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 13pt;">
      <h3 style="text-align: center; font-weight: bold; margin-bottom: 4px;">SỞ GIÁO DỤC VÀ ĐÀO TẠO QUẢNG NGÃI</h3>
      <h4 style="text-align: center; font-weight: bold; margin-bottom: 16px;">ĐỀ KIỂM TRA GIỮA HỌC KỲ I - NĂM HỌC 2025 - 2026<br/>MÔN: NGỮ VẮN 12</h4>
      <p style="font-style: italic; text-align: center; margin-bottom: 20px;">Thời gian làm bài: 90 phút (Không kể thời gian phát đề)</p>
      
      <p style="font-weight: bold; font-size: 14pt; margin-top: 16px;">I. PHẦN ĐỌC HIỂU (3,0 điểm)</p>
      <div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #0d9488; margin: 12px 0;">
        <p style="font-style: italic;">"Sự tử tế là ngôn ngữ mà người điếc có thể nghe và người mù có thể thấy. Trong một thế giới có quá nhiều tiếng ồn và sự vội vã, một hành động tử tế nhỏ bé giống như một luồng gió mát lành xua tan đi sự oi nồng của vất vả..."</p>
      </div>
      <p style="margin-top: 8px;"><strong>Câu 1 (0,75 điểm):</strong> Xác định phương thức biểu đạt chính được sử dụng trong đoạn trích trên.</p>
      <p style="margin-top: 8px;"><strong>Câu 2 (0,75 điểm):</strong> Theo tác giả, sự tử tế được ví với điều gì trong thế giới nhiều tiếng ồn?</p>
      <p style="margin-top: 8px;"><strong>Câu 3 (1,0 điểm):</strong> Anh/chị hiểu như thế nào về câu nói: <em>"Sự tử tế là ngôn ngữ mà người điếc có thể nghe và người mù có thể thấy"</em>?</p>
      <p style="margin-top: 8px;"><strong>Câu 4 (0,5 điểm):</strong> Thông điệp nào trong đoạn trích có ý nghĩa nhất đối với anh/chị?</p>
      
      <p style="font-weight: bold; font-size: 14pt; margin-top: 24px;">II. PHẦN VIẾT (7,0 điểm)</p>
      <p style="margin-top: 8px;">Từ nội dung phần Đọc hiểu, anh/chị hãy viết một bài văn nghị luận (khoảng 600 chữ) trình bày suy nghĩ về ý nghĩa của lối sống tử tế đối với tuổi trẻ trong xã hội hiện đại.</p>
    </div>`,
    answerContent: `<div style="font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 13pt;">
      <h3 style="text-align: center; font-weight: bold; color: #0d9488;">ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM NGỮ VĂN 12</h3>
      <p style="font-weight: bold; margin-top: 16px;">I. PHẦN ĐỌC HIỂU (3,0 điểm)</p>
      <p><strong>Câu 1 (0,75đ):</strong> Phương thức biểu đạt chính: Nghị luận.</p>
      <p><strong>Câu 2 (0,75đ):</strong> Sự tử tế được ví như luồng gió mát lành xua tan sự oi nồng vất vả.</p>
      <p><strong>Câu 3 (1,0đ):</strong> Tử tế là giá trị cảm nhận bằng trái tim, vượt qua rào cản ngôn ngữ hay thể chất.</p>
      <p><strong>Câu 4 (0,5đ):</strong> Học sinh nêu 1 thông điệp tích cực và lý giải hợp lý.</p>
      <p style="font-weight: bold; margin-top: 16px;">II. PHẦN VIẾT (7,0 điểm)</p>
      <p>- Mở bài (0,5đ): Giới thiệu vấn đề nghị luận.</p>
      <p>- Thân bài (5,5đ): Giải thích lối sống tử tế (1.0đ), Phân tích ý nghĩa (3.0đ), Phản biện và bài học (1.5đ).</p>
      <p>- Kết bài (1,0đ): Khẳng định lại giá trị và thông điệp hành động.</p>
    </div>`
  },
  {
    id: 'exam-hist-sample-2',
    title: 'Đề kiểm tra Cuối học kỳ I - Toán 12 (Đã trộn 4 mã đề)',
    subject: 'Toán',
    grade: '12',
    examType: 'Kiểm tra Cuối học kỳ I',
    schoolName: 'THPT Trần Quốc Tuấn',
    province: 'Quảng Ngãi',
    creatorName: 'Cô Trần Thị Hồng',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toLocaleString('vi-VN'),
    timestamp: Date.now() - 3600000 * 24 * 3,
    questionCount: 40,
    totalScore: '10.0',
    method: 'mixed',
    methodLabel: 'Trộn mã đề (4 mã đề: 101, 102, 103, 104)',
    isDriveSynced: true,
    description: 'Đề thi trắc nghiệm Toán 12 gồm 4 phần (Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn, Tự luận) đã trộn ra 4 mã đề chuẩn.',
    mixedExamData: [
      { code: '101', examContent: 'Nội dung đề thi mã 101 môn Toán 12...', answerContent: 'Đáp án mã đề 101: 1A 2B 3C 4D 5A...' },
      { code: '102', examContent: 'Nội dung đề thi mã 102 môn Toán 12...', answerContent: 'Đáp án mã đề 102: 1C 2A 3D 4B 5C...' },
      { code: '103', examContent: 'Nội dung đề thi mã 103 môn Toán 12...', answerContent: 'Đáp án mã đề 103: 1D 2C 3A 4A 5B...' },
      { code: '104', examContent: 'Nội dung đề thi mã 104 môn Toán 12...', answerContent: 'Đáp án mã đề 104: 1B 2D 3B 4C 5D...' },
    ]
  },
  {
    id: 'exam-hist-sample-3',
    title: 'Thi thử Tốt nghiệp THPT - Tiếng Anh 12 (Ma trận 7991)',
    subject: 'Tiếng Anh',
    grade: '12',
    examType: 'Thi thử tốt nghiệp THPT',
    schoolName: 'THPT Chu Văn An',
    province: 'Hà Nội',
    creatorName: 'ThS. Hoàng Anh Tuấn',
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toLocaleString('vi-VN'),
    timestamp: Date.now() - 3600000 * 24 * 6,
    questionCount: 40,
    totalScore: '10.0',
    method: 'semiAuto',
    methodLabel: 'Bán tự động / Ma trận CV 7991',
    isDriveSynced: false,
    description: 'Đề thi thử THPT Quốc gia môn Tiếng Anh cập nhật dạng bài đọc điền từ, sắp xếp câu và đọc hiểu bản tin mới nhất.'
  },
  {
    id: 'exam-hist-sample-4',
    title: 'Đề kiểm tra 15 phút - Hóa học 12 (Chủ đề Este & Lipit)',
    subject: 'Hóa học',
    grade: '12',
    examType: 'Kiểm tra thường xuyên (15 phút)',
    schoolName: 'THPT Bình Sơn',
    province: 'Quảng Ngãi',
    creatorName: 'ThS. Phạm Văn Minh',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toLocaleString('vi-VN'),
    timestamp: Date.now() - 3600000 * 24 * 10,
    questionCount: 15,
    totalScore: '10.0',
    method: 'manual',
    methodLabel: 'Tạo thủ công theo chủ đề',
    isDriveSynced: true,
    description: '15 câu trắc nghiệm kiểm tra mức độ Nhận biết và Thông hiểu kiến thức Este - Lipit.'
  }
];

export const getExamHistory = (): ExamHistoryItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse exam history from localStorage:', e);
  }
  return INITIAL_SAMPLE_HISTORY;
};

export const saveExamHistoryItem = (item: Partial<ExamHistoryItem>): ExamHistoryItem => {
  const currentHistory = getExamHistory();
  const newItem: ExamHistoryItem = {
    id: item.id || `exam-hist-${Date.now()}`,
    title: item.title || 'Đề thi chưa đặt tên',
    subject: item.subject || 'Tổng hợp',
    grade: item.grade || '12',
    examType: item.examType || 'Kiểm tra định kỳ',
    schoolName: item.schoolName || 'Trường THPT',
    province: item.province || '',
    creatorName: item.creatorName || 'Giáo viên',
    createdAt: item.createdAt || new Date().toLocaleString('vi-VN'),
    timestamp: item.timestamp || Date.now(),
    questionCount: item.questionCount || 0,
    totalScore: item.totalScore || '10.0',
    method: item.method || 'auto',
    methodLabel: item.methodLabel || 'Tạo tự động',
    examData: item.examData,
    mixedExamData: item.mixedExamData,
    examContent: item.examContent,
    answerContent: item.answerContent,
    isDriveSynced: item.isDriveSynced || false,
    driveFileId: item.driveFileId,
    driveLink: item.driveLink,
    description: item.description || ''
  };

  const updatedHistory = [newItem, ...currentHistory.filter(h => h.id !== newItem.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error('Failed to save exam history to localStorage:', e);
  }
  return newItem;
};

export const deleteExamHistoryItem = (id: string): ExamHistoryItem[] => {
  const currentHistory = getExamHistory();
  const updated = currentHistory.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update exam history after deletion:', e);
  }
  return updated;
};

export const clearAllExamHistory = (): ExamHistoryItem[] => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear exam history:', e);
  }
  return [];
};

export const restoreSampleExamHistory = (): ExamHistoryItem[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_HISTORY));
  } catch (e) {
    console.error('Failed to restore sample exam history:', e);
  }
  return INITIAL_SAMPLE_HISTORY;
};

export const syncExamToDrive = async (item: ExamHistoryItem): Promise<{ webViewLink?: string; name?: string }> => {
  const content = item.examContent || '<h1>Nội dung đề thi</h1>';
  const docName = `${item.subject}_${item.grade}_${item.title.replace(/[^a-zA-Z0-9_ -]/g, '')}`;
  const res = await uploadHtmlDocumentToDrive(content, docName);
  
  if (res.webViewLink) {
    item.isDriveSynced = true;
    item.driveLink = res.webViewLink;
    saveExamHistoryItem(item);
  }
  return res;
};
