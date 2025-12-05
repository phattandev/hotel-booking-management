import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Footer from '../../common/Footer';
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

  // ref to close dropdown when clicking outside
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
        // Load amenities
        const amenityRes = await getAllAmenities();
        const amenityList = amenityRes?.data ?? amenityRes ?? [];
        if (mounted) setAmenityOptions(Array.isArray(amenityList) ? amenityList : []);

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
          setError(err.message || 'Error loading room data');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Parse numeric fields
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
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

    // Validation
    if (!form.name || !form.price || !form.capacity || !form.amount) {
      const missingFields = [];
      if (!form.name) missingFields.push('Name');
      if (!form.price) missingFields.push('Price');
      if (!form.capacity) missingFields.push('Capacity');
      if (!form.amount) missingFields.push('Amount');
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Backend yêu cầu description không được blank
    if (!form.description || form.description.trim() === '') {
      setError('Description is required and cannot be blank');
      return;
    }

    setSubmitting(true);
    try {
      // Extract amenity IDs from amenity objects
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

      await updateRoom(id, roomData);
      setSuccess('Room updated successfully! Refetching rooms...');
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
            // fallback: navigate without rooms
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
      setError(err.message || 'Error updating room');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container mx-auto p-6 mt-20">Loading...</div>;

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-2">Edit Room #{id}</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Room Name *</label>
            <input 
              type="text"
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="e.g. Deluxe Ocean View"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Room description"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select 
              name="type" 
              value={form.type} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
            >
              <option>SINGLE</option>
              <option>DOUBLE</option>
              <option>SUITE</option>
              <option>FAMILY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input 
              type="number"
              name="price" 
              value={form.price} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="Price"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity *</label>
            <input 
              type="number"
              name="capacity" 
              value={form.capacity} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="e.g. 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <input 
              type="number"
              name="amount" 
              value={form.amount} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="e.g. 10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Photo</label>
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
              <p className="text-xs text-gray-500 mt-1">Current photo</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amenities (Tiện nghi)</label>
          <div className="relative" ref={comboRef}>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => { setAmenityInput(e.target.value); setSelectedAmenity(null); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onKeyPress={handleAmenityKeyPress}
                placeholder="Search or select amenities"
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Dropdown - show all options or filtered */}
            {dropdownOpen && (
              <div className="absolute z-40 w-full bg-white border rounded shadow max-h-48 overflow-auto">
                {amenityOptions.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No amenities available</div>
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
          
          {/* Danh sách amenities đã thêm */}
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
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default EditRoomPage;
