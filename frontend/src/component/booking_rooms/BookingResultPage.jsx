import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../common/Footer';

const BookingResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  // Nếu không có dữ liệu đặt phòng, chuyển hướng / hiển thị thông báo
  if (!booking) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <main className="container mx-auto p-6 mt-20">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy thông tin đặt phòng</p>
            <button
              onClick={() => navigate('/hotels')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Xem khách sạn
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto p-6 mt-20">
        {/* Thông báo đặt phòng thành công */}
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-4xl text-green-600">✓</div>
            <div>
              <h1 className="text-3xl font-bold text-green-600">Đặt phòng thành công!</h1>
              <p className="text-green-700">Đặt phòng của bạn đã được xác nhận.</p>
            </div>
          </div>
        </div>

        {/* Card chi tiết đặt phòng */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Card's Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-90">Mã xác nhận</p>
                <p className="text-2xl font-bold font-mono">{booking.bookingReference}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Ngày đặt</p>
                <p className="text-lg font-semibold">
                  {new Date(booking.bookingDate).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Card's Body */}
          <div className="p-6 space-y-6">
            {/* Thông tin phòng */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold mb-4">Thông tin phòng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên phòng</p>
                  <p className="text-lg font-semibold">{booking.roomName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số phòng</p>
                  <p className="text-lg font-semibold">#{booking.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loại phòng</p>
                  <p className="text-lg font-semibold">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {booking.roomType}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số phòng</p>
                  <p className="text-lg font-semibold">{booking.roomQuantity}</p>
                </div>
              </div>
            </div>

            {/* Ngày lưu trú */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold mb-4">Ngày lưu trú</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nhận phòng</p>
                  <p className="text-lg font-semibold">
                    {new Date(booking.checkInDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trả phòng</p>
                  <p className="text-lg font-semibold">
                    {new Date(booking.checkOutDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số đêm</p>
                  <p className="text-lg font-semibold">{booking.nights}</p>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold mb-4">Khách</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Người lớn</p>
                  <p className="text-lg font-semibold">{booking.adultAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trẻ em</p>
                  <p className="text-lg font-semibold">{booking.childrenAmount}</p>
                </div>
              </div>
            </div>

            {/* Yêu cầu đặt biệt */}
            {booking.specialRequire && (
              <div className="border-b pb-6">
                <h2 className="text-2xl font-bold mb-4">Yêu cầu đặc biệt</h2>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700">{booking.specialRequire}</p>
                </div>
              </div>
            )}

            {/* Chi tiết tổng giá */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Chi tiết giá</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Giá/phòng/đêm:</span>
                  <span className="font-semibold">{booking.pricePerNight?.toLocaleString('en-US')} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Số đêm:</span>
                  <span className="font-semibold">{booking.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Số phòng:</span>
                  <span className="font-semibold">{booking.roomQuantity}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-green-600">{booking.totalPrice?.toLocaleString('en-US')} ₫</span>
                </div>
              </div>
            </div>

            {/* Các nút lựa chọn */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
              <button
                onClick={() => navigate('/find-booking')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Xem tất cả đặt phòng
              </button>
              <button
                onClick={() => navigate('/hotels')}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Tiếp tục đặt phòng
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                In xác nhận
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin quan trọng cần lưu ý, lưu mã đặt phòng */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            <span className="font-semibold">✓ Lưu ý:</span> Vui lòng lưu mã xác nhận <span className="font-mono font-bold">{booking.bookingReference}</span> để sử dụng sau. Bạn có thể dùng nó để tìm kiếm đặt phòng của mình bất kỳ lúc nào.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingResultPage;
