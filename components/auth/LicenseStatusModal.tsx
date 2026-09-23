import React, { useState } from 'react';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  KeySquare, 
  XCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  User as UserIcon, 
  School, 
  Zap, 
  Calendar,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { User } from '../../types';
import { checkIsUserLicensed, generateAccountLicenseKey } from '../../lib/licenseService';
import { useToast } from '../../hooks/useToast';

interface LicenseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onOpenActivation?: () => void;
  onOpenLicenseManager?: () => void;
}

const LicenseStatusModal: React.FC<LicenseStatusModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenActivation,
  onOpenLicenseManager,
}) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const isLicensed = checkIsUserLicensed(currentUser);
  const isAdmin = currentUser.role === 'Quản trị hệ thống';
  const accountKey = generateAccountLicenseKey(currentUser.username);

  const handleCopyAccountKey = () => {
    navigator.clipboard.writeText(accountKey).then(() => {
      setCopied(true);
      addToast(`Đã sao chép mã tài khoản: ${accountKey}`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md transform animate-in fade-in-0 zoom-in-95 border border-stone-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/50">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-stone-900 dark:text-slate-100">
            <KeySquare className="w-5 h-5 text-amber-500" />
            Thông Tin Bản Quyền & Giấy Phép
          </CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
            <XCircle className="w-5 h-5 text-stone-400 hover:text-stone-600" />
          </Button>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Card trạng thái */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isLicensed 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}>
            {isLicensed ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                {isLicensed ? 'Bản Quyền Đã Được Kích Hoạt PRO' : 'Tài Khoản Đang Dùng Thử'}
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {isLicensed 
                  ? 'Bản quyền vĩnh viễn gắn liền với tài khoản của bạn, đồng bộ trên Cloud và sử dụng không giới hạn trên mọi máy tính.' 
                  : `Bạn đã sử dụng ${currentUser.usageCount || 0}/${currentUser.usageLimit || 5} lượt tạo đề thi thử nghiệm.`}
              </p>
            </div>
          </div>

          {/* Chi tiết tài khoản */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-slate-800">
              <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Chủ tài khoản:
              </span>
              <span className="font-bold text-stone-800 dark:text-slate-200">{currentUser.name}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-slate-800">
              <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" /> Đơn vị công tác:
              </span>
              <span className="font-semibold text-stone-800 dark:text-slate-200">{currentUser.school || 'ExamGen Ultra'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-slate-800">
              <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Vai trò & Loại giấy phép:
              </span>
              <span className="font-semibold text-stone-800 dark:text-slate-200">
                {currentUser.role} • {isLicensed ? 'PRO Vĩnh Viễn' : 'Dùng thử'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-slate-800">
              <span className="text-stone-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Hạn sử dụng:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {isLicensed ? 'Vĩnh viễn (Không thời hạn)' : `${Math.max(0, (currentUser.usageLimit || 5) - (currentUser.usageCount || 0))} lượt còn lại`}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-stone-500 dark:text-slate-400">Mã kích hoạt của tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <code className="bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {accountKey}
                </code>
                <button 
                  onClick={handleCopyAccountKey}
                  className="p-1 hover:bg-stone-200 dark:hover:bg-slate-700 rounded text-stone-500"
                  title="Sao chép mã"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="space-y-2 pt-2">
            {!isLicensed && onOpenActivation && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenActivation();
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs h-10 shadow-sm"
              >
                <Zap className="w-4 h-4 mr-1.5 text-amber-300" />
                Kích Hoạt Bản Quyền PRO Ngay (Không Cần Mã Máy)
              </Button>
            )}

            {isAdmin && onOpenLicenseManager && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenLicenseManager();
                }}
                className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 h-10"
              >
                <KeySquare className="w-4 h-4 mr-1.5" />
                Mở Trung Tâm Cấp Phép & Quản Lý Bản Quyền
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full text-xs text-stone-500"
            >
              Đóng
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default LicenseStatusModal;
