import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, KeyRound, X } from '../icons';
import { User } from '../../types';
import { updatePasswordInCloud } from '../../lib/userService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, users }) => {
  const [step, setStep] = useState<'verify' | 'new-password'>('verify');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim() && u.email.toLowerCase() === email.toLowerCase().trim());
    if (user) {
      setFoundUser(user);
      setStep('new-password');
    } else {
      setError('Tên đăng nhập hoặc Email không chính xác.');
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser) return;
    setIsLoading(true);
    setError('');

    try {
      await updatePasswordInCloud(foundUser.id, newPassword);
      setSuccess('Mật khẩu đã được cập nhật thành công!');
      setTimeout(() => {
        onClose();
        setStep('verify');
        setUsername('');
        setEmail('');
        setNewPassword('');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError('Lỗi cập nhật mật khẩu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm shadow-2xl bg-white dark:bg-[#0F1523]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            Khôi phục mật khẩu
          </CardTitle>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          {step === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1">
                <Label>Tên đăng nhập</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Email đã đăng ký</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác minh tài khoản'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <Label>Mật khẩu mới</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              {success && <p className="text-xs text-emerald-600">{success}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cập nhật mật khẩu'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
