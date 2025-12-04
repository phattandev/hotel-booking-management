import React from 'react';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './component/auth/LoginPage'
import RegisterPage from './component/auth/RegisterPage'
import HomePage from './component/home/HomePage'
import NavBar from './component/common/NavBar'
import AllRoomPage from './component/booking_rooms/AllRoomPage'
import RoomDetailPage from './component/booking_rooms/RoomDetailPage'
import AllHotelPage from './component/hotel/AllHotelPage'
import HotelDetailPage from './component/hotel/HotelDetailPage'
import FindBookingPage from './component/booking_rooms/FindBookingPage'
import BookingResultPage from './component/booking_rooms/BookingResultPage'

// Admin
import AdminPage from './component/admin/AdminPage'
import ManageRoomPage from './component/admin/ManageRoom/ManageRoomPage'
import AddRoomPage from './component/admin/ManageRoom/AddRoomPage'
import EditRoomPage from './component/admin/ManageRoom/EditRoomPage'
import ManageBookingPage from './component/admin/ManageBooking/ManageBookingPage'
import ManageAccountPage from './component/admin/ManageAccount/ManageAccountPage'
import ManageAmenitiesPage from './component/admin/ManageAmenity/ManageAmenitiesPage'
import ProfilePage from './component/profile_user/ProfilePage'
import ProtectedRoute from './component/admin/ProtectedRoute'

function App() {

  return (
    <BrowserRouter>
      <NavBar />
      {/* Add padding-top to prevent content from being hidden behind the fixed navbar */}
      <div className="App pt[70px]">
        <Routes>
            {/* Route for homepage and login */}
            <Route exact path="/" element={<LoginPage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/register" element={<RegisterPage />} />
            <Route exact path="/home" element={<HomePage />} />
            {/* Public pages */}
            <Route exact path="/rooms" element={<AllRoomPage />} />
            <Route exact path="/room/:id" element={<RoomDetailPage />} />
            <Route exact path="/hotels" element={<AllHotelPage />} />
            <Route exact path="/hotel/:id" element={<HotelDetailPage />} />
            <Route exact path="/booking-result" element={<BookingResultPage />} />
            <Route exact path="/find-booking" element={<FindBookingPage />} />

            {/* Admin pages (protected) */}
            <Route exact path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route exact path="/admin/manage-rooms" element={<ProtectedRoute><ManageRoomPage /></ProtectedRoute>} />
            <Route exact path="/admin/add-room" element={<ProtectedRoute><AddRoomPage /></ProtectedRoute>} />
            <Route exact path="/admin/edit-room/:id" element={<ProtectedRoute><EditRoomPage /></ProtectedRoute>} />
            <Route exact path="/admin/manage-bookings" element={<ProtectedRoute><ManageBookingPage /></ProtectedRoute>} />
            <Route exact path="/admin/manage-accounts" element={<ProtectedRoute><ManageAccountPage /></ProtectedRoute>} />
            <Route exact path="/admin/manage-amenities" element={<ProtectedRoute><ManageAmenitiesPage /></ProtectedRoute>} />
      <Route exact path="/profile" element={<ProfilePage />} />
    </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
