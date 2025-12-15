import React, { useState, useEffect } from 'react';
import { loginUser, isAuthenticated, isAdmin } from '../../service/ApiService';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [login, setLogin] = useState({
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    // Nếu người dùng đã đăng nhập, chuyển hướng họ về trang chủ
    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/home");
        }
    }, [navigate]);

    const handleLoginChange = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!login.email || !login.password) {
            setErrorMessage("Vui lòng nhập email và mật khẩu.");
            return;
        }
        try {
            const userData = await loginUser(login);
            const role = userData.role ? userData.role.toUpperCase() : '';
            
            // Chuyển hướng theo vai trò - admin vào trang quản trị, người dùng khác về trang chủ
            if (role === 'ADMIN') {
                navigate("/admin");
            } else {
                navigate("/home");
            }
        } catch (error) {
            setErrorMessage(`Lỗi đăng nhập: ${error.message}`);
        }
    };

    return (
        <section className="container mx-auto flex justify-center items-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">

                <h2 className="text-2xl font-bold text-center text-gray-800">Đăng nhập</h2>

                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

                <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={login.email} onChange={handleLoginChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input type="password" name="password" value={login.password} onChange={handleLoginChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 mt-6 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Đăng nhập
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Bạn chưa có tài khoản? <Link to="/register" className="font-medium text-green-600 hover:underline">Đăng ký</Link>
                </p>
            </div>
        </section>
    );
};

export default LoginPage;