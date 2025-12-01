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
      <h1 className="text-2xl font-bold mb-2">Hello {adminName},</h1>
      <p className="text-gray-600 mb-6 mt-5">This is the Admin Dashboard — choose a management area below.</p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{message}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/manage-accounts" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-2">Manage Accounts</h3>
          <p className="text-sm text-gray-600">View and manage user accounts (activate/deactivate, add, edit, delete).</p>
        </Link>

        <Link to="/admin/manage-bookings" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-2">Manage Bookings</h3>
          <p className="text-sm text-gray-600">View all bookings, cancel bookings and filter bookings.</p>
        </Link>

        <Link to="/admin/manage-rooms" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h3 className="text-lg font-semibold mb-2">Manage Rooms</h3>
          <p className="text-sm text-gray-600">Add, edit, delete rooms and change room status.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
