import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/db/supabase/client';
import { CircleArrowRight, ExternalLink, Layers, Link as LinkIcon, Tag, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Separator } from '@/components/ui/separator';
import BaseImage from '@/components/image/BaseImage';
import MarkdownProse from '@/components/MarkdownProse';

export async function generateMetadata({
  params: { locale, websiteName },
}: {
  params: { locale: string; websiteName: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.ai',
  });

  try {
    const decodedWebsiteName = decodeURIComponent(websiteName);

    const { data, error } = await supabase
      .from('redbook_projects')
      .select()
      .eq('status', 'approved')
      .eq('title', decodedWebsiteName)
      .single();

    if (error || !data) {
      return {
        title: t('titleSubfix'),
        description: '',
      };
    }

    return {
      title: `${data.title} | ${t('titleSubfix')}`,
      description: data.description,
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      title: t('titleSubfix'),
      description: '',
    };
  }
}

export default async function Page({ params: { websiteName } }: { params: { websiteName: string } }) {
  const supabase = createClient();
  const t = await getTranslations('Startup.detail');
  const submitT = await getTranslations('Submit');

  try {
    const decodedWebsiteName = decodeURIComponent(websiteName);

    const { data, error } = await supabase
      .from('redbook_projects')
      .select()
      .eq('status', 'approved')
      .eq('title', decodedWebsiteName)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      notFound();
    }

    if (!data) {
      notFound();
    }

    // 添加调试信息 - 输出完整的数据对象
    console.log('Full project data:', JSON.stringify(data, null, 2));
    console.log('Screenshot URLs type:', typeof data.screenshot_urls);
    console.log('Screenshot URLs:', data.screenshot_urls);

    let websiteUrl = data.website_url;
    try {
      const url = new URL(websiteUrl);
      url.searchParams.set('utm_source', 'redbookdev.showhntoday.com');
      url.searchParams.set('utm_medium', 'referral');
      url.searchParams.set('utm_campaign', 'redbook_dev');
      websiteUrl = url.toString();
    } catch (e) {
      console.error('Error parsing URL:', e);
    }

    // 处理小红书笔记链接
    let redbookUrl = data.redbook_url;
    try {
      if (redbookUrl && !redbookUrl.startsWith('http')) {
        redbookUrl = `https://${redbookUrl}`;
      }
    } catch (e) {
      console.error('Error parsing RedBook URL:', e);
    }

    // 获取分类名称的翻译
    const getCategoryName = (category: string) => {
      switch (category) {
        case 'web':
          return submitT('category_web');
        case 'app':
          return submitT('category_app');
        case 'tool':
          return submitT('category_tool');
        case 'other':
          return submitT('category_other');
        default:
          return category;
      }
    };

    // 确保截图数组存在
    const screenshots = Array.isArray(data.screenshot_urls) ? data.screenshot_urls : [];

    // 添加更多调试信息
    console.log('Processed screenshots:', {
      screenshots,
      length: screenshots.length,
      firstImage: screenshots[0],
    });

    return (
      <div className='mx-auto w-full max-w-6xl'>
        {/* 头部区域 */}
        <div className='flex flex-col px-6 py-8 lg:flex-row lg:items-start lg:gap-8 lg:px-0 lg:py-10'>
          {/* 左侧信息区 */}
          <div className='flex flex-col items-center lg:w-1/2 lg:items-start'>
            <div className='w-full space-y-3 text-balance'>
              <h1 className='text-3xl font-bold lg:text-5xl'>{data.title}</h1>
              <h2 className='text-sm text-white/80 lg:text-base'>{data.description}</h2>
            </div>

            {/* 项目信息 */}
            <div className='mt-6 flex w-full flex-col gap-3 rounded-lg bg-white/5 p-4 text-sm text-white/80'>
              {/* 创作者信息 */}
              <div className='flex items-center gap-2'>
                <User className='size-5 text-white/60' />
                <span className='font-medium'>
                  {data.creator_name} {data.creator_redbook_id && `(${data.creator_redbook_id})`}
                </span>
              </div>

              {/* 分类 */}
              <div className='flex items-center gap-2'>
                <Layers className='size-5 text-white/60' />
                <span>{getCategoryName(data.category)}</span>
              </div>

              {/* 标签 */}
              {data.tags && data.tags.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                  <Tag className='size-5 flex-shrink-0 text-white/60' />
                  <div className='flex flex-wrap gap-2'>
                    {data.tags.map((tag: string) => (
                      <span
                        key={`tag-${tag}`}
                        className='rounded-full bg-white/10 px-3 py-1 text-xs transition-colors hover:bg-white/20'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className='mt-6 flex w-full flex-col gap-3'>
              <a
                href={websiteUrl}
                target='_blank'
                rel='noreferrer'
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF4D4D] to-[#F9C76C] p-3 text-sm font-medium text-white transition-opacity hover:opacity-90'
              >
                {t('visitWebsite')} <CircleArrowRight className='size-4' />
              </a>

              {redbookUrl && (
                <a
                  href={redbookUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 p-3 text-sm font-medium text-white transition-colors hover:bg-white/10'
                >
                  {submitT('redbook_url')} <LinkIcon className='size-4' />
                </a>
              )}
            </div>
          </div>

          {/* 右侧主图预览 */}
          <div className='mt-8 lg:mt-0 lg:w-1/2'>
            <div className='relative aspect-video w-full overflow-hidden rounded-xl border border-white/10'>
              <BaseImage title={data.title} alt={data.title} fill src={screenshots[0] || ''} className='object-cover' />
              <a
                href={websiteUrl}
                target='_blank'
                rel='noreferrer'
                className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100'
              >
                <div className='flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-white backdrop-blur-sm'>
                  {t('visitWebsite')} <CircleArrowRight className='size-4' />
                </div>
              </a>
            </div>
          </div>
        </div>

        <Separator className='my-8 bg-white/10' />

        {/* 项目介绍 */}
        <div className='px-6 lg:px-0'>
          <h2 className='mb-6 text-2xl font-semibold text-white/90'>{t('introduction')}</h2>
          <div className='rounded-lg bg-white/5 p-6'>
            <MarkdownProse markdown={data.description || ''} />
          </div>
        </div>

        {/* 项目截图 - 修改条件，确保显示所有截图 */}
        {screenshots.length > 0 && (
          <>
            <Separator className='my-8 bg-white/10' />
            <div className='mb-10 px-6 lg:px-0'>
              <h2 className='mb-6 text-2xl font-semibold text-white/90'>{submitT('screenshots')}</h2>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {screenshots.map((url: string, index: number) => (
                  <a
                    key={`screenshot-${url}`}
                    href={url}
                    target='_blank'
                    rel='noreferrer'
                    className='group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg border border-white/10'
                  >
                    <BaseImage
                      src={url}
                      alt={`${data.title} screenshot ${index + 1}`}
                      fill
                      className='object-cover transition-transform group-hover:scale-105'
                    />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                      <div className='flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm'>
                        查看大图 <ExternalLink className='size-3' />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in project detail page:', error);
    notFound();
  }
}
