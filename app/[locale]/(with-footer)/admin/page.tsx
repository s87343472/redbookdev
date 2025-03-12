'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/db/supabase/client';
import { toast } from 'sonner';

type Project = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  website_url: string;
  redbook_url: string;
  creator_name: string;
  creator_redbook_id: string;
  category: string;
  tags: string[];
  screenshot_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  updated_at: string;
};

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('redbook_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setProjects(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      toast.error('获取项目失败');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const handleStatusChange = async (projectId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('redbook_projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast.success('状态更新成功');
      await fetchProjects();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      toast.error(`更新状态失败: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace(`/${locale}/login`);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.id) {
          router.replace(`/${locale}/login`);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          toast.error('没有管理员权限');
          router.replace(`/${locale}/login`);
          return;
        }

        await fetchProjects();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '权限验证失败';
        toast.error(errorMessage);
        router.replace(`/${locale}/login`);
      }
    };

    checkAdminAuth();
  }, [fetchProjects, locale, router, supabase]);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex min-h-[200px] items-center justify-center'>
          <div className='text-lg'>加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex min-h-[200px] items-center justify-center'>
          <div className='text-red-500'>
            加载失败: {error}
            <button
              type='button'
              onClick={() => fetchProjects()}
              className='ml-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待审核', className: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { text: '已通过', className: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { text: '已拒绝', className: 'bg-red-100 text-red-800' };
      default:
        return { text: '未知状态', className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>项目审核管理</h1>
        <button
          type='button'
          onClick={() => fetchProjects()}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
        >
          刷新列表
        </button>
      </div>

      {projects.map((project) => {
        const statusInfo = getStatusDisplay(project.status);
        return (
          <div key={project.id} className='mb-4 rounded-lg border bg-card p-6 shadow-sm'>
            <div className='mb-4 flex items-start justify-between'>
              <h2 className='text-xl font-semibold'>{project.title || '未命名项目'}</h2>
              <div className='flex items-center gap-2'>
                <span className={`rounded px-2 py-1 text-sm ${statusInfo.className}`}>{statusInfo.text}</span>
              </div>
            </div>

            <div className='space-y-2'>
              <p>
                <span className='font-medium'>描述：</span>
                {project.description}
              </p>
              <p>
                <span className='font-medium'>项目链接：</span>
                <a
                  href={project.website_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline'
                >
                  {project.website_url}
                </a>
              </p>
              <p>
                <span className='font-medium'>小红书链接：</span>
                <a
                  href={project.redbook_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline'
                >
                  {project.redbook_url}
                </a>
              </p>
              <p>
                <span className='font-medium'>创作者：</span>
                {project.creator_name} ({project.creator_redbook_id})
              </p>
              <p>
                <span className='font-medium'>分类：</span>
                {project.category}
              </p>
              <p>
                <span className='font-medium'>标签：</span>
                {project.tags?.join(', ') || '无'}
              </p>
              <p>
                <span className='font-medium'>提交时间：</span>
                {new Date(project.created_at).toLocaleString('zh-CN')}
              </p>
              {project.updated_at && (
                <p>
                  <span className='font-medium'>更新时间：</span>
                  {new Date(project.updated_at).toLocaleString('zh-CN')}
                </p>
              )}
            </div>

            {project.screenshot_urls && project.screenshot_urls.length > 0 && (
              <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-3'>
                {project.screenshot_urls.map((url, index) => (
                  <div key={`${project.id}-${url}`} className='block aspect-video overflow-hidden rounded border'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Screenshot ${index + 1}`} className='h-full w-full object-cover' />
                  </div>
                ))}
              </div>
            )}

            {project.status === 'pending' && (
              <div className='mt-4 flex gap-2'>
                <button
                  type='button'
                  onClick={() => handleStatusChange(project.id, 'approved')}
                  className='rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700'
                >
                  通过
                </button>
                <button
                  type='button'
                  onClick={() => handleStatusChange(project.id, 'rejected')}
                  className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
                >
                  拒绝
                </button>
              </div>
            )}
          </div>
        );
      })}

      {projects.length === 0 && <div className='py-8 text-center text-gray-500'>暂无项目提交</div>}
    </div>
  );
}
