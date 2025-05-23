'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NotificationPanel from '@/components/NotificationPanel';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // استخدام useEffect لجلب العقارات عند تحميل الصفحة
  useState(() => {
    const fetchPendingProperties = async () => {
      if (status === 'authenticated' && session?.user?.role === 'admin') {
        try {
          const response = await fetch('/api/properties?status=pending');
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
    
    fetchPendingProperties();
  }, [status, session]);

  const handleReview = async (propertyId, status) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: status === 'approved' 
            ? 'تمت الموافقة على العقار بنجاح' 
            : 'تم رفض العقار بنجاح' 
        });
        
        // إزالة العقار من القائمة
        setProperties(prev => prev.filter(p => p._id !== propertyId));
      } else {
        setMessage({ type: 'error', text: data.message || 'حدث خطأ أثناء مراجعة العقار' });
      }
    } catch (error) {
      console.error('خطأ في مراجعة العقار:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء مراجعة العقار' });
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

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح بالوصول</h1>
          <p className="text-gray-700 mb-4">هذه الصفحة مخصصة للمديرين فقط.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المدير</h1>
          <div className="flex items-center space-x-4">
            <NotificationPanel />
            <div className="text-sm text-gray-700 mr-4">
              مرحباً، {session.user.name}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">العقارات بانتظار المراجعة</h2>
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">جاري تحميل العقارات...</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الموقع
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإضافة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{property.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{property.price} ريال</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(property.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => handleReview(property._id, 'approved')}
                          className="text-green-600 hover:text-green-900 ml-4"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={() => handleReview(property._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          رفض
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد عقارات بانتظار المراجعة
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
