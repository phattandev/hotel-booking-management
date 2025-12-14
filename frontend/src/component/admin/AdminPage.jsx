import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../../service/ApiService';

const AdminPage = () => {
  const [adminName, setAdminName] = useState('Admin');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getUserProfile();
        if (mounted && res && res.data && res.data.fullname) {
          setAdminName(res.data.fullname);
        }
      } catch (e) {
        // ignore - profile may not be available in dev
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Xin chào {adminName},</h1>
      <p className="text-gray-600 mb-6 mt-5">Đây là bảng điều khiển quản trị viên — chọn một lĩnh vực quản lý dưới đây.</p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{message}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/manage-all-amenities" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-2">Quản lý tất cả tiện nghi</h3>
          <p className="text-sm text-gray-600">Xem và quản lý tất cả tiện nghi trong hệ thống — bao gồm thêm, chỉnh sửa và xóa tiện nghi.</p>
        </Link>
        <Link to="/admin/manage-hotels" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-2">Quản lý khách sạn</h3>
          <p className="text-sm text-gray-600">Xem danh sách khách sạn, thêm, chỉnh sửa, xóa và quản lý phòng cho từng khách sạn.</p>
        </Link>

        <Link to="/admin/manage-accounts" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-2">Quản lý tài khoản</h3>
          <p className="text-sm text-gray-600">Xem và quản lý tài khoản người dùng (kích hoạt/vô hiệu hóa, thêm, chỉnh sửa, xóa).</p>
        </Link>

        <Link to="/admin/manage-bookings" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-2">Quản lý đặt phòng</h3>
          <p className="text-sm text-gray-600">Xem tất cả các đặt phòng, hủy đặt phòng và lọc các đặt phòng.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
