import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { createClient } from '@/db/supabase/client';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
}

export default function ImageUpload({ onImagesUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([]);
  const supabase = createClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // 检查文件数量限制
    if (previewImages.length + acceptedFiles.length > 5) {
      toast.error('最多只能上传5张图片');
      return;
    }

    // 检查文件大小和类型
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`文件 ${file.name} 超过2MB限制`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`文件 ${file.name} 不是图片格式`);
        return false;
      }
      return true;
    });

    // 添加预览
    const newPreviewImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
  }, [previewImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 2 * 1024 * 1024 // 2MB
  });

  const removeImage = (index: number) => {
    setPreviewImages(prev => {
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
        const filePath = `screenshots/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('project-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>将图片拖放到这里</p>
        ) : (
          <p>点击或拖放图片到这里上传（最多5张，每张不超过2MB）</p>
        )}
      </div>

      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map(({ preview }, index) => (
            <div key={preview} className="relative aspect-video">
              <img
                src={preview}
                alt={`预览图 ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {previewImages.length > 0 && (
        <button
          onClick={uploadImages}
          disabled={uploading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {uploading ? '上传中...' : '确认上传'}
        </button>
      )}
    </div>
  );
} 