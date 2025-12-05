import React, { useEffect, useState } from 'react';
import Footer from '../common/Footer';
import { getAllHotels, getRoomsByHotel, searchHotels } from '../../service/ApiService';
import { useNavigate } from 'react-router-dom';

const AllHotelPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    location: '',
    checkInDate: '',
    checkOutDate: '',
    capacity: '',
    roomQuantity: ''
  });
  const [hasSearched, setHasSearched] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllHotels();
      // API returns { status, message, data: [...] }
      setHotels(res.data || []);
    } catch (err) {
      setError(err.message || 'Error fetching hotels');
      setHotels([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Track current image index per hotel for carousel
  const [imageIndexMap, setImageIndexMap] = useState({});

  useEffect(() => {
    // initialize index map for hotels loaded
    const map = {};
    (hotels || []).forEach(h => {
      map[h.id] = map[h.id] ?? 0;
    });
    setImageIndexMap(prev => ({ ...map, ...prev }));
  }, [hotels]);

  const prevImage = (hotelId) => {
    setImageIndexMap(prev => {
      const current = prev[hotelId] ?? 0;
      const images = (hotels.find(h => h.id === hotelId)?.images) || [];
      const nextIndex = images.length > 0 ? (current - 1 + images.length) % images.length : 0;
      return { ...prev, [hotelId]: nextIndex };
    });
  };

  const nextImage = (hotelId) => {
    setImageIndexMap(prev => {
      const current = prev[hotelId] ?? 0;
      const images = (hotels.find(h => h.id === hotelId)?.images) || [];
      const nextIndex = images.length > 0 ? (current + 1) % images.length : 0;
      return { ...prev, [hotelId]: nextIndex };
    });
  };

  const handleViewRooms = async (hotel) => {
    // Fetch rooms for this hotel from the dedicated endpoint
    try {
      const res = await getRoomsByHotel(hotel.id);
      const rooms = res.data || [];
      // Navigate to AllRoomPage with rooms, hotelId, and hotel info
      navigate('/rooms', { 
        state: { 
          rooms: rooms, 
          hotelName: hotel.name, 
          hotelId: hotel.id, 
          hotelImages: hotel.images 
        } 
      });
    } catch (err) {
      console.error('Error fetching rooms for hotel:', err);
      alert('Không thể tải phòng của khách sạn này. Vui lòng thử lại.');
    }
  };

  const handleViewDetail = (hotelId) => {
    navigate(`/hotel/${hotelId}`);
  };

  // Handle filter input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setError(null);
    try {
      const res = await searchHotels(filters);
      setHotels(res.data || []);
      setHasSearched(true);
    } catch (err) {
      setError(err.message || 'Error searching hotels');
      setHotels([]);
    }
    setSearchLoading(false);
  };

  // Handle clear filters
  const handleClearFilters = async () => {
    setFilters({
      location: '',
      checkInDate: '',
      checkOutDate: '',
      capacity: '',
      roomQuantity: ''
    });
    setHasSearched(false);
    setLoading(true);
    setError(null);
    try {
      const res = await getAllHotels();
      setHotels(res.data || []);
    } catch (err) {
      setError(err.message || 'Error fetching hotels');
      setHotels([]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto p-6 mt-20">
        <h1 className="text-3xl font-bold mb-2">Khách sạn</h1>
        <p className="text-gray-600 mb-6">Duyệt danh sách khách sạn có phòng trống</p>

        {/* Search Filter Bar */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Tìm kiếm khách sạn</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vị trí</label>
              <input 
                type="text" 
                name="location" 
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g. Hà Nội"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày nhận phòng</label>
              <input 
                type="date" 
                name="checkInDate" 
                value={filters.checkInDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày trả phòng</label>
              <input 
                type="date" 
                name="checkOutDate" 
                value={filters.checkOutDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sức chứa</label>
              <input 
                type="number" 
                name="capacity" 
                value={filters.capacity}
                onChange={handleFilterChange}
                placeholder="e.g. 2"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số phòng cần</label>
              <input 
                type="number" 
                name="roomQuantity" 
                value={filters.roomQuantity}
                onChange={handleFilterChange}
                placeholder="e.g. 1"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={handleClearFilters}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Xóa lọc
            </button>
            <button 
              type="submit"
              disabled={searchLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">Đang tải khách sạn...</div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            {hasSearched ? 'Không tìm thấy khách sạn phù hợp.' : 'Hiện không có khách sạn nào.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map(hotel => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Carousel area */}
                <div className="relative bg-gray-100 h-48 md:h-56 overflow-hidden">
                  {hotel.images && hotel.images.length > 0 ? (
                    <>
                      <img
                        src={hotel.images[imageIndexMap[hotel.id] ?? 0]}
                        alt={`${hotel.name} ${imageIndexMap[hotel.id] ?? 0}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Left / Right controls */}
                      {hotel.images.length > 1 && (
                        <>
                          <button onClick={() => prevImage(hotel.id)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-opacity-60">
                            ‹
                          </button>
                          <button onClick={() => nextImage(hotel.id)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-opacity-60">
                            ›
                          </button>
                        </>
                      )}

                      {/* Dots */}
                      {hotel.images.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                          {hotel.images.map((_, idx) => (
                            <button key={idx} onClick={() => setImageIndexMap(prev => ({ ...prev, [hotel.id]: idx }))} className={`w-2 h-2 rounded-full ${((imageIndexMap[hotel.id] ?? 0) === idx) ? 'bg-white' : 'bg-white/50'}`}></button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No images available</div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                  <div className="text-sm text-gray-600 mb-2">{hotel.location}</div>
                  <div className="mb-3 text-yellow-500 font-semibold">{Array.from({length: hotel.starRating || 0}).map((_,i)=> '★').join('')}</div>
                  <p className="text-gray-700 text-sm mb-3">{hotel.description}</p>

                  <div className="mb-3">
                    <div className="text-sm font-semibold mb-1">Tiện nghi</div>
                    <div className="text-xs text-gray-600">
                      {hotel.amenities && hotel.amenities.length > 0 ? (
                        hotel.amenities.slice(0,5).join(', ') + (hotel.amenities.length > 5 ? ', ...' : '')
                      ) : (
                        <span className="text-gray-400">Không có tiện nghi</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button onClick={() => handleViewRooms(hotel)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Xem phòng</button>
                    <button onClick={() => handleViewDetail(hotel.id)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Chi tiết</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllHotelPage;
