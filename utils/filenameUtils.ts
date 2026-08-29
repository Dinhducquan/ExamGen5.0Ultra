export interface FilenameMetadata {
  docType?: string;      // e.g. "Ma Trận", "Bảng Đặc Tả", "Đề Thi", "Đáp Án", "Đề Cương"
  subject?: string;      // e.g. "Hóa Học", "Ngữ văn", "Toán"
  grade?: string;        // e.g. "12", "Lớp 12", "Khối 12"
  examType?: string;     // e.g. "Giữa kỳ I", "Cuối kỳ II", "Kiểm tra Giữa học kỳ I"
  schoolYear?: string;   // e.g. "2026–2027", "2026-2027", "2026 2027"
}

/**
 * Removes Vietnamese diacritics (accents) from a string.
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Cleans a text segment by removing accents, special punctuation, underscores,
 * collapsing spaces, and capitalizing words nicely while keeping Roman numerals uppercase.
 */
export function cleanSegment(str: string): string {
  if (!str) return '';
  const unaccented = removeVietnameseAccents(str)
    .replace(/[_\\/:\*\?\"<>\|,\.\-\–\—\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!unaccented) return '';

  return unaccented
    .split(' ')
    .map((word) => {
      if (!word) return '';
      if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|THPT|TNTHPT|LMS|CSV|DOCX|XLSX)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Normalizes document type strings (e.g. "Ma Trận" -> "Ma Tran", "Bảng Đặc Tả" -> "Bang Dac Ta")
 */
export function formatDocType(docType?: string): string {
  if (!docType) return 'Tai Lieu';
  let s = docType.replace(/([a-z])([A-Z])/g, '$1 $2');
  s = cleanSegment(s);
  s = s
    .replace(/\bMa\s*Tran\b/gi, 'Ma Tran')
    .replace(/\bDe\s*Thi\b/gi, 'De Thi')
    .replace(/\bDap\s*An\b/gi, 'Dap An')
    .replace(/\bDe\s*Cuong\b/gi, 'De Cuong')
    .replace(/\bBang\s*Dac\s*Ta\b/gi, 'Bang Dac Ta')
    .replace(/\bBao\s*Cao\b/gi, 'Bao Cao');
  return cleanSegment(s);
}

/**
 * Normalizes grade string (e.g. "12", "Lớp 12", "Khối 12" -> "12")
 */
export function formatGrade(grade?: string): string {
  if (!grade) return '';
  const cleaned = cleanSegment(grade);
  const match = cleaned.match(/\d+|TNTHPT/i);
  if (match) {
    return match[0].toUpperCase();
  }
  return cleaned;
}

/**
 * Normalizes exam type string (e.g. "Kiểm tra Giữa học kỳ I" -> "Giua Ky I")
 */
export function formatExamType(examType?: string): string {
  if (!examType) return '';
  let cleaned = cleanSegment(examType);
  cleaned = cleaned.replace(/^Kiem Tra\s+/i, '');
  cleaned = cleaned.replace(/Hoc Ky/gi, 'Ky');
  return cleanSegment(cleaned);
}

/**
 * Normalizes school year string (e.g. "2026–2027" -> "2026 2027")
 */
export function formatSchoolYear(schoolYear?: string): string {
  if (!schoolYear) return '';
  return cleanSegment(schoolYear);
}

/**
 * Automatically builds standard filename according to pattern:
 * [Loại tài liệu] [Môn học] [Khối lớp] [Kỳ thi] [Năm học].[định dạng]
 * Example: "Ma Tran Hoa Hoc 12 Giua Ky I 2026 2027.xlsx"
 */
export function generateAutoFilename(
  meta?: FilenameMetadata | string,
  extension?: string,
  fallbackMeta?: FilenameMetadata
): string {
  let docType = '';
  let subject = '';
  let grade = '';
  let examType = '';
  let schoolYear = '';

  if (typeof meta === 'string') {
    docType = meta;
    if (fallbackMeta) {
      subject = fallbackMeta.subject || '';
      grade = fallbackMeta.grade || '';
      examType = fallbackMeta.examType || '';
      schoolYear = fallbackMeta.schoolYear || '';
    }
  } else if (meta) {
    docType = meta.docType || '';
    subject = meta.subject || '';
    grade = meta.grade || '';
    examType = meta.examType || '';
    schoolYear = meta.schoolYear || '';
  }

  const parts = [
    formatDocType(docType),
    cleanSegment(subject),
    formatGrade(grade),
    formatExamType(examType),
    formatSchoolYear(schoolYear),
  ].filter(Boolean);

  let baseName = parts.join(' ').replace(/\s+/g, ' ').trim();

  if (!baseName) {
    baseName = 'Tai Lieu ExamGen';
  }

  if (extension) {
    const ext = extension.startsWith('.') ? extension : '.' + extension;
    const re = new RegExp(`\\${ext}$`, 'i');
    baseName = baseName.replace(re, '');
    return `${baseName}${ext}`;
  }

  return baseName;
}
