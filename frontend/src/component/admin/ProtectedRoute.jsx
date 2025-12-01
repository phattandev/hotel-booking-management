import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../service/ApiService';

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }
    if (!isAdmin()) {
        return <Navigate to="/home" />; // Hoặc trang thông báo không có quyền
    }
    return children;
};

export default ProtectedRoute;