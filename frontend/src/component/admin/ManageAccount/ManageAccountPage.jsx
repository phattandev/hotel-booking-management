import React, { useEffect, useState } from 'react';

import { getAllUsers, lockUser, unlockUser } from '../../../service/ApiService';

const ManageAccountPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers();
      // API trả về { status, message, data: [user, ...] }
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Error fetching users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Lock/unlock user status
  const handleToggleStatus = async (userId, isLocked) => {
    setActionLoading(true);
    setError(null);
    try {
      if (isLocked) {
        await unlockUser(userId);
        setMessage('Tài khoản đã mở khóa thành công.');
      } else {
        await lockUser(userId);
        setMessage('Tài khoản đã bị khóa thành công.');
      }
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật trạng thái tài khoản');
    }
    setActionLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 mt-20">Quản lý tài khoản</h1>
      <p className="text-gray-600 mb-4">Xem và quản lý tất cả các tài khoản người dùng trong hệ thống.</p>

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

      {/* Users List */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-4">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-gray-600">Không tìm thấy người dùng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">ID tài khoản</th>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Điện thoại</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  // Giả sử nếu user bị khóa thì có thêm trường isLocked, nếu không có thì cần backend bổ sung
                  // Ở đây tạm xác định: nếu user có trường isLocked === true thì là Locked, ngược lại là Active
                  // Nếu backend trả về khác, cần sửa lại logic này
                  const isLocked = user.isLocked === true;
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">#{user.id}</td>
                      <td className="px-4 py-3">{user.fullName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          isLocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isLocked ? 'Bị khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, isLocked)}
                          className={`px-2 py-1 text-xs rounded text-white ${isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                          disabled={actionLoading}
                        >
                          {isLocked ? 'Mở khóa' : 'Khóa'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageAccountPage;
