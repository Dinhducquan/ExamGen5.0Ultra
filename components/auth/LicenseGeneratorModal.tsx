import React, { useState, useEffect, useMemo } from 'react';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { 
  Loader2, 
  KeySquare, 
  XCircle, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  User as UserIcon, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Award, 
  Layers 
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { User } from '../../types';
import { 
  generateAccountLicenseKey, 
  generateUniversalKey, 
  MASTER_LICENSE_KEYS, 
  getCustomLicenseKeys, 
  addCustomLicenseKey,
  activateUserAccount,
  deactivateUserAccount,
  checkIsUserLicensed
} from '../../lib/licenseService';
import { INITIAL_DEFAULT_USERS } from '../../lib/userService';

interface LicenseGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  users?: User[];
  onUserUpdated?: (updatedUser: User) => void;
}

type TabType = 'direct' | 'generator' | 'master';

const LicenseGeneratorModal: React.FC<LicenseGeneratorModalProps> = ({ 
  isOpen, 
  onClose, 
  users: propUsers,
  onUserUpdated 
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('direct');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generator state
  const [targetUsername, setTargetUsername] = useState('');
  const [schoolLabel, setSchoolLabel] = useState('THPT');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom keys list
  const [customKeys, setCustomKeys] = useState<string[]>([]);

  useEffect(() => {
    if (propUsers && propUsers.length > 0) {
      setAllUsers(propUsers);
      if (!selectedUserId) {
        const firstTeacher = propUsers.find(u => u.role !== 'Quản trị hệ thống') || propUsers[0];
        if (firstTeacher) setSelectedUserId(firstTeacher.id);
      }
    } else {
      try {
        const stored = localStorage.getItem('examgen_users_list');
        const list = stored ? JSON.parse(stored) : INITIAL_DEFAULT_USERS;
        setAllUsers(list);
        if (!selectedUserId && list.length > 0) {
          const firstTeacher = list.find((u: User) => u.role !== 'Quản trị hệ thống') || list[0];
          if (firstTeacher) setSelectedUserId(firstTeacher.id);
        }
      } catch {
        setAllUsers(INITIAL_DEFAULT_USERS);
      }
    }

    setCustomKeys(getCustomLicenseKeys());
  }, [propUsers, isOpen]);

  const selectedUser = useMemo(() => {
    return allUsers.find(u => u.id === selectedUserId) || null;
  }, [allUsers, selectedUserId]);

  const handleCopy = (keyText: string) => {
    navigator.clipboard.writeText(keyText).then(() => {
      setCopiedKey(keyText);
      addToast(`Đã sao chép: ${keyText}`);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  // 1-Click Direct Activation for Teacher (NO MACHINE ID)
  const handleDirectActivate = async (userToActivate: User) => {
    setIsProcessing(true);
    try {
      const accountKey = generateAccountLicenseKey(userToActivate.username);
      const updated = await activateUserAccount(userToActivate, accountKey);

      setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      if (onUserUpdated) onUserUpdated(updated);

      addToast(`⚡ Đã kích hoạt bản quyền PRO vĩnh viễn cho ${userToActivate.name}!`);
    } catch (err: any) {
      addToast(`Lỗi kích hoạt: ${err?.message || 'Không thể cập nhật'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Revert back to trial
  const handleRevertToTrial = async (userToRevert: User) => {
    setIsProcessing(true);
    try {
      const updated = await deactivateUserAccount(userToRevert, 5);
      setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      if (onUserUpdated) onUserUpdated(updated);

      addToast(`Đã chuyển tài khoản ${userToRevert.name} về chế độ dùng thử (5 lượt).`);
    } catch (err: any) {
      addToast(`Lỗi: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Key for Account
  const handleGenerateForAccount = () => {
    if (!targetUsername.trim()) {
      addToast("Vui lòng nhập hoặc chọn Tên đăng nhập của giáo viên.");
      return;
    }
    const key = generateAccountLicenseKey(targetUsername.trim());
    setGeneratedKey(key);
    addCustomLicenseKey(key);
    setCustomKeys(getCustomLicenseKeys());
    addToast("Đã tạo mã bản quyền theo tài khoản thành công!");
  };

  // Generate Universal School Key
  const handleGenerateUniversal = () => {
    const key = generateUniversalKey(schoolLabel);
    setGeneratedKey(key);
    addCustomLicenseKey(key);
    setCustomKeys(getCustomLicenseKeys());
    addToast("Đã tạo mã bản quyền trường học mới!");
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl transform animate-in fade-in-0 zoom-in-95 border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <KeySquare className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                Trung Tâm Cấp Phép & Bản Quyền
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Không cần Machine ID
                </span>
              </CardTitle>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Kích hoạt trực tiếp theo Tài khoản giáo viên • Đồng bộ tức thì lên Cloud Firestore
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
            <XCircle className="w-5 h-5 text-stone-400 hover:text-stone-600 dark:text-slate-400" />
          </Button>
        </CardHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 dark:border-slate-800 px-5 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'direct'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" /> Kích Hoạt 1 Chạm (Khuyên dùng)
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'generator'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
            }`}
          >
            <KeySquare className="w-4 h-4 text-indigo-500" /> Tạo Mã Kích Hoạt
          </button>

          <button
            onClick={() => setActiveTab('master')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'master'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-purple-500" /> Mã Vạn Năng (Master Keys)
          </button>
        </div>

        {/* Tab contents */}
        <CardContent className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* TAB 1: KÍCH HOẠT TRỰC TIẾP 1 CHẠM */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Cơ chế Bản quyền Độc lập theo Tài khoản:</strong> Bản quyền PRO Vĩnh viễn <strong>chỉ kích hoạt riêng cho người dùng được lựa chọn</strong>. Chọn giáo viên bên dưới và bấm nút kích hoạt cho tài khoản đó; các tài khoản khác trong hệ thống giữ nguyên trạng thái dùng thử.
                </div>
              </div>

              {/* Danh sách giáo viên chọn nhanh */}
              <div>
                <Label className="text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  Chọn Giáo Viên Cần Kích Hoạt:
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 dark:border-slate-800 rounded-xl bg-stone-50/50 dark:bg-slate-900/50">
                  {allUsers.map((u) => {
                    const isLicensed = checkIsUserLicensed(u);
                    const isSelected = selectedUserId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setTargetUsername(u.username);
                        }}
                        className={`p-2.5 rounded-xl text-left border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                            : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700/80 hover:bg-stone-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-full border object-cover flex-shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-stone-900 dark:text-slate-100 truncate">{u.name}</p>
                            <p className="text-[10px] text-stone-500 dark:text-slate-400 truncate">@{u.username} • {u.school || 'Giáo viên'}</p>
                          </div>
                        </div>

                        {isLicensed ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex-shrink-0 ml-1">
                            PRO
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex-shrink-0 ml-1">
                            Dùng thử
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chi tiết tài khoản đang chọn */}
              {selectedUser && (
                <div className="p-4 bg-stone-50 dark:bg-slate-800/80 rounded-xl border border-stone-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                        {selectedUser.name}
                        <span className="text-xs font-normal text-stone-500">(@{selectedUser.username})</span>
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                        {selectedUser.school} • {selectedUser.profGroup} • {selectedUser.role}
                      </p>
                    </div>

                    <div className="text-right">
                      {checkIsUserLicensed(selectedUser) ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Đã Kích Hoạt Bản Quyền PRO
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
                          Đang dùng thử ({selectedUser.usageCount || 0}/{selectedUser.usageLimit || 5} lượt)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-stone-200 dark:border-slate-700">
                    <Button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDirectActivate(selectedUser)}
                      className={`flex-1 font-bold text-xs h-10 shadow-sm text-white ${
                        checkIsUserLicensed(selectedUser)
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang cập nhật Cloud...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1.5 text-amber-300" />
                          {checkIsUserLicensed(selectedUser) 
                            ? `Cấp Lại Key PRO Cho ${selectedUser.name}`
                            : `Kích Hoạt PRO Vĩnh Viễn Cho: ${selectedUser.name}`}
                        </>
                      )}
                    </Button>

                    {checkIsUserLicensed(selectedUser) && selectedUser.role !== 'Quản trị hệ thống' && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isProcessing}
                        onClick={() => handleRevertToTrial(selectedUser)}
                        className="text-xs text-stone-500 hover:text-red-600 hover:border-red-300 h-10 px-3 w-full sm:w-auto"
                      >
                        Chuyển về Dùng thử
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400 italic">
                    * Lưu ý: Thao tác này chỉ áp dụng riêng cho tài khoản <strong>@{selectedUser.username}</strong> ({selectedUser.name}), không làm thay đổi trạng thái của các giáo viên khác.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TẠO MÃ KÍCH HOẠT */}
          {activeTab === 'generator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tạo theo Username */}
                <div className="p-4 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-slate-100 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-indigo-500" /> Tạo Key Theo Tên Tài Khoản
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">
                    Mã bản quyền chỉ áp dụng cho tài khoản này (ví dụ: thuyvo, teacher):
                  </p>
                  <Input
                    type="text"
                    placeholder="Nhập username giáo viên (VD: thuyvo)"
                    value={targetUsername}
                    onChange={e => setTargetUsername(e.target.value)}
                    className="text-xs bg-white dark:bg-slate-900"
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateForAccount}
                    className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Tạo Key Theo Tài Khoản
                  </Button>
                </div>

                {/* Tạo Key Phổ Thông / Trường học */}
                <div className="p-4 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-500" /> Tạo Key Trường Học / Nhóm
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">
                    Mã kích hoạt cấp cho tập thể giáo viên trong trường dùng chung:
                  </p>
                  <Input
                    type="text"
                    placeholder="Nhãn trường học (VD: THPT-BINHSON)"
                    value={schoolLabel}
                    onChange={e => setSchoolLabel(e.target.value)}
                    className="text-xs bg-white dark:bg-slate-900"
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateUniversal}
                    className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Tạo Key Trường Học
                  </Button>
                </div>
              </div>

              {/* Hiển thị Key vừa tạo */}
              {generatedKey && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> Mã Kích Hoạt Mới Được Tạo:
                    </Label>
                    <span className="text-[10px] text-emerald-600 font-semibold">Đã lưu vào danh sách hệ thống</span>
                  </div>

                  <div className="relative">
                    <Input
                      readOnly
                      value={generatedKey}
                      className="pr-12 bg-white dark:bg-slate-900 font-mono text-sm font-bold text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 h-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generatedKey)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-emerald-600 hover:bg-emerald-100"
                    >
                      {copiedKey === generatedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">
                    Gửi mã này cho giáo viên để họ dán vào form "Kích hoạt bản quyền" bất kỳ lúc nào.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MÃ VẠN NĂNG MASTER KEYS */}
          {activeTab === 'master' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>
                  Các mã Master Key được cấu hình sẵn trong mã nguồn, có thể kích hoạt vĩnh viễn cho bất kỳ tài khoản nào mà không cần kết nối mạng hay Machine ID.
                </span>
              </div>

              <div className="space-y-2">
                {MASTER_LICENSE_KEYS.map((key) => {
                  const isCopied = copiedKey === key;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <KeySquare className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <div>
                          <span className="font-mono text-xs font-bold text-stone-900 dark:text-slate-100">{key}</span>
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                            Vĩnh viễn • Mọi tài khoản
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(key)}
                        className="text-xs h-8 gap-1.5"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Đã chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Sao chép
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-slate-400">
            Hệ thống cấp phép ExamGen Ultra v5.0 (Cloud-native License)
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LicenseGeneratorModal;
