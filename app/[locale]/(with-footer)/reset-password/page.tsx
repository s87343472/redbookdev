'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/db/supabase/client';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('密码重置成功');
      router.push('/login');
    } catch (error) {
      console.error('重置密码失败:', error);
      toast.error('重置密码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container max-w-md py-8'>
      <h1 className='mb-8 text-center text-2xl font-bold'>重置密码</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='mb-2 block'>新密码</label>
          <input
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className='w-full rounded border p-2'
            placeholder='请输入新密码'
          />
        </div>

        <div>
          <label className='mb-2 block'>确认密码</label>
          <input
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className='w-full rounded border p-2'
            placeholder='请再次输入新密码'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
        >
          {loading ? '提交中...' : '重置密码'}
        </button>
      </form>
    </div>
  );
}
