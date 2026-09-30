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

let activeTypeSubTab = 'all';

function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let rawSlug = urlParams.get('slug') || urlParams.get('cat') || 'laptop';
    const slug = rawSlug.replace(/^-+|-+$/g, '').trim() || 'laptop';
    const search = urlParams.get('search') || '';
    const brandParam = urlParams.get('brand') || '';
    activeTypeSubTab = urlParams.get('type') || (['cpu', 'mainboard', 'vga', 'ram', 'ssd', 'psu'].includes(slug) ? slug : 'all');

    if (brandParam) {
        activeBrandTab = brandParam;
    } else {
        activeBrandTab = 'all';
    }

    currentCategoryName = formatCategoryTitle(slug, activeTypeSubTab, search, activeBrandTab);
    updateCategoryHeaderAndTitles();

    // 1. Bỏ dòng subCompTabsGroup theo yêu cầu người dùng
    renderSubComponentTabs(slug);

    // 2. Nạp dynamic Brand Quick Tabs đúng theo loại linh kiện
    renderBrandQuickTabs(slug, activeTypeSubTab);

    // 3. Nạp dynamic Khoảng giá cho Màn hình / PC Gaming / Linh kiện
    renderPricePills(slug);

    // 4. Nạp dynamic Tiêu chí lọc nâng cao cho Màn hình, PC Gaming, Mainboard, VGA, CPU
    renderCriteriaDropdowns(slug, activeTypeSubTab);

    // Gọi API nạp sản phẩm
    loadCategoryProducts(slug, search, brandParam);
}

function renderSubComponentTabs(slug) {
    const existingSub = document.getElementById('subCompTabsGroup');
    if (existingSub) {
        existingSub.remove();
    }
}

function getCategoryBrands(slug, subType) {
    const currentComp = subType || slug;
    if (currentComp === 'cpu') return ['AMD', 'INTEL'];
    if (currentComp === 'mainboard') return ['ASUS', 'MSI', 'GIGABYTE', 'ASROCK'];
    if (currentComp === 'vga') return ['ASUS', 'MSI', 'GIGABYTE', 'ZOTAC', 'COLORFUL', 'GALAX'];
    if (currentComp === 'ram') return ['KINGSTON', 'CORSAIR', 'G.SKILL', 'TEAMGROUP', 'APACER'];
    if (currentComp === 'ssd') return ['SAMSUNG', 'KINGSTON', 'WESTERN DIGITAL', 'CRUCIAL'];
    if (currentComp === 'psu') return ['CORSAIR', 'SEASONIC', 'MSI', 'ASUS', 'COOLER MASTER'];
    if (slug === 'man-hinh') {
        return ['Acer', 'AIWA', 'ANTGAMER', 'AOC', 'APACER', 'ASROCK', 'ASUS', 'BenQ', 'BJX', 'Cooler Master', 'Dahua', 'Dell', 'E-DRA', 'GALAX', 'GIGABYTE', 'HIKVISION', 'HKC', 'HP', 'Infinity', 'Jonsbo', 'KCC', 'KTC', 'Lenovo', 'Leopard', 'LG', 'MSI', 'Philips', 'Redmi', 'SAMSUNG', 'SingPC', 'SSTC', 'Super Flower', 'Viewsonic', 'VSP', 'Xiaomi'];
    }
    if (slug === 'pc-gaming' || slug === 'pc-gvn') return ['ASUS', 'GIGABYTE', 'KCC', 'MSI'];
    if (slug === 'laptop' || slug === 'laptop-gaming') return ['ASUS', 'ACER', 'MSI', 'LENOVO', 'DELL', 'HP', 'GIGABYTE', 'APPLE'];
    if (slug === 'ban-phim') return ['AKKO', 'LOGITECH', 'RAZER', 'CORSAIR', 'STEELSERIES', 'FL-ESPORTS', 'DAREU', 'DUCKY'];
    if (slug === 'chuot-lot') {
        if (subType === 'mouse') return ['LOGITECH', 'RAZER', 'PULSAR', 'STEELSERIES', 'ZOWIE', 'CORSAIR', 'DAREU'];
        if (subType === 'mousepad') return ['ARTISAN', 'STEELSERIES', 'RAZER', 'CORSAIR', 'DAREU', 'E-DRA'];
        return ['LOGITECH', 'RAZER', 'ARTISAN', 'STEELSERIES', 'CORSAIR', 'DAREU'];
    }
    if (slug === 'tai-nghe') return ['LOGITECH', 'HYPERX', 'RAZER', 'CORSAIR', 'STEELSERIES', 'SONY', 'EDIFIER'];
    if (slug === 'ghe-ban') {
        if (subType === 'ghe') return ['SIHOO', 'ANDA SEAT', 'NOBLECHAIRS', 'CORSAIR', 'E-DRA', 'WARRIOR'];
        if (subType === 'ban') return ['E-DRA', 'WARRIOR', 'LUMBAR', 'HYPERWORK'];
        return ['SIHOO', 'ANDA SEAT', 'E-DRA', 'WARRIOR', 'HYPERWORK'];
    }
    return ['AMD', 'INTEL', 'ASUS', 'MSI', 'GIGABYTE'];
}

function renderBrandQuickTabs(slug, subType) {
    const container = document.getElementById('brandQuickTabs');
    if (!container) return;

    const allBrands = getCategoryBrands(slug, subType);

    // HÌNH 3: Khi người dùng đang chọn một brand cụ thể (activeBrandTab !== 'all')
    // Thì ở dòng Brand Quick Tabs chỉ hiển thị duy nhất 1 nút đại diện cho brand đó
    if (activeBrandTab && activeBrandTab !== 'all') {
        const matched = allBrands.find(b => b.toLowerCase() === activeBrandTab.toLowerCase()) || activeBrandTab;
        container.innerHTML = `<button class="brand-tab-btn active" data-brand="${matched}" title="Bấm để xóa lọc theo brand">${matched}</button>`;
    } else {
        // Khi chọn xem tất cả (activeBrandTab === 'all'): Hiển thị tất cả các nút brand
        const brandList = ['TẤT CẢ', ...allBrands];
        container.innerHTML = brandList.map(brand => {
            const val = brand === 'TẤT CẢ' ? 'all' : brand;
            const isActive = val === 'all';
            return `<button class="brand-tab-btn ${isActive ? 'active' : ''}" data-brand="${val}">${brand}</button>`;
        }).join('');
    }

    container.querySelectorAll('.brand-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedVal = btn.getAttribute('data-brand');
            if (activeBrandTab !== 'all' && selectedVal.toLowerCase() === activeBrandTab.toLowerCase()) {
                activeBrandTab = 'all';
            } else {
                activeBrandTab = selectedVal;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const slug = (urlParams.get('slug') || urlParams.get('cat') || 'laptop').replace(/^-+|-+$/g, '').trim();
            const search = urlParams.get('search') || '';

            currentCategoryName = formatCategoryTitle(slug, activeTypeSubTab, search, activeBrandTab);
            updateCategoryHeaderAndTitles();

            renderBrandQuickTabs(slug, activeTypeSubTab);
            renderCriteriaDropdowns(slug, activeTypeSubTab);

            currentPage = 1;
            applyCategoryFilters();
        });
    });
}

function onBrandDropdownChange(val) {
    activeBrandTab = val;

    const urlParams = new URLSearchParams(window.location.search);
    const slug = (urlParams.get('slug') || urlParams.get('cat') || 'laptop').replace(/^-+|-+$/g, '').trim();
    const search = urlParams.get('search') || '';

    currentCategoryName = formatCategoryTitle(slug, activeTypeSubTab, search, activeBrandTab);
    updateCategoryHeaderAndTitles();

    renderBrandQuickTabs(slug, activeTypeSubTab);

    currentPage = 1;
    applyCategoryFilters();
}

function renderPricePills(slug) {
    const container = document.getElementById('pricePillList');
    if (!container) return;

    let list = [];
    if (slug === 'man-hinh') {
        list = [
            { label: 'Tất cả', val: 'all' },
            { label: 'Dưới 2 triệu', val: 'under-2' },
            { label: '2 triệu - 3 triệu', val: '2-3' },
            { label: '3 triệu - 5 triệu', val: '3-5' },
            { label: '5 triệu - 7 triệu', val: '5-7' },
            { label: '7 triệu - 9 triệu', val: '7-9' },
            { label: '9 triệu - 12 triệu', val: '9-12' },
            { label: '12 triệu - 15 triệu', val: '12-15' },
            { label: '15 triệu - 20 triệu', val: '15-20' },
            { label: '20 triệu - 25 triệu', val: '20-25' },
            { label: '25 triệu - 30 triệu', val: '25-30' },
            { label: 'Trên 30 triệu', val: 'over-30' },
        ];
    } else if (slug === 'pc-gaming' || slug === 'pc-gvn') {
        list = [
            { label: 'Tất cả', val: 'all' },
            { label: 'Dưới 10 triệu', val: 'under-10' },
            { label: '10 triệu - 15 triệu', val: '10-15' },
            { label: '15 triệu - 20 triệu', val: '15-20' },
            { label: '20 triệu - 25 triệu', val: '20-25' },
            { label: '25 triệu - 30 triệu', val: '25-30' },
            { label: '30 triệu - 35 triệu', val: '30-35' },
            { label: 'Trên 35 triệu', val: 'over-35' },
        ];
    } else {
        list = [
            { label: 'Tất cả', val: 'all' },
            { label: 'Dưới 2 triệu', val: 'under-2' },
            { label: '2 triệu - 3 triệu', val: '2-3' },
            { label: '3 triệu - 5 triệu', val: '3-5' },
            { label: '5 triệu - 7 triệu', val: '5-7' },
            { label: '7 triệu - 9 triệu', val: '7-9' },
            { label: '9 triệu - 12 triệu', val: '9-12' },
            { label: '12 triệu - 15 triệu', val: '12-15' },
            { label: 'Trên 15 triệu', val: 'over-15' },
        ];
    }

    container.innerHTML = list.map((item, idx) => {
        const isActive = activePricePill === item.val || (idx === 0 && activePricePill === 'all');
        return `<button class="price-pill ${isActive ? 'active' : ''}" data-price="${item.val}">${item.label}</button>`;
    }).join('');

    container.querySelectorAll('.price-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            container.querySelectorAll('.price-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activePricePill = pill.getAttribute('data-price');
            currentPage = 1;
            applyCategoryFilters();
        });
    });
}

function renderCriteriaDropdowns(slug, subType) {
    const container = document.getElementById('criteriaDropdownList');
    if (!container) return;

    const currentComp = subType || slug;
    let html = '';

    const brandList = getCategoryBrands(slug, subType);
    let brandDropdownHtml = '';
    if (brandList && brandList.length > 0) {
        const brandOptions = brandList.map(b => {
            const selected = activeBrandTab.toLowerCase() === b.toLowerCase() ? 'selected' : '';
            return `<option value="${b}" ${selected}>${b}</option>`;
        }).join('');

        brandDropdownHtml = `
            <div class="criteria-dropdown">
                <select id="critBrand" onchange="onBrandDropdownChange(this.value)">
                    <option value="all" ${activeBrandTab === 'all' ? 'selected' : ''}>Thương hiệu ▾</option>
                    ${brandOptions}
                </select>
            </div>
        `;
    }

    if (slug === 'man-hinh') {
        html = brandDropdownHtml + `
            <div class="criteria-dropdown">
                <select id="critSync" onchange="applyCategoryFilters()">
                    <option value="all">Công Nghệ Đồng Bộ ▾</option>
                    <option value="freesync">AMD FreeSync</option>
                    <option value="g-sync">NVIDIA G-Sync</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critSurface" onchange="applyCategoryFilters()">
                    <option value="all">Bề Mặt ▾</option>
                    <option value="phẳng">Màn hình Phẳng</option>
                    <option value="cong">Màn hình Cong</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critResponse" onchange="applyCategoryFilters()">
                    <option value="all">Thời Gian Đáp Ứng ▾</option>
                    <option value="0.03ms">0.03ms (OLED)</option>
                    <option value="0.5ms">0.5ms</option>
                    <option value="1ms">1ms</option>
                    <option value="4ms">4ms</option>
                    <option value="5ms">5ms</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critHz" onchange="applyCategoryFilters()">
                    <option value="all">Tần Số Quét ▾</option>
                    <option value="60hz">60Hz</option>
                    <option value="75hz">75Hz</option>
                    <option value="100hz">100Hz</option>
                    <option value="144hz">144Hz</option>
                    <option value="165hz">165Hz</option>
                    <option value="180hz">180Hz</option>
                    <option value="240hz">240Hz</option>
                    <option value="280hz">280Hz</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critPanel" onchange="applyCategoryFilters()">
                    <option value="all">Tấm Nền Màn Hình ▾</option>
                    <option value="ips">IPS / Fast IPS</option>
                    <option value="va">VA</option>
                    <option value="tn">TN</option>
                    <option value="oled">OLED</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critRes" onchange="applyCategoryFilters()">
                    <option value="all">Độ Phân Giải ▾</option>
                    <option value="fhd">Full HD (1080p)</option>
                    <option value="2k">2K QHD</option>
                    <option value="4k">4K UHD</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critSize" onchange="applyCategoryFilters()">
                    <option value="all">Kích Thước Màn ▾</option>
                    <option value="24">23.8" - 24.5"</option>
                    <option value="27">27 inch</option>
                    <option value="32">32 inch</option>
                    <option value="34">34 inch UltraWide</option>
                </select>
            </div>
        `;
    } else if (slug === 'pc-gaming' || slug === 'pc-gvn') {
        // Hình 3: Dòng CPU, CHIP GPU, Dung Lượng
        html = `
            <div class="criteria-dropdown">
                <select id="critCpuSeries" onchange="applyCategoryFilters()">
                    <option value="all">Dòng CPU ▾</option>
                    <option value="core i3">Core i3</option>
                    <option value="core i5">Core i5</option>
                    <option value="core i7">Core i7</option>
                    <option value="core i9">Core i9</option>
                    <option value="ryzen 5">Ryzen 5</option>
                    <option value="ryzen 7">Ryzen 7</option>
                    <option value="ryzen 9">Ryzen 9</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critGpuChip" onchange="applyCategoryFilters()">
                    <option value="all">CHIP GPU ▾</option>
                    <option value="gtx 1650">GTX 1650</option>
                    <option value="rtx 3050">RTX 3050</option>
                    <option value="rtx 4060">RTX 4060</option>
                    <option value="rtx 4070">RTX 4070</option>
                    <option value="rtx 4080">RTX 4080</option>
                    <option value="rtx 4090">RTX 4090</option>
                    <option value="rtx 5070">RTX 5070</option>
                    <option value="rtx 5080">RTX 5080</option>
                    <option value="rtx 5090">RTX 5090</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critCapacity" onchange="applyCategoryFilters()">
                    <option value="all">Dung Lượng ▾</option>
                    <option value="16gb">16GB RAM</option>
                    <option value="32gb">32GB RAM</option>
                    <option value="64gb">64GB RAM</option>
                    <option value="512gb">512GB SSD</option>
                    <option value="1tb">1TB SSD</option>
                </select>
            </div>
        `;
    } else if (currentComp === 'mainboard') {
        // Hình 3: Số khe cắm RAM ▾, Chipset Main ▾, Form Factor ▾
        html = `
            <div class="criteria-dropdown">
                <select id="critRamSlots" onchange="applyCategoryFilters()">
                    <option value="all">Số khe cắm RAM ▾</option>
                    <option value="2">2 khe RAM</option>
                    <option value="4">4 khe RAM</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critChipset" onchange="applyCategoryFilters()">
                    <option value="all">Chipset Main ▾</option>
                    <option value="b760">Intel B760</option>
                    <option value="z790">Intel Z790</option>
                    <option value="b650">AMD B650</option>
                    <option value="x670">AMD X670</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critFormFactor" onchange="applyCategoryFilters()">
                    <option value="all">Form Factor ▾</option>
                    <option value="atx">ATX</option>
                    <option value="micro-atx">Micro-ATX</option>
                    <option value="mini-itx">Mini-ITX</option>
                </select>
            </div>
        `;
    } else if (currentComp === 'vga') {
        // Hình 4: Kích Thước Bộ Nhớ ▾, Kiểu Bộ Nhớ ▾, CHIP GPU ▾
        html = `
            <div class="criteria-dropdown">
                <select id="critVramSize" onchange="applyCategoryFilters()">
                    <option value="all">Kích Thước Bộ Nhớ ▾</option>
                    <option value="8gb">8 GB</option>
                    <option value="12gb">12 GB</option>
                    <option value="16gb">16 GB</option>
                    <option value="24gb">24 GB</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critVramType" onchange="applyCategoryFilters()">
                    <option value="all">Kiểu Bộ Nhớ ▾</option>
                    <option value="gddr6">GDDR6</option>
                    <option value="gddr6x">GDDR6X</option>
                    <option value="gddr7">GDDR7</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critGpuChip" onchange="applyCategoryFilters()">
                    <option value="all">CHIP GPU ▾</option>
                    <option value="nvidia">NVIDIA GeForce</option>
                    <option value="amd">AMD Radeon</option>
                </select>
            </div>
        `;
    } else if (currentComp === 'cpu') {
        // Socket CPU ▾, Dòng CPU ▾
        html = `
            <div class="criteria-dropdown">
                <select id="critSocket" onchange="applyCategoryFilters()">
                    <option value="all">Socket CPU ▾</option>
                    <option value="lga 1700">Socket LGA 1700</option>
                    <option value="am5">Socket AM5</option>
                    <option value="am4">Socket AM4</option>
                    <option value="lga 1200">Socket LGA 1200</option>
                </select>
            </div>
            <div class="criteria-dropdown">
                <select id="critSeries" onchange="applyCategoryFilters()">
                    <option value="all">Dòng CPU ▾</option>
                    <option value="i3">Core i3</option>
                    <option value="i5">Core i5</option>
                    <option value="i7">Core i7</option>
                    <option value="i9">Core i9</option>
                    <option value="ryzen 3">Ryzen 3</option>
                    <option value="ryzen 5">Ryzen 5</option>
                    <option value="ryzen 7">Ryzen 7</option>
                    <option value="ryzen 9">Ryzen 9</option>
                </select>
            </div>
        `;
    }

    container.innerHTML = html;
    const filterRow = document.getElementById('criteriaFilterRow');
    if (filterRow) {
        filterRow.style.display = html ? 'flex' : 'none';
    }
}

function updateCategoryHeaderAndTitles() {
    const titleElem = document.getElementById('categoryTitle');
    const breadcrumbElem = document.getElementById('breadcrumbCategoryName');
    const bannerElem = document.getElementById('bannerCatName');
    const pageTitleElem = document.getElementById('pageTitle');

    if (titleElem) titleElem.textContent = currentCategoryName;
    if (breadcrumbElem) breadcrumbElem.textContent = currentCategoryName;
    if (bannerElem) bannerElem.textContent = currentCategoryName.toUpperCase();
    if (pageTitleElem) pageTitleElem.textContent = `${currentCategoryName} chính hãng - PC SHOP`;
}

function filterBySubComponent(typeKey) {
    activeTypeSubTab = typeKey;
    activeBrandTab = 'all';

    const urlParams = new URLSearchParams(window.location.search);
    let slug = urlParams.get('slug') || 'main-cpu-vga';
    let search = urlParams.get('search') || '';
    currentCategoryName = formatCategoryTitle(slug, activeTypeSubTab, search);
    updateCategoryHeaderAndTitles();

    renderBrandQuickTabs(slug, activeTypeSubTab);
    renderCriteriaDropdowns(slug, activeTypeSubTab);

    applyCategoryFilters();
}

function formatCategoryTitle(slug, subType, search, activeBrand) {
    let brandSuffix = '';
    if (activeBrand && activeBrand.toLowerCase() !== 'all') {
        brandSuffix = ` ${activeBrand}`;
    }

    let baseTitle = '';
    if (subType === 'cpu' || slug === 'cpu') baseTitle = 'CPU - Bộ Vi Xử Lý';
    else if (subType === 'mainboard' || slug === 'mainboard') baseTitle = 'Bo Mạch Chủ (Mainboard)';
    else if (subType === 'vga' || slug === 'vga') baseTitle = 'Card Màn Hình (VGA)';
    else if (subType === 'ram' || slug === 'ram') baseTitle = 'Bộ Nhớ RAM';
    else if (subType === 'ssd' || slug === 'ssd') baseTitle = 'Ổ Cứng SSD';
    else if (subType === 'psu' || slug === 'psu') baseTitle = 'Nguồn Máy Tính (PSU)';
    else if (subType === 'case' || slug === 'case') baseTitle = 'Vỏ Máy Tính (Case)';
    else if (subType === 'cooling' || slug === 'cooling') baseTitle = 'Tản Nhiệt PC';
    else if (subType === 'speaker' || slug === 'speaker') baseTitle = 'Loa Máy Tính';
    else if (subType === 'mic' || slug === 'mic') baseTitle = 'Microphone Streamer';
    else if (subType === 'webcam' || slug === 'webcam') baseTitle = 'Webcam HD / 4K';
    else if (subType === 'mouse') baseTitle = 'Chuột Máy Tính';
    else if (subType === 'mousepad') baseTitle = 'Lót Chuột / Mousepad';
    else if (subType === 'ghe') baseTitle = 'Ghế Gaming & Công Thái Học';
    else if (subType === 'ban') baseTitle = 'Bàn Gaming & Bàn Nâng Hạ';
    else if (search) {
        const s = search.toLowerCase();
        if (s.includes('intel') || s.includes('ryzen') || s.includes('core') || s.includes('cpu')) {
            baseTitle = 'CPU - Bộ Vi Xử Lý';
        } else if (s.includes('rtx') || s.includes('gtx') || s.includes('radeon') || s.includes('5080') || s.includes('4070') || s.includes('3050')) {
            baseTitle = 'Card Màn Hình (VGA)';
        } else if (s.includes('b760') || s.includes('z790') || s.includes('b550') || s.includes('b650')) {
            baseTitle = 'Bo Mạch Chủ (Mainboard)';
        } else {
            baseTitle = `Tìm kiếm: ${search}`;
        }
    } else {
        const titles = {
            'laptop': 'Laptop',
            'laptop-gaming': 'Laptop Gaming',
            'pc-gaming': 'PC Gaming',
            'main-cpu-vga': 'CPU - Bộ Vi Xử Lý / Main, VGA',
            'case-nguon-tan': 'Case, Nguồn, Tản Nhiệt',
            'o-cung-ram': 'Ổ cứng, RAM, Thẻ nhớ',
            'audio': 'Loa, Micro, Webcam',
            'man-hinh': 'Màn Hình',
            'ban-phim': 'Bàn Phím Cơ',
            'chuot-lot': 'Chuột + Lót Chuột',
            'tai-nghe': 'Tai Nghe Gaming',
            'ghe-ban': 'Ghế - Bàn Công Thái Học',
            'phan-mem': 'Phần Mềm',
            'phu-kien': 'Phụ Kiện',
            'thu-cu-doi-moi': 'Thu Cũ Đổi Mới'
        };
        baseTitle = titles[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1));
    }

    if (brandSuffix) {
        return `${baseTitle}${brandSuffix}`;
    }
    return baseTitle;
}

// Gọi REST API Backend nạp danh mục
async function loadCategoryProducts(slug, search, brandParam) {
    const grid = document.getElementById('categoryProductGrid');
    grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 60px; text-align: center; color: #666;">Đang nạp danh sách sản phẩm từ Server Backend...</div>';

    try {
        let fetchCategory = slug;
        if (['cpu', 'mainboard', 'vga'].includes(slug)) fetchCategory = 'main-cpu-vga';
        else if (['ram', 'ssd'].includes(slug)) fetchCategory = 'o-cung-ram';
        else if (['case', 'psu', 'cooling'].includes(slug)) fetchCategory = 'case-nguon-tan';
        else if (['speaker', 'mic', 'webcam'].includes(slug)) fetchCategory = 'audio';

        const res = await api.getProducts({ category: fetchCategory, per_page: 250 });
        if (res.status === 'success' && res.data) {
            const allProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);

            // Phân loại chính xác 100% không bị lẫn lộn giữa các mục
            categoryProducts = allProducts.filter(p => {
                const pCatSlug = (p.category_slug || (p.category ? (p.category.slug || p.category.name || '') : '')).toLowerCase();
                const pName = (p.name || '').toLowerCase();
                const pBrand = (p.brand || '').toLowerCase();

                if (search && !pName.includes(search.toLowerCase()) && !pBrand.includes(search.toLowerCase())) {
                    return false;
                }

                // Nếu thuộc nhóm gộp main-cpu-vga
                if (slug === 'main-cpu-vga' || fetchCategory === 'main-cpu-vga') {
                    const isPrebuiltOrLaptop = pName.includes('pc gvn') || pName.includes('pc gaming') || pName.includes('pcshop ultra') || pName.includes('laptop');
                    if (isPrebuiltOrLaptop) return false;

                    if (activeTypeSubTab === 'cpu' || slug === 'cpu') {
                        return pName.includes('vi xử lý') || pName.includes('cpu') || pName.includes('intel core') || pName.includes('amd ryzen');
                    }
                    if (activeTypeSubTab === 'mainboard' || slug === 'mainboard') {
                        return (pName.includes('mainboard') || pName.includes('bo mạch')) && !pName.includes('vi xử lý') && !pName.includes('cpu');
                    }
                    if (activeTypeSubTab === 'vga' || slug === 'vga') {
                        return (pName.includes('card màn hình') || pName.includes('rtx') || pName.includes('gtx') || pName.includes('vga') || pName.includes('radeon')) && !pName.includes('vi xử lý') && !pName.includes('mainboard');
                    }
                    return pName.includes('vi xử lý') || pName.includes('intel core') || pName.includes('amd ryzen') || pName.includes('mainboard') || pName.includes('bo mạch') || pName.includes('card màn hình');
                }

                return pCatSlug.includes(fetchCategory) || pCatSlug.includes(slug) || pName.includes(slug);
            });

            // UU TIÊN SẮP XẾP CPU LÊN ĐẦU KHI XEM TẤT CẢ TRONG MỤC MAIN-CPU-VGA
            if (slug === 'main-cpu-vga' && activeTypeSubTab === 'all') {
                categoryProducts.sort((a, b) => {
                    const getPriority = (p) => {
                        const name = (p.name || '').toLowerCase();
                        if (name.includes('vi xử lý') || name.includes('cpu') || name.includes('intel core') || name.includes('amd ryzen')) return 1;
                        if (name.includes('mainboard') || name.includes('bo mạch')) return 2;
                        if (name.includes('card màn hình') || name.includes('vga') || name.includes('rtx') || name.includes('gtx') || name.includes('radeon')) return 3;
                        return 4;
                    };
                    return getPriority(a) - getPriority(b);
                });
            }

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
    const critRamSlots = (document.getElementById('critRamSlots')?.value || 'all').toLowerCase();
    const critChipset = (document.getElementById('critChipset')?.value || 'all').toLowerCase();
    const critFormFactor = (document.getElementById('critFormFactor')?.value || 'all').toLowerCase();

    const critVramSize = (document.getElementById('critVramSize')?.value || 'all').toLowerCase();
    const critVramType = (document.getElementById('critVramType')?.value || 'all').toLowerCase();
    const critGpuChip = (document.getElementById('critGpuChip')?.value || 'all').toLowerCase();

    const socketDropdown = (document.getElementById('critSocket')?.value || 'all').toLowerCase();
    const seriesDropdown = (document.getElementById('critSeries')?.value || 'all').toLowerCase();

    // Màn hình criteria
    const critSync = (document.getElementById('critSync')?.value || 'all').toLowerCase();
    const critSurface = (document.getElementById('critSurface')?.value || 'all').toLowerCase();
    const critResponse = (document.getElementById('critResponse')?.value || 'all').toLowerCase();
    const critHz = (document.getElementById('critHz')?.value || 'all').toLowerCase();
    const critPanel = (document.getElementById('critPanel')?.value || 'all').toLowerCase();
    const critRes = (document.getElementById('critRes')?.value || 'all').toLowerCase();
    const critSize = (document.getElementById('critSize')?.value || 'all').toLowerCase();

    // PC Gaming criteria
    const critCpuSeries = (document.getElementById('critCpuSeries')?.value || 'all').toLowerCase();
    const critCapacity = (document.getElementById('critCapacity')?.value || 'all').toLowerCase();

    filteredCategoryProducts = categoryProducts.filter(p => {
        const pName = (p.name || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        const price = Number(p.price) || 0;
        const specs = p.specs || {};

        // 0. Sub-Component Type Filter (CPU, Mainboard, VGA, Mouse, Mousepad, Ghế, Bàn)
        if (activeTypeSubTab === 'cpu') {
            if (!pName.includes('vi xử lý') && !pName.includes('cpu') && !pName.includes('intel core') && !pName.includes('amd ryzen')) return false;
        } else if (activeTypeSubTab === 'mainboard') {
            if ((!pName.includes('mainboard') && !pName.includes('bo mạch')) || pName.includes('vi xử lý') || pName.includes('cpu')) return false;
        } else if (activeTypeSubTab === 'vga') {
            if ((!pName.includes('card màn hình') && !pName.includes('vga') && !pName.includes('rtx') && !pName.includes('gtx') && !pName.includes('radeon')) || pName.includes('vi xử lý') || pName.includes('mainboard')) return false;
        } else if (activeTypeSubTab === 'mouse') {
            if (!pName.includes('chuột') || pName.includes('lót chuột') || pName.includes('pad')) return false;
        } else if (activeTypeSubTab === 'mousepad') {
            if (!pName.includes('lót chuột') && !pName.includes('pad') && !pName.includes('bàn di')) return false;
        } else if (activeTypeSubTab === 'ghe') {
            if (!pName.includes('ghế')) return false;
        } else if (activeTypeSubTab === 'ban') {
            if (!pName.includes('bàn') || pName.includes('bàn phím') || pName.includes('bàn di')) return false;
        }

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
            if (activePricePill === '15-20' && !(price > 15000000 && price <= 20000000)) return false;
            if (activePricePill === '20-25' && !(price > 20000000 && price <= 25000000)) return false;
            if (activePricePill === '25-30' && !(price > 25000000 && price <= 30000000)) return false;
            if (activePricePill === 'over-30' && !(price > 30000000)) return false;
            if (activePricePill === 'over-15' && !(price > 15000000)) return false;

            // PC Gaming price pills
            if (activePricePill === 'under-10' && !(price < 10000000)) return false;
            if (activePricePill === '10-15' && !(price >= 10000000 && price <= 15000000)) return false;
            if (activePricePill === '15-20' && !(price > 15000000 && price <= 20000000)) return false;
            if (activePricePill === '20-25' && !(price > 20000000 && price <= 25000000)) return false;
            if (activePricePill === '25-30' && !(price > 25000000 && price <= 30000000)) return false;
            if (activePricePill === '30-35' && !(price > 30000000 && price <= 35000000)) return false;
            if (activePricePill === 'over-35' && !(price > 35000000)) return false;
        }

        // 3. Monitor Filters
        if (critSync !== 'all') {
            const val = (specs.sync_tech || '').toLowerCase();
            if (!val.includes(critSync) && !pName.includes(critSync)) return false;
        }
        if (critSurface !== 'all') {
            const val = (specs.surface || '').toLowerCase();
            if (!val.includes(critSurface) && !pName.includes(critSurface)) return false;
        }
        if (critResponse !== 'all') {
            const val = (specs.response_time || '').toLowerCase();
            if (!val.includes(critResponse) && !pName.includes(critResponse)) return false;
        }
        if (critHz !== 'all') {
            const val = (specs.refresh_rate || '').toLowerCase();
            if (!val.includes(critHz) && !pName.includes(critHz)) return false;
        }
        if (critPanel !== 'all') {
            const val = (specs.panel_type || '').toLowerCase();
            if (!val.includes(critPanel) && !pName.includes(critPanel)) return false;
        }
        if (critRes !== 'all') {
            const val = (specs.resolution || '').toLowerCase();
            if (!val.includes(critRes) && !pName.includes(critRes)) return false;
        }
        if (critSize !== 'all') {
            if (!pName.includes(critSize)) return false;
        }

        // 4. PC Gaming Filters
        if (critCpuSeries !== 'all') {
            const val = (specs.cpu || '').toLowerCase();
            if (!val.includes(critCpuSeries) && !pName.includes(critCpuSeries)) return false;
        }
        if (critCapacity !== 'all') {
            if (!pName.includes(critCapacity)) return false;
        }

        // 5. Mainboard Filters
        if (critRamSlots !== 'all') {
            const val = (specs.ram_slots || specs.slots || '').toLowerCase();
            if (!val.includes(critRamSlots) && !pName.includes(`${critRamSlots} khe`) && !pName.includes(`${critRamSlots}khe`)) return false;
        }
        if (critChipset !== 'all') {
            const val = (specs.chipset || '').toLowerCase();
            if (!val.includes(critChipset) && !pName.includes(critChipset)) return false;
        }
        if (critFormFactor !== 'all') {
            const val = (specs.form_factor || '').toLowerCase();
            if (!val.includes(critFormFactor) && !pName.includes(critFormFactor)) return false;
        }

        // 6. VGA Filters
        if (critVramSize !== 'all') {
            const val = (specs.vram || specs.memory || '').toLowerCase();
            if (!val.includes(critVramSize) && !pName.includes(critVramSize)) return false;
        }
        if (critVramType !== 'all') {
            const val = (specs.vram_type || '').toLowerCase();
            if (!val.includes(critVramType) && !pName.includes(critVramType)) return false;
        }
        if (critGpuChip !== 'all') {
            if (critGpuChip === 'nvidia') {
                if (!pName.includes('geforce') && !pName.includes('rtx') && !pName.includes('gtx') && !pName.includes('nvidia')) return false;
            } else if (critGpuChip === 'amd') {
                if (!pName.includes('radeon') && !pName.includes('rx') && !pName.includes('amd')) return false;
            } else {
                if (!pName.includes(critGpuChip)) return false;
            }
        }

        // 7. CPU Filters
        if (socketDropdown !== 'all') {
            const specSocket = (specs.socket || '').toLowerCase();
            if (!specSocket.includes(socketDropdown) && !pName.includes(socketDropdown)) return false;
        }
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
        // default newest: ƯU TIÊN SẮP XẾP CPU LÊN ĐẦU TIÊN
        filteredCategoryProducts.sort((a, b) => {
            const getPriority = (p) => {
                const name = (p.name || '').toLowerCase();
                if (name.includes('vi xử lý') || name.includes('cpu') || name.includes('intel core') || name.includes('amd ryzen')) return 1;
                if (name.includes('mainboard') || name.includes('bo mạch')) return 2;
                if (name.includes('card màn hình') || name.includes('vga') || name.includes('rtx') || name.includes('gtx') || name.includes('radeon')) return 3;
                return 4;
            };
            const prioA = getPriority(a);
            const prioB = getPriority(b);
            if (prioA !== prioB) {
                return prioA - prioB;
            }
            return b.id - a.id;
        });
    }
}

function resetAllCategoryFilters() {
    activeBrandTab = 'all';
    activePricePill = 'all';
    activeSortOption = 'newest';
    currentPage = 1;

    const urlParams = new URLSearchParams(window.location.search);
    const slug = (urlParams.get('slug') || urlParams.get('cat') || 'laptop').replace(/^-+|-+$/g, '').trim();
    const search = urlParams.get('search') || '';

    currentCategoryName = formatCategoryTitle(slug, activeTypeSubTab, search, activeBrandTab);
    updateCategoryHeaderAndTitles();

    renderBrandQuickTabs(slug, activeTypeSubTab);
    renderCriteriaDropdowns(slug, activeTypeSubTab);

    document.querySelectorAll('.price-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-price') === 'all');
    });

    document.querySelectorAll('.sort-option-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-sort') === 'newest');
    });

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


