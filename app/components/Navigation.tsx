import { useTranslations } from 'next-intl';

import { Link } from '@/app/navigation';

import Logo from './Logo';

export default function Navigation() {
  const t = useTranslations('Navigation');

  return (
    <nav className='sticky top-0 z-50 w-full border-b border-gray-800 bg-tap4-black/80 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-pc items-center justify-between px-4'>
        <Link href='/' className='flex items-center gap-2'>
          <Logo className='h-8 w-8' />
          <span className='text-lg font-bold'>{t('title')}</span>
        </Link>

        <div className='flex items-center gap-4'>
          <Link href='/explore' className='text-sm text-gray-300 hover:text-white'>
            {t('explore')}
          </Link>
          <Link
            href='/submit'
            className='rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100'
          >
            {t('submit')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
