'use client';

import { useEffect, useState } from 'react';
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

  // 检查管理员权限
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace(`/${locale}/login`);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          router.replace(`/${locale}/login`);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          toast.error('没有管理员权限');
          router.replace(`/${locale}/login`);
          return;
        }

        // 有权限后加载项目列表
        fetchProjects();
      } catch (error) {
        console.error('权限验证失败:', error);
        router.replace(`/${locale}/login`);
      }
    };

    checkAdminAuth();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching projects...');
      
      const { data, error } = await supabase
        .from('redbook_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched data:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('获取项目失败:', error);
      setError(error instanceof Error ? error.message : '未知错误');
      toast.error('获取项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      console.log('Updating status:', { projectId, newStatus });
      
      const { error } = await supabase
        .from('redbook_projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      toast.success('状态更新成功');
      // 刷新项目列表
      fetchProjects();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-red-500">
            加载失败: {error}
            <button 
              onClick={fetchProjects}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">项目审核管理</h1>
        <button 
          onClick={fetchProjects}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          刷新列表
        </button>
      </div>
      
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-card p-6 rounded-lg shadow-sm border mb-4"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{project.title || '未命名项目'}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-sm ${
                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {project.status === 'pending' ? '待审核' :
                 project.status === 'approved' ? '已通过' :
                 '已拒绝'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p><span className="font-medium">描述：</span>{project.description}</p>
            <p>
              <span className="font-medium">项目链接：</span>
              <a href={project.website_url} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">{project.website_url}</a>
            </p>
            <p>
              <span className="font-medium">小红书链接：</span>
              <a href={project.redbook_url} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:underline">{project.redbook_url}</a>
            </p>
            <p><span className="font-medium">创作者：</span>{project.creator_name} ({project.creator_redbook_id})</p>
            <p><span className="font-medium">分类：</span>{project.category}</p>
            <p><span className="font-medium">标签：</span>{project.tags?.join(', ') || '无'}</p>
            <p><span className="font-medium">提交时间：</span>
              {new Date(project.created_at).toLocaleString('zh-CN')}
            </p>
            {project.updated_at && (
              <p><span className="font-medium">更新时间：</span>
                {new Date(project.updated_at).toLocaleString('zh-CN')}
              </p>
            )}
          </div>

          {project.screenshot_urls && project.screenshot_urls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.screenshot_urls.map((url, index) => (
                <a
                  key={`${project.id}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video overflow-hidden rounded border"
                >
                  <img
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          {project.status === 'pending' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleStatusChange(project.id, 'approved')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                通过
              </button>
              <button
                onClick={() => handleStatusChange(project.id, 'rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                拒绝
              </button>
            </div>
          )}
        </div>
      ))}

      {projects.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          暂无项目提交
        </div>
      )}
    </div>
  );
} 