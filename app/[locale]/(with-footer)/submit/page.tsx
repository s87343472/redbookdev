import React from 'react';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import Faq from '@/components/Faq';

import SubmitForm from './SubmitForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Submit');
  return {
    title: t('title'),
    description: t('subTitle'),
  };
}

export default function Submit() {
  const t = useTranslations('Submit');

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold'>{t('title')}</h1>
        <p className='text-gray-400'>{t('subTitle')}</p>
      </div>
      <div className='flex justify-center'>
        <SubmitForm />
      </div>
    </div>
  );
}
