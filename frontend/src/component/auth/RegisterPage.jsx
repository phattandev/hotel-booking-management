import React, { useState, useEffect } from 'react';
import { registerUser, isAuthenticated } from '../../service/ApiService';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [registration, setRegistration] = useState({
        fullname: "",
        email: "",
        password: "",
        phone: "",
        dob: ""
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

    const handleFullNameBlur = (e) => {
        const fullName = e.target.value.trim().replace(/\s+/g, ' ');
        const normalizedFullName = fullName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        setRegistration({ ...registration, fullname: normalizedFullName });
    };

    const handleRegistration = async (e) => {
        e.preventDefault();

        // 1. Kiểm tra các trường không được để trống
        if (!registration.fullname || !registration.email || !registration.phone || !registration.dob || !registration.password) {
            setErrorMessage("Vui lòng điền vào tất cả các trường.");
            return;
        }

        // 2. Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@gmail\.com$/;
        if (!emailRegex.test(registration.email)) {
            setErrorMessage("Email phải là địa chỉ @gmail.com hợp lệ.");
            return;
        }

        // 3. Kiểm tra mật khẩu
        const passwordRegex = /[a-zA-Z]/;
        if (!passwordRegex.test(registration.password)) {
            setErrorMessage("Mật khẩu phải chứa ít nhất một chữ cái.");
            return;
        }

        // 4. Kiểm tra ngày sinh
        const dob = new Date(registration.dob);
        const today = new Date();
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(today.getFullYear() - 100);

        if (dob > today) {
            setErrorMessage("Ngày sinh không được lớn hơn ngày hiện tại.");
            return;
        }
        if (dob < hundredYearsAgo) {
            setErrorMessage("Bạn phải dưới 100 tuổi để đăng ký.");
            return;
        }

        try {
            const result = await registerUser(registration);
            setSuccessMessage(result.message || "Đăng ký thành công!");
            setErrorMessage("");
            // Xóa form sau khi đăng ký thành công
            setRegistration({
                fullname: "",
                email: "",
                phone: "",
                dob: "",
                password: ""
            });
            // Tùy chọn: Chuyển hướng đến trang đăng nhập sau một khoảng thời gian
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setSuccessMessage("");
            if (error.response && error.response.data && error.response.data.message) {
                // If backend message exists we prefer to show it (could be already localized)
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage(`Lỗi đăng ký: ${error.message}`);
            }
        }
    };

    return (
        <section className="container mx-auto flex justify-center items-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Đăng ký tài khoản</h2>
                
                {/* Hiển thị thông báo lỗi hoặc thành công */}
                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
                {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

                <form onSubmit={handleRegistration}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                            <input type="text" name="fullname" value={registration.fullname} onChange={handleRegistrationChange} onBlur={handleFullNameBlur} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                            <input type="tel" name="phone" value={registration.phone} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày sinh <span className="text-red-500">*</span></label>
                            <input type="date" name="dob" value={registration.dob} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input type="email" name="email" value={registration.email} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                            <input type="password" name="password" value={registration.password} onChange={handleRegistrationChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required />
                        </div>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 mt-6 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Đăng ký
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Bạn đã có tài khoản? <Link to="/login" className="font-medium text-green-600 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </section>
    );
};

export default RegisterPage;