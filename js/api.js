// Module xử lý kết nối REST API Backend (Vercel FE -> Render Production Backend API v1)
const API_BASE_URL = 'https://pcshop-backend-87np.onrender.com/api/v1';

// Headers mặc định bỏ qua trang cảnh báo của Ngrok Free Tier khi gọi qua Fetch API
const DEFAULT_HEADERS = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
};

// Helper format URL hình ảnh sản phẩm tuyệt đối an toàn (Tự động prepend Backend URL cho Ngrok / Vercel)
function formatImageUrl(rawImg) {
    const fallback = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600';
    if (!rawImg) return fallback;
    let url = Array.isArray(rawImg) ? rawImg[0] : rawImg;
    if (!url || typeof url !== 'string') return fallback;

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    const backendBase = (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');

    if (cleanPath.startsWith('images/')) {
        return `${backendBase}/${cleanPath}`;
    }
    return `${backendBase}/images/${cleanPath}`;
}


const api = {
    // Lấy danh sách danh mục
    getCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                headers: DEFAULT_HEADERS
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
                headers: DEFAULT_HEADERS,
                cache: 'no-store'
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
                headers: DEFAULT_HEADERS,
                cache: 'no-store'
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
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
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
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
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
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json',
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
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
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
                    ...DEFAULT_HEADERS,
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi nạp lịch sử đơn hàng từ Backend:', error);
            return { status: 'error', data: [] };
        }
    },

    // 🛡️ ADMIN & DASHBOARD DB REST APIS
    createStaff: async (staffData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/staff`, {
                method: 'POST',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(staffData)
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi kết nối API Tạo Staff:', error);
            return { status: 'error', message: 'Lỗi kết nối Backend' };
        }
    },

    getStaffList: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/staff`, {
                headers: DEFAULT_HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi nạp danh sách Staff từ API:', error);
            return { status: 'error', data: [] };
        }
    },

    createWarranty: async (warrantyData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/warranties`, {
                method: 'POST',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(warrantyData)
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi kết nối API Tạo Phiếu Bảo Hành:', error);
            return { status: 'error', message: 'Lỗi kết nối Backend' };
        }
    },

    getWarranties: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/warranties`, {
                headers: DEFAULT_HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi nạp danh sách Bảo Hành:', error);
            return { status: 'error', data: [] };
        }
    },

    updateWarrantyStatus: async (id, statusData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/warranties/${id}/status`, {
                method: 'PATCH',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(statusData)
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi cập nhật Bảo Hành:', error);
            return { status: 'error', message: 'Lỗi kết nối Backend' };
        }
    },

    createProduct: async (productData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products`, {
                method: 'POST',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi tạo sản phẩm mới:', error);
            return { status: 'error' };
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
                method: 'PUT',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi cập nhật sản phẩm:', error);
            return { status: 'error' };
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: DEFAULT_HEADERS
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
            return { status: 'error' };
        }
    },

    updateOrderStatus: async (orderId, statusData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(statusData)
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
            return { status: 'error' };
        }
    },

    addSystemLog: async (logData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/logs`, {
                method: 'POST',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logData)
            });
            return await response.json();
        } catch (error) {
            console.error('Lỗi lưu log hệ thống:', error);
            return { status: 'error' };
        }
    }
};
