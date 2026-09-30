// JavaScript điều khiển cho trang Danh mục sản phẩm (category.html - KCC Design với Phân Trang)
let categoryProducts = [];
let filteredCategoryProducts = [];
let currentCategoryName = 'Danh mục sản phẩm';

let activeBrandTab = 'all';
let activePricePill = 'all';
let activeSortOption = 'newest';

// Cấu hình Phân trang (Pagination)
let currentPage = 1;
const itemsPerPage = 15; // 15 sản phẩm trên 1 trang (3 hàng x 5 cột)

document.addEventListener('DOMContentLoaded', () => {
    initCategoryPage();
    initCartDrawer();
    initFilterEvents();
});

function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let rawSlug = urlParams.get('slug') || urlParams.get('cat') || 'laptop';
    const slug = rawSlug.replace(/^-+|-+$/g, '').trim() || 'laptop';
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
        'main-cpu-vga': 'CPU - Bộ Vi Xử Lý / Main, VGA',
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
    grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: #666;">Đang nạp danh sách sản phẩm từ Server Backend...</div>';

    try {
        const res = await api.getProducts({ category: slug, per_page: 250 });
        if (res.status === 'success' && res.data) {
            const allProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);
            
            // Phân loại chính xác 100% không bị lẫn lộn giữa các mục
            categoryProducts = allProducts.filter(p => {
                const pCatSlug = (p.category_slug || (p.category ? (p.category.slug || p.category.name || '') : '')).toLowerCase();
                const pName = (p.name || '').toLowerCase();
                const pBrand = (p.brand || '').toLowerCase();

                if (brandParam && !pBrand.includes(brandParam.toLowerCase()) && !pName.includes(brandParam.toLowerCase())) {
                    return false;
                }

                if (search && !pName.includes(search.toLowerCase()) && !pBrand.includes(search.toLowerCase())) {
                    return false;
                }

                // Nếu có thông tin category slug chuẩn
                if (pCatSlug) {
                    if (pCatSlug === slug) return true;
                    // Nếu thuộc danh mục khác rõ ràng (như laptop-gaming, pc-gaming...) thì loại trừ ngay
                    if (['laptop', 'laptop-gaming', 'pc-gaming', 'case-nguon-tan', 'o-cung-ram', 'man-hinh', 'ban-phim', 'chuot-lot', 'tai-nghe', 'ghe-ban', 'phan-mem', 'phu-kien'].includes(pCatSlug)) {
                        return false;
                    }
                }

                // Fallback nếu chưa có category slug
                if (slug === 'laptop') {
                    return (pName.includes('laptop') || pName.includes('macbook')) && !pName.includes('gaming') && !pName.includes('rtx');
                }
                if (slug === 'laptop-gaming') {
                    return pName.includes('laptop') && (pName.includes('gaming') || pName.includes('rtx') || pName.includes('rog') || pName.includes('nitro'));
                }
                if (slug === 'pc-gaming') {
                    return (pName.includes('pc gaming') || pName.includes('pcshop ultra')) && !pName.includes('laptop');
                }
                if (slug === 'main-cpu-vga') {
                    return (pName.includes('vi xử lý') || pName.includes('intel core') || pName.includes('amd ryzen') || pName.includes('mainboard') || pName.includes('bo mạch') || pName.includes('card màn hình')) && !pName.includes('laptop') && !pName.includes('pc gaming') && !pName.includes('pcshop ultra');
                }

                return pCatSlug.includes(slug) || pName.includes(slug);
            });

            currentPage = 1;
            applyCategoryFilters();
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

    const totalItems = filteredCategoryProducts.length;
    document.getElementById('productFoundCount').textContent = totalItems;

    if (totalItems === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 60px; text-align: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b;">
                <p style="font-size: 15px; margin-bottom: 12px; font-weight: 600;">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
                <button onclick="resetAllCategoryFilters()" style="padding: 8px 18px; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 600;">Xóa bộ lọc để xem lại tất cả</button>
            </div>
        `;
        renderPaginationControls(0);
        return;
    }

    // Tính toán phân trang
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage > totalPages) {
        currentPage = 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageProducts = filteredCategoryProducts.slice(startIndex, startIndex + itemsPerPage);

    pageProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'kcc-card';

        const priceNum = Number(p.price) || 0;
        const priceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum);
        
        let oldPriceHtml = '';
        let badgeHtml = '';
        const oldPrice = priceNum > 0 ? Math.round(priceNum * 1.11) : 0;
        const discountAmount = oldPrice - priceNum;

        if (discountAmount > 100000) {
            const oldPriceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(oldPrice);
            const discountVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount);
            oldPriceHtml = `
                <div class="kcc-price-sub">
                    <span class="kcc-price-old">${oldPriceVnd}</span>
                    <span class="kcc-price-discount">-10%</span>
                </div>
            `;
            badgeHtml = `<div class="kcc-card-badge">TIẾT KIỆM ${discountVnd}</div>`;
        }

        const imgUrl = formatImageUrl(p.images);
        const rawImgPath = (p.images && p.images[0]) ? p.images[0].replace(/^\//, '') : '';

        card.innerHTML = `
            ${badgeHtml}
            <div class="kcc-card-img-wrap">
                <img src="${imgUrl}" alt="${p.name}" onerror="this.onerror=null; this.src='http://127.0.0.1:8000/${rawImgPath}';">
            </div>
            <div class="kcc-card-title" title="${p.name}">${p.name}</div>
            <div class="kcc-card-price-row">
                <div class="kcc-price-main">${priceVnd}</div>
                ${oldPriceHtml}
            </div>
            <div class="kcc-card-footer">
                <span class="kcc-stock-status"><i class="fa-solid fa-check"></i> Còn hàng</span>
                <span class="kcc-compare-btn" onclick="event.stopPropagation();"><i class="fa-solid fa-circle-plus"></i> So sánh</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `product.html?id=${p.id}`;
        });

        grid.appendChild(card);
    });

    renderPaginationControls(totalPages);
}

// Render các nút phân trang hình tròn (Orange Active / Gray Inactive)
function renderPaginationControls(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Nút Trước (Prev)
    html += `
        <button class="kcc-pagination-nav" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
            <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    // Các nút trang tròn (1, 2, 3...)
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage ? 'active' : '';
        html += `<button class="kcc-pagination-page ${isActive}" onclick="goToPage(${i})">${i}</button>`;
    }

    // Nút Tiếp theo (Next)
    html += `
        <button class="kcc-pagination-nav" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredCategoryProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCategoryGrid();

    // Cuộn mượt lên vị trí sản phẩm
    const target = document.getElementById('categoryProductGrid');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function initFilterEvents() {
    // 1. Brand Tab Events
    const brandTabs = document.querySelectorAll('.brand-tab-btn');
    brandTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            brandTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeBrandTab = btn.getAttribute('data-brand');
            currentPage = 1;
            applyCategoryFilters();
        });
    });

    // 2. Price Pill Events
    const pricePills = document.querySelectorAll('.price-pill');
    pricePills.forEach(pill => {
        pill.addEventListener('click', () => {
            pricePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activePricePill = pill.getAttribute('data-price');
            currentPage = 1;
            applyCategoryFilters();
        });
    });

    // 3. Sort Text Option Events
    const sortBtns = document.querySelectorAll('.sort-option-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sortBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSortOption = btn.getAttribute('data-sort');
            currentPage = 1;
            applyCategoryFilters();
        });
    });
}

function applyCategoryFilters() {
    const brandDropdown = (document.getElementById('criteriaBrand')?.value || 'all').toLowerCase();
    const socketDropdown = (document.getElementById('criteriaSocket')?.value || 'all').toLowerCase();
    const seriesDropdown = (document.getElementById('criteriaSeries')?.value || 'all').toLowerCase();

    filteredCategoryProducts = categoryProducts.filter(p => {
        const pName = (p.name || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        const price = Number(p.price) || 0;
        const specs = p.specs || {};

        // 1. Brand Quick Tabs Filter
        if (activeBrandTab !== 'all') {
            const b = activeBrandTab.toLowerCase();
            if (!pBrand.includes(b) && !pName.includes(b)) {
                return false;
            }
        }

        // 2. Price Pill Filter
        if (activePricePill !== 'all') {
            if (activePricePill === 'under-2' && !(price < 2000000)) return false;
            if (activePricePill === '2-3' && !(price >= 2000000 && price <= 3000000)) return false;
            if (activePricePill === '3-5' && !(price > 3000000 && price <= 5000000)) return false;
            if (activePricePill === '5-7' && !(price > 5000000 && price <= 7000000)) return false;
            if (activePricePill === '7-9' && !(price > 7000000 && price <= 9000000)) return false;
            if (activePricePill === '9-12' && !(price > 9000000 && price <= 12000000)) return false;
            if (activePricePill === '12-15' && !(price > 12000000 && price <= 15000000)) return false;
            if (activePricePill === 'over-15' && !(price > 15000000)) return false;
        }

        // 3. Criteria Brand Dropdown
        if (brandDropdown !== 'all') {
            if (!pBrand.includes(brandDropdown) && !pName.includes(brandDropdown)) return false;
        }

        // 4. Criteria Socket Dropdown
        if (socketDropdown !== 'all') {
            const specSocket = (specs.socket || '').toLowerCase();
            if (!specSocket.includes(socketDropdown) && !pName.includes(socketDropdown)) return false;
        }

        // 5. Criteria Series Dropdown
        if (seriesDropdown !== 'all') {
            if (!pName.includes(seriesDropdown)) return false;
        }

        return true;
    });

    // Apply Sorting
    sortFilteredProducts();

    renderCategoryGrid();
}

function sortFilteredProducts() {
    if (activeSortOption === 'price-asc') {
        filteredCategoryProducts.sort((a, b) => a.price - b.price);
    } else if (activeSortOption === 'price-desc') {
        filteredCategoryProducts.sort((a, b) => b.price - a.price);
    } else if (activeSortOption === 'name-asc') {
        filteredCategoryProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeSortOption === 'in-stock') {
        filteredCategoryProducts.sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0));
    } else if (activeSortOption === 'views') {
        filteredCategoryProducts.sort((a, b) => (b.views || b.id) - (a.views || a.id));
    } else {
        // default newest
        filteredCategoryProducts.sort((a, b) => b.id - a.id);
    }
}

function resetAllCategoryFilters() {
    activeBrandTab = 'all';
    activePricePill = 'all';
    activeSortOption = 'newest';
    currentPage = 1;

    document.querySelectorAll('.brand-tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-brand') === 'all');
    });

    document.querySelectorAll('.price-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-price') === 'all');
    });

    document.querySelectorAll('.sort-option-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-sort') === 'newest');
    });

    const criteriaBrand = document.getElementById('criteriaBrand');
    if (criteriaBrand) criteriaBrand.value = 'all';

    const criteriaSocket = document.getElementById('criteriaSocket');
    if (criteriaSocket) criteriaSocket.value = 'all';

    const criteriaSeries = document.getElementById('criteriaSeries');
    if (criteriaSeries) criteriaSeries.value = 'all';

    applyCategoryFilters();
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


