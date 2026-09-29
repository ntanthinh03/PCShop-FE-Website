// Slide Data từ Figma
const slides = [
    {
        label: 'Flash Sale · 22.09 – 30.09.2026',
        title: 'Chào Năm Học Mới.<br>Giảm đến 54%.',
        desc: 'PC gaming, laptop và phụ kiện chính hãng. Bảo hành 24 tháng.',
        bg: '#0f172a',
        accent: '#3b82f6',
        img: 'https://images.unsplash.com/photo-1593640408182-31c228f8a9e3?w=560&h=320&fit=crop&auto=format',
        cta: 'Xem khuyến mãi'
    },
    {
        label: 'Build PC · Tuần lễ khai trương',
        title: 'Build PC Tặng<br>Màn Hình 240Hz.',
        desc: 'Giá chỉ từ 11.990.000đ. Tặng màn hình gaming 240Hz cho mỗi đơn hàng.',
        bg: '#0c1a0e',
        accent: '#22c55e',
        img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=560&h=320&fit=crop&auto=format',
        cta: 'Build ngay'
    },
    {
        label: 'Laptop Gaming · Mùa tựu trường',
        title: 'Pack Laptop<br>Tặng Gear Xịn.',
        desc: 'Quà tặng lên đến 15.000.000đ. Mua 1 tặng kèm balo, chuột, tai nghe.',
        bg: '#1a0a2e',
        accent: '#a855f7',
        img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=560&h=320&fit=crop&auto=format',
        cta: 'Chọn laptop'
    }
];

let currentSlide = 0;
let cartItems = [];
let activeTab = 'Tất cả';
let selectedCategoryFilter = null;
let liveProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initTabs();
    initCartDrawer();
    initCategoryClickListeners();
    loadProducts();
});

// Slider Controller
function initSlider() {
    const dotsContainer = document.getElementById('slideDots');
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => setSlide(i));
        dotsContainer.appendChild(dot);
    });

    document.getElementById('prevSlide').addEventListener('click', () => {
        setSlide((currentSlide - 1 + slides.length) % slides.length);
    });

    document.getElementById('nextSlide').addEventListener('click', () => {
        setSlide((currentSlide + 1) % slides.length);
    });

    setInterval(() => {
        setSlide((currentSlide + 1) % slides.length);
    }, 5000);
}

function setSlide(idx) {
    currentSlide = idx;
    const s = slides[idx];
    const slider = document.getElementById('heroSlider');
    
    slider.style.backgroundColor = s.bg;
    document.getElementById('slideTint').style.backgroundColor = s.accent;
    document.getElementById('slideLabel').style.color = s.accent;
    document.getElementById('slideLabel').textContent = s.label;
    document.getElementById('slideTitle').innerHTML = s.title;
    document.getElementById('slideDesc').textContent = s.desc;
    
    const ctaBtn = document.getElementById('slideCta');
    ctaBtn.style.backgroundColor = s.accent;
    ctaBtn.textContent = `${s.cta} →`;
    
    document.getElementById('slideImg').src = s.img;

    const dots = document.querySelectorAll('.dot');
    dots.forEach((d, i) => {
        d.className = `dot ${i === idx ? 'active' : ''}`;
        if (i === idx) d.style.backgroundColor = s.accent;
        else d.style.backgroundColor = 'rgba(255,255,255,0.25)';
    });
}

// Sidebar Category Items Click Listener
function initCategoryClickListeners() {
    const categoryItems = document.querySelectorAll('.category-menu li');
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') return;
            const categoryName = item.querySelector('.menu-item-content span:first-child').textContent;
            filterByCategory(categoryName);
        });
    });

    document.getElementById('btnCategoryDropdown').addEventListener('click', () => {
        document.querySelector('.sidebar').scrollIntoView({ behavior: 'smooth' });
    });
}

// Chuyển sang Trang Danh Mục Sản Phẩm riêng biệt (category.html?slug=...)
function filterByCategory(catKeyword, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Map từ khóa sang slug chuẩn
    const slugMap = {
        'Laptop': 'laptop',
        'Laptop Gaming': 'laptop-gaming',
        'PC GVN': 'pc-gaming',
        'PC': 'pc-gaming',
        'Main, CPU, VGA': 'main-cpu-vga',
        'Main': 'main-cpu-vga',
        'Case, Nguồn, Tản': 'case-nguon-tan',
        'Tản': 'case-nguon-tan',
        'Ổ cứng, RAM': 'o-cung-ram',
        'RAM': 'o-cung-ram',
        'Màn hình': 'man-hinh',
        'Bàn phím': 'ban-phim',
        'Chuột + Lót chuột': 'chuot-lot',
        'Tai Nghe': 'tai-nghe',
        'Ghế - Bàn': 'ghe-ban'
    };

    const targetSlug = slugMap[catKeyword] || encodeURIComponent(catKeyword.toLowerCase().replace(/,/g, '').replace(/\s+/g, '-'));
    window.location.href = `category.html?slug=${targetSlug}`;
}

function resetCategoryFilter() {
    selectedCategoryFilter = null;
    document.getElementById('categoryActiveBanner').style.display = 'none';
    renderProducts();
}

// Tabs Controller
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab');
            selectedCategoryFilter = null;
            document.getElementById('categoryActiveBanner').style.display = 'none';
            renderProducts();
        });
    });
}

// Nạp toàn bộ 200 linh kiện từ REST API Laravel Backend (Không giới hạn phân trang 15 item)
async function loadProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #666;">Đang nạp linh kiện thực tế từ Server Backend...</div>';

    try {
        const res = await api.getProducts({ per_page: 250 });
        if (res.status === 'success' && res.data) {
            // Xử lý cả dạng Paginated response (res.data.data) lẫn Array (res.data)
            liveProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);
            renderProducts();
            return;
        }
    } catch (e) {
        console.error('Lỗi khi nạp API Backend:', e);
    }
    grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #ef4444;">Không thể kết nối đến Backend Server. Hãy chắc chắn php artisan serve đang chạy.</div>';
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    const filtered = liveProducts.filter(p => {
        // Lọc linh hoạt theo Từ khóa danh mục (Tên, Category Slug, Brand, Specs)
        if (selectedCategoryFilter) {
            const keyword = selectedCategoryFilter.toLowerCase().trim();
            const pName = p.name ? p.name.toLowerCase() : '';
            const pCat = p.category ? (p.category.name || p.category.slug || '').toLowerCase() : '';
            const pBrand = p.brand ? p.brand.toLowerCase() : '';
            const pSpecs = JSON.stringify(p.specs || {}).toLowerCase();

            // Tách từ khóa chính để match chính xác
            if (keyword.includes('laptop')) return pName.includes('laptop') || pCat.includes('laptop');
            if (keyword.includes('pc')) return pName.includes('pc') || pCat.includes('pc');
            if (keyword.includes('màn')) return pName.includes('màn') || pCat.includes('man-hinh');
            if (keyword.includes('phím')) return pName.includes('phím') || pCat.includes('ban-phim');
            if (keyword.includes('chuột')) return pName.includes('chuột') || pCat.includes('chuot');
            if (keyword.includes('ghế')) return pName.includes('ghế') || pCat.includes('ghe');
            if (keyword.includes('main') || keyword.includes('cpu') || keyword.includes('vga')) return pCat.includes('main-cpu-vga') || pName.includes('cpu') || pName.includes('rtx') || pName.includes('mainboard');
            if (keyword.includes('case') || keyword.includes('nguồn') || keyword.includes('tản')) return pCat.includes('case-nguon-tan') || pName.includes('nguồn') || pName.includes('tản');
            if (keyword.includes('ổ cứng') || keyword.includes('ram')) return pCat.includes('o-cung-ram') || pName.includes('ram') || pName.includes('ssd');

            return pName.includes(keyword) || pCat.includes(keyword) || pBrand.includes(keyword) || pSpecs.includes(keyword);
        }

        // Lọc theo Tab trên cùng
        if (activeTab === 'Tất cả') return true;
        if (activeTab === 'PC') return p.name.toLowerCase().includes('pc');
        if (activeTab === 'Laptop') return p.name.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('macbook');
        if (activeTab === 'Màn hình') return p.name.toLowerCase().includes('màn');
        if (activeTab === 'Phụ kiện') return !p.name.toLowerCase().includes('pc') && !p.name.toLowerCase().includes('laptop') && !p.name.toLowerCase().includes('màn');
        return true;
    });

    document.getElementById('productCount').textContent = `${filtered.length} sản phẩm`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 60px; text-align: center; background: #fff; color: #999;">
                <p style="font-size: 16px; margin-bottom: 8px;">Không tìm thấy linh kiện / sản phẩm thuộc danh mục "${selectedCategoryFilter || activeTab}".</p>
                <button onclick="resetCategoryFilter()" style="padding: 8px 16px; background: #111; color: #fff; border: none; cursor: pointer; font-size: 12px;">Xem tất cả sản phẩm</button>
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Format giá VND chuẩn
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
                <button class="btn-add-cart" onclick="addToCart('${p.name}')">+ Thêm vào giỏ</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Cart Drawer
function initCartDrawer() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');

    cartBtn.addEventListener('click', () => drawer.classList.add('open'));
    closeCart.addEventListener('click', () => drawer.classList.remove('open'));
    overlay.addEventListener('click', () => drawer.classList.remove('open'));
}

function addToCart(name) {
    cartItems.push(name);
    updateCartUI();
}

function removeFromCart(idx) {
    cartItems.splice(idx, 1);
    updateCartUI();
}

function updateCartUI() {
    const count = cartItems.length;
    document.getElementById('cartCount').textContent = count;
    document.getElementById('cartDrawerCount').textContent = count;

    const cartBtn = document.getElementById('cartBtn');
    if (count > 0) cartBtn.classList.add('active');
    else cartBtn.classList.remove('active');

    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');

    if (count === 0) {
        cartBody.innerHTML = `
            <div class="cart-empty">
                <div class="empty-icon">🛒</div>
                <p>Giỏ hàng trống</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartFooter.style.display = 'block';
        cartBody.innerHTML = '';
        cartItems.forEach((name, i) => {
            const item = document.createElement('div');
            item.className = 'cart-item';
            item.innerHTML = `
                <p>${name}</p>
                <button onclick="removeFromCart(${i})">✕</button>
            `;
            cartBody.appendChild(item);
        });
    }
}
