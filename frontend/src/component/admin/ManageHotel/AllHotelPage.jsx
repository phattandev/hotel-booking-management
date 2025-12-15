import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllHotels, deleteHotel, getHotelAmenitiesByHotel, getRoomAmenitiesByHotel } from '../../../service/ApiService';

const AllHotelPage = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllHotels();
      const list = res?.data ?? res ?? [];
      setHotels(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách khách sạn');
      setHotels([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchHotels(); }, []);

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleAdd = () => navigate('/admin/add-hotel');

  const handleEdit = () => {
    if (selectedIds.size !== 1) {
      setMessage('Vui lòng chọn đúng một khách sạn để chỉnh sửa.');
      return;
    }
    const id = Array.from(selectedIds)[0];
    navigate(`/admin/edit-hotel/${id}`);
  };

  const handleManage = (hotel) => {
    // hiển thị modal lựa chọn chức năng (Quản lý phòng hoặc Xem tiện nghi)
    setSelectedForManage(hotel);
    setShowManageModal(true);
  };

  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedForManage, setSelectedForManage] = useState(null);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [hotelAmenitiesList, setHotelAmenitiesList] = useState([]);
  const [roomAmenitiesList, setRoomAmenitiesList] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const openManageRooms = (hotel) => {
    setShowManageModal(false);
    navigate('/admin/manage-rooms', { state: { hotelId: hotel.id, hotelName: hotel.name, rooms: hotel.rooms } });
  };

  const openManageAmenities = (hotel) => {
    // Thay vì điều hướng đến trang chủ, tìm nạp và hiển thị các tiện nghi của khách sạn này
    setShowManageModal(false);
    viewHotelAmenities(hotel);
  };

  const viewHotelAmenities = async (hotel) => {
    if (!hotel || !hotel.id) return;
    setLoadingAmenities(true);
    setHotelAmenitiesList([]);
    setRoomAmenitiesList([]);
    setError(null);
    try {
      // Tìm kiếm các tiện nghi cấp khách sạn
      const hRes = await getHotelAmenitiesByHotel(hotel.id);
      const hList = hRes?.data ?? hRes ?? [];
      // Tìm kiếm các tiện nghi cấp phòng được nhóm theo phòng
      const rRes = await getRoomAmenitiesByHotel(hotel.id);
      const rList = rRes?.data ?? rRes ?? [];

      // Làm gọn tiện nghi phòng và loại bỏ trùng lặp bằng ID
      const flat = [];
      for (const group of rList) {
        const arr = group?.amenities ?? [];
        for (const a of arr) {
          if (!flat.find(x => x.id === a.id)) 
            flat.push(a);
        }
      }

      setHotelAmenitiesList(Array.isArray(hList) ? hList : []);
      setRoomAmenitiesList(flat);
      setShowAmenitiesModal(true);
    } catch (err) {
      setError(err.message || 'Lỗi lấy tiện nghi khách sạn');
    }
    setLoadingAmenities(false);
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) { setMessage('Vui lòng chọn ít nhất một khách sạn để xóa.'); return; }
    // Kiểm tra xem có khách sạn nào được chọn có phòng không
    const problematic = hotels.filter(h => selectedIds.has(h.id) && Array.isArray(h.rooms) && h.rooms.length > 0);
    if (problematic.length > 0) {
      setError('Không thể xóa những khách sạn có phòng. Vui lòng bỏ chọn các khách sạn có phòng trước.');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setError(null);
    try {
      for (const id of selectedIds) {
        await deleteHotel(id);
      }
      setMessage(`Đã xóa ${selectedIds.size} khách sạn.`);
      setHotels(prev => prev.filter(h => !selectedIds.has(h.id)));
      setSelectedIds(new Set());
    } catch (err) {
      setError(err.message || 'Lỗi xóa khách sạn');
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-2">Quản lý khách sạn</h1>
      <p className="text-gray-600 mb-4">Danh sách khách sạn. Chọn một khách sạn để quản lý phòng/tiện nghi.</p>

      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}

      <div className="flex justify-end gap-3 mb-4">
        <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded">+ Thêm</button>
        <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded">Chỉnh sửa</button>
        <button onClick={handleDeleteClick} className="px-4 py-2 bg-red-600 text-white rounded">Xóa</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-4">Đang tải...</div>
        ) : hotels.length === 0 ? (
          <div className="p-4 text-gray-600">Không tìm thấy khách sạn nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left"><input type="checkbox" checked={selectedIds.size === hotels.length && hotels.length>0} onChange={e => { if(e.target.checked) setSelectedIds(new Set(hotels.map(h=>h.id))); else setSelectedIds(new Set()); }} /></th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Vị trí</th>
                  <th className="px-4 py-3 text-left">Sao</th>
                  <th className="px-4 py-3 text-left">Số phòng</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map(h => (
                  <tr key={h.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(h.id)} onChange={() => toggleSelect(h.id)} /></td>
                    <td className="px-4 py-3">{h.name}</td>
                    <td className="px-4 py-3">{h.location}</td>
                    <td className="px-4 py-3">{h.starRating}</td>
                    <td className="px-4 py-3">{Array.isArray(h.rooms) ? h.rooms.length : (h.totalRooms ?? '-')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {/* <button onClick={() => navigate(`/admin/edit-hotel/${h.id}`)} className="px-3 py-1 bg-yellow-500 text-white rounded">Sửa</button> */}
                        <button onClick={() => handleManage(h)} className="px-3 py-1 bg-blue-600 text-white rounded">Quản lý</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold mb-4">Xác nhận xóa</h2>
            <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa {selectedIds.size} khách sạn đã chọn? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Có, xóa</button>
            </div>
          </div>
        </div>
      )}
      {showManageModal && selectedForManage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h2 className="text-lg font-bold mb-4">Quản lý khách sạn: {selectedForManage.name}</h2>
            <p className="text-gray-700 mb-4">Chọn chức năng để quản lý khách sạn này.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowManageModal(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
              <button onClick={() => openManageAmenities(selectedForManage)} className="px-4 py-2 bg-indigo-600 text-white rounded">Xem tiện nghi</button>
              <button onClick={() => openManageRooms(selectedForManage)} className="px-4 py-2 bg-blue-600 text-white rounded">Quản lý phòng</button>
            </div>
          </div>
        </div>
      )}

      {showAmenitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
            <h2 className="text-lg font-bold mb-4">Tiện nghi của khách sạn: {selectedForManage?.name}</h2>
            {loadingAmenities ? (
              <div>Đang tải tiện nghi...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tiện nghi khách sạn</h3>
                  {hotelAmenitiesList.length === 0 ? (
                    <div className="text-gray-600">Không có tiện nghi khách sạn.</div>
                  ) : (
                    <ul className="grid grid-cols-2 gap-2">
                      {hotelAmenitiesList.map(a => (
                        <li key={a.id} className="p-2 border rounded">{a.name} <span className="text-xs text-gray-500">({a.type})</span></li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tiện nghi phòng (theo tất cả các phòng thuộc khách sạn)</h3>
                  {roomAmenitiesList.length === 0 ? (
                    <div className="text-gray-600">Không có tiện nghi phòng.</div>
                  ) : (
                    <ul className="grid grid-cols-2 gap-2">
                      {roomAmenitiesList.map(a => (
                        <li key={a.id} className="p-2 border rounded">{a.name} <span className="text-xs text-gray-500">({a.type})</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowAmenitiesModal(false); setSelectedForManage(null); }} className="px-4 py-2 bg-gray-200 rounded">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllHotelPage;
