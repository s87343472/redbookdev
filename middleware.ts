import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import intlMiddleware from './middlewares/intlMiddleware';

export async function middleware(request: NextRequest) {
  // 先处理国际化
  const intlResponse = await intlMiddleware(request);
  
  // 检查是否是管理页面
  const isAdminPage = request.nextUrl.pathname.includes('/admin');
  if (!isAdminPage) {
    return intlResponse;
  }

  // 处理认证
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 如果没有登录，重定向到登录页
  if (!session) {
    // 获取当前语言
    const locale = request.nextUrl.pathname.split('/')[1];
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 检查用户角色
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  // 如果不是管理员，重定向到首页
  if (!profile || profile.role !== 'admin') {
    const locale = request.nextUrl.pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径
     */
    '/((?!api|_next|.*\\..*).*)',
    '/:locale/admin/:path*',
    '/api/admin/:path*',
  ],
};
