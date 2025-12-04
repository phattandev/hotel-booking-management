import React, { useState } from 'react';
import ManageHotelAmenitiesPage from './ManageHotelAmenitiesPage';
import ManageRoomAmenitiesPage from './ManageRoomAmenitiesPage';

const ManageAmenitiesPage = () => {
	const [tab, setTab] = useState('hotel');

	return (
		<div className="mt-20">
			<div className="container mx-auto p-6">
				<h1 className="text-2xl font-bold mb-4">Quản lý tiện nghi</h1>
				<div className="mb-4 flex gap-2">
					<button onClick={()=>setTab('hotel')} className={`px-4 py-2 rounded ${tab==='hotel' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Tiện nghi khách sạn</button>
					<button onClick={()=>setTab('room')} className={`px-4 py-2 rounded ${tab==='room' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Tiện nghi phòng</button>
				</div>
			</div>

			<div>
				{tab === 'hotel' ? <ManageHotelAmenitiesPage /> : <ManageRoomAmenitiesPage />}
			</div>
		</div>
	);
};

export default ManageAmenitiesPage;
