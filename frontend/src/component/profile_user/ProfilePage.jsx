import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getLoggedInProfileInfo,
  updateUserProfile,
  api,
  getHeader,
  logout
} from '../../service/ApiService';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', dob: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setErr('');
    try {
      console.log('[ProfilePage] Fetching profile...');
      const res = await getLoggedInProfileInfo();
      console.log('[ProfilePage] Profile loaded:', res.data);
      setProfile(res.data);
      setForm({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        dob: res.data.dob || '',
      });
    } catch (e) {
      setErr(e.message || 'Error loading profile');
    }
    setProfileLoading(false);
  };

  const handleEdit = () => setEdit(true);
  const handleCancel = () => {
    setEdit(false);
    setForm({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      dob: profile.dob || '',
    });
    setMsg('');
    setErr('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      // Validation
      if (!form.fullName.trim()) {
        setErr('Full name is required.');
        return;
      }
      if (form.fullName.trim().length > 40) {
        setErr('Full name must be less than 40 characters.');
        return;
      }
      if (!form.phone.trim()) {
        setErr('Phone number is required.');
        return;
      }
      const phoneRegex = /^\d{10,12}$/;
      if (!phoneRegex.test(form.phone.trim())) {
        setErr('Phone number must be between 10 and 12 digits.');
        return;
      }
      if (!form.dob) {
        setErr('Date of birth is required.');
        return;
      }
      const dobDate = new Date(form.dob);
      if (dobDate >= new Date()) {
        setErr('Date of birth must be in the past.');
        return;
      }

      // Always send all required fields (fullName, phone, dob are required by backend)
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        dob: form.dob
      };
      const res = await updateUserProfile(payload);
      console.log('[ProfilePage] Profile updated:', res.data);
      setProfile(res.data);
      setMsg('Profile updated successfully.');
      setEdit(false);
    } catch (e) {
      const backendMsg = e.response?.data?.message || e.response?.data?.error || e.message;
      setErr(backendMsg || 'Error updating profile');
    }
  };

  // Password change logic
  const handlePwChange = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErr('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErr('New password must be at least 6 characters.');
      return;
    }
    if (newPassword === currentPassword) {
      setErr('New password must be different from current password.');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/api/v1/users/change-password', {
        oldPassword: currentPassword,
        newPassword
      }, { headers: getHeader() });
      setMsg('Password changed successfully. Please log in again.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (e) {
      // Hiển thị lỗi chi tiết từ backend nếu có
      const backendMsg = e.response?.data?.message || e.response?.data?.error || e.message;
      setErr(backendMsg || 'Error changing password');
    }
    setPwLoading(false);
  };

  if (profileLoading) return <div className="container mx-auto p-6 mt-20">Loading...</div>;

  return (
    <div className="container mx-auto p-6 mt-20 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Thông tin người dùng</h1>
      {(msg || err) && (
        <div className={`mb-4 p-3 rounded ${msg ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>{msg || err}</div>
      )}
      {profile && (
        <form onSubmit={handleSave} className="bg-white rounded shadow p-6 mb-8">
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Họ và tên</label>
            <input type="text" className="w-full p-2 border rounded" value={form.fullName} disabled={!edit} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Số điện thoại</label>
            <input type="text" className="w-full p-2 border rounded" value={form.phone} disabled={!edit} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input type="email" className="w-full p-2 border rounded bg-gray-100" value={profile.email} disabled />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Ngày sinh</label>
            <input type="date" className="w-full p-2 border rounded" value={form.dob} disabled={!edit} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            {!edit && <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleEdit}>Edit</button>}
            {edit && <>
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={handleCancel}>Hủy</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Lưu</button>
            </>}
          </div>
        </form>
      )}
      {/* Password change form */}
      <form onSubmit={handlePwChange} className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-bold mb-4">Thay đổi mật khẩu</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Mật khẩu hiện tại</label>
          <input type="password" className="w-full p-2 border rounded" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Mật khẩu mới</label>
          <input type="password" className="w-full p-2 border rounded" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Xác nhận mật khẩu mới</label>
          <input type="password" className="w-full p-2 border rounded" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={pwLoading}>{pwLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
