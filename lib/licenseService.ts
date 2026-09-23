import { User } from '../types';
import { updateUserInCloud } from './userService';

/**
 * HỆ THỐNG QUẢN LÝ BẢN QUYỀN THEO TÀI KHOẢN - EXAMGEN ULTRA
 * Bản quyền được gán ĐỘC LẬP theo từng Tài khoản Người dùng (User Account).
 * Kích hoạt một người dùng TUYỆT ĐỐI KHÔNG ảnh hưởng hay kích hoạt các tài khoản khác.
 * Đồng bộ Cloud Firestore thời gian thực trên mọi thiết bị.
 */

// Danh sách các Mã kích hoạt Vạn năng (Universal Master Keys) do Quản trị viên cấp dùng chung
export const MASTER_LICENSE_KEYS = [
  'EG-VIP-2026',
  'EG-ULTRA-PRO',
  'EG-TEACHER-PASS',
  'EG-FULL-ACCESS-2026',
  'EG-THPT-2026',
  'EG-PRO-SPECIAL-2026',
];

const CUSTOM_KEYS_STORAGE_KEY = 'examgen_custom_license_keys';
const USER_LICENSE_PREFIX = 'examgen_user_license_';

// Tự động dọn dẹp biến global cũ (nếu có) để tránh hiện tượng kích hoạt toàn bộ
try {
  localStorage.removeItem('examgen_license_key');
  localStorage.removeItem('examgen_license_global');
} catch {}

/**
 * Thuật toán tạo mã bản quyền ĐỘC QUYỀN theo Tên tài khoản (Account-based License Key)
 * Chỉ tài khoản có đúng Username này mới được kích hoạt bằng mã này.
 */
export function generateAccountLicenseKey(username: string): string {
  if (!username) return 'EG-PRO-USER-8888';
  const clean = username.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Tính checksum toán học 4 chữ số từ chuỗi username
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const checksum = Math.abs(hash % 9000) + 1000;
  return `EG-PRO-${clean}-${checksum}`;
}

/**
 * Tạo mã kích hoạt ngẫu nhiên theo tiêu chuẩn trường học
 */
export function generateUniversalKey(label: string = 'VIP'): string {
  const cleanLabel = label.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || 'VIP';
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const year = new Date().getFullYear();
  return `EG-${cleanLabel}-${randomPart}-${year}`;
}

/**
 * Lấy danh sách các mã kích hoạt tùy chỉnh đã được Quản trị viên tạo
 */
export function getCustomLicenseKeys(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEYS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu thêm mã kích hoạt mới do Quản trị viên tạo vào hệ thống
 */
export function addCustomLicenseKey(key: string): void {
  const keys = getCustomLicenseKeys();
  const upper = key.trim().toUpperCase();
  if (upper && !keys.includes(upper)) {
    keys.unshift(upper);
    localStorage.setItem(CUSTOM_KEYS_STORAGE_KEY, JSON.stringify(keys));
  }
}

/**
 * Kiểm tra tính hợp lệ của mã kích hoạt bản quyền cho MỘT người dùng cụ thể
 * Nghiêm ngặt: Mã cấp cho tài khoản A KHÔNG THỂ kích hoạt cho tài khoản B.
 */
export function verifyLicenseKey(
  inputKey: string,
  user?: User | null
): { valid: boolean; type: string; message: string } {
  if (!inputKey || !inputKey.trim()) {
    return { valid: false, type: 'invalid', message: 'Vui lòng nhập mã kích hoạt bản quyền.' };
  }

  const cleanKey = inputKey.trim().toUpperCase();

  // 1. Kiểm tra trong danh sách Master Keys vạn năng
  if (MASTER_LICENSE_KEYS.map(k => k.toUpperCase()).includes(cleanKey)) {
    return {
      valid: true,
      type: 'Master VIP',
      message: 'Mã kích hoạt Master VIP hợp lệ! Bản quyền vĩnh viễn đã được mở khóa.',
    };
  }

  // 2. Kiểm tra trong danh sách Custom Keys do Quản trị viên cấp riêng
  const customKeys = getCustomLicenseKeys();
  if (customKeys.includes(cleanKey)) {
    return {
      valid: true,
      type: 'Quản trị viên cấp',
      message: 'Mã kích hoạt của Quản trị viên hợp lệ! Bản quyền đã được kích hoạt thành công.',
    };
  }

  // 3. Nếu là mã theo tài khoản dạng: EG-PRO-{USERNAME}-{CHECKSUM}
  const accountKeyMatch = cleanKey.match(/^EG-PRO-([A-Z0-9]+)-(\d{4})$/);
  if (accountKeyMatch) {
    const keyUsername = accountKeyMatch[1];
    
    // Nếu có đối tượng user được cung cấp để đối chiếu
    if (user && user.username) {
      const cleanUser = user.username.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const expectedKey = generateAccountLicenseKey(user.username).toUpperCase();
      
      if (keyUsername === cleanUser && cleanKey === expectedKey) {
        return {
          valid: true,
          type: 'Bản quyền theo Tài khoản',
          message: `Mã kích hoạt chính thức cho tài khoản ${user.username} hợp lệ!`,
        };
      } else {
        return {
          valid: false,
          type: 'invalid',
          message: `Mã kích hoạt này cấp riêng cho tài khoản "${keyUsername}", không thể áp dụng cho tài khoản "${user.username}".`,
        };
      }
    } else {
      // Không truyền user, chỉ chấp nhận nếu mã nằm trong custom keys
      if (customKeys.includes(cleanKey)) {
        return {
          valid: true,
          type: 'Bản quyền theo Tài khoản',
          message: 'Mã kích hoạt hợp lệ.',
        };
      }
    }
  }

  // 4. Mã bản quyền theo trường (chỉ hợp lệ nếu Quản trị viên đã tạo và lưu trong customKeys)
  const universalKeyPattern = /^EG-[A-Z0-9]+-[A-Z0-9]+-\d{4}$/;
  if (universalKeyPattern.test(cleanKey) && customKeys.includes(cleanKey)) {
    return {
      valid: true,
      type: 'Bản quyền Toàn trường',
      message: 'Mã kích hoạt bản quyền trường học hợp lệ!',
    };
  }

  return {
    valid: false,
    type: 'invalid',
    message: 'Mã kích hoạt không đúng hoặc chưa được hệ thống cấp phép. Vui lòng kiểm tra lại hoặc liên hệ Quản trị viên.',
  };
}

/**
 * Kiểm tra xem MỘT NGƯỜI DÙNG CỤ THỂ đã có bản quyền hay chưa
 * TUYỆT ĐỐI CHỈ DỰA TRÊN DỮ LIỆU CỦA ĐÚNG NGƯỜI DÙNG ĐÓ.
 */
export function checkIsUserLicensed(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // 1. Quản trị hệ thống luôn có bản quyền
  if (user.role === 'Quản trị hệ thống') return true;

  // 2. Kiểm tra cờ isLicensed được kích hoạt trên chính tài khoản này
  if (user.isLicensed === true) return true;

  // 3. Nếu tài khoản có licenseKey riêng gắn trong hồ sơ
  if (user.licenseKey && typeof user.licenseKey === 'string' && user.licenseKey.trim()) {
    const check = verifyLicenseKey(user.licenseKey, user);
    if (check.valid) return true;
  }

  // 4. Kiểm tra bộ nhớ cục bộ DÀNH RIÊNG CHO USERNAME NÀY (Không dùng chung)
  if (user.username) {
    try {
      const savedUserKey = localStorage.getItem(`${USER_LICENSE_PREFIX}${user.username.toLowerCase()}`);
      if (savedUserKey) {
        const check = verifyLicenseKey(savedUserKey, user);
        if (check.valid) return true;
      }
    } catch {}
  }

  // Mặc định: Chưa được kích hoạt (đang dùng thử)
  return false;
}

/**
 * Kích hoạt bản quyền cho DUY NHẤT một tài khoản người dùng được chọn
 * Lưu vào Cloud Firestore và lưu bộ nhớ cục bộ theo username của người đó.
 */
export async function activateUserAccount(user: User, key?: string): Promise<User> {
  const activationKey = key || generateAccountLicenseKey(user.username);
  const now = new Date().toISOString();

  const updatedUser: User = {
    ...user,
    isLicensed: true,
    licenseKey: activationKey,
    licenseType: 'Vĩnh viễn (Đồng bộ Cloud)',
    licenseActivatedAt: now,
  };
  delete updatedUser.usageLimit; // Hủy bỏ giới hạn dùng thử

  // Lưu trữ cục bộ RIÊNG BIỆT cho tài khoản này (không lưu global key)
  try {
    localStorage.setItem(`${USER_LICENSE_PREFIX}${user.username.toLowerCase()}`, activationKey);
    // Xóa triệt để các key global cũ tránh ô nhiễm trạng thái
    localStorage.removeItem('examgen_license_key');
  } catch {}

  // Đồng bộ lên Cloud Firestore
  try {
    await updateUserInCloud(user.id, {
      isLicensed: true,
      licenseKey: activationKey,
      licenseType: 'Vĩnh viễn (Đồng bộ Cloud)',
      licenseActivatedAt: now,
      usageLimit: 999999,
    });
  } catch (err) {
    console.warn("Không thể lưu trạng thái bản quyền lên Firestore, sẽ duy trì trong cache cục bộ:", err);
  }

  return updatedUser;
}

/**
 * Chuyển tài khoản người dùng về trạng thái dùng thử (Dành cho Quản trị viên)
 */
export async function deactivateUserAccount(user: User, trialLimit: number = 5): Promise<User> {
  const updatedUser: User = {
    ...user,
    isLicensed: false,
    usageLimit: trialLimit,
    licenseType: 'Dùng thử',
    licenseKey: '',
  };

  try {
    localStorage.removeItem(`${USER_LICENSE_PREFIX}${user.username.toLowerCase()}`);
    localStorage.removeItem('examgen_license_key');
  } catch {}

  try {
    await updateUserInCloud(user.id, {
      isLicensed: false,
      usageLimit: trialLimit,
      licenseType: 'Dùng thử',
      licenseKey: '',
    });
  } catch (err) {
    console.warn("Lỗi khi cập nhật Firestore:", err);
  }

  return updatedUser;
}
