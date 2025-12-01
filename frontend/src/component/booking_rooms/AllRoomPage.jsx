import React, { useEffect, useState } from 'react';
import Footer from '../common/Footer';
import { getAllRooms } from '../../service/ApiService';

const AllRoomPage = () => {
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch rooms from API
	const fetchRooms = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await getAllRooms();
			// API trả về { status, message, data: [room, ...] }
			setRooms(res.data || []);
		} catch (err) {
			setError(err.message || 'Error fetching rooms');
			setRooms([]);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchRooms();
	}, []);

	return (
		<div className="bg-gray-100 min-h-screen">
			<main className="container mx-auto p-6 mt-20">
				<h1 className="text-3xl font-bold mb-2">Available Rooms</h1>
				<p className="text-gray-600 mb-6">Browse all available rooms in our hotel</p>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
						{error}
					</div>
				)}

				{loading ? (
					<div className="text-center py-10">Loading rooms...</div>
				) : rooms.length === 0 ? (
					<div className="text-center py-10 text-gray-600">No rooms available at the moment.</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{rooms.map(room => (
							<div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
								{/* Room Image */}
								<div className="relative bg-gray-200 h-48 overflow-hidden">
									{room.roomPhotoUrl ? (
										<img 
											src={room.roomPhotoUrl} 
											alt={room.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="flex items-center justify-center h-full text-gray-400">
											No image available
										</div>
									)}
									<div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
										{room.amount} available
									</div>
								</div>

								{/* Room Details */}
								<div className="p-4">
									<h3 className="text-xl font-bold mb-2">{room.name}</h3>
									
									<div className="mb-3 flex justify-between items-start">
										<span className="text-sm text-gray-600">Room #{room.roomNumber}</span>
										<span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
											{room.type}
										</span>
									</div>

									<p className="text-gray-600 text-sm mb-3">{room.description}</p>

									<div className="flex justify-between items-center mb-3 text-sm text-gray-600">
										<span>Capacity: <strong>{room.capacity}</strong> pax</span>
									</div>

									<div className="border-t pt-3">
										<div className="text-2xl font-bold text-green-600 mb-3">
											{room.price?.toLocaleString()} ₫
										</div>
										<button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
											Book Now
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
};

export default AllRoomPage;
