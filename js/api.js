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
    }
};
