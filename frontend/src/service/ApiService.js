import axios from 'axios';
import authEventEmitter from '../utils/authEventEmitter';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

// Instance cho các API cần xác thực
export const api = axios.create({
    baseURL: BASE_URL,
});

// Instance cho các API không cần xác thực (đăng nhập, đăng ký)
const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9090",
});

// Interceptor chỉ áp dụng cho `api`, không áp dụng cho `authApi`
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const getHeader = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

export async function registerUser(registrationData) {
    try {
        // Transform frontend data to match backend RegistrationRequest format
        const payload = {
            fullName: registrationData.fullname,
            email: registrationData.email,
            phone: registrationData.phone, // Map phone -> phoneNumber
            password: registrationData.password,
            dob: registrationData.dob,
            //role: "CUSTOMER" // Default role for new users
        };
        const response = await authApi.post("/api/v1/auth/register", payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            const errorMessage = typeof error.response.data === 'string' ? error.response.data : (error.response.data.message || JSON.stringify(error.response.data));
            throw new Error(errorMessage || "An unexpected error occurred during registration.");
        } else {
            throw new Error(`Error registering user: ${error.message || "An unexpected error occurred."}`);
        }
    }
}

export async function loginUser(loginData) {
    try {
    const response = await authApi.post("/api/v1/auth/login", loginData);
        if (response.data && response.data.data && response.data.data.token) {
            // Backend returns: { status, message, data: { token, role, expirationTime, isActive } }
            const tokenData = response.data.data;
            localStorage.setItem("token", tokenData.token);
            
            // Role is at response.data.data.role
            const role = (tokenData.role || '').toUpperCase();
            localStorage.setItem("userRole", role);
            console.log('[ApiService] Login success - token saved, role:', role);
            
            // Emit event so NavBar and other components update
            authEventEmitter.emit();
            console.log('[ApiService] Auth event emitted');
        }
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Email or password incorrect.");
        } else {
            throw new Error(`Error logging in: ${error.message || "An unexpected error occurred."}`);
        }
    }
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    // Emit event so NavBar and other components update
    authEventEmitter.emit();
}

export function isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
}

export function isAdmin() {
    const role = localStorage.getItem("userRole");
    const result = role === "ADMIN";
    console.log('[ApiService] isAdmin() - role:', role, '-> result:', result);
    return result;
}

export function isUser() {
    const role = localStorage.getItem("userRole");
    const result = role === "CUSTOMER" || role === "USER";
    console.log('[ApiService] isUser() - role:', role, '-> result:', result);
    return result;
}

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


// Lấy danh sách tất cả user (chỉ trả về các trường cần thiết)
export async function getAllUsers() {
    try {
        const response = await api.get("/api/v1/users/all", {
            headers: getHeader()
        });
        // response.data.data là mảng user, mỗi user có: id, fullName, email, phone, dob, createdAt
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Error fetching users";
        throw new Error(errorMessage);
    }
}

// Khóa tài khoản user
export async function lockUser(userId) {
    try {
        const response = await api.put(`/api/v1/users/${userId}/lock`, {}, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Error locking user";
        throw new Error(errorMessage);
    }
}

// Mở khóa tài khoản user
export async function unlockUser(userId) {
    try {
        const response = await api.put(`/api/v1/users/${userId}/unlock`, {}, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Error unlocking user";
        throw new Error(errorMessage);
    }
}

// Xóa user theo userId
export async function deleteUser(userId) {
    try {
        const response = await api.delete(`/api/v1/users/delete/${userId}`, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Error deleting user";
        throw new Error(errorMessage);
    }
}



// Lấy danh sách tất cả phòng
export async function getAllRooms() {
    try {
        const result = await api.get("/api/v1/rooms/all");
        // API trả về { status, message, data: [room, ...] }
        return result.data;
    } catch (error) {
        throw new Error("Error fetching rooms");
    }
}

export async function getRoomById(roomId) {
    try {
        const result = await api.get(`/api/v1/rooms/room/${roomId}`);
        return result.data;
    } catch (error) {
        throw new Error(`Error fetching room ${error.message}`);
    }
}

/* This function adds a new room to the database */
export async function addRoom(roomData) {
    try {
        // Sử dụng FormData để gửi cả file và data
        const formData = new FormData();
        formData.append('roomNumber', roomData.roomNumber);
        formData.append('type', roomData.type);
        formData.append('price', roomData.price);
        formData.append('capacity', roomData.capacity);
        formData.append('description', roomData.description);
        formData.append('name', roomData.name);
        formData.append('amount', roomData.amount);
        
        // Thêm amenities nếu có
        if (roomData.amenities && Array.isArray(roomData.amenities)) {
            roomData.amenities.forEach((amenity, index) => {
                formData.append(`amenities[${index}]`, amenity);
            });
        }
        
        // Thêm file nếu có - CHỈ thêm nếu file thực sự được chọn
        if (roomData.photo && roomData.photo instanceof File) {
            formData.append('photo', roomData.photo);
            console.log('[ApiService] addRoom - photo file added:', roomData.photo.name);
        } else {
            console.log('[ApiService] addRoom - no photo file, sending without image');
        }
        
        console.log('[ApiService] addRoom - sending FormData');
        
        // Gửi FormData - KHÔNG set Content-Type, browser sẽ tự set với boundary
        const response = await api.post("/api/v1/rooms/add", formData);
        console.log('[ApiService] addRoom response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[ApiService] addRoom error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.response?.data?.data?.message || error.message || "Error adding room";
        throw new Error(errorMessage);
    }
}

/* This function gets all room types from thee database */
export async function getRoomTypes() {
	try {
		const response = await api.get("/api/v1/rooms/room/types")
		return response.data
	} catch (error) {
		throw new Error("Error fetching room types")
	}
}

/* This function deletes a room by the Id */
export async function deleteRoom(roomId) {
    try {
        const response = await api.delete(`/api/v1/rooms/delete/${roomId}`, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        throw new Error(`Error deleting room: ${error.message}`);
    }
}

/* This function update a room */
export async function updateRoom(roomId, roomData) {
    try {
        // Sử dụng FormData để gửi cả file và data
        const formData = new FormData();
        formData.append('roomNumber', roomData.roomNumber);
        formData.append('type', roomData.type);
        formData.append('price', roomData.price);
        formData.append('capacity', roomData.capacity);
        formData.append('description', roomData.description);
        formData.append('name', roomData.name);
        formData.append('amount', roomData.amount);
        
        // Thêm amenities nếu có
        if (roomData.amenities && Array.isArray(roomData.amenities)) {
            roomData.amenities.forEach((amenity, index) => {
                formData.append(`amenities[${index}]`, amenity);
            });
        }
        
        // CHỈ thêm file nếu file mới được chọn (instance of File)
        // Nếu user không chọn file mới, thì không gửi photo field
        if (roomData.photo && roomData.photo instanceof File) {
            formData.append('photo', roomData.photo);
            console.log('[ApiService] updateRoom - new photo file added:', roomData.photo.name);
        } else {
            console.log('[ApiService] updateRoom - no new photo file, keeping existing image');
        }
        
        console.log('[ApiService] updateRoom - sending FormData for room', roomId);
        
        // Gửi FormData - KHÔNG set Content-Type, browser sẽ tự set với boundary
        const response = await api.put(`/api/v1/rooms/update/${roomId}`, formData);
        console.log('[ApiService] updateRoom response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[ApiService] updateRoom error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.response?.data?.data?.message || error.message || "Error updating room";
        throw new Error(errorMessage);
    }
}

/* This function books a room */
export async function bookRoom(roomId, booking) {
	try {
		const response = await api.post(`/api/v1/bookings/room/${roomId}/booking`, booking, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data.message)
		} else {
			throw new Error(`Error booking room : ${error.message}`)
		}
	}
}

/* This function get all bookings */
export async function getAllBookings() {
	try {
		const result = await api.get("/api/v1/bookings/all-bookings", {
			headers: getHeader()
		})
		return result.data
	} catch (error) {
		throw new Error(`Error fetching bookings : ${error.message}`)
	}
}
