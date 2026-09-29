// JavaScript điều khiển cho trang Danh mục sản phẩm (category.html)
let categoryProducts = [];
let filteredCategoryProducts = [];
let currentCategoryName = 'Danh mục sản phẩm';

document.addEventListener('DOMContentLoaded', () => {
    initCategoryPage();
    initCartDrawer();
    initFilterEvents();
});

// Lấy tham số slug/query từ URL (VD: category.html?slug=laptop hoặc ?search=asus)
function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || urlParams.get('cat') || 'laptop';
    const search = urlParams.get('search') || '';

    // Chuẩn hóa tên danh mục từ slug
    currentCategoryName = formatCategoryTitle(slug, search);

    document.getElementById('categoryTitle').textContent = currentCategoryName;
    document.getElementById('breadcrumbCategoryName').textContent = currentCategoryName;
    document.getElementById('bannerCatName').textContent = currentCategoryName.toUpperCase();
    document.getElementById('pageTitle').textContent = `${currentCategoryName} chính hãng - PC SHOP`;

    // Gọi API nạp sản phẩm
    loadCategoryProducts(slug, search);
}

function formatCategoryTitle(slug, search) {
    if (search) return `Tìm kiếm: ${search}`;
    const titles = {
        'laptop': 'Laptop',
        'laptop-gaming': 'Laptop Gaming',
        'pc-gaming': 'PC Gaming',
        'main-cpu-vga': 'Main, CPU, VGA',
        'case-nguon-tan': 'Case, Nguồn, Tản Nhiệt',
        'o-cung-ram': 'Ổ cứng, RAM, Thẻ nhớ',
        'man-hinh': 'Màn hình Gaming',
        'ban-phim': 'Bàn phím cơ',
        'chuot-lot': 'Chuột + Lót chuột',
        'tai-nghe': 'Tai nghe Gaming',
        'ghe-ban': 'Ghế - Bàn công thái học'
    };
    return titles[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1));
}

// Gọi REST API Backend nạp danh mục
async function loadCategoryProducts(slug, search) {
    const grid = document.getElementById('categoryProductGrid');
    grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: #666;">Đang nạp danh sách linh kiện từ Server Backend...</div>';

    try {
        const res = await api.getProducts({ per_page: 250 });
        if (res.status === 'success' && res.data) {
            const allProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);
            
            // Lọc sản phẩm theo Slug hoặc Search
            categoryProducts = allProducts.filter(p => {
                const pCatSlug = p.category ? (p.category.slug || p.category.name || '').toLowerCase() : '';
                const pName = p.name ? p.name.toLowerCase() : '';
                const pBrand = p.brand ? p.brand.toLowerCase() : '';

                if (search) {
                    return pName.includes(search.toLowerCase()) || pBrand.includes(search.toLowerCase());
                }

                if (slug === 'laptop') return pName.includes('laptop') || pCatSlug.includes('laptop');
                if (slug === 'laptop-gaming') return pName.includes('laptop') && (pName.includes('rtx') || pName.includes('rog') || pName.includes('nitro'));
                if (slug === 'pc-gaming') return pName.includes('pc') || pCatSlug.includes('pc');
                if (slug === 'main-cpu-vga') return pCatSlug.includes('main-cpu-vga') || pName.includes('cpu') || pName.includes('rtx') || pName.includes('mainboard');
                if (slug === 'case-nguon-tan') return pCatSlug.includes('case-nguon-tan') || pName.includes('nguồn') || pName.includes('tản') || pName.includes('case');
                if (slug === 'o-cung-ram') return pCatSlug.includes('o-cung-ram') || pName.includes('ram') || pName.includes('ssd');
                if (slug === 'man-hinh') return pName.includes('màn') || pCatSlug.includes('man-hinh');
                if (slug === 'ban-phim') return pName.includes('phím') || pCatSlug.includes('ban-phim');

                return pCatSlug.includes(slug) || pName.includes(slug);
            });

            filteredCategoryProducts = [...categoryProducts];
            renderCategoryGrid();
            return;
        }
    } catch (e) {
        console.error('Lỗi nạp sản phẩm danh mục:', e);
    }

    grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: #ef4444;">Không thể kết nối Server Backend. Hãy đảm bảo php artisan serve đang chạy.</div>';
}

function renderCategoryGrid() {
    const grid = document.getElementById('categoryProductGrid');
    grid.innerHTML = '';

    document.getElementById('productFoundCount').textContent = filteredCategoryProducts.length;

    if (filteredCategoryProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 80px; text-align: center; background: #fff; border: 1px solid #eee; border-radius: 8px; color: #999;">
                <p style="font-size: 16px; margin-bottom: 12px;">Chưa có sản phẩm nào thuộc danh mục này.</p>
                <a href="index.html" style="display: inline-block; padding: 10px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 4px; font-size: 13px;">Trở về trang chủ</a>
            </div>
        `;
        return;
    }

    filteredCategoryProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const priceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const specs = p.specs || {};
        
        let specsHtml = '';
        if (specs.cpu) specsHtml += `<div>CPU: ${specs.cpu}</div>`;
        if (specs.ram && specs.ssd) specsHtml += `<div>RAM ${specs.ram} · SSD ${specs.ssd}</div>`;
        if (specs.gpu) specsHtml += `<div>GPU: ${specs.gpu}</div>`;

        const imgUrl = (p.images && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400';

        card.innerHTML = `
            <div class="card-img-wrap">
                <img src="${imgUrl}" alt="${p.name}">
                <span class="card-tag">Chính hãng</span>
            </div>
            <div class="card-body">
                <p class="card-title">${p.name}</p>
                <div class="card-specs">
                    ${specsHtml || `<div>Thương hiệu: ${p.brand || 'PC SHOP'}</div>`}
                </div>
                <div class="card-price-box">
                    <div class="current-price">${priceVnd}</div>
                </div>
                <button class="btn-add-cart" onclick="addToCartCategory('${p.name}')">+ Thêm vào giỏ</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Bắt sự kiện Lọc giá & Hãng bên Sidebar Filter
function initFilterEvents() {
    const checkboxes = document.querySelectorAll('.filter-checkbox input');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', applyCategoryFilters);
    });
}

function applyCategoryFilters() {
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(cb => cb.value.toLowerCase());
    const selectedPrice = document.querySelector('input[name="price"]:checked')?.value || 'all';

    filteredCategoryProducts = categoryProducts.filter(p => {
        // Lọc Hãng
        if (selectedBrands.length > 0) {
            const pBrand = (p.brand || '').toLowerCase();
            const pName = (p.name || '').toLowerCase();
            const matchBrand = selectedBrands.some(b => pBrand.includes(b) || pName.includes(b));
            if (!matchBrand) return false;
        }

        // Lọc Giá
        const price = p.price;
        if (selectedPrice === 'under-15' && price >= 15000000) return false;
        if (selectedPrice === '15-25' && (price < 15000000 || price > 25000000)) return false;
        if (selectedPrice === '25-40' && (price < 25000000 || price > 40000000)) return false;
        if (selectedPrice === 'over-40' && price <= 40000000) return false;

        return true;
    });

    renderCategoryGrid();
}

// Sắp xếp sản phẩm
function sortProducts() {
    const sortVal = document.getElementById('sortSelect').value;

    if (sortVal === 'price-asc') {
        filteredCategoryProducts.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-desc') {
        filteredCategoryProducts.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'name-asc') {
        filteredCategoryProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        filteredCategoryProducts = [...categoryProducts];
    }

    renderCategoryGrid();
}

// Cart Drawer Controller
let cartItemsCat = [];

function initCartDrawer() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');

    if (cartBtn && drawer) {
        cartBtn.addEventListener('click', () => drawer.classList.add('open'));
        closeCart.addEventListener('click', () => drawer.classList.remove('open'));
        overlay.addEventListener('click', () => drawer.classList.remove('open'));
    }
}

function addToCartCategory(name) {
    cartItemsCat.push(name);
    document.getElementById('cartCount').textContent = cartItemsCat.length;
    document.getElementById('cartDrawerCount').textContent = cartItemsCat.length;

    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');

    cartFooter.style.display = 'block';
    cartBody.innerHTML = '';
    cartItemsCat.forEach((n, i) => {
        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `<p>${n}</p>`;
        cartBody.appendChild(item);
    });

    document.getElementById('cartDrawer').classList.add('open');
}
