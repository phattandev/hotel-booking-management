import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import NavBar from '../common/NavBar';
import HomePage from '../home/HomePage';
import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';
import AdminPage from './AdminPage';
// import AddRoom from './component/room/AddRoom';
// import EditRoom from './component/room/EditRoom';
// import ProtectedRoute from './component/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <NavBar />
      <main className="pt-16"> {/* Add padding top to avoid content being hidden by fixed NavBar */}
        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-room" 
            element={
              <ProtectedRoute>
                <AddRoom />
              </ProtectedRoute>
            } 
          />
          <Route path="/edit-room/:roomId" element={<ProtectedRoute><EditRoom /></ProtectedRoute>} />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;