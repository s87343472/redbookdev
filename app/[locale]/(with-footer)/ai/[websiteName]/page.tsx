import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/db/supabase/client';
import { CircleArrowRight } from 'lucide-react';
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

    return (
      <div className='w-full'>
        <div className='flex flex-col px-6 py-5 lg:h-[323px] lg:flex-row lg:justify-between lg:px-0 lg:py-10'>
          <div className='flex flex-col items-center lg:items-start'>
            <div className='space-y-1 text-balance lg:space-y-3'>
              <h1 className='text-2xl lg:text-5xl'>{data.title}</h1>
              <h2 className='text-xs lg:text-sm'>{data.description}</h2>
            </div>
            <a
              href={websiteUrl}
              target='_blank'
              rel='noreferrer'
              className='flex-center mt-5 min-h-5 w-full gap-1 rounded-[8px] bg-white p-[10px] text-sm capitalize text-black hover:opacity-80 lg:mt-auto lg:w-[288px]'
            >
              {t('visitWebsite')} <CircleArrowRight className='size-[14px]' />
            </a>
          </div>
          <a
            href={websiteUrl}
            target='_blank'
            rel='noreferrer'
            className='flex-center group relative h-[171px] w-full flex-shrink-0 lg:h-[234px] lg:w-[466px]'
          >
            <BaseImage
              title={data.title}
              alt={data.title}
              fill
              src={data.screenshot_urls?.[0] || ''}
              className='absolute mt-3 aspect-[466/234] w-full rounded-[16px] border border-[#424242] bg-[#424242] bg-cover lg:mt-0'
            />
            <div className='absolute inset-0 z-10 hidden items-center justify-center gap-1 rounded-[16px] bg-black bg-opacity-50 text-2xl text-white transition-all duration-200 group-hover:flex'>
              {t('visitWebsite')} <CircleArrowRight className='size-5' />
            </div>
          </a>
        </div>
        <Separator className='bg-[#010101]' />
        <div className='mb-5 px-3 lg:px-0'>
          <h2 className='my-5 text-2xl text-white/40 lg:my-10'>{t('introduction')}</h2>
          <MarkdownProse markdown={data.description || ''} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in project detail page:', error);
    notFound();
  }
}
