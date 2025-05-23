import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ success: true, message: 'تم الاتصال بقاعدة البيانات بنجاح' });
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    return NextResponse.json(
      { success: false, message: 'فشل الاتصال بقاعدة البيانات', error: String(error) },
      { status: 500 }
    );
  }
}
