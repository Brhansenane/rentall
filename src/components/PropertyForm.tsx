import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function PropertyForm() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    features: '',
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // تحويل الخصائص إلى مصفوفة
      const featuresArray = formData.features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature);

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          features: featuresArray
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'تم إضافة العقار بنجاح وهو الآن قيد المراجعة' 
        });
        // إعادة تعيين النموذج
        setFormData({
          title: '',
          description: '',
          location: '',
          price: '',
          features: '',
          images: []
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'حدث خطأ أثناء إضافة العقار' 
        });
      }
    } catch (error) {
      console.error('خطأ في إضافة العقار:', error);
      setMessage({ 
        type: 'error', 
        text: 'حدث خطأ أثناء إضافة العقار' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">إضافة عقار جديد</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            عنوان العقار
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل عنوان العقار"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            وصف العقار
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل وصفاً تفصيلياً للعقار"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            الموقع
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل موقع العقار"
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            السعر
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل سعر العقار"
          />
        </div>
        
        <div>
          <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
            المميزات (مفصولة بفواصل)
          </label>
          <input
            type="text"
            id="features"
            name="features"
            value={formData.features}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="مثال: 3 غرف نوم, 2 حمام, موقف سيارات"
          />
        </div>
        
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
            روابط الصور (سيتم إضافة هذه الميزة لاحقاً)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            ملاحظة: ميزة رفع الصور ستكون متاحة في الإصدار القادم
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إضافة العقار'}
          </button>
        </div>
      </form>
    </div>
  );
}
