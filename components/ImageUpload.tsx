import { useCallback, useState } from 'react';
import { createClient } from '@/db/supabase/client';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
}

export default function ImageUpload({ onImagesUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([]);
  const supabase = createClient();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setUploading(true);
        const urls: string[] = [];

        for (const file of acceptedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage.from('project-images').upload(filePath, file);

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('project-images').getPublicUrl(filePath);

          urls.push(publicUrl);
        }

        onImagesUploaded(urls);
        toast.success('图片上传成功');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        toast.error(`上传失败: ${errorMessage}`);
      } finally {
        setUploading(false);
      }
    },
    [onImagesUploaded, supabase],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (index: number) => {
    setPreviewImages((prev) => {
      const newPreviewImages = [...prev];
      URL.revokeObjectURL(newPreviewImages[index].preview);
      newPreviewImages.splice(index, 1);
      return newPreviewImages;
    });
  };

  const uploadImages = async () => {
    if (previewImages.length === 0) return [];

    setUploading(true);
    const urls: string[] = [];

    try {
      for (const { file } of previewImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage.from('project-images').upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('project-images').getPublicUrl(filePath);

        urls.push(publicUrl);
      }

      onImagesUploaded(urls);
      // 清理预览
      previewImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setPreviewImages([]);
    } catch (error) {
      console.error('上传图片失败:', error);
      toast.error('上传图片失败，请重试');
    } finally {
      setUploading(false);
    }

    return urls;
  };

  return (
    <div className='space-y-4'>
      <div className='mt-2'>
        <div
          {...getRootProps()}
          className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-transparent p-6 transition-colors hover:border-white/20 ${
            isDragActive ? 'border-white/30 bg-white/5' : ''
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className='text-center'>
              <div className='mb-2 text-lg'>上传中...</div>
              <div className='text-sm text-white/60'>请稍候</div>
            </div>
          ) : (
            <div className='text-center'>
              <div className='mb-2 text-lg'>{isDragActive ? '松开鼠标上传图片' : '点击或拖拽图片到此处上传'}</div>
              <div className='text-sm text-white/60'>
                支持 PNG、JPG、JPEG、GIF 格式，单个文件不超过 5MB，最多上传 5 张
              </div>
            </div>
          )}
        </div>
      </div>

      {previewImages.length > 0 && (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
          {previewImages.map(({ preview }, index) => (
            <div key={preview} className='relative aspect-video'>
              <img src={preview} alt={`预览图 ${index + 1}`} className='h-full w-full rounded object-cover' />
              <button
                type='button'
                onClick={() => removeImage(index)}
                className='absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {previewImages.length > 0 && (
        <button
          type='button'
          onClick={uploadImages}
          disabled={uploading}
          className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50'
        >
          {uploading ? '上传中...' : '确认上传'}
        </button>
      )}
    </div>
  );
}
