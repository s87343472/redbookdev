import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='32'
      viewBox='0 0 32 32'
      fill='none'
      className={cn('text-white', className)}
    >
      <path
        d='M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 25.2c-6.188 0-11.2-5.012-11.2-11.2S9.812 4.8 16 4.8 27.2 9.812 27.2 16 22.188 27.2 16 27.2z'
        fill='currentColor'
      />
      <path
        d='M16 8.4c-4.188 0-7.6 3.412-7.6 7.6s3.412 7.6 7.6 7.6 7.6-3.412 7.6-7.6-3.412-7.6-7.6-7.6zm0 12.8c-2.87 0-5.2-2.33-5.2-5.2s2.33-5.2 5.2-5.2 5.2 2.33 5.2 5.2-2.33 5.2-5.2 5.2z'
        fill='currentColor'
      />
      <circle cx='16' cy='16' r='2.8' fill='currentColor' />
    </svg>
  );
}
