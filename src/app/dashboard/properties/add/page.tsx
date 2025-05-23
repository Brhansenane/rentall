import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NotificationPanel from '@/components/NotificationPanel';
import PropertyForm from '@/components/PropertyForm';

export default function AddProperty() {
  const { data: session } = useSession();

  if (!session || session.user.role !== 'property_owner') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح بالوصول</h1>
          <p className="text-gray-700 mb-4">هذه الصفحة مخصصة لمالكي العقارات فقط.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">إضافة عقار جديد</h1>
          <div className="flex items-center space-x-4">
            <NotificationPanel />
            <div className="text-sm text-gray-700 mr-4">
              مرحباً، {session.user.name}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            العودة إلى لوحة التحكم
          </Link>
        </div>
        
        <PropertyForm />
      </main>
    </div>
  );
}
