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
    try {
        const res = await api.getProducts({ per_page: 250 });
        if (res.status === 'success' && res.data) {
            liveProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);
            renderLandingSections();
            return;
        }
    } catch (e) {
        console.error('Lỗi khi nạp API Backend:', e);
    }
}

function renderLandingSections() {
    const pcGrid = document.getElementById('pcGrid');
    const laptopGamingGrid = document.getElementById('laptopGamingGrid');
    const laptopOfficeGrid = document.getElementById('laptopOfficeGrid');

    if (!pcGrid || !laptopGamingGrid || !laptopOfficeGrid) return;

    // Lọc lấy sản phẩm thuộc đúng danh mục PC Bán Chạy (Không dính Nguồn, SSD, RAM, Card)
    const pcProducts = liveProducts.filter(p => {
        const cat = p.category ? (p.category.slug || p.category.name || '').toLowerCase() : '';
        const name = (p.name || '').toLowerCase();
        // Loại bỏ các linh kiện lẻ
        if (name.includes('nguồn') || name.includes('ram') || name.includes('ssd') || name.includes('vga') || name.includes('mainboard') || name.includes('tản')) {
            return false;
        }
        return cat.includes('pc-gaming') || name.includes('pc gvn') || name.includes('pc gaming') || name.startsWith('pc ');
    }).slice(0, 10);

    const gamingLaptopProducts = liveProducts.filter(p => {
        const cat = p.category ? (p.category.slug || p.category.name || '').toLowerCase() : '';
        const name = (p.name || '').toLowerCase();
        return cat.includes('laptop-gaming') || (name.includes('laptop') && (name.includes('gaming') || name.includes('rog') || name.includes('tuf') || name.includes('nitro') || name.includes('rtx')));
    }).slice(0, 10);

    const officeLaptopProducts = liveProducts.filter(p => {
        const cat = p.category ? (p.category.slug || p.category.name || '').toLowerCase() : '';
        const name = (p.name || '').toLowerCase();
        return cat === 'laptop' || (name.includes('laptop') && !name.includes('gaming') && !name.includes('nitro') && !name.includes('rog'));
    }).slice(0, 10);

    renderProductCardsToContainer(pcGrid, pcProducts.length > 0 ? pcProducts : liveProducts.filter(p => (p.name||'').toLowerCase().includes('pc')).slice(0, 10));
    renderProductCardsToContainer(laptopGamingGrid, gamingLaptopProducts.length > 0 ? gamingLaptopProducts : liveProducts.filter(p => (p.name||'').toLowerCase().includes('laptop')).slice(0, 10));
    renderProductCardsToContainer(laptopOfficeGrid, officeLaptopProducts.length > 0 ? officeLaptopProducts : liveProducts.filter(p => (p.name||'').toLowerCase().includes('laptop')).slice(0, 10));


    // Khởi tạo Tự động trượt nhẹ sản phẩm theo định kỳ
    initAutoSectionSliders();
}

function renderProductCardsToContainer(container, products) {
    container.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'home-product-card';
        card.onclick = () => {
            window.location.href = `category.html?slug=${p.category ? (p.category.slug || 'pc-gaming') : 'pc-gaming'}`;
        };

        const priceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const oldPriceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price * 1.15);
        const specs = p.specs || {};

        let specsHtml = '';
        if (specs.cpu) specsHtml += `<div>• CPU: ${specs.cpu}</div>`;
        if (specs.ram && specs.ssd) specsHtml += `<div>• RAM: ${specs.ram} | SSD: ${specs.ssd}</div>`;
        if (specs.gpu) specsHtml += `<div>• VGA: ${specs.gpu}</div>`;
        if (!specsHtml) {
            specsHtml = `<div>• Hàng chính hãng 100%</div><div>• Bảo hành 24 tháng</div>`;
        }

        const imgUrl = (p.images && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400';

        card.innerHTML = `
            <span class="home-card-tag">-13%</span>
            <img class="home-card-img" src="${imgUrl}" alt="${p.name}">
            <h3 class="home-card-title">${p.name}</h3>
            <div class="home-card-specs-box">
                ${specsHtml}
            </div>
            <div class="home-card-prices">
                <span class="home-old-price">${oldPriceVnd}</span>
                <span class="home-cur-price">${priceVnd}</span>
            </div>
        `;
        container.appendChild(card);
    });
}


// Hàm cuộn Slider cho từng Section bằng nút bấm ‹ ›
function scrollSection(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Tự động cuộn slide sản phẩm nhẹ nhàng
function initAutoSectionSliders() {
    const sectionIds = ['pcGrid', 'laptopGamingGrid', 'laptopOfficeGrid'];
    sectionIds.forEach(id => {
        let dir = 1;
        setInterval(() => {
            const container = document.getElementById(id);
            if (!container) return;
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                dir = -1;
            } else if (container.scrollLeft <= 10) {
                dir = 1;
            }
            container.scrollBy({ left: dir * 280, behavior: 'smooth' });
        }, 6000);
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

// Quản lý Đăng nhập & Đơn hàng
let currentUser = JSON.parse(localStorage.getItem('pcshop_user')) || null;
let userOrders = JSON.parse(localStorage.getItem('pcshop_orders')) || [
    {
        id: 'ORD-2026-9812',
        date: '28/09/2026',
        items: ['PC Gaming PCShop Ultra V198 (RTX 5070 Ti 16GB)', 'Bàn Phím Cơ Gaming Akko Mod007'],
        total: '17.149.000đ',
        status: 'Đã giao hàng thành công'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initAuthEvents();
    initOrdersModal();
    updateUserHeaderUI();
});

function initAuthEvents() {
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const authOverlay = document.getElementById('authOverlay');

    if (loginBtn && authModal) {
        loginBtn.addEventListener('click', () => {
            if (currentUser) {
                openOrdersModal();
            } else {
                authModal.classList.add('open');
            }
        });
        closeAuth.addEventListener('click', () => authModal.classList.remove('open'));
        authOverlay.addEventListener('click', () => authModal.classList.remove('open'));
    }
}

function switchAuthTab(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const authTabsHeader = document.getElementById('authTabsHeader');

    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        forgotForm.style.display = 'none';
        authTabsHeader.style.display = 'flex';
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
    } else if (type === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        forgotForm.style.display = 'none';
        authTabsHeader.style.display = 'flex';
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
    } else if (type === 'forgot') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        forgotForm.style.display = 'block';
        authTabsHeader.style.display = 'none';
    }
}

function handleGoogleLogin() {
    currentUser = { email: 'user.google@gmail.com', name: 'Google User' };
    localStorage.setItem('pcshop_user', JSON.stringify(currentUser));

    document.getElementById('authModal').classList.remove('open');
    updateUserHeaderUI();
    alert('Đăng nhập thành công bằng tài khoản Google!');
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    try {
        const res = await api.forgotPassword(email);
        if (res.status === 'success') {
            alert(`Thành công: ${res.message || 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.'}`);
        } else {
            alert(`Lưu ý: ${res.message || 'Liên kết khôi phục mật khẩu đã được gửi tới email của bạn.'}`);
        }
    } catch (err) {
        alert(`Đã gửi yêu cầu khôi phục mật khẩu đến email ${email}.`);
    }
    switchAuthTab('login');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await api.login(email, password);
        if (res.status === 'success' && res.data) {
            const user = res.data.user || { name: email.split('@')[0], email };
            currentUser = { ...user, token: res.data.token || res.data.access_token };
            localStorage.setItem('pcshop_user', JSON.stringify(currentUser));
            document.getElementById('authModal').classList.remove('open');
            updateUserHeaderUI();
            alert(`Đăng nhập thành công! Xin chào ${currentUser.name}.`);
            return;
        }
    } catch (err) {
        console.warn('Backend Auth API notice:', err);
    }

    // Fallback client session
    const name = email.split('@')[0];
    currentUser = { email, name, token: 'demo_token_' + Date.now() };
    localStorage.setItem('pcshop_user', JSON.stringify(currentUser));
    document.getElementById('authModal').classList.remove('open');
    updateUserHeaderUI();
    alert(`Đăng nhập thành công! Xin chào ${name}.`);
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const res = await api.register(name, email, password);
        if (res.status === 'success' && res.data) {
            const user = res.data.user || { name, email };
            currentUser = { ...user, token: res.data.token || res.data.access_token };
            localStorage.setItem('pcshop_user', JSON.stringify(currentUser));
            document.getElementById('authModal').classList.remove('open');
            updateUserHeaderUI();
            alert(`Đăng ký tài khoản thành công! Xin chào ${name}.`);
            return;
        }
    } catch (err) {
        console.warn('Backend Register API notice:', err);
    }

    currentUser = { email, name, token: 'demo_token_' + Date.now() };
    localStorage.setItem('pcshop_user', JSON.stringify(currentUser));
    document.getElementById('authModal').classList.remove('open');
    updateUserHeaderUI();
    alert(`Đăng ký thành công! Xin chào ${name}.`);
}

async function handleLogout() {
    if (currentUser && currentUser.token) {
        try {
            await api.logout(currentUser.token);
        } catch (e) {
            console.warn('Logout API error:', e);
        }
    }
    currentUser = null;
    localStorage.removeItem('pcshop_user');
    updateUserHeaderUI();
    alert('Bạn đã đăng xuất khỏi hệ thống.');
}

function updateUserHeaderUI() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    if (currentUser) {
        loginBtn.innerHTML = `<i class="fa-solid fa-user-check" style="color: #38bdf8;"></i> ${currentUser.name} (Đơn hàng)`;
        loginBtn.title = "Bấm để xem đơn hàng | Bấm đúp để đăng xuất";
    } else {
        loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> Đăng nhập`;
    }
}


// Modal Lịch Sử Đơn Hàng Của User
function initOrdersModal() {
    const ordersModal = document.getElementById('ordersModal');
    const closeOrders = document.getElementById('closeOrders');
    const ordersOverlay = document.getElementById('ordersOverlay');

    if (closeOrders && ordersModal) {
        closeOrders.addEventListener('click', () => ordersModal.classList.remove('open'));
        ordersOverlay.addEventListener('click', () => ordersModal.classList.remove('open'));
    }
}

function openOrdersModal() {
    const ordersModal = document.getElementById('ordersModal');
    renderOrdersList();
    ordersModal.classList.add('open');
}

function renderOrdersList() {
    const body = document.getElementById('ordersListBody');
    body.innerHTML = '';

    if (userOrders.length === 0) {
        body.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Bạn chưa có đơn hàng nào trước đây.</div>';
        return;
    }

    userOrders.forEach(ord => {
        const card = document.createElement('div');
        card.className = 'order-item-card';

        let itemsHtml = ord.items.map(it => `<div class="order-product-line">• ${it}</div>`).join('');

        card.innerHTML = `
            <div class="order-item-header">
                <span>Mã đơn: <strong>${ord.id}</strong> (${ord.date})</span>
                <span class="order-status">${ord.status}</span>
            </div>
            <div style="margin: 8px 0;">${itemsHtml}</div>
            <div class="order-total-price">Tổng cộng: ${ord.total}</div>
        `;
        body.appendChild(card);
    });
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

        cartFooter.innerHTML = `
            <button class="btn-checkout" onclick="checkoutCurrentCart()">Thanh toán ngay (${count} sản phẩm) →</button>
        `;
    }
}

function checkoutCurrentCart() {
    if (cartItems.length === 0) return;

    const newOrder = {
        id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('vi-VN'),
        items: [...cartItems],
        total: 'Đã xác nhận đặt hàng',
        status: 'Đang xử lý & Giao hàng'
    };

    userOrders.unshift(newOrder);
    localStorage.setItem('pcshop_orders', JSON.stringify(userOrders));

    cartItems = [];
    updateCartUI();
    document.getElementById('cartDrawer').classList.remove('open');

    alert(`Đặt hàng thành công! Mã đơn hàng của bạn là ${newOrder.id}.`);
    openOrdersModal();
}

