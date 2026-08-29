import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "../types";

export const INITIAL_DEFAULT_USERS: User[] = [
  {
    id: 99,
    name: "Đinh Đức Quân",
    username: "admin",
    password: "admin@123",
    email: "dinhducquan@examgen.pro",
    role: "Quản trị hệ thống",
    school: "ExamGen Ultra AI",
    profGroup: "Quản trị",
    status: "Hoạt động",
    lastLogin: "2025-08-18 09:00",
    avatar: "https://i.imgur.com/of8t0I5.png",
    usageCount: 42,
    tokenUsage: 123456
  },
  {
    id: 98,
    name: "Võ Thị Thu Thủy",
    username: "thuyvo",
    password: "thuyvo@123",
    email: "thuyvo@gmail.com",
    role: "Giáo viên",
    school: "THPT Bình Sơn",
    profGroup: "Ngoại ngữ",
    status: "Hoạt động",
    lastLogin: "2025-08-18 08:30",
    avatar: "https://i.pravatar.cc/150?u=thuyvo",
    usageCount: 1,
    usageLimit: 10,
    tokenUsage: 0
  },
  {
    id: 97,
    name: "Giáo viên Toán (Mẫu)",
    username: "teacher",
    password: "123",
    email: "teacher@example.com",
    role: "Giáo viên",
    school: "THPT Trần Quốc Tuấn",
    profGroup: "Toán",
    status: "Hoạt động",
    lastLogin: "",
    avatar: "https://i.pravatar.cc/150?u=teacher",
    usageCount: 0,
    usageLimit: 5,
    tokenUsage: 0
  },
  {
    id: 96,
    name: "Giáo viên Vật lý (Mẫu)",
    username: "teacher1",
    password: "123",
    email: "teacher1@example.com",
    role: "Giáo viên",
    school: "THPT Chuyên Lê Khiết",
    profGroup: "Vật lý - Công nghệ",
    status: "Hoạt động",
    lastLogin: "",
    avatar: "https://i.pravatar.cc/150?u=teacher1",
    usageCount: 0,
    usageLimit: 5,
    tokenUsage: 0
  },
  {
    id: 95,
    name: "Giáo viên Ngữ văn (Mẫu)",
    username: "teacher2",
    password: "123",
    email: "teacher2@example.com",
    role: "Giáo viên",
    school: "THPT Bình Sơn",
    profGroup: "Ngữ văn",
    status: "Hoạt động",
    lastLogin: "",
    avatar: "https://i.pravatar.cc/150?u=teacher2",
    usageCount: 0,
    usageLimit: 5,
    tokenUsage: 0
  }
];

const USERS_COLLECTION = "users";

// Helper timeout to prevent Firestore from hanging indefinitely if network/iframe blocks WebSockets
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore operation timed out")), timeoutMs)
    )
  ]);
}

/**
 * Tải toàn bộ danh sách người dùng từ Cloud Firestore
 * Nếu cơ sở dữ liệu trên cloud chưa có dữ liệu hoặc offline/timeout, tự động nạp từ cache/mặc định.
 */
export async function fetchUsersFromCloud(): Promise<User[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await withTimeout(getDocs(usersRef), 2000);

    if (snapshot.empty) {
      console.info("⚡ Khởi tạo tài khoản quản trị và giáo viên mặc định lên Cloud Firestore...");
      try {
        const batch = writeBatch(db);
        for (const user of INITIAL_DEFAULT_USERS) {
          const docRef = doc(db, USERS_COLLECTION, String(user.id));
          batch.set(docRef, user);
        }
        batch.commit().catch(err => console.warn("Background batch commit:", err));
      } catch (_) {}
      
      try {
        localStorage.setItem("examgen_users_list", JSON.stringify(INITIAL_DEFAULT_USERS));
      } catch (_) {}
      return INITIAL_DEFAULT_USERS;
    }

    const usersList: User[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as User;
      usersList.push({
        ...data,
        id: Number(data.id || docSnap.id)
      });
    });

    // Sắp xếp theo ID giảm dần
    usersList.sort((a, b) => b.id - a.id);
    try {
      localStorage.setItem("examgen_users_list", JSON.stringify(usersList));
    } catch (_) {}
    return usersList;
  } catch (error) {
    console.info("ℹ️ Firestore offline/timeout mode, falling back to local storage cache.");
    // Fallback sang localStorage nếu mạng offline
    try {
      const local = localStorage.getItem("examgen_users_list");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_DEFAULT_USERS;
  }
}

/**
 * Đăng ký lắng nghe thay đổi thời gian thực từ Cloud Firestore
 * Cho phép cập nhật danh sách người dùng đồng thời trên mọi thiết bị và trình duyệt
 */
export function subscribeUsersFromCloud(
  onUpdate: (users: User[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Tự động seed nếu rỗng
        fetchUsersFromCloud().then(onUpdate).catch(console.error);
        return;
      }
      const usersList: User[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as User;
        usersList.push({
          ...data,
          id: Number(data.id || docSnap.id)
        });
      });
      usersList.sort((a, b) => b.id - a.id);
      onUpdate(usersList);
    },
    (err) => {
      console.warn("Firestore real-time subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Tạo người dùng mới và lưu tập trung trên Cloud Firestore
 */
export async function createUserInCloud(user: User): Promise<User> {
  const docRef = doc(db, USERS_COLLECTION, String(user.id));
  const payload: User = {
    ...user,
    lastLogin: user.lastLogin || "",
    usageCount: user.usageCount || 0,
    tokenUsage: user.tokenUsage || 0,
  };
  await setDoc(docRef, payload);
  return payload;
}

/**
 * Cập nhật thông tin người dùng (bao gồm ảnh đại diện avatar) lên Cloud Firestore
 */
export async function updateUserInCloud(id: number, partialUser: Partial<User>): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, String(id));
  await setDoc(docRef, partialUser as any, { merge: true });
}

/**
 * Xóa một người dùng khỏi Cloud Firestore
 */
export async function deleteUserInCloud(id: number): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, String(id));
  await deleteDoc(docRef);
}

/**
 * Xóa nhiều người dùng hàng loạt khỏi Cloud Firestore
 */
export async function deleteMultipleUsersInCloud(ids: number[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of ids) {
    const docRef = doc(db, USERS_COLLECTION, String(id));
    batch.delete(docRef);
  }
  await batch.commit();
}

/**
 * Xác thực đăng nhập người dùng (Ưu tiên tức thì, an toàn tuyệt đối với dự phòng offline)
 */
export async function authenticateWithCloud(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // 1. Kiểm tra nhanh trong danh sách mặc định & local storage
    let cachedUsers: User[] = INITIAL_DEFAULT_USERS;
    try {
      const local = localStorage.getItem("examgen_users_list");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) cachedUsers = parsed;
      }
    } catch (_) {}

    // Tìm kiếm trong bộ nhớ cục bộ
    let found = cachedUsers.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
    );

    // 2. Nếu chưa thấy trong cache, thử tải từ Firestore (với timeout ngắn)
    if (!found) {
      const cloudUsers = await fetchUsersFromCloud();
      found = cloudUsers.find(
        (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
      );
    }

    // 3. Dự phòng danh sách mặc định hệ thống nếu vẫn chưa thấy
    if (!found) {
      found = INITIAL_DEFAULT_USERS.find(
        (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
      );
    }

    if (!found) {
      return {
        success: false,
        error: "Tài khoản này chưa tồn tại trên hệ thống máy chủ. Vui lòng liên hệ Admin hoặc Đăng ký tài khoản mới."
      };
    }

    if (found.status === "Tạm khóa") {
      return {
        success: false,
        error: "Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ Quản trị viên để mở khóa."
      };
    }

    // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu có khoảng trắng hoặc mật khẩu gốc)
    if (found.password !== cleanPassword && found.password !== passwordInput) {
      return {
        success: false,
        error: "Mật khẩu không chính xác. Vui lòng kiểm tra lại."
      };
    }

    // Cập nhật lastLogin (chạy ngầm không làm chậm quá trình đăng nhập)
    const nowStr = new Date().toISOString().slice(0, 16).replace("T", " ");
    const updatedUser: User = {
      ...found,
      lastLogin: nowStr
    };

    // Đẩy cập nhật ngầm lên Cloud Firestore
    updateUserInCloud(found.id, { lastLogin: nowStr }).catch((e) => {
      console.info("Đăng nhập thành công (chế độ dự phòng offline):", e?.message || e);
    });

    return {
      success: true,
      user: updatedUser
    };
  } catch (error: any) {
    console.error("Lỗi khi xác thực đăng nhập:", error);
    
    // Khôi phục dự phòng tài khoản mặc định nếu có ngoại lệ bất ngờ
    const cleanUsername = usernameInput.trim().toLowerCase();
    const fallbackUser = INITIAL_DEFAULT_USERS.find(
      (u) => (u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername) &&
             (u.password === passwordInput.trim() || u.password === passwordInput)
    );

    if (fallbackUser) {
      return {
        success: true,
        user: fallbackUser
      };
    }

    return {
      success: false,
      error: `Lỗi kết nối cơ sở dữ liệu: ${error?.message || "Vui lòng thử lại"}`
    };
  }
}
