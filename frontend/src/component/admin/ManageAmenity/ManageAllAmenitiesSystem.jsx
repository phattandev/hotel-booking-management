import React, { useEffect, useState } from 'react';
import { getAllAmenities, createAmenity, updateAmenity, deleteAmenity } from '../../../service/ApiService';

const ManageAllAmenitiesSystem = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // 'create'|'update'|'delete'
    const [pendingPayload, setPendingPayload] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'Hotel Service' });

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllAmenities();
            const list = res?.data ?? res ?? [];
            setItems(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err.message || 'Error fetching amenities');
            setItems([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    // single-select behavior: only one amenity can be selected at a time
    const toggleSelect = (id) => {
        const next = new Set();
        if (!selectedIds.has(id)) next.add(id);
        setSelectedIds(next);
    };

    const openAdd = () => { setEditing(null); setForm({ name: '', type: 'Hotel Service' }); setShowForm(true); };
    const openEdit = () => {
        if (selectedIds.size !== 1) { setMessage('Vui lòng chọn đúng một tiện nghi để chỉnh sửa.'); return; }
        const id = Array.from(selectedIds)[0];
        const a = items.find(i => i.id === id) || {};
        setEditing(id);
        setForm({ name: a.name || '', type: a.type || 'Hotel Service' });
        setShowForm(true);
    };

    // open confirm dialog to delete selected amenity (single-select enforced)
    const handleDelete = () => {
        if (selectedIds.size !== 1) { setMessage('Vui lòng chọn đúng một tiện nghi để xóa.'); return; }
        setError(null);
        const id = Array.from(selectedIds)[0];
        setPendingAction('delete');
        setPendingPayload({ id });
        setConfirmOpen(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        // instead of performing immediately, open confirmation modal for save
        const payload = { name: form.name, type: form.type };
        if (editing) {
            setPendingAction('update');
            setPendingPayload({ id: editing, payload });
        } else {
            setPendingAction('create');
            setPendingPayload({ payload });
        }
        setConfirmOpen(true);
    };

    // called when user confirms an action in the confirm dialog
    const performPending = async () => {
        setConfirmOpen(false);
        setError(null);
        try {
            if (pendingAction === 'delete') {
                const { id } = pendingPayload || {};
                const res = await deleteAmenity(id);
                if (res && typeof res.status !== 'undefined' && res.status !== 200) {
                    setError(res.message || 'Không thể xóa tiện nghi này.');
                    return;
                }
                setMessage('Tiện nghi đã xóa');
                setSelectedIds(new Set());
            } else if (pendingAction === 'update') {
                const { id, payload } = pendingPayload || {};
                await updateAmenity(id, payload);
                setMessage('Tiện nghi đã cập nhật');
                setShowForm(false);
                setEditing(null);
            } else if (pendingAction === 'create') {
                const { payload } = pendingPayload || {};
                await createAmenity(payload);
                setMessage('Tiện nghi đã thêm');
                setShowForm(false);
            }

            // reload list after any action
            await fetchAll();
            setPendingAction(null);
            setPendingPayload(null);
        } catch (err) {
            setError(err.message || 'Lỗi thực hiện hành động');
        }
    };

    return (
        <div className="container mx-auto p-6 mt-20">
            <h1 className="text-2xl font-bold mb-4">Quản lý tất cả tiện nghi (Hệ thống)</h1>

            {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">{error}</div>}

            <div className="flex justify-end gap-3 mb-4">
                <button onClick={openAdd} className="px-4 py-2 bg-green-600 text-white rounded">+ Thêm</button>
                <button onClick={openEdit} className="px-4 py-2 bg-blue-600 text-white rounded">Chỉnh sửa</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Xóa</button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                {loading ? (
                    <div className="p-4">Đang tải...</div>
                ) : items.length === 0 ? (
                    <div className="p-4 text-gray-600">Không tìm thấy tiện nghi nào.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left">Chọn</th>
                                    <th className="px-4 py-3 text-left">Tên</th>
                                    <th className="px-4 py-3 text-left">Loại</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(it => (
                                    <tr key={it.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(it.id)} onChange={()=>toggleSelect(it.id)} /></td>
                                        <td className="px-4 py-3">{it.name}</td>
                                        <td className="px-4 py-3">{it.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <form onSubmit={submit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold mb-3">{editing ? 'Chỉnh sửa tiện nghi' : 'Thêm tiện nghi'}</h2>
                        <label className="block mb-2">Tên</label>
                        <input required value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} className="w-full mb-3 p-2 border rounded" />
                        <label className="block mb-2">Loại</label>
                        <select value={form.type} onChange={e=>setForm(f=>({...f, type: e.target.value}))} className="w-full mb-3 p-2 border rounded">
                            <option>Hotel Service</option>
                            <option>Room Feature</option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Confirmation dialog for create/update/delete */}
            {confirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-3">Xác nhận</h3>
                        <div className="mb-4 text-gray-700">
                            {pendingAction === 'delete' && (
                                <p>Bạn có chắc muốn xóa tiện nghi này không?</p>
                            )}
                            {pendingAction === 'update' && (
                                <p>Bạn có chắc muốn lưu thay đổi cho tiện nghi này không?</p>
                            )}
                            {pendingAction === 'create' && (
                                <p>Bạn có chắc muốn thêm tiện nghi mới này không?</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => { setConfirmOpen(false); setPendingAction(null); setPendingPayload(null); }} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                            <button type="button" onClick={performPending} className="px-4 py-2 bg-red-600 text-white rounded">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAllAmenitiesSystem;
