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

    // التحقق من أن المستخدم هو مالك عقار
    if (session.user.role !== 'property_owner') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بعرض هذه العقارات' },
        { status: 403 }
      );
    }

    await dbConnect();

    // الحصول على عقارات المستخدم
    const properties = await Property.find({ owner: session.user.id })
      .sort({ createdAt: -1 });

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
