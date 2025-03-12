import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { createClient } from '@/db/supabase/client';
import { CircleChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { CATEGORIES } from '@/lib/categories';
import { RevalidateOneHour } from '@/lib/constants';
import Faq from '@/components/Faq';
import SearchForm from '@/components/home/SearchForm';
import WebNavCardList from '@/components/webNav/WebNavCardList';

import { TagList } from './Tag';

const ScrollToTop = dynamic(() => import('@/components/page/ScrollToTop'), { ssr: false });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  const supabase = createClient();
  const { data: projects } = await supabase
    .from('redbook_projects')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const projectsWithCategory = (projects || []).map((project) => ({
    ...project,
    category: CATEGORIES.find((cat: { code: string }) => cat.code === project.category),
  }));

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL as string),
    title: 'RedBook Dev - Discover Great RedBook Developer Works',
    description: 'Showcase your creativity and gain more attention',
    keywords: t('keywords'),
    alternates: {
      canonical: './',
    },
    openGraph: {
      title: 'RedBook Dev - Discover Great RedBook Developer Works',
      description: 'Showcase your creativity and gain more attention',
    },
  };
}

export const revalidate = RevalidateOneHour;

export default async function Page() {
  const supabase = createClient();
  const t = await getTranslations('Home');
  const [{ data: categoryList }, { data: projectList }] = await Promise.all([
    supabase.from('navigation_category').select(),
    supabase
      .from('redbook_projects')
      .select()
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  // 将 redbook_projects 数据转换为 web_navigation 格式
  const navigationList = projectList?.map((project) => ({
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
    category_name: project.category,
  }));

  return (
    <div className='relative w-full'>
      <div className='relative mx-auto w-full max-w-pc flex-1 px-3 lg:px-0'>
        <div className='my-5 flex flex-col text-center lg:mx-auto lg:my-10 lg:gap-1'>
          <h1 className='text-2xl font-bold text-white lg:text-5xl'>RedBook Dev</h1>
          <h2 className='text-balance text-xs font-bold text-white lg:text-sm'>
            Discover Great RedBook Developer Works
          </h2>
        </div>
        <div className='flex w-full items-center justify-center'>
          <SearchForm />
        </div>
        <div className='mb-10 mt-5'>
          <TagList
            data={(categoryList || []).map((item) => ({
              id: String(item.id),
              name: item.name,
              href: `/category/${item.name}`,
            }))}
          />
        </div>
        <div className='flex flex-col gap-5'>
          <h2 className='text-center text-[18px] lg:text-[32px]'>{t('ai-navigate')}</h2>
          <WebNavCardList dataList={navigationList || []} />
          <Link
            href='/explore'
            className='mx-auto mb-5 flex w-fit items-center justify-center gap-5 rounded-[9px] border border-white p-[10px] text-sm leading-4 hover:opacity-70'
          >
            {t('exploreMore')}
            <CircleChevronRight className='mt-[0.5] h-[20px] w-[20px]' />
          </Link>
        </div>
        <Faq />
        <ScrollToTop />
      </div>
    </div>
  );
}
