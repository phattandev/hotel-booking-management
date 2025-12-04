import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRoom, getAllAmenities } from '../../../service/ApiService';

const AddRoomPage = () => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const [form, setForm] = useState({
    hotelId: '',
    roomNumber: '',
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

  // Fetch amenities for combobox on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getAllAmenities();
        // res may be { status, message, data: [...] } or an array
        const list = res?.data ?? res ?? [];
        if (mounted) setAmenityOptions(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('[AddRoomPage] Error loading amenities:', err);
      }
    };
    load();
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
      roomNumber: form.roomNumber,
      name: form.name,
      price: form.price,
      capacity: form.capacity,
      amount: form.amount,
      description: form.description,
      type: form.type
    });

    // Validation
    if (!form.roomNumber || !form.name || !form.price || !form.capacity || !form.amount) {
      const missingFields = [];
      if (!form.roomNumber) missingFields.push('Room Number');
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

    setLoading(true);
    try {
      const roomData = {
        hotelId: form.hotelId,
        roomNumber: form.roomNumber,
        type: form.type, // String "SINGLE", "DOUBLE", etc.
        price: form.price,
        capacity: form.capacity,
        description: form.description.trim(),
        name: form.name.trim(),
        amount: form.amount,
        amenities: form.amenities,
        photo: form.photo // File object or null
      };

      console.log('[AddRoomPage] Sending roomData:', roomData);
      console.log('[AddRoomPage] Photo file:', form.photo);
      await addRoom(roomData);
      setSuccess('Room added successfully! Redirecting...');
      setTimeout(() => navigate('/admin/manage-rooms'), 1500);
    } catch (err) {
      console.error('[AddRoomPage] Error:', err);
      setError(err.message || 'Error adding room');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-2">Add New Room</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hotel ID *</label>
            <input 
              type="number"
              name="hotelId"
              value={form.hotelId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Room Number *</label>
            <input 
              type="number"
              name="roomNumber" 
              value={form.roomNumber} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
              placeholder="e.g. 101"
            />
          </div>
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
                <option>SUIT</option>
                <option>TRIPLE</option>
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
                onKeyPress={handleAmenityKeyPress}
                placeholder="Search amenities (e.g. WiFi)"
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

            {/* Dropdown */}
            {dropdownOpen && amenityInput && (
              <div className="absolute z-40 w-full bg-white border rounded shadow max-h-48 overflow-auto">
                {amenityOptions.filter(a => a.name && a.name.toLowerCase().includes(amenityInput.toLowerCase())).length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No amenities found</div>
                ) : (
                  amenityOptions.filter(a => a.name && a.name.toLowerCase().includes(amenityInput.toLowerCase())).map(opt => (
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
            <div className="flex flex-wrap gap-2">
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
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Room'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default AddRoomPage;
