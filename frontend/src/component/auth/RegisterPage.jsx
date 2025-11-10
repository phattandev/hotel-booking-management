import React, { useState, useEffect } from 'react';
import { registerUser, isAuthenticated } from '../../service/ApiService';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [registration, setRegistration] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        dob: "",
        password: "",
        role: "USER" // Giá trị mặc định, không cần người dùng nhập
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    // Nếu người dùng đã đăng nhập, chuyển hướng họ về trang chủ
    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/home");
        }
    }, [navigate]);

    const handleRegistrationChange = (e) => {
        setRegistration({ ...registration, [e.target.name]: e.target.value });
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        // Kiểm tra các trường không được để trống
        if (!registration.fullname || !registration.email || !registration.phoneNumber || !registration.dob || !registration.password) {
            setErrorMessage("Please fill in all fields.");
            return;
        }
        try {
            const result = await registerUser(registration);
            // Backend trả về một object Response, ta nên lấy message từ đó
            setSuccessMessage(result.message || "Registration successful!");
            setErrorMessage("");
            // Xóa form sau khi đăng ký thành công
            setRegistration({
                fullname: "",
                email: "",
                phoneNumber: "",
                dob: "",
                password: "",
                role: "USER"
            });
            // Tùy chọn: Chuyển hướng đến trang đăng nhập sau một khoảng thời gian
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setSuccessMessage("");
            setErrorMessage(`Registration Error: ${error.message}`);
        }
    };

    return (
        <section className="container mx-auto flex justify-center items-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
                
                {/* Hiển thị thông báo lỗi hoặc thành công */}
                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
                {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

                <form onSubmit={handleRegistration}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="fullname" value={registration.fullname} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" name="phoneNumber" value={registration.phoneNumber} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input type="date" name="dob" value={registration.dob} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={registration.email} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" value={registration.password} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 mt-6 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Register
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Already have an account? <Link to="/login" className="font-medium text-green-600 hover:underline">Login</Link>
                </p>
            </div>
        </section>
    );
};

export default RegisterPage;