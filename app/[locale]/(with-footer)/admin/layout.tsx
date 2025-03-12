export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='mx-auto w-full max-w-pc px-3 lg:px-0'>
      {children}
    </div>
  );
} 