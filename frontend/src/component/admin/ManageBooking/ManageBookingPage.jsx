import React, { useEffect, useState } from 'react';
import { getAllBookings, getBookingByConfirmationCode, updateBooking } from '../../../service/ApiService';

const ManageBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

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

  // Tìm theo mã xác nhận (gọi endpoint backend)
  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!searchCode) {
      setFilteredBookings(bookings);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await getBookingByConfirmationCode(searchCode.trim());
      // res may be { status, message, data } or single booking object
      const booking = res?.data ?? (res?.data === undefined ? res : null);
      if (booking) {
        setFilteredBookings([booking]);
      } else {
        setFilteredBookings([]);
        setMessage('Không tìm thấy đặt phòng với mã xác nhận này.');
      }
    } catch (err) {
      console.warn('Search error', err.message || err);
      setMessage('Lỗi khi tìm kiếm. Vui lòng thử lại.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Hủy đặt phòng bằng hộp thoại xác nhận
  const handleCancelClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelReason('');
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBookingId) return;
    if (!cancelReason || cancelReason.trim() === '') {
      setMessage('Lý do hủy là bắt buộc.');
      return;
    }
    try {
      console.log('Sending cancel request with reason:', cancelReason.trim());
      // Use updateBooking instead of cancelBooking to ensure cancelReason is saved
      const payload = {
        status: 'CANCELLED',
        cancelReason: cancelReason.trim(),
        roomNumber: ''
      };
      const res = await updateBooking(selectedBookingId, payload);
      console.log('Cancel response:', res);
      setMessage('Hủy đặt phòng thành công.');
      
      // Reload lại toàn bộ dữ liệu
      try {
        const data = await getAllBookings();
        const list = Array.isArray(data) ? data : data.data || [];
        setBookings(list);
        setFilteredBookings(list);
      } catch (e) {
        console.warn('Could not refresh bookings:', e.message);
      }
    } catch (err) {
      console.error('Cancel error', err);
      setMessage(err.message || 'Lỗi khi hủy đặt phòng.');
    } finally {
      setShowCancelConfirm(false);
      setSelectedBookingId(null);
      setCancelReason('');
    }
  };

  const handleCancelCancel = () => {
    setShowCancelConfirm(false);
    setSelectedBookingId(null);
    setCancelReason('');
  };

  // Xử lý thay đổi trạng thái từ dropdown
  const handleStatusChange = async (booking, newStatus) => {
    if (!booking) return;
    
    // Nếu status không thay đổi, không làm gì
    if (newStatus === booking.status) {
      return;
    }
    
    // Nếu admin chọn CANCELLED, hiển thị modal nhập lý do hủy
    if (newStatus === 'CANCELLED') {
      setSelectedBookingId(booking.id);
      setCancelReason('');
      setShowCancelConfirm(true);
      return;
    }
    // Nếu không, hiển thị hộp thoại xác nhận thay đổi trạng thái
    setPendingStatusChange({ booking, newStatus });
    setShowStatusConfirm(true);
  };

  // Hàm xử lý khi xác nhận thay đổi trạng thái
  const statusLabel = (s) => {
    if (!s) return '';
    return s === 'BOOKED' ? 'Đã đặt' : s === 'CANCELLED' ? 'Đã hủy' : s === 'CHECKED_IN' ? 'Đã nhận phòng' : s === 'CHECKED_OUT' ? 'Đã trả phòng' : s;
  };

  const handleStatusConfirm = async () => {
    if (!pendingStatusChange) return;
    const { booking, newStatus } = pendingStatusChange;
    
    // Nếu CHECK_IN, roomNumber là bắt buộc
    if (newStatus === 'CHECKED_IN' && (!roomNumber || roomNumber.trim() === '')) {
      setMessage('Số phòng là bắt buộc khi check-in.');
      return;
    }
    
    setStatusUpdating(true);
    try {
      const payload = {
        status: newStatus,
        cancelReason: '',
        roomNumber: newStatus === 'CHECKED_IN' ? roomNumber.trim() : ''
      };
      const res = await updateBooking(booking.id, payload);
      const updated = res?.data ?? res;
      setBookings(prev => prev.map(b => (b.id === booking.id ? (updated || { ...b, status: newStatus }) : b)));
      setFilteredBookings(prev => prev.map(b => (b.id === booking.id ? (updated || { ...b, status: newStatus }) : b)));
      setMessage(`Cập nhật trạng thái booking #${booking.id} thành ${statusLabel(newStatus)} thành công.`);
    } catch (err) {
      console.error('Update status error', err);
      setMessage(err.message || 'Lỗi khi cập nhật trạng thái.');
    } finally {
      setStatusUpdating(false);
      setShowStatusConfirm(false);
      setPendingStatusChange(null);
      setRoomNumber('');
    }
  };

  const handleStatusCancel = () => {
    setShowStatusConfirm(false);
    setPendingStatusChange(null);
  };

  // Xem lý do hủy
  const handleViewCancelReason = (reason) => {
    setSelectedCancelReason(reason || 'Không có lý do');
    setShowCancelReasonModal(true);
  };

  const handleCloseCancelReasonModal = () => {
    setShowCancelReasonModal(false);
    setSelectedCancelReason('');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 mt-20">Quản lý đặt phòng</h1>
      <p className="text-gray-600 mb-4">Xem và quản lý tất cả các đặt phòng trong hệ thống.</p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          {message}
        </div>
      )}

  {/* Điều khiển: Phần tìm kiếm */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            placeholder="Tìm theo mã xác nhận (confirmation code)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded w-full"
          />
          <button type="submit" disabled={searchLoading} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {searchLoading ? 'Đang tìm...' : 'Tìm'}
          </button>
          <button type="button" onClick={() => { setSearchCode(''); setFilteredBookings(bookings); }} className="px-3 py-2 bg-gray-200 rounded">
            Đặt lại
          </button>
        </form>
      </div>

  {/* Danh sách đặt phòng */}
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
                  <th className="px-4 py-3 text-left">Mã xác nhận</th>
                  <th className="px-4 py-3 text-left">Tên khách</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Số điện thoại</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{booking.id}</td>
                    <td className="px-4 py-3 font-semibold">{booking.bookingReference || 'N/A'}</td>
                    <td className="px-4 py-3">{booking.user?.fullName || booking.customerName || 'N/A'}</td>
                    <td className="px-4 py-3">{booking.user?.email || booking.customerEmail || 'N/A'}</td>
                    <td className="px-4 py-3">{booking.user?.phone || booking.customerPhone || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                        {booking.status === 'BOOKED' ? 'Đã đặt' : booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status === 'CHECKED_IN' ? 'Đã nhận phòng' : booking.status === 'CHECKED_OUT' ? 'Đã trả phòng' : booking.status || 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking, e.target.value)}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="BOOKED">Đã đặt</option>
                          <option value="CHECKED_IN">Đã nhận phòng</option>
                          <option value="CHECKED_OUT">Đã trả phòng</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                        {booking.status === 'BOOKED' && (
                          <button
                            onClick={() => { setSelectedBookingId(booking.id); setShowCancelConfirm(true); setCancelReason(''); }}
                            className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Hủy
                          </button>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <button
                            onClick={() => handleViewCancelReason(booking.cancelReason)}
                            className="px-2 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                          >
                            Xem lý do
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

  {/* Hộp thoại xác nhận thay đổi trạng thái */}
      {showStatusConfirm && pendingStatusChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold mb-4">Xác nhận thay đổi trạng thái</h2>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn thay đổi trạng thái booking <strong>#{pendingStatusChange.booking.id}</strong> thành <strong>{statusLabel(pendingStatusChange.newStatus)}</strong>?
            </p>
            
            {pendingStatusChange.newStatus === 'CHECKED_IN' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Số phòng (bắt buộc)</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Nhập số phòng (ví dụ: 205)"
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleStatusCancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Không, giữ lại
              </button>
              <button
                onClick={handleStatusConfirm}
                disabled={statusUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {statusUpdating ? 'Đang cập nhật...' : 'Có, xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form xác nhận xóa phòng */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold mb-4">Xác nhận hủy</h2>
            <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn hủy đặt phòng #{selectedBookingId}?</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Lý do hủy (bắt buộc)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded"
                placeholder="Nhập lý do hủy"
              />
            </div>
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

      {/* Form điền lý do hủy đặt phòng */}
      {showCancelReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold mb-4">Lý do hủy đặt phòng</h2>
            <div className="mb-6 p-3 bg-gray-100 rounded">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedCancelReason}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCloseCancelReasonModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBookingPage;
