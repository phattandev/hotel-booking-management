import React, { useEffect, useState } from 'react';
import Footer from '../common/Footer';
import { getAllHotels } from '../../service/ApiService';
import { useParams, useNavigate } from 'react-router-dom';

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bản đồ chỉ số carousel cho ảnh phòng
  const [roomImageIndexMap, setRoomImageIndexMap] = useState({});
  // Chỉ số carousel ảnh khách sạn
  const [hotelImgIdx, setHotelImgIdx] = useState(0);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllHotels();
        const hotels = res.data || [];
        const found = hotels.find(h => String(h.id) === String(id));
        if (!found) {
          setError('Không tìm thấy khách sạn');
        } else {
          setHotel(found);
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thông tin khách sạn');
      }
      setLoading(false);
    };
    fetchHotel();
  }, [id]);

  // Khởi tạo bản đồ chỉ số ảnh phòng khi dữ liệu khách sạn có sẵn
  useEffect(() => {
    if (hotel && hotel.rooms) {
      const map = {};
      hotel.rooms.forEach(r => { map[r.id] = 0; });
      setRoomImageIndexMap(prev => ({ ...map, ...prev }));
    }
  }, [hotel]);

  // Đặt lại chỉ số ảnh khách sạn khi danh sách ảnh thay đổi
  useEffect(() => {
    if (hotel && hotel.images && hotel.images.length > 0) {
      setHotelImgIdx(0);
    }
  }, [hotel?.images]);

  const handleViewRooms = () => {
    if (hotel && hotel.rooms) {
      navigate('/rooms', { state: { rooms: hotel.rooms, hotelId: hotel.id, hotelName: hotel.name, hotelImages: hotel.images } });
    }
  };

  if (loading) return <div className="pt-24 text-center">Đang tải khách sạn...</div>;
  if (error) return <div className="pt-24 text-center text-red-600">{error}</div>;
  if (!hotel) return null;

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto p-6 mt-20">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:space-x-6">
            <div className="md:flex-1">
              {/* Carousel ảnh khách sạn */}
              <div className="relative bg-gray-200 rounded mb-4 overflow-hidden h-64 md:h-72">
                {hotel.images && hotel.images.length > 0 ? (
                  <>
                    <img src={hotel.images[hotelImgIdx]} alt={`${hotel.name} ${hotelImgIdx}`} className="w-full h-full object-cover" />
                    {hotel.images.length > 1 && (
                      <>
                        <button onClick={() => setHotelImgIdx((hotelImgIdx - 1 + hotel.images.length) % hotel.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-opacity-60">‹</button>
                        <button onClick={() => setHotelImgIdx((hotelImgIdx + 1) % hotel.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-opacity-60">›</button>
                      </>
                    )}
                    {hotel.images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                        {hotel.images.map((_, idx) => (
                          <button key={idx} onClick={() => setHotelImgIdx(idx)} className={`w-2 h-2 rounded-full ${hotelImgIdx === idx ? 'bg-white' : 'bg-white/50'}`}></button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Không có ảnh</div>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-2">{hotel.name}</h1>
              <div className="text-sm text-gray-600 mb-2">{hotel.location}</div>
              <div className="mb-4 text-yellow-500 font-semibold">{Array.from({length: hotel.starRating || 0}).map((_,i)=> '★').join('')}</div>
              <p className="text-gray-700 mb-4">{hotel.description}</p>

                <div className="mb-4">
                <div className="text-sm font-semibold">Liên hệ</div>
                <div className="text-sm text-gray-600">{hotel.contactName} - {hotel.contactPhone}</div>
                <div className="text-sm text-gray-600">Email: {hotel.email}</div>
                <div className="text-sm text-gray-600">Điện thoại: {hotel.phone}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold">Tiện nghi</div>
                <div className="text-sm text-gray-700">
                  {hotel.amenities && hotel.amenities.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {hotel.amenities.map((a, idx) => <li key={idx}>{a}</li>)}
                    </ul>
                  ) : <div className="text-gray-400">Không có</div>}
                </div>
              </div>              <div className="flex space-x-2">
                <button onClick={handleViewRooms} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Xem phòng</button>
                <button onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Xem danh sách phòng</button>
              </div>
            </div>

            <div className="md:w-1/3 mt-6 md:mt-0">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm font-semibold mb-2">Thông tin khách sạn</div>
                <div className="text-sm text-gray-600 mb-1">Trạng thái: {hotel.isActive ? 'Hoạt động' : 'Không hoạt động'}</div>
                <div className="text-sm text-gray-600 mb-1">Xếp hạng: {hotel.starRating} sao</div>
                <div className="text-sm text-gray-600">Số phòng: {hotel.rooms?.length ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Danh sách phòng */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Danh sách phòng</h2>
            {hotel.rooms && hotel.rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotel.rooms.map(r => {
                      const images = r.roomImages && r.roomImages.length > 0 ? r.roomImages : (hotel.images || []);
                      const currentIndex = roomImageIndexMap[r.id] ?? 0;
                      return (
                        <div key={r.id} className="bg-white p-4 rounded shadow">
                          {/* Carousel ảnh phòng */}
                          <div className="relative bg-gray-200 h-36 mb-3 overflow-hidden">
                            {images.length > 0 ? (
                              <>
                                <img src={images[currentIndex]} alt={r.name} className="w-full h-full object-cover" />
                                {images.length > 1 && (
                                  <>
                                    <button onClick={() => setRoomImageIndexMap(prev => ({ ...prev, [r.id]: (currentIndex - 1 + images.length) % images.length }))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-opacity-60">‹</button>
                                    <button onClick={() => setRoomImageIndexMap(prev => ({ ...prev, [r.id]: (currentIndex + 1) % images.length }))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-opacity-60">›</button>
                                  </>
                                )}
                                {images.length > 1 && (
                                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                                    {images.map((_, idx) => (
                                      <button key={idx} onClick={() => setRoomImageIndexMap(prev => ({ ...prev, [r.id]: idx }))} className={`w-2 h-2 rounded-full ${(currentIndex === idx) ? 'bg-white' : 'bg-white/50'}`}></button>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">Không có ảnh</div>
                            )}
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-lg font-bold">{r.name}</div>
                              <div className="text-sm text-gray-600">Số phòng #{r.roomNumber} - Loại phòng: {r.type}</div>
                            </div>
                            <div className="text-green-600 font-bold">{r.price?.toLocaleString()} ₫</div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{r.description}</p>
                          <div className="text-sm text-gray-600">Sức chứa: {r.capacity}</div>
                        <div className="mt-3 flex space-x-2">
                          <button onClick={() => navigate(`/rooms` , { state: { rooms: [r], hotelId: hotel.id, hotelName: hotel.name, hotelImages: hotel.images } })} className="px-8 py-1 bg-gray-200 rounded">Xem chi tiết phòng</button>
                        </div>
                        </div>
                      );
                    })}
              </div>
            ) : (
              <div className="text-gray-600">Không có phòng nào.</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HotelDetailPage;
