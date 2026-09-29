// Main JavaScript Logic kết nối với API Backend
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();

    // Event listener cho ô tìm kiếm
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        loadProducts({ search: query });
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            loadProducts({ search: query });
        }
    });
});

// Nạp danh sách danh mục từ Backend
async function loadCategories() {
    const categoryList = document.getElementById('categoryList');
    const res = await api.getCategories();

    if (res.status === 'success' && Array.isArray(res.data)) {
        res.data.forEach(cat => {
            const li = document.createElement('li');
            li.setAttribute('data-id', cat.id);
            li.textContent = cat.name;
            li.addEventListener('click', () => {
                document.querySelectorAll('.category-list li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                document.getElementById('sectionTitle').textContent = cat.name;
                loadProducts({ category_id: cat.id });
            });
            categoryList.appendChild(li);
        });
    }
}

// Nạp danh sách sản phẩm từ Backend
async function loadProducts(filters = {}) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '<div class="loading-spinner">Đang kết nối API Backend...</div>';

    const res = await api.getProducts(filters);

    if (res.status === 'success' && res.data && res.data.data) {
        const products = res.data.data;

        if (products.length === 0) {
            productGrid.innerHTML = '<p class="no-products">Không tìm thấy sản phẩm nào.</p>';
            return;
        }

        productGrid.innerHTML = '';
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Format giá USD / VND
            const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.price);

            card.innerHTML = `
                <img src="${p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'}" class="product-img" alt="${p.name}">
                <div>
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-price">${formattedPrice}</div>
                </div>
                <button class="btn btn-primary" onclick="addToCart(${p.id})">
                    <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
                </button>
            `;
            productGrid.appendChild(card);
        });
    } else {
        productGrid.innerHTML = '<p class="error-msg">Không thể tải dữ liệu từ Server Backend.</p>';
    }
}

function addToCart(productId) {
    alert(`Đã thêm sản phẩm ID #${productId} vào giỏ hàng!`);
}
