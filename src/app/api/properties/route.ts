import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // التحقق من تسجيل الدخول
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // التحقق من أن المستخدم هو مدير
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بعرض هذه العقارات' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    await dbConnect();

    // بناء استعلام البحث
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // الحصول على العقارات
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');

    return NextResponse.json(
      { success: true, properties },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطأ في الحصول على العقارات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء الحصول على العقارات', error: String(error) },
      { status: 500 }
    );
  }
}
