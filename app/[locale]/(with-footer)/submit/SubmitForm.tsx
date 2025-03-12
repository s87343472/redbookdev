'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { createClient } from '@/db/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FORM_PLACEHOLDER, WEBSITE_EXAMPLE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Spinning from '@/components/Spinning';
import ImageUpload from '@/components/ImageUpload';

const FormSchema = z.object({
  title: z.string().min(1, {
    message: '请输入项目名称'
  }),
  description: z.string().min(1, {
    message: '请输入项目描述'
  }),
  website_url: z.string().url({
    message: '请输入有效的网址'
  }),
  redbook_url: z.string().url({
    message: '请输入有效的小红书笔记链接'
  }),
  creator_name: z.string().min(1, {
    message: '请输入创作者名称'
  }),
  creator_redbook_id: z.string().min(1, {
    message: '请输入小红书ID'
  }),
  category: z.enum(['web', 'app', 'tool', 'other']),
  tags: z.string(),
});

export default function SubmitForm({ className }: { className?: string }) {
  const supabase = createClient();
  const t = useTranslations('Submit.form');
  const [loading, setLoading] = useState(false);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      website_url: '',
      redbook_url: '',
      creator_name: '',
      creator_redbook_id: '',
      category: 'web',
      tags: '',
    },
  });

  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    if (screenshotUrls.length === 0) {
      toast.error(t('screenshot_required'));
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('redbook_projects').insert({
        title: formData.title,
        description: formData.description,
        website_url: formData.website_url,
        redbook_url: formData.redbook_url,
        creator_name: formData.creator_name,
        creator_redbook_id: formData.creator_redbook_id,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        screenshot_urls: screenshotUrls,
        status: 'pending'
      });
      
      if (error) throw error;
      
      toast.success(t('success'));
      form.reset();
      setScreenshotUrls([]);
    } catch (error) {
      console.error(t('error'), error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleImagesUploaded = (urls: string[]) => {
    setScreenshotUrls(urls);
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
                    type='url'
                    placeholder='https://your-project.com'
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
                    type='url'
                    placeholder='https://www.xiaohongshu.com/...'
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='space-y-1'>
            <FormLabel>{t('screenshots')} *</FormLabel>
            <ImageUpload onImagesUploaded={handleImagesUploaded} />
            {screenshotUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {screenshotUrls.map((url, index) => (
                  <div key={url} className="relative aspect-video">
                    <img
                      src={url}
                      alt={`项目截图 ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='mt-8 flex flex-col gap-[10px] lg:gap-8'>
          <button
            type='submit'
            disabled={loading}
            className={cn(
              'flex-center h-[48px] w-full gap-4 rounded-[8px] bg-white text-center font-bold text-black hover:cursor-pointer hover:opacity-80',
              loading && 'hover:cursor-not-allowed',
            )}
          >
            {loading ? <Spinning className='size-[22px]' /> : t('submit')}
          </button>
          <p className='text-[13px] text-white/40'>
            {t('pending_notice')}
          </p>
        </div>
      </form>
    </Form>
  );
}
