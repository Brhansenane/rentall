import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NotificationPanel from '@/components/NotificationPanel';

export default function HomePage() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  // إعادة توجيه المستخدم المسجل دخوله إلى لوحة التحكم المناسبة
  if (session) {
    if (session.user.role === 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">جاري التوجيه إلى لوحة تحكم المدير...</p>
            <meta httpEquiv="refresh" content="1;url=/admin" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">جاري التوجيه إلى لوحة تحكم مالك العقار...</p>
            <meta httpEquiv="refresh" content="1;url=/dashboard" />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">نظام إدارة العقارات</h1>
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4"
            >
              تسجيل الدخول
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            مرحباً بك في نظام إدارة العقارات
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            منصة متكاملة لإدارة العقارات ومراجعتها بكفاءة عالية
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">لمالكي العقارات</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>إضافة عقارات جديدة بسهولة</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>متابعة حالة العقارات المضافة</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>إشعارات فورية عند الموافقة أو الرفض</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link 
                href="/auth/register?role=property_owner" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                تسجيل كمالك عقار
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">للمديرين</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>مراجعة العقارات المقدمة</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>إشعارات فورية عند إضافة عقار جديد</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>لوحة تحكم متكاملة لإدارة العقارات</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link 
                href="/auth/register?role=admin" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                تسجيل كمدير
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white mt-12 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} نظام إدارة العقارات. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
