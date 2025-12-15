import React, { useEffect, useState } from 'react';
import Footer from '../common/Footer';
import { getRoomById, bookRoom } from '../../service/ApiService';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../service/ApiService';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hotelId = location.state?.hotelId;
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Form state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adultAmount, setAdultAmount] = useState(1);
  const [childrenAmount, setChildrenAmount] = useState(0);
  const [specialRequire, setSpecialRequire] = useState('');
  const [roomQuantity, setRoomQuantity] = useState(1);

  // Carousel state for room images
  const [roomImgIdx, setRoomImgIdx] = useState(0);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getRoomById(id);
        // API returns { status, message, data: room }
        setRoom(res.data);
      } catch (err) {
        setError(err.message || 'Error fetching room details');
      }
      setLoading(false);
    };
    fetchRoom();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    // Validate dates
    if (!checkInDate || !checkOutDate) {
      setBookingError('Vui lòng chọn ngày nhận phòng và ngày trả phòng');
      return;
    }

    if (new Date(checkInDate) < new Date().setHours(0, 0, 0, 0)) {
      setBookingError('Ngày nhận phòng phải là hôm nay hoặc trong tương lai');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setBookingError('Ngày trả phòng phải sau ngày nhận phòng (tối thiểu 1 ngày)');
      return;
    }

    if (adultAmount + childrenAmount > room?.capacity) {
      setBookingError(`Số khách vượt quá sức chứa phòng (tối đa ${room?.capacity} người)`);
      return;
    }

    if (adultAmount < 1) {
      setBookingError('Phải có ít nhất 1 người lớn');
      return;
    }

    if (roomQuantity < 1 || roomQuantity > room?.amount) {
      setBookingError(`Số phòng phải từ 1 đến ${room?.amount}`);
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const bookingData = {
        checkinDate: checkInDate,
        checkoutDate: checkOutDate,
        adultAmount,
        childrenAmount,
        hotelId: hotelId || room?.hotelId || 1,
        roomId: parseInt(id),
        roomQuantity,
        specialRequire: specialRequire || ''
      };

      const response = await bookRoom(bookingData);
      
      // Tính toán tổng giá và các thông tin cần thiết cho trang kết quả
      const nights = Math.ceil(
        (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = room.price * nights * roomQuantity;
      
      // Prepare booking result data
      const bookingResult = {
        bookingReference: response?.data?.bookingReference,
        roomName: room.name,
        roomNumber: room.roomNumber,
        roomType: room.type,
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        checkInDate,
        checkOutDate,
        nights,
        adultAmount,
        childrenAmount,
        roomQuantity,
        pricePerNight: room.price,
        totalPrice,
        specialRequire,
        bookingDate: new Date().toISOString()
      };
      
      // Tải về trang kết quả đặt phòng với dữ liệu
      navigate('/booking-result', { state: { booking: bookingResult } });
    } catch (err) {
      setBookingError(err.message || 'Lỗi khi tạo đặt phòng');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  if (loading) {
    return <div className="pt-24 text-center">Đang tải chi tiết phòng...</div>;
  }

  if (error) {
    return <div className="pt-24 text-center text-red-600">{error}</div>;
  }

  if (!room) {
    return <div className="pt-24 text-center text-gray-600">Không tìm thấy phòng</div>;
  }

  // Form xác nhận chuyển đến trang đăng nhập
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Cần đăng nhập</h2>
        <p className="text-gray-700 mb-6">
          Bạn cần đăng nhập hoặc tạo tài khoản để đặt phòng. Bạn có muốn chuyển đến trang đăng nhập không?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowLoginModal(false)}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleLoginConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {showLoginModal && <LoginModal />}
      
      <main className="container mx-auto p-6 mt-20">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left: Images and Info */}
            <div>
              {/* Ảnh phòng */}
              <div className="mb-4 bg-gray-200 rounded overflow-hidden relative h-96">
                {/* Carousel ảnh phòng */}
                {room.roomImages && room.roomImages.length > 0 ? (
                  <>
                    <img
                      src={room.roomImages[roomImgIdx]}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    {room.roomImages.length > 1 && (
                      <>
                        <button onClick={() => setRoomImgIdx(idx => (idx - 1 + room.roomImages.length) % room.roomImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-opacity-60">‹</button>
                        <button onClick={() => setRoomImgIdx(idx => (idx + 1) % room.roomImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-opacity-60">›</button>
                      </>
                    )}
                    {room.roomImages.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                        {room.roomImages.map((_, idx) => (
                          <button key={idx} onClick={() => setRoomImgIdx(idx)} className={`w-2 h-2 rounded-full ${roomImgIdx === idx ? 'bg-white' : 'bg-white/50'}`}></button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Hình ảnh không có sẵn</div>
                )}
              </div>

              {/* Thông tin cơ bản của phòng */}
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Loại phòng:</span>{' '}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {room.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Sức chứa:</span> {room.capacity} người
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold">Còn trống:</span> {room.amount} phòng
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{room.description}</p>
                </div>

                <div className="text-3xl font-bold text-green-600">
                  {room.price?.toLocaleString()} ₫
                </div>
              </div>

              {/* Tiện nghi */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="p-4 bg-gray-50 rounded">
                  <h2 className="text-lg font-bold mb-3">Tiện nghi phòng</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {room.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <div>
                          <div className="font-semibold text-sm">{amenity.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Giao diện bên phải: Form đặt phòng */}
            <div>
              <div className="p-6 bg-gray-50 rounded sticky top-24">
                <h2 className="text-2xl font-bold mb-4">Đặt phòng</h2>

                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleBooking} className="space-y-4">
                  {/* Ngày nhận phòng */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Ngày nhận phòng</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Ngày trả phòng */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Ngày trả phòng</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Số lượng người lớn */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Số người lớn</label>
                    <input
                      type="number"
                      min="1"
                      value={adultAmount}
                      onChange={(e) => setAdultAmount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Số lượng trẻ em */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Số trẻ em</label>
                    <input
                      type="number"
                      min="0"
                      value={childrenAmount}
                      onChange={(e) => setChildrenAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Số lượng phòng */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Số lượng phòng</label>
                    <input
                      type="number"
                      min="1"
                      max={room.amount}
                      value={roomQuantity}
                      onChange={(e) => setRoomQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">Còn trống: {room.amount} phòng</p>
                  </div>

                  {/* Yêu cầu đặt biệt */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Yêu cầu đặc biệt (Tùy chọn)</label>
                    <textarea
                      value={specialRequire}
                      onChange={(e) => setSpecialRequire(e.target.value)}
                      placeholder="VD: Phòng tầng cao, hướng vườn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                      rows="3"
                    />
                  </div>

                  {/* Tổng giá */}
                  <div className="border-t pt-3 mt-4">
                    {checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate) && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Giá/phòng/đêm:</span>
                          <span className="font-semibold">{room.price?.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Số đêm:</span>
                          <span className="font-semibold">
                            {Math.ceil(
                              (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Tổng cộng:</span>
                          <span className="text-green-600">
                            {(
                              room.price *
                              Math.ceil(
                                (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
                              ) *
                              roomQuantity
                            )?.toLocaleString()} ₫
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút đặt phòng */}
                  <button
                    type="submit"
                    disabled={bookingLoading || room.amount === 0}
                    className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${
                      bookingLoading || room.amount === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {bookingLoading ? 'Đang xử lý...' : room.amount === 0 ? 'Phòng không còn trống' : 'Đặt phòng ngay'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RoomDetailPage;
