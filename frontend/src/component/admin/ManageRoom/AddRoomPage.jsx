import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRoom, getAllAmenities, getAllHotels, getRoomsByHotel } from '../../../service/ApiService';
import { useLocation } from 'react-router-dom';

const AddRoomPage = () => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Parse numeric fields
    let parsedValue = value;
    if (name === 'hotelId' && value) {
      parsedValue = parseInt(value, 10);
    } else if (['price', 'capacity', 'amount'].includes(name) && value) {
      parsedValue = name === 'price' ? parseFloat(value) : parseInt(value, 10);
    }
    setForm({ ...form, [name]: parsedValue });
  };
  const [form, setForm] = useState({
    hotelId: '',
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
  const [hotels, setHotels] = useState([]);
  const location = useLocation();
  const managedHotelId = location?.state?.hotelId;
  const hotelName = location?.state?.hotelName;
  const hotelRooms = location?.state?.rooms;
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file });
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch hotels and amenities on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Load hotels
        const hotelRes = await getAllHotels();
        const hotelList = hotelRes?.data ?? hotelRes ?? [];
        if (mounted) setHotels(Array.isArray(hotelList) ? hotelList : []);
        
  // Load amenities and show only room-level features for room form
  const amenityRes = await getAllAmenities();
  const amenityList = amenityRes?.data ?? amenityRes ?? [];
  const arr = Array.isArray(amenityList) ? amenityList : [];
  if (mounted) setAmenityOptions(arr.filter(a => (a.type || '').toLowerCase().includes('room')));
      } catch (err) {
        console.error('[AddRoomPage] Error loading data:', err);
      }
    };
    load();
      // if this page is opened for a specific hotel, prefill and lock
      if (managedHotelId) {
        setForm(prev => ({ ...prev, hotelId: Number(managedHotelId) }));
      }
    return () => { mounted = false };
  }, []);

  // ref to close dropdown when clicking outside
  const comboRef = useRef();
  useEffect(() => {
    const onDoc = (e) => {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleAddAmenity = () => {
    // If an option is selected from dropdown, add the object
    if (selectedAmenity && selectedAmenity.id != null) {
      // avoid duplicates by id
      const exists = form.amenities.some(a => a && a.id === selectedAmenity.id);
      if (!exists) {
        setForm({ ...form, amenities: [...form.amenities, selectedAmenity] });
      }
      setSelectedAmenity(null);
      setAmenityInput('');
      setDropdownOpen(false);
      return;
    }

    // fallback: add as free-text string (keeps previous behavior)
    if (amenityInput.trim()) {
      setForm({ ...form, amenities: [...form.amenities, amenityInput.trim()] });
      setAmenityInput('');
      setDropdownOpen(false);
    }
  };

  const handleRemoveAmenity = (index) => {
    setForm({
      ...form,
      amenities: form.amenities.filter((_, i) => i !== index)
    });
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

    // Debug log
    console.log('[AddRoomPage] Form data:', form);
    console.log('[AddRoomPage] Validation check:', {
      name: form.name,
      price: form.price,
      capacity: form.capacity,
      amount: form.amount,
      description: form.description,
      type: form.type
    });

      // Xác thực
      if (!form.hotelId || !form.name || !form.price || !form.capacity || !form.amount) {
        const missingFields = [];
        if (!form.hotelId) missingFields.push('Khách sạn');
        if (!form.name) missingFields.push('Tên phòng');
        if (!form.price) missingFields.push('Giá');
        if (!form.capacity) missingFields.push('Sức chứa');
        if (!form.amount) missingFields.push('Số lượng');
        setError(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
        return;
      }

    // Backend yêu cầu mô tả không được trống
    if (!form.description || form.description.trim() === '') {
      setError('Mô tả là bắt buộc và không được để trống');
      return;
    }

    setLoading(true);
    try {
      // Lấy ID tiện nghi từ các đối tượng tiện nghi
      const amenityIds = form.amenities.map(amenity => 
        (amenity && typeof amenity === 'object') ? amenity.id : null
      ).filter(id => id !== null);

      const roomData = {
        hotelId: form.hotelId, // Đã đươc chuyển thành số trong handleChange
        type: form.type,
        price: form.price,
        capacity: form.capacity,
        description: form.description.trim(),
        name: form.name.trim(),
        amount: form.amount,
        amenityIds: amenityIds,
        photo: form.photo
      };

      console.log('[AddRoomPage] Sending roomData:', roomData);
  console.log('[AddRoomPage] Photo file:', form.photo);
  await addRoom(roomData);
  setSuccess('Thêm phòng thành công! Đang tải lại danh sách phòng...');
      // Lấy lại phòng từ máy chủ và quay lại với danh sách đã cập nhật
      const redirectDelay = setTimeout(async () => {
        if (managedHotelId && hotelName) {
          try {
            const res = await getRoomsByHotel(managedHotelId);
            const freshRooms = res.data || [];
            navigate('/admin/manage-rooms', { 
              state: { hotelId: managedHotelId, hotelName: hotelName, rooms: freshRooms } 
            });
          } catch (e) {
            console.error('[AddRoomPage] Error refetching rooms:', e);
            // fallback: navigate without rooms (ManageRoomPage will show error)
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
      console.error('[AddRoomPage] Error:', err);
      setError(err.message || 'Lỗi khi thêm phòng');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-2">Thêm phòng mới</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Khách sạn *</label>
            <select 
              name="hotelId"
              value={form.hotelId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={!!managedHotelId}
            >
              <option value="">-- Chọn khách sạn --</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} (ID: {hotel.id})
                </option>
              ))}
            </select>
            {managedHotelId && <div className="text-sm text-gray-500 mt-1">Đang quản lý khách sạn ID: {managedHotelId}</div>}
          </div>
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

            {/* Dropdown - hiển thị tất cả các tùy chọn hoặc được lọc */}
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
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/manage-rooms')} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Đang thêm...' : 'Thêm phòng'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default AddRoomPage;
