import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { authOptions } from '@/lib/auth';
import { sendNotificationToUser, sendNotificationToAdmins } from '@/lib/socketClient';

// الحصول على إشعارات المستخدم
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

    await dbConnect();

    // الحصول على إشعارات المستخدم
    const notifications = await Notification.find({ 
      recipient: session.user.id 
    })
    .sort({ createdAt: -1 })
    .populate('property', 'title')
    .limit(20);

    return NextResponse.json(
      { success: true, notifications },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطأ في الحصول على الإشعارات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء الحصول على الإشعارات', error: String(error) },
      { status: 500 }
    );
  }
}

// إنشاء إشعار جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // التحقق من تسجيل الدخول
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, propertyId, type, message } = body;

    // التحقق من البيانات المدخلة
    if (!recipientId || !type || !message) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول الأساسية مطلوبة' },
        { status: 400 }
      );
    }

    await dbConnect();

    // إنشاء إشعار جديد
    const notification = await Notification.create({
      recipient: recipientId,
      property: propertyId,
      type,
      message
    });

    // إرسال الإشعار في الوقت الفعلي
    if (type === 'property_pending') {
      // إرسال إشعار للمديرين
      sendNotificationToAdmins({
        id: notification._id,
        type,
        message,
        property: propertyId,
        createdAt: notification.createdAt
      });
    } else {
      // إرسال إشعار لمالك العقار
      sendNotificationToUser(recipientId, {
        id: notification._id,
        type,
        message,
        property: propertyId,
        createdAt: notification.createdAt
      });
    }

    return NextResponse.json(
      { success: true, message: 'تم إنشاء الإشعار بنجاح', notification },
      { status: 201 }
    );
  } catch (error) {
    console.error('خطأ في إنشاء الإشعار:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الإشعار', error: String(error) },
      { status: 500 }
    );
  }
}

// تحديث حالة قراءة الإشعار
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // التحقق من تسجيل الدخول
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: 'معرف الإشعار مطلوب' },
        { status: 400 }
      );
    }

    await dbConnect();

    // البحث عن الإشعار
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'الإشعار غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من أن المستخدم هو مستلم الإشعار
    if (notification.recipient.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بتحديث هذا الإشعار' },
        { status: 403 }
      );
    }

    // تحديث حالة قراءة الإشعار
    notification.isRead = true;
    await notification.save();

    return NextResponse.json(
      { success: true, message: 'تم تحديث حالة قراءة الإشعار بنجاح' },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطأ في تحديث حالة قراءة الإشعار:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تحديث حالة قراءة الإشعار', error: String(error) },
      { status: 500 }
    );
  }
}
