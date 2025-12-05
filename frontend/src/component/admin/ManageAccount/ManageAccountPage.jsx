import React, { useEffect, useState } from 'react';

import { getAllUsers, lockUser, unlockUser } from '../../../service/ApiService';

const ManageAccountPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserAction, setSelectedUserAction] = useState(null); // 'lock' or 'unlock'
  const [selectedUserInfo, setSelectedUserInfo] = useState(null); // Store user info for modal
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers();
      console.log('getAllUsers response:', res);
      // API trả về { status, message, data: [user, ...] }
      const userList = res.data || [];
      console.log('User list:', userList);
      setUsers(userList);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message || 'Error fetching users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Lock/unlock user status
  const handleToggleStatus = async (user, action) => {
    setSelectedUserId(user.id);
    setSelectedUserAction(action); // 'lock' or 'unlock'
    setSelectedUserInfo(user);
    setShowConfirmModal(true);
  };

  // Confirm lock/unlock
  const handleConfirmToggle = async () => {
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (selectedUserAction === 'unlock') {
        await unlockUser(selectedUserId);
        setMessage(`Mở khóa tài khoản "${selectedUserInfo?.fullName}" thành công.`);
      } else {
        await lockUser(selectedUserId);
        setMessage(`Khóa tài khoản "${selectedUserInfo?.fullName}" thành công.`);
      }
      setShowConfirmModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật trạng thái tài khoản');
    }
    setActionLoading(false);
  };

  const handleCancelToggle = () => {
    setShowConfirmModal(false);
    setSelectedUserId(null);
    setSelectedUserAction(null);
    setSelectedUserInfo(null);
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
                  // Backend dùng field 'activate': true = Hoạt động, false = Bị khóa
                  const isLocked = user.activate === false;
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
                          onClick={() => handleToggleStatus(user, isLocked ? 'unlock' : 'lock')}
                          className={`px-3 py-2 text-xs font-semibold rounded text-white transition ${isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
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

      {/* Confirm Modal for Lock/Unlock */}
      {showConfirmModal && selectedUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold mb-4">
              {selectedUserAction === 'unlock' ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản'}
            </h2>
            <p className="text-gray-700 mb-6">
              {selectedUserAction === 'unlock' 
                ? `Bạn có chắc chắn muốn mở khóa tài khoản "${selectedUserInfo.fullName}" (${selectedUserInfo.email})?`
                : `Bạn có chắc chắn muốn khóa tài khoản "${selectedUserInfo.fullName}" (${selectedUserInfo.email})?`
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelToggle}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-semibold"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`px-4 py-2 text-white rounded font-semibold ${
                  selectedUserAction === 'unlock'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
                disabled={actionLoading}
              >
                {actionLoading 
                  ? (selectedUserAction === 'unlock' ? 'Đang mở khóa...' : 'Đang khóa...')
                  : (selectedUserAction === 'unlock' ? 'Mở khóa' : 'Khóa')
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAccountPage;
