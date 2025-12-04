import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../common/Footer';
import { getBookingByConfirmationCode, getUserBookings, isAuthenticated } from '../../service/ApiService';

const FindBookingPage = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [allBookings, setAllBookings] = useState([]);
	const [filteredBookings, setFilteredBookings] = useState([]);
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [initialLoading, setInitialLoading] = useState(true);
	const [searchLoading, setSearchLoading] = useState(false);
	const [error, setError] = useState(null);
	const [searchStatus, setSearchStatus] = useState(''); // 'success', 'not-found', ''
	const [hasSearched, setHasSearched] = useState(false);

	// Check authentication on mount
	useEffect(() => {
		if (!isAuthenticated()) {
			navigate('/login');
			return;
		}
	}, [navigate]);

	// Load all bookings on mount
	useEffect(() => {
		const loadAllBookings = async () => {
			setInitialLoading(true);
			setError(null);
			try {
				const response = await getUserBookings();
				// API returns { status, message, data: [bookings] }
				const bookings = response.data || [];
				
				// Sort by createAt - newest first
				const sorted = [...bookings].sort((a, b) => {
					return new Date(b.createAt) - new Date(a.createAt);
				});

				setAllBookings(sorted);
				setFilteredBookings(sorted);
			} catch (err) {
				setError(err.message || 'Error loading bookings');
				setAllBookings([]);
				setFilteredBookings([]);
			} finally {
				setInitialLoading(false);
			}
		};

		loadAllBookings();
	}, []);

	// Handle search by confirmation code
	const handleSearch = async (e) => {
		e.preventDefault();
		
		setSearchLoading(true);
		setError(null);
		setSearchStatus('');
		setSelectedBooking(null);
		setHasSearched(true);

		if (!searchQuery.trim()) {
			// If search is empty, show all bookings
			setFilteredBookings(allBookings);
			setSearchStatus('');
			setHasSearched(false);
			setSearchLoading(false);
			return;
		}

		try {
			const response = await getBookingByConfirmationCode(searchQuery.trim());
			// API returns { status, message, data: booking }
			const bookingData = response.data;
			
			if (bookingData) {
				setFilteredBookings([bookingData]);
				setSearchStatus('success');
			} else {
				setFilteredBookings([]);
				setSearchStatus('not-found');
			}
		} catch (err) {
			setError(err.message || 'Error searching for booking');
			setFilteredBookings([]);
			setSearchStatus('not-found');
		} finally {
			setSearchLoading(false);
		}
	};

	// Handle clear search
	const handleClearSearch = () => {
		setSearchQuery('');
		setFilteredBookings(allBookings);
		setSearchStatus('');
		setHasSearched(false);
		setError(null);
		setSelectedBooking(null);
	};

	// Handle view details
	const handleViewDetails = (booking) => {
		setSelectedBooking(booking);
	};

	// Handle close details
	const handleCloseDetails = () => {
		setSelectedBooking(null);
	};

	// Handle cancel booking (placeholder)
	const handleCancelBooking = (booking) => {
		// TODO: Implement cancel booking functionality
		alert(`Cancel booking functionality coming soon for: ${booking.bookingReference}`);
	};

	// Handle login confirm
	const handleLoginConfirm = () => {
		setShowLoginModal(false);
		navigate('/login');
	};

	// Login Modal Component
	const LoginModal = () => (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<h2 className="text-xl font-bold mb-4">Login Required</h2>
				<p className="text-gray-700 mb-6">
					You need to log in or create an account to view your bookings. Would you like to proceed to the login page?
				</p>
				<div className="flex space-x-3">
					<button
						onClick={() => navigate('/hotels')}
						className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleLoginConfirm}
						className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
					>
						OK
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto p-6 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tìm kiếm đặt phòng</h1>
          <p className="text-gray-600">Xem tất cả các đặt phòng của bạn hoặc tìm kiếm theo mã xác nhận</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã xác nhận (VD: X82L9A hoặc BK-2025-010)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {searchLoading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-semibold"
              >
                Xóa
              </button>
            )}
          </form>
        </div>				{/* Search Status Message */}
				{hasSearched && searchStatus && (
					<div className={`mb-6 p-4 rounded-lg border ${
						searchStatus === 'success'
							? 'bg-green-50 border-green-200 text-green-800'
							: 'bg-orange-50 border-orange-200 text-orange-800'
					}`}>
						{searchStatus === 'success' ? (
							<div className="flex items-center space-x-2">
								<span className="text-2xl">✓</span>
								<span className="font-semibold">Tìm thấy đặt phòng!</span>
							</div>
						) : (
							<div className="flex items-center space-x-2">
								<span className="text-2xl">✗</span>
								<span className="font-semibold">Không tìm thấy đặt phòng với mã xác nhận này</span>
							</div>
						)}
					</div>
				)}

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
						<div className="flex items-center space-x-2">
							<span className="text-2xl">⚠</span>
							<span className="font-semibold">{error}</span>
						</div>
					</div>
				)}

				{/* Loading State */}
				{initialLoading && (
					<div className="bg-white rounded-lg shadow p-12 text-center">
						<p className="text-gray-600">Đang tải các đặt phòng của bạn...</p>
					</div>
				)}

				{/* Booking Details Modal/View */}
				{selectedBooking && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full my-8">
							{/* Header */}
							<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
								<div>
									<p className="text-sm opacity-90">Mã xác nhận</p>
									<p className="text-2xl font-bold font-mono">{selectedBooking.bookingReference}</p>
								</div>
								<button
									onClick={handleCloseDetails}
									className="text-white text-2xl hover:opacity-80"
								>
									✕
								</button>
							</div>

							{/* Body */}
							<div className="p-6 space-y-6 max-h-96 overflow-y-auto">
								{/* Customer Information */}
								<div className="border-b pb-4">
									<h3 className="text-lg font-bold mb-3">Thông tin khách hàng</h3>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-gray-600 font-semibold">Tên</p>
											<p>{selectedBooking.customerName || selectedBooking.user?.fullName || 'N/A'}</p>
										</div>
										<div>
											<p className="text-gray-600 font-semibold">Email</p>
											<p>{selectedBooking.customerEmail || selectedBooking.user?.email || 'N/A'}</p>
										</div>
										<div>
											<p className="text-gray-600 font-semibold">Điện thoại</p>
											<p>{selectedBooking.customerPhone || selectedBooking.user?.phone || 'N/A'}</p>
										</div>
										<div>
											<p className="text-gray-600 font-semibold">Trạng thái</p>
											<span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
												selectedBooking.status === 'BOOKED' 
													? 'bg-green-100 text-green-800'
													: selectedBooking.status === 'CANCELLED'
													? 'bg-red-100 text-red-800'
													: 'bg-yellow-100 text-yellow-800'
											}`}>
												{selectedBooking.status === 'BOOKED' ? 'Đã đặt' : selectedBooking.status === 'CANCELLED' ? 'Đã hủy' : selectedBooking.status}
											</span>
										</div>
									</div>
								</div>

								{/* Stay Dates */}
								<div className="border-b pb-4">
									<h3 className="text-lg font-bold mb-3">Ngày lưu trú</h3>
									<div className="grid grid-cols-3 gap-4 text-sm">
										<div>
											<p className="text-gray-600 font-semibold">Nhận phòng</p>
											<p>{new Date(selectedBooking.checkinDate).toLocaleDateString('vi-VN')}</p>
										</div>
										<div>
											<p className="text-gray-600 font-semibold">Trả phòng</p>
											<p>{new Date(selectedBooking.checkoutDate).toLocaleDateString('vi-VN')}</p>
										</div>
										<div>
											<p className="text-gray-600 font-semibold">Đêm</p>
											<p>{Math.ceil(
												(new Date(selectedBooking.checkoutDate) - new Date(selectedBooking.checkinDate)) / (1000 * 60 * 60 * 24)
											)}</p>
										</div>
									</div>
								</div>

								{/* Guests */}
								<div className="border-b pb-4">
									<h3 className="text-lg font-bold mb-3">Khách</h3>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-gray-600 font-semibold">Người lớn</p>
											<p>{selectedBooking.adultAmount}</p>
										</div>
										<div>
											<p className="text-gray-600 font-semibold">Trẻ em</p>
											<p>{selectedBooking.childrenAmount}</p>
										</div>
									</div>
								</div>

								{/* Special Requests */}
								{selectedBooking.specialRequire && (
									<div className="border-b pb-4">
										<h3 className="text-lg font-bold mb-2">Yêu cầu đặc biệt</h3>
										<p className="text-sm text-gray-700">{selectedBooking.specialRequire}</p>
									</div>
								)}

								{/* Price */}
								<div className="bg-blue-50 p-3 rounded">
									<div className="flex justify-between text-sm">
										<span className="text-gray-700 font-semibold">Tổng tiền:</span>
										<span className="text-green-600 font-bold">{selectedBooking.totalPrice?.toLocaleString()} ₫</span>
									</div>
								</div>
							</div>

							{/* Footer Buttons */}
							<div className="p-6 border-t bg-gray-50 flex gap-3">
								<button
									onClick={handleCloseDetails}
									className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors font-semibold text-sm"
								>
									Đóng
								</button>
								{selectedBooking.status === 'BOOKED' && (
									<button
										onClick={() => {
											handleCancelBooking(selectedBooking);
											handleCloseDetails();
										}}
										className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold text-sm"
									>
										Hủy đặt phòng
									</button>
								)}
								<button
									onClick={() => window.print()}
									className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-semibold text-sm"
								>
									In
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Bookings List */}
				{!initialLoading && filteredBookings.length > 0 ? (
					<div className="grid gap-4">
						{filteredBookings.map((booking) => (
							<div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
								<div className="p-6">
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
										{/* Booking Reference */}
										<div>
											<p className="text-sm text-gray-600 font-semibold">Mã xác nhận</p>
											<p className="text-lg font-mono font-bold text-blue-600">{booking.bookingReference}</p>
										</div>

										{/* Check-in / Check-out */}
										<div>
											<p className="text-sm text-gray-600 font-semibold">Ngày lưu trú</p>
											<p className="text-lg font-medium">
												{new Date(booking.checkinDate).toLocaleDateString('vi-VN')} -{' '}
												{new Date(booking.checkoutDate).toLocaleDateString('vi-VN')}
											</p>
										</div>

										{/* Guests */}
										<div>
											<p className="text-sm text-gray-600 font-semibold">Khách</p>
											<p className="text-lg font-medium">
												{booking.adultAmount} người lớn{booking.childrenAmount > 0 && `, ${booking.childrenAmount} trẻ em`}
											</p>
										</div>

										{/* Status */}
										<div>
											<p className="text-sm text-gray-600 font-semibold">Trạng thái</p>
											<span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
												booking.status === 'BOOKED' 
													? 'bg-green-100 text-green-800'
													: booking.status === 'CANCELLED'
													? 'bg-red-100 text-red-800'
													: 'bg-yellow-100 text-yellow-800'
											}`}>
												{booking.status === 'BOOKED' ? 'Đã đặt' : booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
											</span>
										</div>
									</div>

									{/* Price and Buttons */}
									<div className="flex justify-between items-center pt-4 border-t">
										<div>
											<p className="text-sm text-gray-600 font-semibold">Tổng tiền</p>
											<p className="text-xl font-bold text-green-600">{booking.totalPrice?.toLocaleString()} ₫</p>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => handleViewDetails(booking)}
												className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
											>
												Xem chi tiết
											</button>
											{booking.status === 'BOOKED' && (
												<button
													onClick={() => handleCancelBooking(booking)}
													className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold"
												>
													Hủy
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					!initialLoading && (
						<div className="bg-white rounded-lg shadow p-12 text-center">
							<p className="text-gray-600 text-lg mb-4">
								{hasSearched ? 'Không tìm thấy đặt phòng nào' : 'Bạn chưa có đặt phòng nào'}
							</p>
							<button
								onClick={() => navigate('/hotels')}
								className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
							>
								Duyệt khách sạn
							</button>
						</div>
					)
				)}
			</main>
			<Footer />
		</div>
	);
};

export default FindBookingPage;
