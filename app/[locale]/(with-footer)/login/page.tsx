'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/db/supabase/client';
import { toast } from 'sonner';
import { useRouter } from '@/app/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  // 检查登录状态
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile?.role === 'admin') {
            router.replace(`/${locale}/admin`);
          }
        }
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('未找到用户信息');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        toast.success('登录成功');
        // 使用 replace 而不是 push，这样不会在历史记录中留下登录页
        setTimeout(() => {
          router.replace(`/${locale}/admin`);
        }, 100);
      } else {
        await supabase.auth.signOut();
        toast.error('没有管理员权限');
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast.error('登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }
    
    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('重置密码邮件已发送，请查收');
    } catch (error) {
      console.error('发送重置密码邮件失败:', error);
      toast.error('发送重置密码邮件失败');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container max-w-md py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">管理员登录</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded bg-background text-foreground"
            placeholder="请输入邮箱"
          />
        </div>

        <div>
          <label className="block mb-2">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded bg-background text-foreground"
            placeholder="请输入密码"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isResetting}
            className="text-blue-500 hover:underline"
          >
            {isResetting ? '发送中...' : '忘记密码？'}
          </button>
        </div>
      </form>
    </div>
  );
} 