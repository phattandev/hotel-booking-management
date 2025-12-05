import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { deleteRoom, getRoomsByHotel } from '../../../service/ApiService';

const ManageRoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch rooms from navigation state (passed from AllHotelPage)
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      // If a hotelId is present, prefer fetching rooms for that hotel from server
      const hotelId = location?.state?.hotelId;
      const roomsFromState = location?.state?.rooms;
      if (hotelId) {
        try {
          const res = await getRoomsByHotel(hotelId);
          setRooms(res.data || []);
        } catch (e) {
          // fallback to rooms from state if server call fails
          if (roomsFromState && Array.isArray(roomsFromState)) {
            setRooms(roomsFromState);
          } else {
            setError('Không thể tải phòng từ server. Vui lòng thử lại.');
            setRooms([]);
          }
        }
      } else if (roomsFromState && Array.isArray(roomsFromState)) {
        setRooms(roomsFromState);
      } else {
        setError('Không có dữ liệu phòng. Vui lòng quay lại và chọn lại khách sạn.');
        setRooms([]);
      }
    } catch (err) {
      setError(err.message || 'Error fetching rooms');
      setRooms([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // detect hotel context passed from ManageHotel page
    const hotelId = location?.state?.hotelId;
    const hotelName = location?.state?.hotelName;
    if (hotelId) setCurrentHotel({ id: hotelId, name: hotelName });
    fetchRooms();
  }, []);

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleAdd = () => {
    if (currentHotel) {
      navigate('/admin/add-room', { state: { hotelId: currentHotel.id, hotelName: currentHotel.name } });
    } else {
      navigate('/admin/add-room');
    }
  };

  const handleEdit = () => {
    if (selectedIds.size !== 1) {
      setMessage('Vui lòng chọn đúng một phòng để chỉnh sửa.');
      return;
    }
    const id = Array.from(selectedIds)[0];
    // preserve hotel context if present
    if (currentHotel) {
      navigate(`/admin/edit-room/${id}`, { state: { hotelId: currentHotel.id } });
    } else {
      navigate(`/admin/edit-room/${id}`);
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) {
      setMessage('Vui lòng chọn ít nhất một phòng để xóa.');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setError(null);
    try {
      // Delete all selected rooms
      for (const roomId of selectedIds) {
        await deleteRoom(roomId);
      }
      setMessage(`Đã xóa ${selectedIds.size} phòng thành công.`);
      // After deletion, if we have a hotel context, refetch rooms; otherwise update local list
      const hid = currentHotel ? Number(currentHotel.id) : null;
      if (hid) {
        try {
          const res = await getRoomsByHotel(hid);
          setRooms(res.data || []);
        } catch (e) {
          // fallback: remove locally
          setRooms(prev => prev.filter(r => !selectedIds.has(r.id)));
        }
      } else {
        setRooms(prev => prev.filter(r => !selectedIds.has(r.id)));
      }
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err.message || 'Lỗi xóa phòng');
    }
    setActionLoading(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="container mx-auto p-6 mt-20">
  <h1 className="text-2xl font-bold mb-2">Quản lý phòng{currentHotel ? ` - ${currentHotel.name || ('ID ' + currentHotel.id)}` : ''}</h1>
  <p className="text-gray-600 mb-4">{currentHotel ? `Xem và quản lý các phòng của khách sạn: ${currentHotel.name || 'ID ' + currentHotel.id}` : 'Xem và quản lý tất cả các phòng trong hệ thống.'}</p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 mb-4">
        <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          + Thêm phòng
        </button>
        <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Chỉnh sửa
        </button>
        <button onClick={handleDeleteClick} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" disabled={actionLoading}>
          Xóa
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-4">Đang tải...</div>
        ) : (() => {
          const hid = currentHotel ? Number(currentHotel.id) : null;
          // Simply display all rooms from location.state (already filtered for this hotel)
          const displayed = rooms;
          if (!displayed || displayed.length === 0) return (<div className="p-4 text-gray-600">Không tìm thấy phòng nào. Sử dụng Thêm để tạo phòng mới.</div>);
          return (<div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === displayed.length && displayed.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(displayed.map(r => r.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Giá</th>
                  <th className="px-4 py-3 text-left">Sức chứa</th>
                  <th className="px-4 py-3 text-left">Còn trống</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(room => (
                  <tr key={room.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(room.id)} 
                        onChange={() => toggleSelect(room.id)} 
                      />
                    </td>
                    <td className="px-4 py-3">{room.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        {room.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{room.price?.toLocaleString()} ₫</td>
                    <td className="px-4 py-3">{room.capacity} người</td>
                    <td className="px-4 py-3">{room.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>);
        })()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold mb-4">Xác nhận xóa</h2>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa {selectedIds.size} phòng đã chọn? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={actionLoading}
              >
                Có, xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoomPage;
