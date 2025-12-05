import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllHotels, updateHotel, getAllAmenities } from '../../../service/ApiService';

const EditHotelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllHotels();
        const list = res?.data ?? res ?? [];
        const found = (Array.isArray(list) ? list : []).find(h => Number(h.id) === Number(id));
        if (mounted) {
          setHotel(found || null);
          setForm(found ? {
            name: found.name || '',
            location: found.location || '',
            description: found.description || '',
            starRating: found.starRating || 5,
            email: found.email || '',
            phone: found.phone || '',
            contactName: found.contactName || '',
            contactPhone: found.contactPhone || '',
            isActive: found.isActive || false,
            amenityIds: Array.isArray(found.amenities) ? found.amenities.map(a => a.id || a) : []
          } : null);
        }
      } catch (err) {
        setError(err.message || 'Error loading hotel');
      }
      try {
        const res2 = await getAllAmenities();
        const list2 = res2?.data ?? res2 ?? [];
        if (mounted) setAmenities(Array.isArray(list2) ? list2 : []);
      } catch (e) {
        // ignore
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (!form) return;
    if (type === 'checkbox' && name === 'isActive') {
      setForm(f => ({ ...f, isActive: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const toggleAmenity = (aid) => {
    setForm(f => {
      const next = new Set(f.amenityIds || []);
      if (next.has(aid)) next.delete(aid); else next.add(aid);
      return { ...f, amenityIds: Array.from(next) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form) return;
    setLoading(true);
    try {
      await updateHotel(id, form);
      setMessage('Cập nhật khách sạn thành công.');
      setTimeout(() => navigate('/admin/manage-hotels'), 1000);
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật');
    }
    setLoading(false);
  };

  if (loading) return <div className="container mx-auto p-6 mt-20">Đang tải...</div>;
  if (!hotel) return <div className="container mx-auto p-6 mt-20">Khách sạn không tồn tại.</div>;

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-2">Chỉnh sửa khách sạn - ID {hotel.id}</h1>
      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ID (khóa)</label>
            <input disabled value={hotel.id} className="w-full p-2 border rounded bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Vị trí</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" rows={4} />
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
            <label className="block text-sm font-medium mb-1">Active</label>
            <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Người liên hệ</label>
          <input name="contactName" value={form.contactName} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tiện nghi</label>
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
          <button type="button" onClick={() => navigate('/admin/manage-hotels')} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditHotelPage;
