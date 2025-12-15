import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAllRooms, updateRoom, getAllAmenities, getRoomsByHotel } from '../../../service/ApiService';

const EditRoomPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const managedHotelId = location?.state?.hotelId;
  const hotelName = location?.state?.hotelName;
  const hotelRooms = location?.state?.rooms;
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'SINGLE',
    price: '',
    capacity: '',
    amount: '',
    amenities: [],
    photo: null
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const comboRef = useRef();

  // ref để đóng dropdown khi click ra ngoài
  useEffect(() => {
    const onDoc = (e) => {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
    // Tải danh sách tiện nghi và chỉ hiển thị tiện nghi ở cấp phòng cho form chỉnh sửa phòng
    const amenityRes = await getAllAmenities();
  const amenityList = amenityRes?.data ?? amenityRes ?? [];
  const arr = Array.isArray(amenityList) ? amenityList : [];
  if (mounted) setAmenityOptions(arr.filter(a => (a.type || '').toLowerCase().includes('room')));

        // Lấy danh sách phòng và tìm phòng theo ID
        const res = await getAllRooms();
        const list = res.data || [];
        const room = list.find(r => String(r.id) === String(id));
        if (room && mounted) {
          setForm({
            name: room.name || '',
            description: room.description || '',
            type: room.type || 'SINGLE',
            price: room.price || '',
            capacity: room.capacity || '',
            amount: room.amount || '',
            amenities: room.amenities || [],
            photo: null
          });
          // Set photo preview từ URL nếu có
          if (room.roomPhotoUrl) {
            setPhotoPreview(room.roomPhotoUrl);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Lỗi khi tải dữ liệu phòng');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  // Phân tích các trường số
    let parsedValue = value;
    if (['price'].includes(name) && value) {
      parsedValue = parseFloat(value);
    } else if (['capacity', 'amount'].includes(name) && value) {
      parsedValue = parseInt(value, 10);
    }
    setForm({ ...form, [name]: parsedValue });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file });
  // Xem trước ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAmenity = () => {
    // Nếu chọn một tuỳ chọn từ dropdown, thêm object
    if (selectedAmenity && selectedAmenity.id != null) {
      // tránh trùng lặp id tiện nghi
      const exists = form.amenities.some(a => a && a.id === selectedAmenity.id);
      if (!exists) {
        setForm({ ...form, amenities: [...form.amenities, selectedAmenity] });
      }
      setSelectedAmenity(null);
      setAmenityInput('');
      setDropdownOpen(false);
      return;
    }

    // Dự phòng: thêm chuỗi văn bản tự do (giữ hành vi trước đó)
    if (amenityInput.trim()) {
      setForm({ ...form, amenities: [...form.amenities, amenityInput.trim()] });
      setAmenityInput('');
      setDropdownOpen(false);
    }
  };

  const handleRemoveAmenity = (index) => {
    const updated = form.amenities.filter((_, i) => i !== index);
    setForm({ ...form, amenities: updated });
  };

  const handleAmenityKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAmenity();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Xác thực các trường bắt buộc
    if (!form.name || !form.price || !form.capacity || !form.amount) {
      const missingFields = [];
      if (!form.name) missingFields.push('Tên phòng');
      if (!form.price) missingFields.push('Giá');
      if (!form.capacity) missingFields.push('Sức chứa');
      if (!form.amount) missingFields.push('Số lượng');
      setError(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      return;
    }

    // Backend yêu cầu description không được blank
    if (!form.description || form.description.trim() === '') {
      setError('Mô tả là bắt buộc và không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      // Trích xuất ID tiện nghi từ object tiện nghi
      const amenityIds = form.amenities.map(amenity => 
        (amenity && typeof amenity === 'object') ? amenity.id : null
      ).filter(id => id !== null);

      const roomData = {
        type: form.type,
        price: form.price,
        capacity: form.capacity,
        description: form.description.trim(),
        name: form.name.trim(),
        amount: form.amount,
        amenityIds: amenityIds,
        photo: form.photo
      };

      console.log('[EditRoomPage] Sending roomData:', roomData);
      console.log('[EditRoomPage] Photo file:', form.photo);
      await updateRoom(id, roomData);
      setSuccess('Cập nhật phòng thành công! Đang cập nhật danh sách phòng...');
      
      // Nếu mở từ trang quản lý khách sạn, lấy lại danh sách phòng từ server và quay lại
      // với danh sách đã được cập nhật
      const redirectDelay = setTimeout(async () => {
        if (managedHotelId && hotelName) {
          try {
            const res = await getRoomsByHotel(managedHotelId);
            const freshRooms = res.data || [];
            navigate('/admin/manage-rooms', { 
              state: { hotelId: managedHotelId, hotelName: hotelName, rooms: freshRooms } 
            });
          } catch (e) {
            console.error('[EditRoomPage] Error refetching rooms:', e);
            // Phương án dự phòng: chuyển hướng mà không kèm danh sách phòng
            navigate('/admin/manage-rooms', { 
              state: { hotelId: managedHotelId, hotelName: hotelName } 
            });
          }
        } else {
          navigate('/admin/manage-rooms');
        }
      }, 1500);
      return () => clearTimeout(redirectDelay);
    } catch (err) {
      console.error('[EditRoomPage] Error:', err);
      setError(err.message || 'Lỗi khi cập nhật phòng');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container mx-auto p-6 mt-20">Đang tải...</div>;

  return (
    <div className="container mx-auto p-6 mt-20">
  <h1 className="text-2xl font-bold mb-2">Chỉnh sửa phòng #{id}</h1>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên phòng *</label>
            <input 
              type="text"
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
                placeholder="ví dụ: Deluxe Ocean View"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Mô tả phòng"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Loại *</label>
            <select 
              name="type" 
              value={form.type} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
            >
              <option value="SINGLE">Đơn</option>
              <option value="DOUBLE">Đôi</option>
              <option value="SUIT">Suite</option>
              <option value="TRIPLE">Ba người</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giá *</label>
            <input 
              type="number"
              name="price" 
              value={form.price} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="Giá"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sức chứa *</label>
            <input 
              type="number"
              name="capacity" 
              value={form.capacity} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="ví dụ: 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số lượng *</label>
            <input 
              type="number"
              name="amount" 
              value={form.amount} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="ví dụ: 10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ảnh</label>
          <input 
            type="file" 
            name="photo" 
            onChange={handlePhotoChange}
            accept="image/*"
            className="w-full p-2 border rounded"
          />
          {photoPreview && (
            <div className="mt-3">
              <img src={photoPreview} alt="Preview" className="max-w-xs h-32 object-cover rounded" />
              <p className="text-xs text-gray-500 mt-1">Ảnh hiện tại</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tiện nghi</label>
          <div className="relative" ref={comboRef}>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => { setAmenityInput(e.target.value); setSelectedAmenity(null); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onKeyPress={handleAmenityKeyPress}
                placeholder="Tìm kiếm hoặc chọn tiện nghi"
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>

            {/* Dropdown - show all options or filtered */}
            {dropdownOpen && (
              <div className="absolute z-40 w-full bg-white border rounded shadow max-h-48 overflow-auto">
                {amenityOptions.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">Không có tiện nghi nào</div>
                ) : (
                  amenityOptions
                    .filter(a => !amenityInput || (a.name && a.name.toLowerCase().includes(amenityInput.toLowerCase())))
                    .map(opt => (
                      <div
                        key={opt.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => { setAmenityInput(opt.name); setSelectedAmenity(opt); setDropdownOpen(false); }}
                      >
                        {opt.name}
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
          
          {/* Danh sách tiện nghi đã thêm */}
          {form.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.amenities.map((amenity, index) => {
                const label = (amenity && typeof amenity === 'object') ? amenity.name : amenity;
                return (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/manage-rooms')} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={submitting}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default EditRoomPage;
