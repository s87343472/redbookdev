/* eslint-disable react/jsx-props-no-spreading */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/db/supabase/client';

import { InfoPageSize, RevalidateOneHour } from '@/lib/constants';

import Content from '../../Content';

export const revalidate = RevalidateOneHour * 6;

export async function generateMetadata({ params }: { params: { code: string; pageNum?: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: categoryList } = await supabase.from('navigation_category').select().eq('name', params.code);

  if (!categoryList || !categoryList[0]) {
    notFound();
  }

  return {
    title: categoryList[0].title,
  };
}

export default async function Page({ params }: { params: { code: string; pageNum?: string } }) {
  const supabase = createClient();
  const currentPage = Number(params?.pageNum || 1);

  const [{ data: categoryList }, { data: projectList, count }] = await Promise.all([
    supabase.from('navigation_category').select().eq('name', params.code),
    supabase
      .from('redbook_projects')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .eq('category', params.code)
      .range(0, InfoPageSize - 1),
  ]);

  if (!categoryList || !categoryList[0]) {
    notFound();
  }

  // 将 redbook_projects 数据转换为 web_navigation 格式
  const navigationList = projectList?.map(project => ({
    id: project.id,
    name: project.title,
    title: project.title,
    content: project.description,
    detail: project.description,
    url: project.website_url,
    image_url: project.screenshot_urls[0] || '',
    thumbnail_url: project.screenshot_urls[0] || '',
    website_data: '',
    collection_time: project.created_at,
    star_rating: 5,
    tag_name: project.tags?.join(',') || '',
    category_name: project.category
  }));

  return (
    <Content
      headerTitle={categoryList[0]!.title || params.code}
      navigationList={navigationList || []}
      currentPage={currentPage}
      total={count!}
      pageSize={InfoPageSize}
      route={`/category/${params.code}`}
    />
  );
}
