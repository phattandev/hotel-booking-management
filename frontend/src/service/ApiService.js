import axios from 'axios';

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
            fullname: registrationData.fullname,
            email: registrationData.email,
            phoneNumber: registrationData.phone, // Map phone -> phoneNumber
            dob: registrationData.dob,
            password: registrationData.password,
            role: "CUSTOMER" // Default role for new users
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
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userRole", response.data.role); 
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
}

export function isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
}

export function isAdmin() {
    const role = localStorage.getItem("userRole");
    return role === "ADMIN"; // Sửa giá trị kiểm tra
}

export function isUser() {
    const role = localStorage.getItem("userRole");
    return role === "USER"; // Sửa giá trị kiểm tra
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

export async function deleteUser(userId) {
    try {
        const response = await api.delete(`/api/v1/users/delete`, {
            headers: getHeader()
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Error deleting user";
        throw new Error(errorMessage);
    }
}

export async function getAllRooms() {
    try {
        const result = await api.get("/api/v1/rooms/all");
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
export async function addRoom(photo, roomType, roomPrice) {
	const formData = new FormData()
	formData.append("photo", photo)
	formData.append("roomType", roomType)
	formData.append("roomPrice", roomPrice)

	const response = await api.post("/api/v1/rooms/add/new-room", formData, {
		headers: getHeader()
	})
	if (response.status === 201) {
		return true
	} else {
		return false
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
		const response = await api.delete(`/api/v1/rooms/delete/room/${roomId}`, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		throw new Error(`Error deleting room ${error.message}`)
	}
}

/* This function update a room */
export async function updateRoom(roomId, roomData) {
	const formData = new FormData()
	formData.append("roomType", roomData.roomType)
	formData.append("roomPrice", roomData.roomPrice)
	formData.append("photo", roomData.photo)
	const response = await api.put(`/api/v1/rooms/update/${roomId}`, formData,{
		headers: getHeader()
	})
	return response
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
