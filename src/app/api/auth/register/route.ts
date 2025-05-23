import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // التحقق من البيانات المدخلة
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة الدور
    if (role && !['property_owner', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'الدور غير صالح' },
        { status: 400 }
      );
    }

    await dbConnect();

    // التحقق من وجود المستخدم مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء مستخدم جديد
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'property_owner' // الدور الافتراضي هو مالك عقار
    });

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return NextResponse.json(
      { success: true, message: 'تم إنشاء المستخدم بنجاح', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('خطأ في تسجيل المستخدم:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تسجيل المستخدم', error: String(error) },
      { status: 500 }
    );
  }
}
