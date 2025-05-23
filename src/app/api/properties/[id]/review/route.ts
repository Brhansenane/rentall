import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Property from '@/models/Property';
import Notification from '@/models/Notification';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        { success: false, message: 'غير مصرح لك بمراجعة العقارات' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // التحقق من صحة الحالة
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'حالة غير صالحة' },
        { status: 400 }
      );
    }

    await dbConnect();

    // البحث عن العقار
    const property = await Property.findById(id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, message: 'العقار غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من أن العقار في حالة انتظار
    if (property.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'تمت مراجعة هذا العقار مسبقاً' },
        { status: 400 }
      );
    }

    // تحديث حالة العقار
    property.status = status;
    await property.save();

    // إنشاء إشعار لمالك العقار
    const notificationType = status === 'approved' ? 'property_approved' : 'property_rejected';
    const notificationMessage = status === 'approved' 
      ? `تمت الموافقة على عقارك: ${property.title}`
      : `تم رفض عقارك: ${property.title}`;

    await Notification.create({
      recipient: property.owner,
      property: property._id,
      type: notificationType,
      message: notificationMessage
    });

    // إذا تم الرفض، يمكن حذف العقار (اختياري حسب متطلبات المشروع)
    if (status === 'rejected') {
      await Property.findByIdAndDelete(id);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: status === 'approved' 
          ? 'تمت الموافقة على العقار بنجاح' 
          : 'تم رفض العقار بنجاح',
        property: {
          id: property._id,
          title: property.title,
          status: property.status
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطأ في مراجعة العقار:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء مراجعة العقار', error: String(error) },
      { status: 500 }
    );
  }
}
