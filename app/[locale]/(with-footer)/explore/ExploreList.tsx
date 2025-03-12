import { createClient } from '@/db/supabase/client';

import SearchForm from '@/components/home/SearchForm';
import BasePagination from '@/components/page/BasePagination';
import WebNavCardList from '@/components/webNav/WebNavCardList';

import { TagList } from '../(home)/Tag';

const WEB_PAGE_SIZE = 12;

export default async function ExploreList({ pageNum }: { pageNum?: string }) {
  const supabase = createClient();
  const currentPage = pageNum ? Number(pageNum) : 1;

  // start and end
  const start = (currentPage - 1) * WEB_PAGE_SIZE;
  const end = start + WEB_PAGE_SIZE - 1;

  const [{ data: categoryList }, { data: projectList, count }] = await Promise.all([
    supabase.from('navigation_category').select(),
    supabase
      .from('redbook_projects')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(start, end),
  ]);

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
    <>
      <div className='flex w-full items-center justify-center'>
        <SearchForm />
      </div>
      <div className='mb-10 mt-5'>
        <TagList
          data={categoryList!.map((item) => ({
            id: String(item.id),
            name: item.name,
            href: `/category/${item.name}`,
          }))}
        />
      </div>
      <WebNavCardList dataList={navigationList || []} />
      <BasePagination
        currentPage={currentPage}
        pageSize={WEB_PAGE_SIZE}
        total={count!}
        route='/explore'
        subRoute='/page'
        className='my-5 lg:my-10'
      />
    </>
  );
}
