import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, User as UserIcon, Eye, EyeOff, Cloud, CheckCircle2, Shield, Plus, Lock, KeyRound, Sun, Moon } from '../icons';
import { User } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../hooks/useTheme';
import { authenticateWithCloud, createUserInCloud } from '../../lib/userService';
import { SCHOOLS_BY_PROVINCE, PROFESSIONAL_GROUPS } from '../../constants';

interface LoginScreenProps {
  onLoginSuccess: (user: User, rememberMe: boolean) => void;
  users: User[];
}

const LAST_LOGIN_USERNAME_KEY = 'examgen_last_login_username';
const ATTEMPTS_STORAGE_KEY = 'examgen_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 5;

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, users }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<User | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSchool, setRegSchool] = useState('THPT Chuyên Lê Khiết');
  const [regProfGroup, setRegProfGroup] = useState('Toán');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const lastUsername = localStorage.getItem(LAST_LOGIN_USERNAME_KEY);
    if (lastUsername) {
      setUsername(lastUsername);
    }
  }, []);

  useEffect(() => {
    const normalizedUsername = username.toLowerCase().trim();
    const user = users.find(u => u.username.toLowerCase() === normalizedUsername || u.email.toLowerCase() === normalizedUsername);
    setFoundUser(user || null);

    if (user) {
      setAvatarUrl(user.avatar);
    } else {
      setAvatarUrl(null);
    }
  }, [username, users]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const now = Date.now();
    let attemptsData: { [key: string]: { count: number; lockedUntil: number } } = {};
    try {
      const savedAttempts = sessionStorage.getItem(ATTEMPTS_STORAGE_KEY);
      if (savedAttempts) attemptsData = JSON.parse(savedAttempts);
    } catch (e) {}

    const userAttempts = attemptsData[username.toLowerCase()] || { count: 0, lockedUntil: 0 };

    try {
      // Xác thực trực tiếp qua Cloud Firestore & Cache
      const authResult = await authenticateWithCloud(username, password);

      if (!authResult.success || !authResult.user) {
        if (userAttempts.lockedUntil > now) {
          setError(t('login.error.locked', `Tài khoản bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${Math.ceil((userAttempts.lockedUntil - now) / 1000 / 60)} phút.`));
          setIsLoading(false);
          return;
        }

        const newCount = userAttempts.count + 1;
        if (newCount >= MAX_ATTEMPTS) {
          attemptsData[username.toLowerCase()] = { count: newCount, lockedUntil: now + LOCKOUT_DURATION_MINUTES * 60 * 1000 };
          setError(t('login.error.tooManyAttempts', `Bạn đã nhập sai quá ${MAX_ATTEMPTS} lần. Tài khoản bị tạm khóa trong ${LOCKOUT_DURATION_MINUTES} phút.`));
        } else {
          attemptsData[username.toLowerCase()] = { count: newCount, lockedUntil: 0 };
          setError(authResult.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
        sessionStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attemptsData));
        setIsLoading(false);
        return;
      }

      // Đăng nhập thành công: xóa lịch sử thất bại
      delete attemptsData[username.toLowerCase()];
      sessionStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attemptsData));
      
      onLoginSuccess(authResult.user, false);
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi kết nối hệ thống máy chủ đám mây.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError('Vui lòng điền đầy đủ họ tên, tên đăng nhập và mật khẩu.');
      setIsRegistering(false);
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();
    const existing = users.find(u => u.username.toLowerCase() === cleanUsername || (regEmail && u.email.toLowerCase() === regEmail.trim().toLowerCase()));
    if (existing) {
      setRegError('Tên đăng nhập hoặc Email này đã tồn tại trên hệ thống đám mây.');
      setIsRegistering(false);
      return;
    }

    try {
      const newId = Date.now();
      const newUser: User = {
        id: newId,
        name: regName.trim(),
        username: cleanUsername,
        email: regEmail.trim() || `${cleanUsername}@examgen.vn`,
        password: regPassword,
        role: 'Giáo viên',
        school: regSchool,
        profGroup: regProfGroup,
        status: 'Hoạt động',
        lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
        avatar: `https://i.pravatar.cc/150?u=${cleanUsername}`,
        usageCount: 0,
        tokenUsage: 0,
        usageLimit: 10,
      };

      // Lưu trữ tập trung trực tiếp lên Cloud Firestore
      await createUserInCloud(newUser);

      setRegSuccess('Đăng ký tài khoản thành công lên Cloud Database! Đang chuyển đến đăng nhập...');
      setTimeout(() => {
        setUsername(cleanUsername);
        setPassword(regPassword);
        setActiveTab('login');
      }, 1200);
    } catch (err: any) {
      setRegError('Lỗi khi lưu tài khoản lên Cloud Firestore: ' + (err?.message || 'Vui lòng thử lại.'));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#FAF8F5] dark:bg-[#080B14] p-4 overflow-hidden transition-colors duration-200">
      {/* Theme Toggle in Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 sm:px-3 py-1.5 rounded-xl bg-white/90 dark:bg-white/10 border border-stone-200 dark:border-white/10 shadow-sm hover:bg-stone-100 dark:hover:bg-white/20 text-stone-700 dark:text-slate-200 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
          title="Chuyển đổi Chế độ Sáng / Tối"
        >
          {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
          <span className="hidden sm:inline text-stone-700 dark:text-slate-200">{theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
        </button>
      </div>

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 -ml-40 -mt-40 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -mr-40 -mb-40 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-md shadow-xl dark:shadow-2xl border border-stone-200/90 dark:border-white/[0.1] animate-in fade-in-0 zoom-in-95 bg-white/95 dark:bg-[#0F1523]/95 backdrop-blur-2xl text-stone-900 dark:text-slate-100">
        <CardHeader className="text-center pb-2">
          {/* Cloud Database Connected Badge */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-2xs">
              <Cloud className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Cơ sở dữ liệu đám mây tập trung</span>
            </span>
          </div>

          <div className="relative mx-auto w-20 h-20 rounded-full bg-stone-100 dark:bg-[#151B2B] flex items-center justify-center text-stone-400 dark:text-slate-400 shadow-sm mb-2 overflow-hidden border-2 border-indigo-500/30">
            {avatarUrl ? (
              <img key={avatarUrl} src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover animate-in fade-in-0 duration-500" />
            ) : (
              <UserIcon size={36} className="text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <span>ExamGen Ultra</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">5.0</span>
          </CardTitle>
          <p className="text-xs font-medium text-stone-600 dark:text-slate-400 mt-1">
            Nền tảng Quản lý & Sinh đề thi Thông minh AI (Chuẩn GDPT 2018)
          </p>

          {/* Tab Switcher: Đăng nhập / Đăng ký */}
          <div className="grid grid-cols-2 p-1 mt-4 rounded-xl bg-stone-100 dark:bg-[#151B2B] border border-stone-200 dark:border-white/[0.08] text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-[#1C2438] text-stone-900 dark:text-white shadow-xs border border-stone-200/90 dark:border-white/[0.08]'
                  : 'text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Đăng nhập hệ thống
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setRegError(''); setRegSuccess(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-[#1C2438] text-stone-900 dark:text-white shadow-xs border border-stone-200/90 dark:border-white/[0.08]'
                  : 'text-stone-600 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Đăng ký Giáo viên mới
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="username" className="text-xs font-bold text-stone-800 dark:text-slate-200">
                  Tài khoản / Email
                </Label>
                <Input
                  id="username"
                  autoComplete="off"
                  placeholder="Nhập tên đăng nhập hoặc email..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-sm font-medium"
                />
              </div>

              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-stone-800 dark:text-slate-200">
                    Mật khẩu
                  </Label>
                  {foundUser && (
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-bold">
                      {foundUser.name} ({foundUser.role})
                    </span>
                  )}
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-7 text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className="text-xs font-medium text-red-700 dark:text-red-400 p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/60 leading-snug">
                  {error}
                </div>
              )}

              <Button type="submit" variant="gradient" className="w-full mt-2 shadow-glow-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  'Đăng nhập tài khoản'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800 dark:text-slate-200">Họ và tên Giáo viên *</Label>
                <Input
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  disabled={isRegistering}
                  className="text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800 dark:text-slate-200">Tên đăng nhập *</Label>
                  <Input
                    placeholder="nguyenvanan"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    disabled={isRegistering}
                    className="text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800 dark:text-slate-200">Mật khẩu *</Label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    disabled={isRegistering}
                    className="text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800 dark:text-slate-200">Email liên hệ</Label>
                <Input
                  type="email"
                  placeholder="teacher@school.edu.vn"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  disabled={isRegistering}
                  className="text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800 dark:text-slate-200">Trường công tác</Label>
                  <Input
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    disabled={isRegistering}
                    className="text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800 dark:text-slate-200">Tổ bộ môn</Label>
                  <Input
                    value={regProfGroup}
                    onChange={(e) => setRegProfGroup(e.target.value)}
                    disabled={isRegistering}
                    className="text-sm font-medium"
                  />
                </div>
              </div>

              {regError && (
                <div className="text-xs font-medium text-red-700 dark:text-red-400 p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/60 leading-snug">
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 leading-snug">
                  {regSuccess}
                </div>
              )}

              <Button type="submit" className="w-full mt-2" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo tài khoản lên Cloud...
                  </>
                ) : (
                  'Đăng ký & Lưu trữ Đám mây'
                )}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-[11px] font-medium text-stone-500 dark:text-slate-400">
            Dữ liệu tài khoản được lưu trữ an toàn & đồng bộ tức thì qua Cloud Firestore.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
