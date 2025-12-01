
import React, { useEffect, useState } from 'react';
import Footer from '../common/Footer';
import { getAllUsers, lockUser, unlockUser } from '../../service/ApiService';

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
        setMessage('User unlocked successfully.');
      } else {
        await lockUser(userId);
        setMessage('User locked successfully.');
      }
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Error updating user status');
    }
    setActionLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 mt-20">Manage Accounts</h1>
      <p className="text-gray-600 mb-4">View and manage all user accounts in the system.</p>

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
          <div className="p-4">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-gray-600">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">User ID</th>
                  <th className="px-4 py-3 text-left">Full Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
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
                          {isLocked ? 'Locked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, isLocked)}
                          className={`px-2 py-1 text-xs rounded text-white ${isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                          disabled={actionLoading}
                        >
                          {isLocked ? 'Unlock' : 'Lock'}
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
