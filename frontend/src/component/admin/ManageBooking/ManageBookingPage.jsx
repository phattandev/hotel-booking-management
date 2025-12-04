import React, { useEffect, useState } from 'react';
import { getAllBookings } from '../../../service/ApiService';

const ManageBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filterRoomType, setFilterRoomType] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllBookings();
        const list = Array.isArray(data) ? data : data.data || [];
        if (mounted) {
          setBookings(list);
          setFilteredBookings(list);
        }
      } catch (e) {
        console.warn('Could not fetch bookings:', e.message);
        if (mounted) setBookings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Filter bookings by room type
  const handleFilterChange = (e) => {
    const roomType = e.target.value;
    setFilterRoomType(roomType);
    if (!roomType) {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.roomType === roomType || b.room?.roomType === roomType));
    }
  };

  // Cancel booking with confirmation
  const handleCancelClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = () => {
    // Mock cancel — will call API in Phase 2
    const booking = bookings.find(b => b.id === selectedBookingId);
    setMessage(`Booking #${selectedBookingId} (${booking?.id}) cancelled (mock).`);
    setBookings(prev => prev.filter(b => b.id !== selectedBookingId));
    setFilteredBookings(prev => prev.filter(b => b.id !== selectedBookingId));
    setShowCancelConfirm(false);
    setSelectedBookingId(null);
  };

  const handleCancelCancel = () => {
    setShowCancelConfirm(false);
    setSelectedBookingId(null);
  };

  // Get unique room types for filter
  const roomTypes = [...new Set(bookings.map(b => b.roomType || b.room?.roomType || ''))].filter(Boolean);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 mt-20">Quản lý đặt phòng</h1>
      <p className="text-gray-600 mb-4">Xem và quản lý tất cả các đặt phòng trong hệ thống.</p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          {message}
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <label className="block text-sm font-medium mb-2">Lọc theo loại phòng:</label>
        <select
          value={filterRoomType}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Tất cả loại phòng</option>
          {roomTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded shadow">
        {loading ? (
          <div className="p-4">Đang tải...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-4 text-gray-600">Không tìm thấy đặt phòng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">ID đặt phòng</th>
                  <th className="px-4 py-3 text-left">Tên khách</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Loại phòng</th>
                  <th className="px-4 py-3 text-left">Nhận phòng</th>
                  <th className="px-4 py-3 text-left">Trả phòng</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{booking.id}</td>
                    <td className="px-4 py-3">{booking.guestName || booking.user?.fullname || 'N/A'}</td>
                    <td className="px-4 py-3">{booking.guestEmail || booking.user?.email || 'N/A'}</td>
                    <td className="px-4 py-3">{booking.roomType || booking.room?.roomType || 'N/A'}</td>
                    <td className="px-4 py-3">{booking.checkInDate || 'N/A'}</td>
                    <td className="px-4 py-3">{booking.checkOutDate || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                        {booking.status === 'BOOKED' ? 'Đã đặt' : booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status || 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCancelClick(booking.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold mb-4">Xác nhận hủy</h2>
            <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn hủy đặt phòng #{selectedBookingId}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelCancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Không, giữ lại
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Có, hủy đặt phòng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBookingPage;
