'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { createClient } from '@/db/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { FORM_PLACEHOLDER, WEBSITE_EXAMPLE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import Spinning from '@/components/Spinning';

export default function SubmitForm({ className }: { className?: string }) {
  const supabase = createClient();
  const t = useTranslations('Submit');
  const [loading, setLoading] = useState(false);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);

  const formSchema = z.object({
    title: z.string().min(1, {
      message: t('error_title_required'),
    }),
    description: z.string().min(1, {
      message: t('error_description_required'),
    }),
    website_url: z.string().min(1, {
      message: t('error_website_url_required'),
    }),
    redbook_url: z.string().min(1, {
      message: t('error_redbook_url_required'),
    }),
    creator_name: z.string().min(1, {
      message: t('error_creator_name_required'),
    }),
    creator_redbook_id: z.string().min(1, {
      message: t('error_creator_redbook_id_required'),
    }),
    category: z.string().min(1, {
      message: t('error_category_required'),
    }),
    tags: z.array(z.string()).min(1, {
      message: t('error_tags_required'),
    }),
    screenshot_urls: z.array(z.string()).min(1, {
      message: t('error_screenshots_required'),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      website_url: '',
      redbook_url: '',
      creator_name: '',
      creator_redbook_id: '',
      category: 'web',
      tags: [],
      screenshot_urls: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (screenshotUrls.length === 0) {
      toast.error(t('screenshot_required'));
      return;
    }

    try {
      setLoading(true);

      // 自动添加https://前缀（如果没有的话）
      const formattedValues = {
        ...values,
        website_url: values.website_url.startsWith('http') ? values.website_url : `https://${values.website_url}`,
        redbook_url: values.redbook_url.startsWith('http') ? values.redbook_url : `https://${values.redbook_url}`,
        // 确保使用最新的screenshotUrls
        screenshot_urls: screenshotUrls,
      };

      const { error } = await supabase.from('redbook_projects').insert({
        ...formattedValues,
        status: 'pending',
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(t('success'));
      form.reset();
      setScreenshotUrls([]);
    } catch (error) {
      if (error instanceof Error) {
        console.error(t('error'), error.message);
        toast.error(error.message);
      } else {
        console.error(t('error'), error);
        toast.error(t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImagesUploaded = (urls: string[]) => {
    setScreenshotUrls(urls);
    form.setValue('screenshot_urls', urls);
  };

  const removeScreenshot = (url: string) => {
    const newUrls = screenshotUrls.filter((u) => u !== url);
    setScreenshotUrls(newUrls);
    form.setValue('screenshot_urls', newUrls);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'mx-3 mb-5 flex flex-col justify-between rounded-[12px] bg-[#2C2D36] px-3 py-5 lg:w-[600px] lg:p-8',
          className,
        )}
      >
        <div className='space-y-3 lg:space-y-5'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('title')} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('title_placeholder')}
                    className='input-border-pink h-[42px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-5'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('description')} *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('description_placeholder')}
                    className='input-border-pink min-h-[100px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-5'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='website_url'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('url')} *</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='your-project.com'
                    className='input-border-pink h-[42px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-5'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='redbook_url'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('redbook_url')} *</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='www.xiaohongshu.com/...'
                    className='input-border-pink h-[42px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-5'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='creator_name'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('creator_name')} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('creator_name_placeholder')}
                    className='input-border-pink h-[42px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-5'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='creator_redbook_id'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('creator_redbook_id')} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('creator_redbook_id_placeholder')}
                    className='input-border-pink h-[42px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-5'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('category')} *</FormLabel>
                <FormControl>
                  <select
                    className='input-border-pink h-[42px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-2'
                    {...field}
                  >
                    <option value='web'>{t('category_web')}</option>
                    <option value='app'>{t('category_app')}</option>
                    <option value='tool'>{t('category_tool')}</option>
                    <option value='other'>{t('category_other')}</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='tags'
            render={({ field }) => (
              <FormItem className='space-y-1'>
                <FormLabel>{t('tags')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('tags_placeholder')}
                    className='input-border-pink h-[42px] w-full rounded-[8px] border-[0.5px] bg-dark-bg p-5'
                    value={field.value ? field.value.join(', ') : ''}
                    onChange={(e) => {
                      const tagsString = e.target.value;
                      const tagsArray = tagsString
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag !== '');
                      field.onChange(tagsArray);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='mt-4'>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>{t('screenshots')} *</label>
              <ImageUpload onImagesUploaded={handleImagesUploaded} />
            </div>
            {screenshotUrls.length > 0 && (
              <div className='mt-4 grid grid-cols-2 gap-4'>
                {screenshotUrls.map((url) => (
                  <div key={url} className='relative'>
                    <img src={url} alt='Screenshot' className='h-32 w-full rounded object-cover' />
                    <button
                      type='button'
                      onClick={() => removeScreenshot(url)}
                      className='absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='mt-8 flex flex-col gap-[10px] lg:gap-8'>
          <div className='flex items-center justify-center'>
            {loading ? (
              <div className='flex items-center space-x-2'>
                <Spinning />
                <span>{t('submitting')}</span>
              </div>
            ) : (
              <button
                type='submit'
                className='h-[42px] w-[120px] rounded-[8px] bg-gradient-to-r from-[#FF4D4D] to-[#F9C76C] font-medium text-white hover:opacity-80'
              >
                {t('submit')}
              </button>
            )}
          </div>
          <p className='text-[13px] text-white/40'>{t('pending_notice')}</p>
        </div>
      </form>
    </Form>
  );
}
