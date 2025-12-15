import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addHotel, getAllAmenities } from '../../../service/ApiService';

const AddHotelPage = () => {
  const [form, setForm] = useState({
    name: '', location: '', description: '', starRating: 5,
    email: '', phone: '', contactName: '', contactPhone: '', isActive: true,
    amenityIds: []
  });
  const [amenities, setAmenities] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      try {
        const res = await getAllAmenities();
        const list = res?.data ?? res ?? [];
        // chỉ hiển thị những tiện nghi cấp khách sạn cho form thêm khách sạn
        const arr = Array.isArray(list) ? list : [];
        setAmenities(arr.filter(a => (a.type || '').toLowerCase().includes('hotel')));
      } catch (e) {
        // bỏ qua lỗi tải tiện nghi
      }
    })();
  }, []);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setForm(f => ({ ...f, images: files }));
  // tạo preview ảnh
  const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setForm(f => ({ ...f, images: [] }));
      setImagePreviews([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };


  const toggleAmenity = (id) => {
    setForm(f => {
      const next = new Set(f.amenityIds || []);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...f, amenityIds: Array.from(next) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!form.name || !form.location || !form.description) {
      setError('Vui lòng điền tên, địa điểm và mô tả');
      return;
    }
    // Require at least one image
    if (!form.images || !Array.isArray(form.images) || form.images.length === 0) {
      setError('Vui lòng chọn ít nhất 1 hình ảnh cho khách sạn.');
      return;
    }
    setLoading(true);
    try {
      await addHotel(form);
      setMessage('Tạo khách sạn thành công.');
      setTimeout(() => navigate('/admin/manage-hotels'), 1000);
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo khách sạn');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-2">Thêm khách sạn</h1>
      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên *</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vị trí *</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <label className="block text-sm font-medium mb-1">Mô tả *</label><br />
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" rows={4}/>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Sao</label>
            <input type="number" name="starRating" value={form.starRating} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Điện thoại</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hoạt động</label>
            <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Người liên hệ</label>
            <input name="contactName" value={form.contactName} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại người liên hệ</label>
            <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hình ảnh khách sạn (ít nhất 1) *</label>
          <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="w-full p-2 border rounded" />
          {imagePreviews && imagePreviews.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {imagePreviews.map((src, idx) => (
                <img key={idx} src={src} alt={`preview-${idx}`} className="w-32 h-20 object-cover rounded" />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tiện nghi (tùy chọn)</label>
          <div className="flex flex-wrap gap-2">
            {amenities.map(a => (
              <label key={a.id} className="inline-flex items-center gap-2 px-2 py-1 border rounded">
                <input type="checkbox" checked={(form.amenityIds || []).includes(a.id)} onChange={() => toggleAmenity(a.id)} />
                <span>{a.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/manage-hotels')} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Đang lưu...' : 'Lưu'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddHotelPage;
