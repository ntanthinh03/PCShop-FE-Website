// JavaScript điều khiển cho trang Danh mục sản phẩm (category.html)
let categoryProducts = [];
let filteredCategoryProducts = [];
let currentCategoryName = 'Danh mục sản phẩm';

document.addEventListener('DOMContentLoaded', () => {
    initCategoryPage();
    initCartDrawer();
    initFilterEvents();
});

function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug') || urlParams.get('cat') || 'laptop';
    const search = urlParams.get('search') || '';
    const brandParam = urlParams.get('brand') || '';

    currentCategoryName = formatCategoryTitle(slug, search || brandParam);

    document.getElementById('categoryTitle').textContent = currentCategoryName;
    document.getElementById('breadcrumbCategoryName').textContent = currentCategoryName;
    document.getElementById('bannerCatName').textContent = currentCategoryName.toUpperCase();
    document.getElementById('pageTitle').textContent = `${currentCategoryName} chính hãng - PC SHOP`;

    // Gọi API nạp sản phẩm
    loadCategoryProducts(slug, search, brandParam);
}

function formatCategoryTitle(slug, search) {
    if (search) return `Danh mục: ${search}`;
    const titles = {
        'laptop': 'Laptop',
        'laptop-gaming': 'Laptop Gaming',
        'pc-gaming': 'PC Gaming',
        'main-cpu-vga': 'Main, CPU, VGA',
        'case-nguon-tan': 'Case, Nguồn, Tản Nhiệt',
        'o-cung-ram': 'Ổ cứng, RAM, Thẻ nhớ',
        'audio': 'Loa, Micro, Webcam',
        'man-hinh': 'Màn hình Gaming',
        'ban-phim': 'Bàn phím cơ',
        'chuot-lot': 'Chuột + Lót chuột',
        'tai-nghe': 'Tai nghe Gaming',
        'ghe-ban': 'Ghế - Bàn công thái học',
        'phan-mem': 'Phần mềm, Mạng',
        'phu-kien': 'Phụ kiện - Console',
        'thu-cu-doi-moi': 'Thu cũ đổi mới'
    };
    return titles[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1));
}

// Gọi REST API Backend nạp danh mục
async function loadCategoryProducts(slug, search, brandParam) {
    const grid = document.getElementById('categoryProductGrid');
    grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: #666;">Đang nạp danh sách linh kiện từ Server Backend...</div>';

    try {
        const res = await api.getProducts({ per_page: 250 });
        if (res.status === 'success' && res.data) {
            const allProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);
            
            // Phân loại chính xác 100% không bị lẫn lộn giữa các mục
            categoryProducts = allProducts.filter(p => {
                const pCatSlug = p.category ? (p.category.slug || p.category.name || '').toLowerCase() : '';
                const pName = (p.name || '').toLowerCase();
                const pBrand = (p.brand || '').toLowerCase();

                if (brandParam && !pBrand.includes(brandParam.toLowerCase()) && !pName.includes(brandParam.toLowerCase())) {
                    return false;
                }

                if (search && !pName.includes(search.toLowerCase()) && !pBrand.includes(search.toLowerCase())) {
                    return false;
                }

                if (slug === 'laptop') {
                    return (pCatSlug.includes('laptop') || pName.includes('laptop') || pName.includes('macbook')) && !pName.includes('rtx') && !pName.includes('nitro') && !pName.includes('rog');
                }
                if (slug === 'laptop-gaming') {
                    return pCatSlug.includes('laptop-gaming') || (pName.includes('laptop') && (pName.includes('gaming') || pName.includes('rtx') || pName.includes('rog') || pName.includes('nitro')));
                }
                if (slug === 'pc-gaming') {
                    return pCatSlug.includes('pc-gaming') || (pName.includes('pc') && !pName.includes('laptop') && !pName.includes('case'));
                }
                if (slug === 'main-cpu-vga') {
                    return pCatSlug.includes('main-cpu-vga') || pName.includes('cpu') || pName.includes('rtx') || pName.includes('mainboard') || pName.includes('card màn hình');
                }
                if (slug === 'case-nguon-tan') {
                    return pCatSlug.includes('case-nguon-tan') || pName.includes('nguồn') || pName.includes('tản') || pName.includes('case') || pName.includes('aio');
                }
                if (slug === 'o-cung-ram') {
                    return pCatSlug.includes('o-cung-ram') || pName.includes('ram') || pName.includes('ssd') || pName.includes('hdd');
                }
                if (slug === 'audio') {
                    return pCatSlug.includes('audio') || pName.includes('loa') || pName.includes('micro') || pName.includes('webcam');
                }
                if (slug === 'man-hinh') {
                    return pCatSlug.includes('man-hinh') || pName.includes('màn hình');
                }
                if (slug === 'ban-phim') {
                    return pCatSlug.includes('ban-phim') || pName.includes('bàn phím');
                }
                if (slug === 'chuot-lot') {
                    return pCatSlug.includes('chuot-lot') || pName.includes('chuột') || pName.includes('lót chuột');
                }
                if (slug === 'tai-nghe') {
                    return pCatSlug.includes('tai-nghe') || pName.includes('tai nghe');
                }
                if (slug === 'ghe-ban') {
                    return pCatSlug.includes('ghe-ban') || pName.includes('ghế') || pName.includes('bàn');
                }

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
                <p style="font-size: 16px; margin-bottom: 12px;">Chưa có sản phẩm nào thuộc danh mục "${currentCategoryName}".</p>
                <a href="index.html" style="display: inline-block; padding: 10px 20px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 4px; font-size: 13px;">Trở về trang chủ</a>
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
            </div>
        `;
        grid.appendChild(card);
    });
}


function initFilterEvents() {
    const checkboxes = document.querySelectorAll('.filter-checkbox input');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', applyCategoryFilters);
    });
}

// SỬA LỖI LỌC GIÁ CỰC KỲ CHÍNH XÁC (Dưới 15 tr -> Chỉ hiện sản phẩm < 15.000.000đ)
function applyCategoryFilters() {
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(cb => cb.value.toLowerCase());
    
    // Lấy Radio/Checkbox giá được tích chọn
    const selectedPriceInputs = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(cb => cb.value);

    filteredCategoryProducts = categoryProducts.filter(p => {
        // 1. Lọc theo Thương hiệu
        if (selectedBrands.length > 0) {
            const pBrand = (p.brand || '').toLowerCase();
            const pName = (p.name || '').toLowerCase();
            const matchBrand = selectedBrands.some(b => pBrand.includes(b) || pName.includes(b));
            if (!matchBrand) return false;
        }

        // 2. Lọc theo Khoảng Giá (Nghiêm ngặt 100%)
        if (selectedPriceInputs.length > 0 && !selectedPriceInputs.includes('all')) {
            const price = Number(p.price);
            const matchPrice = selectedPriceInputs.some(priceVal => {
                if (priceVal === 'under-15') return price < 15000000;
                if (priceVal === '15-25') return price >= 15000000 && price <= 25000000;
                if (priceVal === '25-40') return price > 25000000 && price <= 40000000;
                if (priceVal === 'over-40') return price > 40000000;
                return true;
            });
            if (!matchPrice) return false;
        }

        return true;
    });

    renderCategoryGrid();
}

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
