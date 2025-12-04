import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../common/Footer';
import { getAllRooms, updateRoom } from '../../../service/ApiService';

const EditRoomPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
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
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Lấy danh sách phòng và tìm phòng theo ID
        const res = await getAllRooms();
        const list = res.data || [];
        const room = list.find(r => String(r.id) === String(id));
        if (room && mounted) {
          setForm({
            roomNumber: room.roomNumber || '',
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
    setForm({ ...form, [name]: value });
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
    if (amenityInput.trim()) {
      setForm({
        ...form,
        amenities: [...form.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
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

    setSubmitting(true);
    try {
      const roomData = {
        roomNumber: form.roomNumber,
        type: form.type,
        price: form.price,
        capacity: form.capacity,
        description: form.description.trim(),
        name: form.name.trim(),
        amount: form.amount,
        amenities: form.amenities,
        photo: form.photo
      };

      await updateRoom(id, roomData);
      setSuccess('Room updated successfully! Redirecting...');
      setTimeout(() => navigate('/admin/manage-rooms'), 1500);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium mb-2">Amenities</label>
          <div className="flex gap-2 mb-2">
            <input 
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyPress={handleAmenityKeyPress}
              className="flex-1 p-2 border rounded"
              placeholder="e.g. WiFi, Air Conditioning, TV"
            />
            <button 
              type="button"
              onClick={handleAddAmenity}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add
            </button>
          </div>
          {form.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.amenities.map((amenity, index) => (
                <div key={index} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {/* Amenity may be an object from API or a simple string; handle both */}
                  {typeof amenity === 'object' && amenity !== null ? (amenity.name || amenity.id || JSON.stringify(amenity)) : amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="font-bold hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
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
