import React, { useEffect, useState } from 'react';
import Footer from '../common/Footer';
import { getRoomsByHotel } from '../../service/ApiService';
import { useLocation, useNavigate } from 'react-router-dom';

	const AllRoomPage = () => {
		const [rooms, setRooms] = useState([]);
		const location = useLocation();
		const navigate = useNavigate();
		// Nếu danh sách phòng được truyền từ AllHotelPage (response có chứa danh sách phòng), dùng chúng
		const roomsFromState = location.state?.rooms;
		const hotelIdFromState = location.state?.hotelId;
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState(null);

		// Lấy danh sách phòng từ API hoặc từ state
		const fetchRooms = async () => {
		setLoading(true);
		setError(null);
		try {
				// Nếu có danh sách phòng được truyền từ AllHotelPage, dùng danh sách đó
				if (roomsFromState && Array.isArray(roomsFromState)) {
					setRooms(roomsFromState);
				} else if (hotelIdFromState) {
					// Nếu không được truyền, gọi API lấy phòng theo mã khách sạn
					const res = await getRoomsByHotel(hotelIdFromState);
					setRooms(res.data || []);
				} else {
					// Hiển thị lỗi vì cần danh sách phòng hoặc mã khách sạn
					setError('Không có thông tin khách sạn. Vui lòng chọn khách sạn từ danh sách.');
					setRooms([]);
				}
		} catch (err) {
			setError(err.message || 'Lỗi khi tải phòng');
			setRooms([]);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchRooms();
	}, []);

	// Trạng thái carousel (băng chuyền lướt ngang cho ảnh) cho mỗi phòng
	const [roomImageIndexMap, setRoomImageIndexMap] = useState({});

	useEffect(() => {
		// Khởi tạo bản đồ chỉ mục cho các phòng đã tải
		const map = {};
		(rooms || []).forEach(r => {
			map[r.id] = map[r.id] ?? 0;
		});
		setRoomImageIndexMap(prev => ({ ...map, ...prev }));
	}, [rooms]);

	// Nút chuyển ảnh phòng trước
	const prevRoomImage = (roomId, images) => {
		setRoomImageIndexMap(prev => {
			const current = prev[roomId] ?? 0;
			const nextIndex = images.length > 0 ? (current - 1 + images.length) % images.length : 0;
			return { ...prev, [roomId]: nextIndex };
		});
	};

	// Nút chuyển ảnh phòng sau
	const nextRoomImage = (roomId, images) => {
		setRoomImageIndexMap(prev => {
			const current = prev[roomId] ?? 0;
			const nextIndex = images.length > 0 ? (current + 1) % images.length : 0;
			return { ...prev, [roomId]: nextIndex };
		});
	};

	return (
		<div className="bg-gray-100 min-h-screen">
			<main className="container mx-auto p-6 mt-20">
				<h1 className="text-3xl font-bold mb-2">Danh sách phòng</h1>
				<p className="text-gray-600 mb-6">Duyệt danh sách phòng trống tại khách sạn</p>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
						{error}
					</div>
				)}

				{loading ? (
					<div className="text-center py-10">Đang tải phòng...</div>
				) : rooms.length === 0 ? (
					<div className="text-center py-10 text-gray-600">Hiện không có phòng nào.</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{rooms.map(room => {
							// Mảng soạn hình ảnh cho băng chuyền (carousel)
							const images = room.roomImages && room.roomImages.length > 0
								? room.roomImages
								: (location.state?.hotelImages && location.state.hotelImages.length > 0
									? location.state.hotelImages
									: []);
							const currentIndex = roomImageIndexMap[room.id] ?? 0;
							return (
								<div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
									{/* Carousel ảnh phòng */}
									<div className="relative bg-gray-200 h-48 overflow-hidden">
										{images.length > 0 ? (
											<>
												<img
													src={images[currentIndex]}
													alt={room.name}
													className="w-full h-full object-cover"
												/>
												{images.length > 1 && (
													<>
														<button onClick={() => prevRoomImage(room.id, images)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-60">‹</button>
														<button onClick={() => nextRoomImage(room.id, images)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-60">›</button>
													</>
												)}
												{images.length > 1 && (
													<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
														{images.map((_, idx) => (
															<button key={idx} onClick={() => setRoomImageIndexMap(prev => ({ ...prev, [room.id]: idx }))} className={`w-2 h-2 rounded-full ${currentIndex === idx ? 'bg-white' : 'bg-white/50'}`}></button>
														))}
													</div>
												)}
											</>
										) : (
											<div className="flex items-center justify-center h-full text-gray-400">Không có ảnh</div>
										)}
										<div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
											{room.amount} còn trống
										</div>
									</div>

									{/* Thông tin phòng */}
									<div className="p-4">
										<h3 className="text-xl font-bold mb-2">{room.name}</h3>
										<div className="mb-3 flex justify-between items-start">
											<span className="text-sm text-gray-600">Phòng #{room.roomNumber}</span>
											<span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
												{room.type}
											</span>
										</div>
										<p className="text-gray-600 text-sm mb-3">{room.description}</p>
										<div className="flex justify-between items-center mb-3 text-sm text-gray-600">
											<span>Sức chứa: <strong>{room.capacity}</strong> người</span>
										</div>
										<div className="border-t pt-3">
											<div className="text-2xl font-bold text-green-600 mb-3">
												{room.price?.toLocaleString()} ₫
											</div>
											<div className="flex space-x-2">
												<button
													onClick={() => navigate(`/room/${room.id}`, { state: { hotelId: hotelIdFromState, hotelImages: location.state?.hotelImages, hotelName: location.state?.hotelName } })}
													className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
												>
													Xem chi tiết
												</button>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
};

export default AllRoomPage;
