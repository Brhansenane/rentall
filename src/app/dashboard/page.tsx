'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NotificationPanel from '@/components/NotificationPanel';

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchMyProperties = async () => {
      if (status === 'authenticated' && session?.user?.role === 'property_owner') {
        try {
          const response = await fetch('/api/properties/my-properties');
          const data = await response.json();
          
          if (data.success) {
            setProperties(data.properties);
          } else {
            setMessage({ type: 'error', text: data.message || 'حدث خطأ أثناء جلب العقارات' });
          }
        } catch (error) {
          console.error('خطأ في جلب العقارات:', error);
          setMessage({ type: 'error', text: 'حدث خطأ أثناء جلب العقارات' });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchMyProperties();
  }, [status, session]);

  // تحديد لون حالة العقار
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ترجمة حالة العقار
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'غير معروف';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم مالك العقار</h1>
          <div className="flex items-center space-x-4">
            <NotificationPanel />
            <div className="text-sm text-gray-700 mr-4">
              مرحباً، {session.user.name}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">عقاراتي</h2>
          <Link 
            href="/dashboard/properties/add" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            إضافة عقار جديد
          </Link>
        </div>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">جاري تحميل العقارات...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property._id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {getStatusText(property.status)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">الموقع:</span> {property.location}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">السعر:</span> {property.price} ريال
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">تاريخ الإضافة:</span> {new Date(property.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {property.description}
                  </div>
                  
                  {property.status === 'approved' && (
                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`/dashboard/properties/${property._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">لا توجد عقارات مضافة بعد</p>
            <Link 
              href="/dashboard/properties/add" 
              className="text-blue-600 hover:underline"
            >
              إضافة عقار جديد
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
