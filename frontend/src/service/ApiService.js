import axios from 'axios';
import authEventEmitter from '../utils/authEventEmitter';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

// Instance cho các API cần xác thực
// Axios instance cho các request cần xác thực (token sẽ được thêm qua interceptor)
export const api = axios.create({
    baseURL: BASE_URL,
});

// Instance cho các API không cần xác thực (đăng nhập, đăng ký)
// Axios instance cho các request không cần xác thực (login/register,...)
const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9090",
});

// Interceptor chỉ áp dụng cho `api`, không áp dụng cho `authApi`
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    // Guard against literal string 'null' which may be stored accidentally
    if (token && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // chắc chắn không gửi Authorization header nếu không có token
        if (config.headers && config.headers.Authorization) delete config.headers.Authorization;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Chắc chắn không gửi Authorization header trong authApi
authApi.interceptors.request.use(config => {
    if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
    }
    return config;
}, error => Promise.reject(error));

/*
    Mô tả: Trả về headers mặc định dùng cho các request cần Authorization.
    Trả về: object chứa Authorization header (Bearer token) nếu token tồn tại.
    Lưu ý: Không đặt Content-Type ở đây vì nhiều request dùng FormData và
    browser phải tự set boundary.
*/
export const getHeader = () => {
    const token = localStorage.getItem("token");
    // Chỉ bao gồm Ủy quyền theo mặc định.
    // Không trả Authorization nếu token absent or 'null'
    if (!token || token === 'null') return {};
    return {
        Authorization: `Bearer ${token}`
    };
};

/*
    Mô tả: Đăng ký người dùng mới.
    Tham số: registrationData - object từ form (fullname, email, phone, password, dob).
    Hành vi: chuyển đổi trường frontend sang định dạng backend rồi gọi endpoint đăng ký.
    Trả về: response.data từ endpoint '/api/v1/auth/register'.
    Lỗi: ném Error với message phù hợp từ server hoặc thông báo chung.
*/
export async function registerUser(registrationData) {
    try {
        const payload = {
            fullName: registrationData.fullname,
            email: registrationData.email,
            phone: registrationData.phone, 
            password: registrationData.password,
            dob: registrationData.dob,
            //role: "CUSTOMER" - vai trò mặc định do backend xử lý
        };
        const response = await authApi.post("/api/v1/auth/register", payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            const errorMessage = typeof error.response.data === 'string' ? error.response.data : (error.response.data.message || JSON.stringify(error.response.data));
            throw new Error(errorMessage || "Đã xảy ra lỗi không mong muốn khi đăng kí.");
        } else {
            throw new Error(`Lỗi đăng kí tài khoản: ${error.message || "Đã xảy ra lỗi không mong muốn."}`);
        }
    }
}

/*
    Mô tả: Thực hiện đăng nhập người dùng.
    Tham số: loginData - object chứa email và password.
    Hành vi: gọi endpoint login, lưu token và role vào localStorage nếu thành công,
    và phát sự kiện xác thực để các component cập nhật.
    Trả về: response.data.
    Lỗi: ném Error với message từ server hoặc thông báo chung.
*/
export async function loginUser(loginData) {
    try {
    const response = await authApi.post("/api/v1/auth/login", loginData);
        if (response.data && response.data.data && response.data.data.token) {
            // Backend trả về: { status, message, data: { token, role, expirationTime, isActive } }
            const tokenData = response.data.data;
            localStorage.setItem("token", tokenData.token);
            
            // Role nằm ở response.data.data.role
            const role = (tokenData.role || '').toUpperCase();
            localStorage.setItem("userRole", role);
            console.log('[ApiService] Đăng nhập thành công- token đã được lưu vào localStorage, vai trò:', role);
            
            // Phát ra sự kiện để NavBar và các thành phần khác cập nhật
            authEventEmitter.emit();
            console.log('[ApiService] Sự kiện xác thực đã được phát sau khi đăng nhập.');
        }
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Email hoặc mật khâu không chính xác.");
        } else {
            throw new Error(`Lỗi đăng nhập: ${error.message || "Đã xảy ra lỗi không mong muốn."}`);
        }
    }
}

/*
    Mô tả: Đăng xuất người dùng cục bộ.
    Hành vi: xóa token và userRole khỏi localStorage và phát sự kiện để UI cập nhật.
*/
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    // Phát ra sự kiện để NavBar và các thành phần khác cập nhật
    authEventEmitter.emit();
}

/*
    Mô tả: Kiểm tra xem người dùng đã đăng nhập hay chưa dựa trên token trong localStorage.
    Trả về: boolean.
*/
export function isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
}

/*
    Mô tả: Kiểm tra xem người dùng hiện tại có role là ADMIN không (dựa vào localStorage.userRole).
    Trả về: boolean.
*/
export function isAdmin() {
    const role = localStorage.getItem("userRole");
    const result = role === "ADMIN";
    console.log('[ApiService] isAdmin() - role:', role, '-> result:', result);
    return result;
}

/*
    Mô tả: Kiểm tra xem người dùng hiện tại có phải là CUSTOMER/USER không.
    Trả về: boolean.
*/
export function isUser() {
    const role = localStorage.getItem("userRole");
    const result = role === "CUSTOMER" || role === "USER";
    console.log('[ApiService] isUser() - role:', role, '-> result:', result);
    return result;
}

/*
    Mô tả: Lấy thông tin hồ sơ tài khoản người dùng (endpoint bảo mật).
    Trả về: response.data từ '/api/v1/users/account'.
*/
export async function getUserProfile() {
    try {
        const response = await api.get("/api/v1/users/account", {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/*
    Mô tả: Lấy thông tin hồ sơ người dùng đang đăng nhập (Customer/Admin).
    Trả về: dữ liệu response từ endpoint '/api/v1/users/get-logged-in-profile-info'.
    Tham số: không cần tham số.
    Lỗi: ném Error với message trả về từ server hoặc thông báo chung khi thất bại.
*/
export async function getLoggedInProfileInfo() {
    try {
        const res = await api.get('/api/v1/users/get-logged-in-profile-info', { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin hồ sơ người dùng đang đăng nhập.');
    }
}

/*
    Mô tả: Cập nhật thông tin hồ sơ người dùng. Các trường trong payload là tuỳ chọn.
    Tham số: payload - object chứa các trường cần cập nhật.
    Trả về: dữ liệu response từ endpoint '/api/v1/users/update'.
    Lỗi: ném Error với message trả về từ server hoặc thông báo chung khi thất bại.
*/
export async function updateUserProfile(payload) {
    try {
        const res = await api.put('/api/v1/users/update', payload, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin hồ sơ người dùng.');
    }
}

/*
    Mô tả: Lấy danh sách tất cả người dùng (thu về các trường cần thiết như id, fullName, email, phone, dob, createdAt).
    Trả về: response.data từ '/api/v1/users/all'.
*/
export async function getAllUsers() {
    try {
        const response = await api.get("/api/v1/users/all", {
            headers: getHeader()
        });
        // response.data.data là mảng user, mỗi user có: id, fullName, email, phone, dob, createdAt
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Lỗi khi lấy danh sách người dùng";
        throw new Error(errorMessage);
    }
}

/*
    Mô tả: Khóa tài khoản người dùng theo userId (kêu gọi endpoint tương ứng).
    Tham số: userId (số hoặc chuỗi).
    Trả về: response.data.
*/
export async function lockUser(userId) {
    try {
        const response = await api.put(`/api/v1/users/${userId}/lock`, {}, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Lỗi khóa người dùng";
        throw new Error(errorMessage);
    }
}

/*
    Mô tả: Mở khóa tài khoản người dùng theo userId.
    Tham số: userId.
*/
export async function unlockUser(userId) {
    try {
        const response = await api.put(`/api/v1/users/${userId}/unlock`, {}, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Lỗi mở khóa người dùng";
        throw new Error(errorMessage);
    }
}

/*
    Mô tả: Xóa người dùng theo userId.
    Tham số: userId.
*/
export async function deleteUser(userId) {
    try {
        const response = await api.delete(`/api/v1/users/delete/${userId}`, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Lỗi xóa người dùng";
        throw new Error(errorMessage);
    }
}

/*
    Mô tả: Lấy danh sách tất cả phòng từ server.
    Hành vi: Chuẩn hoá nhiều dạng response để luôn trả về object { status, message, data: [...] }.
    Trả về: object chuẩn hoá.
*/
export async function getAllRooms() {
    try {
        // Public endpoint: use unauthenticated instance so guests can fetch rooms
        const result = await authApi.get("/api/v1/rooms/all");
        const serverData = result.data;
        if (Array.isArray(serverData)) {
            return { status: 200, message: 'OK', data: serverData };
        }
        if (serverData && Array.isArray(serverData.data)) {
            return serverData;
        }
        const arr = serverData?.data ?? serverData ?? [];
        return { status: 200, message: 'OK', data: Array.isArray(arr) ? arr : [] };
    } catch (error) {
        throw new Error("Lỗi khi lấy danh sách phòng.");
    }
}

/*
    Mô tả: Lấy danh sách tất cả khách sạn.
    Trả về: response.data từ '/api/v1/hotels/all'.
*/
export async function getAllHotels() {
    try {
        // Public endpoint: use unauthenticated instance so guests can fetch hotels
        const res = await authApi.get('/api/v1/hotels/all');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách khách sạn.');
    }
}

/*
    Mô tả: Lấy danh sách phòng theo hotelId.
    Tham số: hotelId.
    Hành vi: chuẩn hoá response tương tự getAllRooms để trả về { status, message, data }.
*/
export async function getRoomsByHotel(hotelId) {
    try {
        // Try unauthenticated call first (guests)
        try {
            const res = await authApi.get(`/api/v1/hotels/${hotelId}/rooms`);
            const serverData = res.data;
            if (Array.isArray(serverData)) {
                return { status: 200, message: 'OK', data: serverData };
            }
            if (serverData && Array.isArray(serverData.data)) {
                return serverData;
            }
            const arr = serverData?.data ?? serverData ?? [];
            return { status: 200, message: 'OK', data: Array.isArray(arr) ? arr : [] };
        } catch (errUnauth) {
            // If unauthenticated call fails (possible 401 or other), try authenticated instance as fallback
            console.warn('[ApiService] authApi.get rooms failed, falling back to api.get with headers:', errUnauth?.message || errUnauth);
            const res = await api.get(`/api/v1/hotels/${hotelId}/rooms`, { headers: getHeader() });
            const serverData = res.data;
            if (Array.isArray(serverData)) {
                return { status: 200, message: 'OK', data: serverData };
            }
            if (serverData && Array.isArray(serverData.data)) {
                return serverData;
            }
            const arr = serverData?.data ?? serverData ?? [];
            return { status: 200, message: 'OK', data: Array.isArray(arr) ? arr : [] };
        }
    } catch (error) {
        // Surface more debugging info when possible
        const msg = error?.response?.data?.message || error?.message || `Lỗi khi lấy danh sách phòng theo mã khách sạn: ${hotelId}`;
        console.error('[ApiService] getRoomsByHotel final error:', error);
        // Attach HTTP status (if any) to the Error object so callers can react (e.g. 401 -> redirect to detail)
        const e = new Error(msg);
        e.status = error?.response?.status;
        throw e;
    }
}

/*
    Mô tả: Lấy thông tin một khách sạn theo id bằng cách gọi getAllHotels và tìm trong danh sách.
    Tham số: hotelId.
    Trả về: object { status: 200, data: hotelObject } hoặc ném lỗi.
*/
export async function getHotelById(hotelId) {
    try {
        const all = await getAllHotels();
        const list = all?.data ?? all ?? [];
        return { status: 200, data: list.find(h => h.id === Number(hotelId)) };
    } catch (error) {
        throw new Error(error.response?.data?.message || `Lỗi khi lấy thông tin khách sạn theo mã: ${hotelId}`);
    }
}

/*
    Mô tả: Tìm kiếm khách sạn theo bộ lọc (location, checkInDate, checkOutDate, capacity, roomQuantity).
    Tham số: filters - object có các trường tương ứng.
    Trả về: object chuẩn hoá { status, message, data }.
*/
export async function searchHotels(filters) {
    try {
        const params = new URLSearchParams();
        if (filters.location) params.append('location', filters.location);
        if (filters.checkInDate) params.append('checkInDate', filters.checkInDate);
        if (filters.checkOutDate) params.append('checkOutDate', filters.checkOutDate);
        if (filters.capacity) params.append('capacity', filters.capacity);
        if (filters.roomQuantity) params.append('roomQuantity', filters.roomQuantity);
        
        // Public search: use unauthenticated instance so guests can search hotels
        const res = await authApi.get(`/api/v1/hotels/search?${params.toString()}`);
        const serverData = res.data;
        if (Array.isArray(serverData)) {
            return { status: 200, message: 'OK', data: serverData };
        }
        if (serverData && Array.isArray(serverData.data)) {
            return serverData;
        }
        const arr = serverData?.data ?? serverData ?? [];
        return { status: 200, message: 'OK', data: Array.isArray(arr) ? arr : [] };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi tìm kiếm khách sạn.');
    }
}

/*
    Mô tả: Thêm khách sạn mới (multipart/form-data). Hỗ trợ nhiều ảnh.
    Tham số: payload - object chứa thông tin khách sạn và optional images (array of File).
    Lưu ý: backend mong đợi field 'image' cho file(s).
*/
export async function addHotel(payload) {
    try {
        const form = new FormData();
        if (payload.name) form.append('name', payload.name);
        if (payload.location) form.append('location', payload.location);
        if (payload.description) form.append('description', payload.description);
        if (payload.starRating != null) form.append('starRating', payload.starRating);
        if (payload.email) form.append('email', payload.email);
        if (payload.phone) form.append('phone', payload.phone);
        if (payload.contactName) form.append('contactName', payload.contactName);
        if (payload.contactPhone) form.append('contactPhone', payload.contactPhone);
        if (payload.isActive != null) form.append('isActive', payload.isActive);
        // danh sách amenityIds (mảng mã tiện ích kiểu interger)
        if (payload.amenityIds && Array.isArray(payload.amenityIds)) {
            payload.amenityIds.forEach((id, idx) => form.append(`amenityIds[${idx}]`, id));
        }
        if (payload.images && Array.isArray(payload.images)) {
            payload.images.forEach((file) => {
                if (file instanceof File) {
                    form.append('image', file);
                }
            });
        } else if (payload.image && payload.image instanceof File) {
            // Nếu chỉ có một file đơn lẻ
            form.append('image', payload.image);
        }
        const res = await api.post('/api/v1/hotels/add', form, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Lỗi khi thêm khách sạn mới');
    }
}

/*
    Mô tả: Cập nhật thông tin khách sạn (multipart/form-data).
    Tham số: hotelId, payload (có thể chứa images array hoặc image file).
*/
export async function updateHotel(hotelId, payload) {
    try {
        const form = new FormData();
        if (payload.name) form.append('name', payload.name);
        if (payload.location) form.append('location', payload.location);
        if (payload.description) form.append('description', payload.description);
        if (payload.starRating != null) form.append('starRating', payload.starRating);
        if (payload.email) form.append('email', payload.email);
        if (payload.phone) form.append('phone', payload.phone);
        if (payload.contactName) form.append('contactName', payload.contactName);
        if (payload.contactPhone) form.append('contactPhone', payload.contactPhone);
        if (payload.isActive != null) form.append('isActive', payload.isActive);
        if (payload.amenityIds && Array.isArray(payload.amenityIds)) {
            payload.amenityIds.forEach((id, idx) => form.append(`amenityIds[${idx}]`, id));
        }
        // Hỗ trợ hiển thị nhiều file cho hotel (payload.images = mảng các file ảnh)
        if (payload.images && Array.isArray(payload.images)) {
            payload.images.forEach((file) => {
                if (file instanceof File) {
                    form.append('image', file);
                }
            });
        } else if (payload.image && payload.image instanceof File) {
            form.append('image', payload.image);
        }
        const res = await api.put(`/api/v1/hotels/update/${hotelId}`, form, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Lỗi khi cập nhật khách sạn');
    }
}

/*
    Mô tả: Xóa khách sạn theo hotelId.
*/
export async function deleteHotel(hotelId) {
    try {
        const res = await api.delete(`/api/v1/hotels/delete/${hotelId}`, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Lỗi khi xóa khách sạn');
    }
}

/*
    Mô tả: Lấy thông tin phòng theo roomId.
*/
export async function getRoomById(roomId) {
    try {
        const result = await api.get(`/api/v1/rooms/${roomId}`);
        return result.data;
    } catch (error) {
        throw new Error(`Lỗi khi lấy thông tin phòng: ${error.message}`);
    }
}

/*
    Mô tả: Thêm phòng mới (multipart/form-data).
    Tham số: roomData - object chứa hotelId, type, price, capacity, description, name, amount, amenityIds (array), image (File).
    Lưu ý: backend yêu cầu field file là 'image'.
*/
export async function addRoom(roomData) {
    try {
        const formData = new FormData();
        
        // Thêm hotelId
        if (roomData.hotelId) {
            formData.append('hotelId', roomData.hotelId);
        }
        
        formData.append('type', roomData.type);
        formData.append('price', roomData.price);
        formData.append('capacity', roomData.capacity);
        formData.append('description', roomData.description);
        formData.append('name', roomData.name);
        formData.append('amount', roomData.amount);
        
        // Thêm amenityIds (là integers, không phải objects)
        if (roomData.amenityIds && Array.isArray(roomData.amenityIds)) {
            roomData.amenityIds.forEach((id, index) => {
                formData.append(`amenityIds[${index}]`, id);
            });
        }
        
        // Thêm image file (backend yêu cầu 'image')
        if (roomData.photo && roomData.photo instanceof File) {
            formData.append('image', roomData.photo);
            console.log('[ApiService] Thêm phòng - File ảnh đã thêm:', roomData.photo.name);
        }
        
        console.log('[ApiService] Thêm phòng - Gửi form dữ liệu:');
        
        const response = await api.post("/api/v1/rooms/add", formData);
        console.log('[ApiService] Phản hồi thêm phòng:', response.data);
        return response.data;
    } catch (error) {
        console.error('[ApiService] Lỗi thêm phòng:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.response?.data?.data?.message || error.message || "Lỗi khi thêm phòng";
        throw new Error(errorMessage);
    }
}

/*Mô tả: Lấy tất cả loại phòng từ server.*/// Chưa sử dụng
export async function getRoomTypes() {
	try {
		const response = await api.get("/api/v1/rooms/room/types")
		return response.data
	} catch (error) {
		throw new Error("Lỗi khi lấy danh sách loại phòng.")
	}
}

/*Mô tả: Xóa phòng theo roomId.*/
export async function deleteRoom(roomId) {
    try {
        const response = await api.delete(`/api/v1/rooms/delete/${roomId}`, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        throw new Error(`Lỗi khi xóa phòng: ${error.message}`);
    }
}

/*
    Mô tả: Cập nhật thông tin phòng (multipart/form-data). Nếu có file ảnh mới sẽ gửi trường 'image'.
    Tham số: roomId, roomData.
*/
export async function updateRoom(roomId, roomData) {
    try {
        const formData = new FormData();
        
        formData.append('type', roomData.type);
        formData.append('price', roomData.price);
        formData.append('capacity', roomData.capacity);
        formData.append('description', roomData.description);
        formData.append('name', roomData.name);
        formData.append('amount', roomData.amount);
        
        // Thêm amenityIds (là integers, không phải objects)
        if (roomData.amenityIds && Array.isArray(roomData.amenityIds)) {
            roomData.amenityIds.forEach((id, index) => {
                formData.append(`amenityIds[${index}]`, id);
            });
        }
        
        // CHỈ thêm file nếu file mới được chọn (instance of File)
        // Nếu user không chọn file mới, thì không gửi photo field
        if (roomData.photo && roomData.photo instanceof File) {
            formData.append('image', roomData.photo);
            console.log('[ApiService] Cập nhật phòng - File ảnh mới đã thêm:', roomData.photo.name);
        } else {
            console.log('[ApiService] Cập nhật phòng - Không có file ảnh mới được thêm. Giữ nguyên ảnh hiện tại.');
        }
        
        console.log('[ApiService] Cập nhật phòng - Gửi form dữ liệu cho phòng:', roomId);
        
        // Gửi FormData - KHÔNG set Content-Type, browser sẽ tự set với boundary
        const response = await api.put(`/api/v1/rooms/update/${roomId}`, formData);
        console.log('[ApiService] Cập nhật phòng response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[ApiService] Lỗi cập nhật phòng :', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.response?.data?.data?.message || error.message || "Lỗi khi cập nhật phòng";
        throw new Error(errorMessage);
    }
}

/*
    Mô tả: Tạo đặt phòng mới.
    Tham số: bookingData - object chứa checkinDate, checkoutDate, adultAmount, childrenAmount, hotelId, roomId, roomQuantity, specialRequire.
    Trả về: response.data từ endpoint tạo booking.
*/
export async function bookRoom(bookingData) {
	try {
		const response = await api.post(`/api/v1/bookings/create`, bookingData, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error(`Lỗi tạo đặt phòng: ${error.message}`)
		}
	}
}

// ================= Booking - Đặt phòng =================
/* Mô tả: Lấy tất cả đặt phòng (admin). */
export async function getAllBookings() {
	try {
		const result = await api.get("/api/v1/bookings/all", {
			headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(`Lỗi lấy danh sách đặt phòng: ${error.message}`)
	}
}

/* Mô tả: Lấy các đặt phòng của người dùng hiện tại. */
export async function getUserBookings() {
	try {
		const result = await api.get("/api/v1/users/get-user-bookings", {
			headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(`Lỗi lấy danh sách đặt phòng: ${error.message}`)
	}
}

/*
    Mô tả: Lấy đặt phòng theo mã xác nhận (confirmation code).
    Tham số: confirmationCode.
*/
export async function getBookingByConfirmationCode(confirmationCode) {
	try {
		const result = await api.get(`/api/v1/bookings/get-by-confirmation-code/${confirmationCode}`)
		return result.data
	} catch (error) {
		throw new Error(`Lỗi lấy đặt phòng theo mã xác nhận: ${error.message}`)
	}
}

/*
    Mô tả: Hủy đặt phòng theo bookingId kèm lý do.
    Tham số: bookingId, cancelReason.
*/
export async function cancelBooking(bookingId, cancelReason) {
	try {
		const result = await api.delete(`/api/v1/bookings/cancel/${bookingId}`, {
			data: { cancelReason },
			headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(error.response?.data?.message || `Lỗi hủy đặt phòng: ${error.message}`)
	}
}

/*
    Mô tả: Cập nhật thông tin đặt phòng (status, cancelReason, roomNumber, ...).
    Tham số: bookingId, payload.
*/
export async function updateBooking(bookingId, payload) {
    try {
        const result = await api.put(`/api/v1/bookings/update/${bookingId}`, payload, {
            headers: getHeader()
        });
        return result.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Lỗi cập nhật đặt phòng: ${error.message}`);
    }
}

// ================= Amenities - Tiện nghi (Hotel & Room) =================
/* Mô tả: Lấy danh sách amenities dành cho hotel (cấp khách sạn).*/// Chưa sử dụng
export async function getHotelAmenities() {
    try {
        const res = await api.get('/api/v1/amenities/hotel');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách tiện nghi khách sạn');
    }
}


/*
    Mô tả: Thêm amenity (cấp khách sạn) hệ thống.
    Tham số: payload - object mô tả amenity.
*/// Chưa sử dụng
export async function addHotelAmenity(payload) {
    try {
        const res = await api.post('/api/v1/amenities/hotel/add', payload, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi thêm tiện nghi khách sạn');
    }
}


/* Mô tả: Cập nhật amenity cấp khách sạn theo id. */// Chưa sử dụng
export async function updateHotelAmenity(id, payload) {
    try {
        const res = await api.put(`/api/v1/amenities/hotel/${id}`, payload, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi cập nhật tiện nghi khách sạn');
    }
}


/*Mô tả: Xóa amenity cấp khách sạn theo id.*/// Chưa sử dụng
export async function deleteHotelAmenity(id) {
    try {
        const res = await api.delete(`/api/v1/amenities/hotel/${id}`, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi xóa tiện nghi khách sạn');
    }
}


/* Mô tả: Lấy danh sách amenities cấp phòng.*/// Chưa sử dụng
export async function getRoomAmenities() {
    try {
        const res = await api.get('/api/v1/amenities/room');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách tiện nghi phòng');
    }
}


/* Mô tả: Lấy tất cả amenities (dùng cho combobox trên frontend).*/
export async function getAllAmenities() {
    try {
        const res = await api.get('/api/v1/amenities/all');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách tất cả tiện nghi');
    }
}

/* Mô tả: Tạo amenity ở cấp hệ thống. */
export async function createAmenity(payload) {
    try {
        const res = await api.post('/api/v1/amenities/create', payload, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi tạo tiện nghi');
    }
}

/* Mô tả: Cập nhật amenity hệ thống theo id. */
export async function updateAmenity(id, payload) {
    try {
        const res = await api.put(`/api/v1/amenities/update/${id}`, payload, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi cập nhật tiện nghi');
    }
}

/* Mô tả: Xóa amenity hệ thống theo id. */
export async function deleteAmenity(id) {
    try {
        const res = await api.delete(`/api/v1/amenities/delete/${id}`, { headers: getHeader() });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi xóa tiện nghi');
    }
}

/*
    Mô tả: Lấy amenities cho một khách sạn cụ thể.
    Tham số: hotelId.
*/
export async function getHotelAmenitiesByHotel(hotelId) {
    try {
        const res = await api.get(`/api/v1/amenities/hotel/${hotelId}/hotel-amenities`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi lấy tiện nghi khách sạn theo mã khách sạn');
    }
}

/*
    Mô tả: Lấy amenities theo từng phòng cho một khách sạn.
    Tham số: hotelId.
*/
export async function getRoomAmenitiesByHotel(hotelId) {
    try {
        const res = await api.get(`/api/v1/amenities/hotel/${hotelId}/room-amenities`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi lấy tiện nghi phòng theo mã khách sạn');
    }
}

