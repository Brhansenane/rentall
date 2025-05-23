import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // المسارات العامة التي لا تتطلب مصادقة
  const publicPaths = ['/auth/login', '/auth/register', '/'];
  const isPublicPath = publicPaths.some(publicPath => path === publicPath || path.startsWith('/api/auth'));

  // التحقق من وجود جلسة مستخدم
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // إذا كان المسار عاماً، السماح بالوصول
  if (isPublicPath) return NextResponse.next();

  // إذا لم يكن هناك جلسة وليس مساراً عاماً، إعادة التوجيه إلى صفحة تسجيل الدخول
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // التحقق من الأدوار للمسارات المحمية
  if (session) {
    // مسارات المدير
    if (path.startsWith('/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // مسارات مالك العقار
    if (path.startsWith('/dashboard/properties') && session.role !== 'property_owner') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}
