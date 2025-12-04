import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRooms, deleteRoom } from '../../../service/ApiService';

const ManageRoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Fetch rooms from API
  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllRooms();
      // API trả về { status, message, data: [room, ...] }
      setRooms(res.data || []);
    } catch (err) {
      setError(err.message || 'Error fetching rooms');
      setRooms([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleAdd = () => navigate('/admin/add-room');

  const handleEdit = () => {
    if (selectedIds.size !== 1) {
      setMessage('Vui lòng chọn đúng một phòng để chỉnh sửa.');
      return;
    }
    const id = Array.from(selectedIds)[0];
    navigate(`/admin/edit-room/${id}`);
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
      setRooms(prev => prev.filter(r => !selectedIds.has(r.id)));
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
      <h1 className="text-2xl font-bold mb-2">Quản lý phòng</h1>
      <p className="text-gray-600 mb-4">Xem và quản lý tất cả các phòng trong hệ thống.</p>

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
        ) : rooms.length === 0 ? (
          <div className="p-4 text-gray-600">Không tìm thấy phòng nào. Sử dụng Thêm để tạo phòng mới.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === rooms.length && rooms.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(rooms.map(r => r.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Phòng #</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Giá</th>
                  <th className="px-4 py-3 text-left">Sức chứa</th>
                  <th className="px-4 py-3 text-left">Còn trống</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(room.id)} 
                        onChange={() => toggleSelect(room.id)} 
                      />
                    </td>
                    <td className="px-4 py-3">#{room.roomNumber}</td>
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
          </div>
        )}
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
