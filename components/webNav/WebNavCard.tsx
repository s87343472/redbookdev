'use client';

/* eslint-disable react/jsx-no-target-blank */
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WebNavigation } from '@/db/supabase/types';
import { CircleArrowRight, SquareArrowOutUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WebNavCard({ id, name, thumbnail_url, title, url, content }: WebNavigation) {
  const t = useTranslations('Home');
  const params = useParams();
  const locale = params.locale as string;

  if (!id) {
    return null;
  }

  const websiteUrl = url ? new URL(url) : null;
  if (websiteUrl) {
    websiteUrl.searchParams.set('utm_source', 'redbookdev.showhntoday.com');
    websiteUrl.searchParams.set('utm_medium', 'referral');
    websiteUrl.searchParams.set('utm_campaign', 'redbook_dev');
  }

  // 对标题进行URL编码，以支持中文和其他非英文字符
  const encodedTitle = encodeURIComponent(title || '');

  return (
    <div className='flex h-[210px] flex-col gap-3 rounded-xl bg-[#2C2D36] p-1 lg:h-[343px]'>
      <Link href={`/${locale}/ai/${encodedTitle}`} title={title ?? ''} className='group relative'>
        <img
          src={thumbnail_url ?? ''}
          alt={title ?? ''}
          title={title ?? ''}
          width={310}
          height={174}
          className='aspect-[310/174] w-full rounded-xl bg-white/40 hover:opacity-70'
        />
        <div className='absolute inset-0 z-10 hidden items-center justify-center gap-1 rounded-xl bg-black bg-opacity-50 text-xl text-white transition-all duration-200 group-hover:flex'>
          {t('checkDetail')} <CircleArrowRight className='size-4' />
        </div>
      </Link>
      <div className='flex items-center justify-between px-[6px]'>
        <a
          href={websiteUrl?.toString() ?? '#'}
          title={title ?? ''}
          target='_blank'
          rel='nofollow'
          className='hover:opacity-70'
        >
          <h3 className='line-clamp-1 flex-1 text-sm font-bold lg:text-base'>{title ?? ''}</h3>
        </a>
        <a
          href={websiteUrl?.toString() ?? '#'}
          title={title ?? ''}
          target='_blank'
          rel='nofollow'
          className='hover:opacity-70'
        >
          <SquareArrowOutUpRight className='size-5' />
          <span className='sr-only'>{title ?? ''}</span>
        </a>
      </div>
      <p className='line-clamp-3 px-[6px] text-xs text-white/70 lg:line-clamp-5 lg:text-sm'>{content ?? ''}</p>
    </div>
  );
}
