import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, KeySquare, XCircle, Copy, CheckCircle2, Shield, Zap } from '../icons';
import { useToast } from '../../hooks/useToast';

interface LicenseGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MACHINE_ID_KEY = 'examgen_machine_id';
const LICENSE_KEY = 'examgen_license_key';

const getMachineId = (): string => {
  let machineId = localStorage.getItem(MACHINE_ID_KEY);
  if (!machineId) {
    machineId = 'MACHINE-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(MACHINE_ID_KEY, machineId);
  }
  return machineId;
};

const generateKeyForMachine = (machineId: string): string => {
  if (!machineId) return '';
  return 'EG-ULTRA-' + btoa(machineId).split('').reverse().join('');
};

const LicenseGeneratorModal: React.FC<LicenseGeneratorModalProps> = ({ isOpen, onClose }) => {
    const { addToast } = useToast();
    const [machineIdInput, setMachineIdInput] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isActivatedThisDevice, setIsActivatedThisDevice] = useState(false);

    const handleUseCurrentMachineId = () => {
      const currentId = getMachineId();
      setMachineIdInput(currentId);
      const key = generateKeyForMachine(currentId);
      setGeneratedKey(key);
      addToast("Đã lấy Machine ID của thiết bị hiện tại.");
    };

    const handleGenerate = () => {
        if (!machineIdInput.trim()) {
            addToast("Vui lòng nhập Machine ID của người dùng.");
            return;
        }
        setIsGenerating(true);
        setTimeout(() => {
            const key = generateKeyForMachine(machineIdInput.trim());
            setGeneratedKey(key);
            setIsGenerating(false);
        }, 300);
    };

    const handleCopy = () => {
        if (!generatedKey) return;
        navigator.clipboard.writeText(generatedKey).then(() => {
            setCopied(true);
            addToast("Đã sao chép key bản quyền vào clipboard.");
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleActivateCurrentDevice = () => {
      const currentId = getMachineId();
      const key = generateKeyForMachine(currentId);
      localStorage.setItem(LICENSE_KEY, key);
      setIsActivatedThisDevice(true);
      setGeneratedKey(key);
      setMachineIdInput(currentId);
      addToast("⚡ Đã kích hoạt bản quyền vĩnh viễn thành công cho máy này!");
      setTimeout(() => setIsActivatedThisDevice(false), 3000);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg transform animate-in fade-in-0 zoom-in-95 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      <KeySquare className="w-5 h-5 text-amber-500"/> Cấp Key bản quyền (Dành cho Quản trị viên)
                    </CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
                      <XCircle className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Quyền hạn Quản trị:</strong> Giáo viên gửi Machine ID của họ cho bạn. Bạn chỉ cần dán Machine ID vào đây để tạo mã kích hoạt gửi lại cho giáo viên, hoặc tự động kích hoạt nhanh cho máy này.
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label htmlFor="machine-id" className="font-semibold text-sm">Machine ID của người dùng</Label>
                          <button
                            type="button"
                            onClick={handleUseCurrentMachineId}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Zap className="w-3.5 h-3.5" /> Lấy ID máy này
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Nhập mã định danh máy (Machine ID) do giáo viên cung cấp:</p>
                        <div className="flex items-center gap-2">
                            <Input
                                id="machine-id"
                                type="text"
                                placeholder="VD: MACHINE-174..."
                                value={machineIdInput}
                                onChange={(e) => setMachineIdInput(e.target.value)}
                                disabled={isGenerating}
                                className="font-mono text-xs"
                            />
                            <Button onClick={handleGenerate} disabled={isGenerating} className="flex-shrink-0">
                                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Tạo Key
                            </Button>
                        </div>
                    </div>

                    {generatedKey && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                            <Label className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                              Mã kích hoạt (Activation Key)
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    readOnly
                                    value={generatedKey}
                                    className="pr-10 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 font-mono text-sm text-emerald-900 dark:text-emerald-200 font-bold"
                                />
                                <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto">
                                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> : <Copy className="w-5 h-5" />}
                                </Button>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-slate-400">
                              Gửi mã này cho giáo viên để họ nhập vào mục "Kích hoạt bản quyền".
                            </p>
                        </div>
                    )}

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleActivateCurrentDevice}
                        className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center justify-center gap-1.5 py-2.5"
                      >
                        {isActivatedThisDevice ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Đã kích hoạt bản quyền cho máy này!
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-500" />
                            ⚡ Tự động tạo mã & kích hoạt Bản quyền cho máy này ngay
                          </>
                        )}
                      </Button>
                    </div>
                </CardContent>
            </div>
        </div>
    );
};

export default LicenseGeneratorModal;