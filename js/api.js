// Module xử lý kết nối REST API Backend (Laravel API v1)
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = {
    // Lấy danh sách danh mục
    getCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi lấy danh mục:', error);
            return { status: 'error', data: [] };
        }
    },

    // Lấy danh sách sản phẩm (có lọc theo search & category)
    getProducts: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/products?${query}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi lấy sản phẩm:', error);
            return { status: 'error', data: { data: [] } };
        }
    },

    // Lấy chi tiết 1 sản phẩm
    getProductDetail: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi lấy chi tiết sản phẩm:', error);
            return { status: 'error', data: null };
        }
    },

    // 🔐 AUTHENTICATION REST APIS (Kết nối Laravel Backend v1/auth)
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi kết nối API Login:', error);
            return { status: 'error', message: 'Không thể kết nối đến máy chủ Backend.' };
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi kết nối API Register:', error);
            return { status: 'error', message: 'Không thể kết nối đến máy chủ Backend.' };
        }
    },

    logout: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi kết nối API Logout:', error);
            return { status: 'error', message: 'Lỗi khi đăng xuất.' };
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi gửi mail Quên mật khẩu:', error);
            return { status: 'error', message: 'Không thể kết nối đến máy chủ Backend.' };
        }
    },

    // 📦 ORDER REST APIS
    getOrderHistory: async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/history`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi nạp lịch sử đơn hàng từ Backend:', error);
            return { status: 'error', data: [] };
        }
    }
};

