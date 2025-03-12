'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/db/supabase/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('Login');
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace(`/${locale}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        toast.error(errorMessage);
      }
    };

    checkAuth();
  }, [locale, router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      router.replace(`/${locale}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!email) {
        throw new Error('请输入邮箱');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('重置密码邮件已发送，请查收');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      toast.error(errorMessage);
    }
  };

  return (
    <div className='mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-pc items-center justify-center px-3 lg:px-0'>
      <div className='w-full max-w-[400px] rounded-lg bg-card p-6'>
        <h1 className='mb-6 text-center text-2xl font-bold'>{t('title')}</h1>
        <form onSubmit={handleLogin} className='flex flex-col gap-4'>
          <div>
            <label htmlFor='email' className='mb-2 block text-sm font-medium'>
              {t('email')}
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none'
              required
            />
          </div>
          <div>
            <label htmlFor='password' className='mb-2 block text-sm font-medium'>
              {t('password')}
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none'
              required
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='mt-2 h-10 rounded-lg bg-white px-4 text-sm font-medium text-black hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? t('loading') : t('submit')}
          </button>
          <button type='button' onClick={handleResetPassword} className='text-sm text-white/60 hover:text-white'>
            {t('resetPassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
