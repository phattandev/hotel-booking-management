import React from 'react';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './component/auth/LoginPage'
import RegisterPage from './component/auth/RegisterPage'
import HomePage from './component/home/HomePage'
import NavBar from './component/common/NavBar'
import AllRoomPage from './component/booking_rooms/AllRoomPage'
import FindBookingPage from './component/booking_rooms/FindBookingPage'

// Admin
import AdminPage from './component/admin/AdminPage'
import ManageRoomPage from './component/admin/ManageRoomPage'
import AddRoomPage from './component/admin/AddRoomPage'
import EditRoomPage from './component/admin/EditRoomPage'
import ManageBookingPage from './component/admin/ManageBookingPage'
import ManageAccountPage from './component/admin/ManageAccountPage'
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
            <Route exact path="/find-booking" element={<FindBookingPage />} />

            {/* Admin pages (protected) */}
            <Route exact path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route exact path="/admin/manage-rooms" element={<ProtectedRoute><ManageRoomPage /></ProtectedRoute>} />
            <Route exact path="/admin/add-room" element={<ProtectedRoute><AddRoomPage /></ProtectedRoute>} />
            <Route exact path="/admin/edit-room/:id" element={<ProtectedRoute><EditRoomPage /></ProtectedRoute>} />
            <Route exact path="/admin/manage-bookings" element={<ProtectedRoute><ManageBookingPage /></ProtectedRoute>} />
            <Route exact path="/admin/manage-accounts" element={<ProtectedRoute><ManageAccountPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
