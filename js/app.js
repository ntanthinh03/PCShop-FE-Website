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

// Fallback Mock Data từ Figma nếu Backend chưa sẵn sàng
const mockProducts = [
    {
        id: 1, name: 'PC Intel i5-12400F / RTX 3050',
        cpu: 'Intel i5-12400F', ram: '16 GB', ssd: '512 GB', gpu: 'RTX 3050 6GB',
        price: '18.690.000đ', old: '20.620.000đ', tag: '-9%',
        img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=260&fit=crop&auto=format'
    },
    {
        id: 2, name: 'PC Intel i5-12400F / RX 6500XT',
        cpu: 'Intel i5-12400F', ram: '16 GB', ssd: '512 GB', gpu: 'RX 6500XT 4GB',
        price: '17.390.000đ', old: '19.320.000đ', tag: '-10%',
        img: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=400&h=260&fit=crop&auto=format'
    },
    {
        id: 3, name: 'PC Intel i7-14700F / RTX 5070Ti',
        cpu: 'Intel i7-14700F', ram: '16 GB', ssd: '1024 GB', gpu: 'RTX 5070 Ti',
        price: '72.990.000đ', old: '74.020.000đ', tag: '-1%',
        img: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=260&fit=crop&auto=format'
    },
    {
        id: 4, name: 'PC AMD Ryzen 7 7800X3D / RTX 5080',
        cpu: 'Ryzen 7-7800X3D', ram: '16 GB', ssd: '1024 GB', gpu: 'RTX 5080',
        price: '84.990.000đ', old: '86.310.000đ', tag: '-2%',
        img: 'https://images.unsplash.com/photo-1593640408182-31c228f8a9e3?w=400&h=260&fit=crop&auto=format'
    },
    {
        id: 5, name: 'Laptop Acer Aspire 7 / RTX 3050',
        cpu: 'Core 5-210H', ram: '16 GB', ssd: '512 GB', gpu: 'RTX 3050 4GB',
        price: '24.490.000đ', old: '27.990.000đ', tag: '-13%',
        img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=260&fit=crop&auto=format'
    },
    {
        id: 6, name: 'Laptop ASUS V16 / RTX 3050',
        cpu: 'Core 5-210H', ram: '16 GB', ssd: '512 GB', gpu: 'RTX 3050',
        price: '26.490.000đ', old: '29.990.000đ', tag: '-12%',
        img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=260&fit=crop&auto=format'
    },
    {
        id: 7, name: 'Màn hình LG 27" 165Hz IPS',
        cpu: '27 inch', ram: '165Hz', ssd: '1ms', gpu: 'IPS Panel',
        price: '6.490.000đ', old: '7.200.000đ', tag: '-10%',
        img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=260&fit=crop&auto=format'
    },
    {
        id: 8, name: 'Bàn phím cơ Keychron K2 Pro',
        cpu: 'TKL Layout', ram: 'Hot-swap', ssd: 'Wireless', gpu: 'RGB LED',
        price: '2.190.000đ', old: '2.890.000đ', tag: '-24%',
        img: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=260&fit=crop&auto=format'
    }
];

let currentSlide = 0;
let cartItems = [];
let activeTab = 'Tất cả';

document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initTabs();
    initCartDrawer();
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

    // Auto 5s slide
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

    // Dots update
    const dots = document.querySelectorAll('.dot');
    dots.forEach((d, i) => {
        d.className = `dot ${i === idx ? 'active' : ''}`;
        if (i === idx) d.style.backgroundColor = s.accent;
        else d.style.backgroundColor = 'rgba(255,255,255,0.25)';
    });
}

// Tabs Controller
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab');
            renderProducts();
        });
    });
}

// Render Products
async function loadProducts() {
    // Thử kết nối API thật từ Laravel Backend, nếu chưa sẵn sàng dùng mock data từ Figma
    try {
        const res = await api.getProducts();
        if (res.status === 'success' && res.data && res.data.data && res.data.data.length > 0) {
            renderApiProducts(res.data.data);
            return;
        }
    } catch (e) {
        console.log('Chưa kết nối API Backend, nạp mockup Figma...');
    }
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    const filtered = mockProducts.filter(p => {
        if (activeTab === 'Tất cả') return true;
        if (activeTab === 'PC') return p.name.toLowerCase().startsWith('pc');
        if (activeTab === 'Laptop') return p.name.toLowerCase().startsWith('laptop');
        if (activeTab === 'Màn hình') return p.name.toLowerCase().startsWith('màn');
        if (activeTab === 'Phụ kiện') return !p.name.toLowerCase().startsWith('pc') && !p.name.toLowerCase().startsWith('laptop') && !p.name.toLowerCase().startsWith('màn');
        return true;
    });

    document.getElementById('productCount').textContent = `${filtered.length} sản phẩm`;

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="card-img-wrap">
                <img src="${p.img}" alt="${p.name}">
                ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ''}
            </div>
            <div class="card-body">
                <p class="card-title">${p.name}</p>
                <div class="card-specs">
                    <div>CPU: ${p.cpu}</div>
                    <div>RAM ${p.ram} · SSD ${p.ssd}</div>
                    <div>GPU: ${p.gpu}</div>
                </div>
                <div class="card-price-box">
                    <div class="old-price">${p.old}</div>
                    <div class="current-price">${p.price}</div>
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
