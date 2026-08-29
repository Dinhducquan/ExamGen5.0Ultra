import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const createGoogleDriveProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.setCustomParameters({ prompt: 'consent' });
  return provider;
};

export const googleSignInForDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const provider = createGoogleDriveProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không thể nhận token ủy quyền từ Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Lỗi đăng nhập Google Drive OAuth:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const formatQuestionsToHTML = (questions: any[]): string => {
  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'biet': return 'Nhận biết';
      case 'hieu': return 'Thông hiểu';
      case 'vd': return 'Vận dụng';
      case 'vdCao': return 'Vận dụng cao';
      default: return lvl;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multipleChoice': return 'Trắc nghiệm 4 phương án';
      case 'trueFalse': return 'Đúng / Sai';
      case 'shortAnswer': return 'Trả lời ngắn';
      case 'essay': return 'Tự luận';
      default: return type;
    }
  };

  const questionsHTML = questions.map((q, idx) => {
    const optionsHTML = q.options && q.options.length > 0
      ? `<div style="margin-top: 8px; margin-bottom: 8px; padding-left: 16px;">
          ${q.options.map((opt: string) => `<p style="margin: 4px 0; font-size: 14px;"><strong>${opt}</strong></p>`).join('')}
         </div>`
      : '';

    const explanationHTML = q.explanation
      ? `<p style="margin: 4px 0 0 0; font-style: italic; color: #4b5563;"><strong>Lời giải chi tiết:</strong> ${q.explanation}</p>`
      : '';

    return `
      <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #ffffff;">
        <div style="font-size: 12px; font-weight: bold; color: #2563eb; margin-bottom: 6px; text-transform: uppercase;">
          [${q.id}] • Môn: ${q.subject} - ${q.grade} | Chủ đề: ${q.topic} | Dạng: ${getTypeLabel(q.type)} | Mức độ: ${getLevelLabel(q.level)}
        </div>
        <div style="font-size: 15px; font-weight: bold; color: #111827; margin-bottom: 8px;">
          Câu ${idx + 1}: ${q.content}
        </div>
        ${optionsHTML}
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px; margin-top: 8px; font-size: 13px; color: #14532d;">
          <p style="margin: 0; font-weight: bold;">Đáp án chuẩn: ${q.answer}</p>
          ${explanationHTML}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ngân hàng câu hỏi - ExamGen Ultra 5.0</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; color: #111827; margin: 40px; }
        h1 { font-family: Arial, sans-serif; text-align: center; color: #1e3a8a; font-size: 20pt; text-transform: uppercase; margin-bottom: 4px; }
        .sub-header { font-family: Arial, sans-serif; text-align: center; color: #6b7280; font-size: 11pt; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 12px; }
      </style>
    </head>
    <body>
      <h1>NGÂN HÀNG CÂU HỎI CHUẨN GDPT 2018</h1>
      <div class="sub-header">
        Được xuất tự động từ ứng dụng <strong>ExamGen Ultra 5.0</strong> | Tổng số: <strong>${questions.length} câu hỏi</strong> | Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
      </div>
      ${questionsHTML}
    </body>
    </html>
  `;
};

const FOLDER_NAME = 'Tài liệu lưu trữ ExamGen Ultra 5.0';
let cachedFolderId: string | null = null;

export const getOrCreateExamGenFolder = async (token: string): Promise<string> => {
  if (cachedFolderId) {
    return cachedFolderId;
  }
  try {
    const safeFolderName = FOLDER_NAME.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const query = `name = '${safeFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        cachedFolderId = searchData.files[0].id;
        return cachedFolderId;
      }
    } else {
      const errText = await searchRes.text();
      console.warn('Drive folder search status:', searchRes.status, errText);
      if (searchRes.status === 401 || searchRes.status === 403) {
        cachedAccessToken = null;
        throw new Error('Phiên làm việc Google Drive đã hết hạn hoặc chưa đủ quyền. Vui lòng bấm ủy quyền lại.');
      }
    }

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (createRes.ok) {
      const createData = await createRes.json();
      if (createData.id) {
        cachedFolderId = createData.id;
        return cachedFolderId;
      }
    }

    const errText = await createRes.text();
    console.error('Drive folder creation status:', createRes.status, errText);
    if (createRes.status === 401 || createRes.status === 403) {
      cachedAccessToken = null;
      throw new Error('Phiên làm việc Google Drive đã hết hạn hoặc chưa đủ quyền. Vui lòng bấm ủy quyền lại.');
    }
    throw new Error(`Không thể tạo thư mục "${FOLDER_NAME}" trên Google Drive (${createRes.status}): ${errText}`);
  } catch (err: any) {
    console.error('Could not create or find ExamGen folder in Drive:', err);
    throw err;
  }
};

export const uploadQuestionBankToDrive = async (
  questions: any[],
  customFileName?: string,
  isRetry = false
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  let token = getDriveAccessToken();
  
  if (!token) {
    const authRes = await googleSignInForDrive();
    token = authRes.accessToken;
  }

  const fileName = customFileName || `Tài liệu Ngân hàng Câu hỏi ExamGen (${new Date().toLocaleDateString('vi-VN')})`;
  let folderId: string;
  try {
    folderId = await getOrCreateExamGenFolder(token);
  } catch (err: any) {
    if (!isRetry && (err.message?.includes('hết hạn') || err.message?.includes('quyền'))) {
      const authRes = await googleSignInForDrive();
      return uploadQuestionBankToDrive(questions, customFileName, true);
    }
    throw err;
  }
  
  // Notice: mimeType application/vnd.google-apps.document converts HTML content directly into native Google Docs!
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.document',
    description: 'Ngân hàng câu hỏi dạng Google Tài liệu (Google Docs) được tạo từ ExamGen Ultra 5.0',
    parents: [folderId]
  };

  const fileData = formatQuestionsToHTML(questions);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    fileData +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error('Drive API Error:', errText);
    if (response.status === 401 || response.status === 403) {
      cachedAccessToken = null; // Clear expired token
      if (!isRetry) {
        return uploadQuestionBankToDrive(questions, customFileName, true);
      }
      throw new Error('Phiên làm việc Google Drive đã hết hạn hoặc chưa đủ quyền. Vui lòng bấm ủy quyền lại.');
    }
    throw new Error(`Đẩy file lên Google Drive thất bại (${response.status})`);
  }

  const result = await response.json();
  return result;
};

export const uploadHtmlDocumentToDrive = async (
  innerHtmlContent: string,
  docTitle: string,
  description?: string,
  isRetry = false
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  let token = getDriveAccessToken();
  
  if (!token) {
    const authRes = await googleSignInForDrive();
    token = authRes.accessToken;
  }

  const fileName = `${docTitle} (${new Date().toLocaleDateString('vi-VN')})`;
  let folderId: string;
  try {
    folderId = await getOrCreateExamGenFolder(token);
  } catch (err: any) {
    if (!isRetry && (err.message?.includes('hết hạn') || err.message?.includes('quyền'))) {
      const authRes = await googleSignInForDrive();
      return uploadHtmlDocumentToDrive(innerHtmlContent, docTitle, description, true);
    }
    throw err;
  }

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.document',
    description: description || 'Tài liệu xuất tự động từ ứng dụng ExamGen Ultra 5.0',
    parents: [folderId]
  };

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${docTitle}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #111827; margin: 30px; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; border: 1px solid #000000; }
        th, td { border: 1px solid #000000; padding: 6px 10px; font-size: 11pt; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; text-align: center; }
        h1, h2, h3 { font-family: Arial, sans-serif; text-align: center; margin-top: 12px; margin-bottom: 8px; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .border { border: 1px solid #000000; }
      </style>
    </head>
    <body>
      ${innerHtmlContent}
    </body>
    </html>
  `;

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    fullHtml +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error('Drive API Error:', errText);
    if (response.status === 401 || response.status === 403) {
      cachedAccessToken = null;
      if (!isRetry) {
        return uploadHtmlDocumentToDrive(innerHtmlContent, docTitle, description, true);
      }
      throw new Error('Phiên làm việc Google Drive đã hết hạn hoặc chưa đủ quyền. Vui lòng bấm ủy quyền lại.');
    }
    throw new Error(`Đẩy file lên Google Drive thất bại (${response.status})`);
  }

  const result = await response.json();
  return result;
};

export const getExamGenFolderDetails = async (isRetry = false): Promise<{ id: string; webViewLink: string }> => {
  let token = getDriveAccessToken();
  if (!token) {
    const authRes = await googleSignInForDrive();
    token = authRes.accessToken;
  }

  try {
    const folderId = await getOrCreateExamGenFolder(token);
    return {
      id: folderId,
      webViewLink: `https://drive.google.com/drive/u/0/folders/${folderId}`
    };
  } catch (err: any) {
    if (!isRetry && (err.message?.includes('hết hạn') || err.message?.includes('quyền'))) {
      await googleSignInForDrive();
      return getExamGenFolderDetails(true);
    }
    throw err;
  }
};

export interface DriveDocFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
  category?: string;
}

export const listExamGenFolderFiles = async (isRetry = false): Promise<DriveDocFile[]> => {
  let token = getDriveAccessToken();
  if (!token) {
    const authRes = await googleSignInForDrive();
    token = authRes.accessToken;
  }

  try {
    const folderId = await getOrCreateExamGenFolder(token);
    const query = `'${folderId}' in parents and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,createdTime,modifiedTime,size,iconLink)&orderBy=modifiedTime desc`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        cachedAccessToken = null;
        if (!isRetry) {
          await googleSignInForDrive();
          return listExamGenFolderFiles(true);
        }
      }
      throw new Error(`Không thể lấy danh sách file từ Google Drive (${response.status})`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (err: any) {
    console.error('List Drive files error:', err);
    throw err;
  }
};

export const uploadRawFileToDrive = async (
  file: File,
  categoryLabel?: string,
  isRetry = false
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  let token = getDriveAccessToken();
  if (!token) {
    const authRes = await googleSignInForDrive();
    token = authRes.accessToken;
  }

  try {
    const folderId = await getOrCreateExamGenFolder(token);
    const metadata = {
      name: file.name,
      description: categoryLabel ? `Tài liệu dạng ${categoryLabel} được tải lên từ ExamGen Ultra 5.0` : 'Tài liệu từ ExamGen Ultra 5.0',
      parents: [folderId]
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    const metadataPart = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + delimiter + `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;
    const metadataEncoder = new TextEncoder();
    const metadataBytes = metadataEncoder.encode(metadataPart);
    const closeBytes = metadataEncoder.encode(closeDelimiter);

    const combinedBuffer = new Uint8Array(metadataBytes.length + bytes.length + closeBytes.length);
    combinedBuffer.set(metadataBytes, 0);
    combinedBuffer.set(bytes, metadataBytes.length);
    combinedBuffer.set(closeBytes, metadataBytes.length + bytes.length);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: combinedBuffer
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        cachedAccessToken = null;
        if (!isRetry) {
          const authRes = await googleSignInForDrive();
          return uploadRawFileToDrive(file, categoryLabel, true);
        }
      }
      throw new Error(`Không thể tải file lên Google Drive (${response.status})`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Upload raw file to Drive error:', err);
    throw err;
  }
};

export const deleteDriveFile = async (fileId: string, isRetry = false): Promise<boolean> => {
  let token = getDriveAccessToken();
  if (!token) {
    const authRes = await googleSignInForDrive();
    token = authRes.accessToken;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        cachedAccessToken = null;
        if (!isRetry) {
          await googleSignInForDrive();
          return deleteDriveFile(fileId, true);
        }
      }
      throw new Error(`Không thể xóa file trên Google Drive (${response.status})`);
    }

    return true;
  } catch (err: any) {
    console.error('Delete drive file error:', err);
    throw err;
  }
};
