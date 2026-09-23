import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, KeySquare, CheckCircle2, ShieldCheck, Sparkles, User as UserIcon, School, Zap, AlertCircle } from 'lucide-react';
import { User } from '../../types';
import { 
  verifyLicenseKey, 
  activateUserAccount, 
  generateAccountLicenseKey, 
  MASTER_LICENSE_KEYS 
} from '../../lib/licenseService';

interface LicenseKeyModalProps {
  user?: User | null;
  onSuccess: (key: string, activatedUser?: User) => void;
  onCancel?: () => void;
}

const LicenseKeyModal: React.FC<LicenseKeyModalProps> = ({ user, onSuccess, onCancel }) => {
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ type: string; message: string } | null>(null);

  const accountExpectedKey = user ? generateAccountLicenseKey(user.username) : '';

  const handleUseAccountKey = () => {
    if (accountExpectedKey) {
      setKey(accountExpectedKey);
      setError('');
    }
  };

  const handleUseMasterKey = (masterKey: string) => {
    setKey(masterKey);
    setError('');
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const verification = verifyLicenseKey(key, user);
      if (!verification.valid) {
        setError(verification.message);
        setIsLoading(false);
        return;
      }

      setSuccessInfo({ type: verification.type, message: verification.message });

      // Nếu có thông tin người dùng, lưu kích hoạt lên Cloud Firestore
      let activatedUser = user || undefined;
      if (user) {
        activatedUser = await activateUserAccount(user, key.trim());
      }

      setTimeout(() => {
        setIsLoading(false);
        onSuccess(key.trim(), activatedUser);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra trong quá trình kích hoạt.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100/90 dark:bg-slate-950/90 p-4 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 -z-10" />

      <Card className="w-full max-w-lg shadow-2xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
        {/* Header với Gradient mượt mà */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner ring-1 ring-white/20">
            <KeySquare className="w-7 h-7 text-amber-300" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Kích Hoạt Bản Quyền Hệ Thống</CardTitle>
          <p className="text-xs text-indigo-100 mt-1 max-w-md mx-auto">
            Kích hoạt trực tiếp theo Tài khoản người dùng • Không yêu cầu mã máy (Machine ID) • Dùng được trên mọi thiết bị
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Thông tin tài khoản cần kích hoạt */}
          {user && (
            <div className="p-3.5 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-stone-300 dark:border-slate-600 shadow-sm object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-slate-100 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                    {user.name} ({user.username})
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <School className="w-3 h-3 text-stone-400" />
                    {user.school || 'Giáo viên'} • {user.profGroup || 'Tổ bộ môn'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-3 h-3" /> Hết lượt thử
                </span>
                <p className="text-[10px] text-stone-400 mt-1">Cần kích hoạt PRO</p>
              </div>
            </div>
          )}

          {/* Form kích hoạt */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="license-key" className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-slate-300">
                  Mã kích hoạt bản quyền (Activation Key)
                </Label>
                {accountExpectedKey && (
                  <button
                    type="button"
                    onClick={handleUseAccountKey}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" /> Điền mã tài khoản
                  </button>
                )}
              </div>

              <Input
                id="license-key"
                type="text"
                placeholder="VD: EG-VIP-2026 hoặc EG-PRO-..."
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError('');
                }}
                required
                disabled={isLoading}
                className="font-mono text-sm tracking-wide bg-stone-50 dark:bg-slate-800/80 border-stone-300 dark:border-slate-700 h-11"
              />
              <p className="text-[11px] text-stone-500 dark:text-slate-400">
                Nhập mã bản quyền do Quản trị viên cấp, mã theo tài khoản hoặc mã nhà trường để sử dụng vĩnh viễn.
              </p>
            </div>

            {/* Gợi ý mã Master cho việc kích hoạt nhanh */}
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Mã kích hoạt sẵn sàng:
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Bấm để chọn</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MASTER_LICENSE_KEYS.slice(0, 3).map((mk) => (
                  <button
                    key={mk}
                    type="button"
                    onClick={() => handleUseMasterKey(mk)}
                    className="px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shadow-xs"
                  >
                    {mk}
                  </button>
                ))}
                {accountExpectedKey && (
                  <button
                    type="button"
                    onClick={handleUseAccountKey}
                    className="px-2 py-1 text-[11px] font-mono font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
                  >
                    Mã riêng: {accountExpectedKey}
                  </button>
                )}
              </div>
            </div>

            {/* Thông báo lỗi nếu có */}
            {error && (
              <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Thông báo thành công */}
            {successInfo && (
              <div className="p-3 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{successInfo.message}</span>
              </div>
            )}

            {/* Nút hành động */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={isLoading || !key.trim()}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xác thực & đồng bộ Cloud...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Kích Hoạt Bản Quyền PRO
                  </>
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="w-full text-xs text-stone-500 hover:text-stone-700 dark:text-slate-400"
                >
                  Quay lại đăng nhập
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseKeyModal;
