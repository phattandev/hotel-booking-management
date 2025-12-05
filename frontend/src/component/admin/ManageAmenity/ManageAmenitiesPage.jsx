import React, { useEffect, useState } from 'react';
import {
	getAllAmenities,
	addRoomAmenity,
	updateRoomAmenity,
	deleteRoomAmenity,
	addHotelAmenity,
	updateHotelAmenity,
	deleteHotelAmenity,
} from '../../../service/ApiService';

const ManageAmenitiesPage = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);
	const [selectedIds, setSelectedIds] = useState(new Set());
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ name: '', type: 'Hotel Service' });

	const fetch = async () => {
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

	useEffect(() => { fetch(); }, []);

	const toggleSelect = id => {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id); else next.add(id);
		setSelectedIds(next);
	};

	const openAdd = () => { setEditing(null); setForm({ name: '', type: 'Hotel Service' }); setShowForm(true); };
	const openEdit = () => {
		if (selectedIds.size !== 1) { setMessage('Vui lòng chọn một tiện nghi để chỉnh sửa.'); return; }
		const id = Array.from(selectedIds)[0];
		const a = items.find(i => i.id === id) || {};
		setEditing(id);
		setForm({ name: a.name || '', type: a.type || 'Hotel Service' });
		setShowForm(true);
	};

	const handleDelete = async () => {
		if (selectedIds.size === 0) { setMessage('Vui lòng chọn ít nhất một tiện nghi để xóa.'); return; }
		setError(null);
		try {
			for (const id of selectedIds) {
				const item = items.find(i => i.id === id) || {};
				if ((item.type || '').toLowerCase().includes('hotel')) {
					await deleteHotelAmenity(id);
				} else {
					await deleteRoomAmenity(id);
				}
			}
			setMessage(`Đã xóa ${selectedIds.size} tiện nghi.`);
			setItems(prev => prev.filter(it => !selectedIds.has(it.id)));
			setSelectedIds(new Set());
		} catch (err) {
			setError(err.message || 'Lỗi xóa tiện nghi');
		}
	};

	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		try {
			if (editing) {
				if ((form.type || '').toLowerCase().includes('hotel')) await updateHotelAmenity(editing, form);
				else await updateRoomAmenity(editing, form);
				setMessage('Tiện nghi đã cập nhật');
			} else {
				if ((form.type || '').toLowerCase().includes('hotel')) await addHotelAmenity(form);
				else await addRoomAmenity(form);
				setMessage('Tiện nghi đã thêm');
			}
			setShowForm(false);
			fetch();
		} catch (err) {
			setError(err.message || 'Lỗi lưu tiện nghi');
		}
	};

	return (
		<div className="container mx-auto p-6 mt-20">
			<h1 className="text-2xl font-bold mb-4">Quản lý tiện nghi</h1>

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
									<th className="px-4 py-3 text-left"><input type="checkbox" checked={selectedIds.size === items.length && items.length>0} onChange={e=>{ if(e.target.checked) setSelectedIds(new Set(items.map(i=>i.id))); else setSelectedIds(new Set()) }} /></th>
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
		</div>
	);
};

export default ManageAmenitiesPage;
