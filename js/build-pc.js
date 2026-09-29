// JavaScript điều khiển cho trang Xây dựng Cấu hình PC (build-pc.html)

const COMPONENT_TYPES = [
    { key: 'cpu', label: '1. CPU', name: 'Bộ vi xử lý (CPU)', catSlug: 'main-cpu-vga', filterKeyword: 'cpu' },
    { key: 'mainboard', label: '2. MAINBOARD', name: 'Bo mạch chủ (Mainboard)', catSlug: 'main-cpu-vga', filterKeyword: 'mainboard' },
    { key: 'ram', label: '3. RAM', name: 'Bộ nhớ RAM', catSlug: 'o-cung-ram', filterKeyword: 'ram' },
    { key: 'ssd', label: '4. SSD', name: 'Ổ cứng SSD', catSlug: 'o-cung-ram', filterKeyword: 'ssd' },
    { key: 'hdd', label: '5. HDD', name: 'Ổ cứng HDD', catSlug: 'o-cung-ram', filterKeyword: 'hdd' },
    { key: 'vga', label: '6. VGA', name: 'Card màn hình (VGA)', catSlug: 'main-cpu-vga', filterKeyword: 'vga' },
    { key: 'psu', label: '7. NGUỒN', name: 'Nguồn máy tính (PSU)', catSlug: 'case-nguon-tan', filterKeyword: 'nguon' },
    { key: 'case', label: '8. CASE', name: 'Vỏ cây máy tính (Case)', catSlug: 'case-nguon-tan', filterKeyword: 'case' },
    { key: 'cooler', label: '9. TẢN NHIỆT', name: 'Tản nhiệt CPU', catSlug: 'case-nguon-tan', filterKeyword: 'tan' },
    { key: 'fan', label: '10. FAN CASE', name: 'Quạt tản nhiệt Case', catSlug: 'case-nguon-tan', filterKeyword: 'fan' },
    { key: 'monitor', label: '11. MÀN HÌNH', name: 'Màn hình hiển thị', catSlug: 'man-hinh', filterKeyword: 'man-hinh' },
    { key: 'keyboard', label: '12. BÀN PHÍM', name: 'Bàn phím cơ', catSlug: 'ban-phim', filterKeyword: 'ban-phim' },
    { key: 'mouse', label: '13. CHUỘT', name: 'Chuột Gaming + Lót', catSlug: 'chuot-lot', filterKeyword: 'chuot' },
    { key: 'headset', label: '14. TAI NGHE', name: 'Tai nghe Gaming', catSlug: 'tai-nghe', filterKeyword: 'tai-nghe' },
    { key: 'chair', label: '15. GHẾ - BÀN', name: 'Ghế & Bàn công thái học', catSlug: 'ghe-ban', filterKeyword: 'ghe' }
];

// Trạng thái cấu hình được chọn
let selectedComponents = {}; // e.g. { cpu: { product: {...}, quantity: 1 } }
let activeModalComponentKey = null;

let modalCategoryProducts = []; // Raw products matching current component category
let filteredModalProducts = [];  // Filtered products after brand, price, search filters

document.addEventListener('DOMContentLoaded', () => {
    initBuildPcPage();
    initModalEvents();
});

function initBuildPcPage() {
    renderComponentRows();
    updateTotalCostDisplay();
}

// Render danh sách linh kiện trong bảng xây dựng
function renderComponentRows() {
    const tableContainer = document.getElementById('buildPcTable');
    if (!tableContainer) return;

    tableContainer.innerHTML = '';

    COMPONENT_TYPES.forEach(comp => {
        const row = document.createElement('div');
        row.className = 'build-row';
        row.id = `build-row-${comp.key}`;

        const selectedItem = selectedComponents[comp.key];

        if (!selectedItem) {
            // Chưa chọn linh kiện
            row.innerHTML = `
                <div class="build-row-label">${comp.label}</div>
                <div class="build-row-empty">
                    <button class="btn-select-component" onclick="openComponentModal('${comp.key}')">
                        <i class="fa-solid fa-plus"></i> Chọn ${comp.name}
                    </button>
                </div>
            `;
        } else {
            // Đã chọn linh kiện (Giống Hình 2)
            const p = selectedItem.product;
            const qty = selectedItem.quantity || 1;
            const priceNum = Number(p.price) || 0;
            const subtotal = priceNum * qty;

            const unitPriceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum);
            const subtotalVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal);
            const imgUrl = (p.images && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400';

            row.innerHTML = `
                <div class="build-row-label">${comp.label}</div>
                <div class="build-row-selected">
                    <div class="build-item-info">
                        <img src="${imgUrl}" alt="${p.name}" class="build-item-img">
                        <div class="build-item-details">
                            <div class="build-item-title">${p.name}</div>
                            <div class="build-item-meta">
                                <span>Mã SP: ${p.sku || p.id}</span>
                                <span>Bảo hành: 36 tháng</span>
                                <span class="stock-in">Kho hàng: Còn hàng</span>
                            </div>
                        </div>
                    </div>
                    <div class="build-item-price-col">
                        <span class="build-item-unit-price">${unitPriceVnd}</span>
                        <div class="build-qty-box">
                            <span>x</span>
                            <input type="number" class="build-qty-input" value="${qty}" min="1" max="99" onchange="updateItemQty('${comp.key}', this.value)">
                            <span>=</span>
                        </div>
                        <span class="build-item-subtotal">${subtotalVnd}</span>
                        <div class="build-item-actions">
                            <button class="btn-edit-item" onclick="openComponentModal('${comp.key}')" title="Đổi linh kiện khác">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-delete-item" onclick="removeComponent('${comp.key}')" title="Xóa linh kiện này">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        tableContainer.appendChild(row);
    });

    updateTotalCostDisplay();
}

// Cập nhật số lượng linh kiện
function updateItemQty(key, qtyVal) {
    const qty = parseInt(qtyVal, 10);
    if (selectedComponents[key]) {
        selectedComponents[key].quantity = (isNaN(qty) || qty < 1) ? 1 : qty;
        renderComponentRows();
    }
}

// Xóa linh kiện đã chọn
function removeComponent(key) {
    delete selectedComponents[key];
    renderComponentRows();
}

// Tính tổng chi phí dự tính
function calculateTotalCost() {
    let total = 0;
    Object.keys(selectedComponents).forEach(key => {
        const item = selectedComponents[key];
        if (item && item.product) {
            const price = Number(item.product.price) || 0;
            const qty = item.quantity || 1;
            total += price * qty;
        }
    });
    return total;
}

function updateTotalCostDisplay() {
    const total = calculateTotalCost();
    const totalVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);

    const topElem = document.getElementById('totalCostTop');
    const bottomElem = document.getElementById('totalCostBottom');

    if (topElem) topElem.textContent = totalVnd;
    if (bottomElem) bottomElem.textContent = totalVnd;
}

// MỞ POPUP MODAL CHỌN LINH KIỆN
async function openComponentModal(key) {
    activeModalComponentKey = key;
    const comp = COMPONENT_TYPES.find(c => c.key === key);
    if (!comp) return;

    document.getElementById('modalTitle').textContent = `CHỌN LINH KIỆN: ${comp.name.toUpperCase()}`;
    document.getElementById('modalSearchInput').value = '';

    const modal = document.getElementById('pcBuilderModal');
    modal.classList.add('open');

    // Gọi API lấy danh sách linh kiện chuẩn 100%
    await loadModalProducts(comp);
}

function closeModal() {
    const modal = document.getElementById('pcBuilderModal');
    if (modal) modal.classList.remove('open');
}

// Gọi API nạp sản phẩm chuẩn từng loại linh kiện cho Modal
async function loadModalProducts(comp) {
    const listContainer = document.getElementById('modalProductList');
    listContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Đang nạp danh sách sản phẩm từ hệ thống...</div>';

    try {
        const res = await api.getProducts({ per_page: 500 });
        if (res.status === 'success' && res.data) {
            const allProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);

            // Lọc NGHIÊM NGẶT 100% theo loại linh kiện (CẤM lẫn loại khác)
            modalCategoryProducts = allProducts.filter(p => {
                const name = (p.name || '').toLowerCase();
                const catSlug = (p.category_slug || (p.category ? (p.category.slug || '') : '')).toLowerCase();

                if (comp.key === 'cpu') {
                    return (name.includes('vi xử lý') || name.includes('cpu') || name.includes('intel core') || name.includes('amd ryzen')) 
                        && !name.includes('mainboard') && !name.includes('laptop') && !name.includes('pc gaming') && !name.includes('tản nhiệt');
                }
                if (comp.key === 'mainboard') {
                    return (name.includes('mainboard') || name.includes('bo mạch') || name.includes('z790') || name.includes('b760') || name.includes('b650') || name.includes('x670') || name.includes('a620') || name.includes('h610'))
                        && !name.includes('laptop') && !name.includes('vi xử lý') && !name.includes('cpu');
                }
                if (comp.key === 'ram') {
                    return (name.includes('ram') || name.includes('ddr4') || name.includes('ddr5') || name.includes('kingbank'))
                        && !name.includes('laptop') && !name.includes('vga') && !name.includes('ssd');
                }
                if (comp.key === 'ssd') {
                    return (name.includes('ssd') || name.includes('nvme') || name.includes('m.2')) && !name.includes('laptop') && !name.includes('ram');
                }
                if (comp.key === 'hdd') {
                    return (name.includes('hdd') || name.includes('ổ cứng hdd') || name.includes('western digital purple') || name.includes('barracuda')) && !name.includes('ssd');
                }
                if (comp.key === 'vga') {
                    return (name.includes('card màn hình') || name.includes('rtx') || name.includes('gtx') || name.includes('vga') || name.includes('radeon') || name.includes('geforce'))
                        && !name.includes('laptop') && !name.includes('pc gaming') && !name.includes('vi xử lý');
                }
                if (comp.key === 'psu') {
                    return (name.includes('nguồn') || name.includes('psu') || name.includes('power') || name.includes('80 plus'));
                }
                if (comp.key === 'case') {
                    return (name.includes('vỏ case') || name.includes('vỏ cây') || name.includes('case pc') || name.includes('bể cá') || name.includes('sama') || name.includes('nzxt'));
                }
                if (comp.key === 'cooler') {
                    return (name.includes('tản nhiệt') || name.includes('cooler') || name.includes('aio') || name.includes('cr-3000') || name.includes('thermalright'));
                }
                if (comp.key === 'fan') {
                    return (name.includes('fan case') || name.includes('quạt case') || name.includes('fan led') || name.includes('120mm'));
                }
                if (comp.key === 'monitor') {
                    return (name.includes('màn hình') || name.includes('monitor') || catSlug.includes('man-hinh'));
                }
                if (comp.key === 'keyboard') {
                    return (name.includes('bàn phím') || name.includes('keyboard') || catSlug.includes('ban-phim'));
                }
                if (comp.key === 'mouse') {
                    return (name.includes('chuột') || name.includes('mouse') || catSlug.includes('chuot-lot'));
                }
                if (comp.key === 'headset') {
                    return (name.includes('tai nghe') || name.includes('headset') || catSlug.includes('tai-nghe'));
                }
                if (comp.key === 'chair') {
                    return (name.includes('ghế') || name.includes('bàn') || catSlug.includes('ghe-ban'));
                }

                return name.includes(comp.filterKeyword) || catSlug.includes(comp.filterKeyword);
            });

            // Tự động tạo danh sách Checkbox Hãng sản xuất động dựa trên các hãng thực tế của sản phẩm
            renderModalBrandFilters(modalCategoryProducts);

            applyModalFilters();
            return;
        }
    } catch (e) {
        console.error('Lỗi nạp linh kiện modal:', e);
    }

    listContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;">Không thể kết nối Server Backend.</div>';
}

// Tạo danh sách thương hiệu động theo linh kiện hiện tại
function renderModalBrandFilters(products) {
    const brandContainer = document.getElementById('modalBrandFilterGroup');
    if (!brandContainer) return;

    const brandsSet = new Set();
    products.forEach(p => {
        if (p.brand) brandsSet.add(p.brand.trim());
        const nameUpper = (p.name || '').toUpperCase();
        if (nameUpper.includes('INTEL')) brandsSet.add('Intel');
        if (nameUpper.includes('AMD')) brandsSet.add('AMD');
        if (nameUpper.includes('ASUS')) brandsSet.add('ASUS');
        if (nameUpper.includes('GIGABYTE')) brandsSet.add('Gigabyte');
        if (nameUpper.includes('MSI')) brandsSet.add('MSI');
        if (nameUpper.includes('KINGSTON')) brandsSet.add('Kingston');
        if (nameUpper.includes('COLORFUL')) brandsSet.add('Colorful');
        if (nameUpper.includes('CRUCIAL')) brandsSet.add('Crucial');
        if (nameUpper.includes('WESTERN')) brandsSet.add('Western');
    });

    const brands = Array.from(brandsSet).sort();

    let html = `<h4>Hãng sản xuất</h4>`;
    html += `<label class="modal-filter-checkbox"><input type="checkbox" class="modal-brand-cb" value="all" checked onchange="onModalBrandCheckboxChange(this)"> Tất cả</label>`;

    brands.forEach(b => {
        const count = products.filter(p => (p.brand || '').toLowerCase().includes(b.toLowerCase()) || (p.name || '').toLowerCase().includes(b.toLowerCase())).length;
        html += `<label class="modal-filter-checkbox"><input type="checkbox" class="modal-brand-cb" value="${b.toLowerCase()}" onchange="onModalBrandCheckboxChange(this)"> ${b} (${count})</label>`;
    });

    brandContainer.innerHTML = html;
}

function onModalBrandCheckboxChange(elem) {
    if (elem.value === 'all' && elem.checked) {
        document.querySelectorAll('.modal-brand-cb').forEach(cb => {
            if (cb.value !== 'all') cb.checked = false;
        });
    } else if (elem.value !== 'all' && elem.checked) {
        const allCb = document.querySelector('.modal-brand-cb[value="all"]');
        if (allCb) allCb.checked = false;
    }

    const checkedCount = document.querySelectorAll('.modal-brand-cb:checked').length;
    if (checkedCount === 0) {
        const allCb = document.querySelector('.modal-brand-cb[value="all"]');
        if (allCb) allCb.checked = true;
    }

    applyModalFilters();
}

function onModalPriceCheckboxChange(elem) {
    if (elem.value === 'all' && elem.checked) {
        document.querySelectorAll('.modal-price-cb').forEach(cb => {
            if (cb.value !== 'all') cb.checked = false;
        });
    } else if (elem.value !== 'all' && elem.checked) {
        const allCb = document.querySelector('.modal-price-cb[value="all"]');
        if (allCb) allCb.checked = false;
    }

    const checkedCount = document.querySelectorAll('.modal-price-cb:checked').length;
    if (checkedCount === 0) {
        const allCb = document.querySelector('.modal-price-cb[value="all"]');
        if (allCb) allCb.checked = true;
    }

    applyModalFilters();
}

function applyModalFilters() {
    const searchQuery = (document.getElementById('modalSearchInput')?.value || '').toLowerCase().trim();
    const sortVal = document.getElementById('modalSortSelect')?.value || 'newest';

    const selectedBrandCbs = Array.from(document.querySelectorAll('.modal-brand-cb:checked')).map(cb => cb.value);
    const selectedPriceCbs = Array.from(document.querySelectorAll('.modal-price-cb:checked')).map(cb => cb.value);

    filteredModalProducts = modalCategoryProducts.filter(p => {
        const name = (p.name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const price = Number(p.price) || 0;

        // 1. Lọc theo ô tìm kiếm
        if (searchQuery && !name.includes(searchQuery) && !brand.includes(searchQuery)) {
            return false;
        }

        // 2. Lọc theo Checkbox Hãng sản xuất
        if (selectedBrandCbs.length > 0 && !selectedBrandCbs.includes('all')) {
            const matchBrand = selectedBrandCbs.some(b => brand.includes(b) || name.includes(b));
            if (!matchBrand) return false;
        }

        // 3. Lọc theo Checkbox Khoảng giá
        if (selectedPriceCbs.length > 0 && !selectedPriceCbs.includes('all')) {
            const matchPrice = selectedPriceCbs.some(pVal => {
                if (pVal === 'under-3') return price < 3000000;
                if (pVal === '3-7') return price >= 3000000 && price <= 7000000;
                if (pVal === '7-15') return price > 7000000 && price <= 15000000;
                if (pVal === 'over-15') return price > 15000000;
                return true;
            });
            if (!matchPrice) return false;
        }

        return true;
    });

    // Sắp xếp danh sách
    if (sortVal === 'price-asc') {
        filteredModalProducts.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-desc') {
        filteredModalProducts.sort((a, b) => b.price - a.price);
    } else {
        filteredModalProducts.sort((a, b) => b.id - a.id);
    }

    renderModalProducts(filteredModalProducts);
}

function resetModalFilters() {
    const searchInput = document.getElementById('modalSearchInput');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.modal-brand-cb').forEach(cb => {
        cb.checked = (cb.value === 'all');
    });

    document.querySelectorAll('.modal-price-cb').forEach(cb => {
        cb.checked = (cb.value === 'all');
    });

    const sortSelect = document.getElementById('modalSortSelect');
    if (sortSelect) sortSelect.value = 'newest';

    applyModalFilters();
}

function renderModalProducts(products) {
    const listContainer = document.getElementById('modalProductList');
    listContainer.innerHTML = '';

    if (products.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 50px; text-align: center; color: #64748b;">
                <p style="font-size: 15px; margin-bottom: 10px;">Không tìm thấy linh kiện nào phù hợp với bộ lọc hiện tại.</p>
                <button onclick="resetModalFilters()" style="padding: 6px 14px; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Đặt lại bộ lọc</button>
            </div>
        `;
        return;
    }

    products.forEach(p => {
        const item = document.createElement('div');
        item.className = 'modal-product-item';

        const priceNum = Number(p.price) || 0;
        const priceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum);
        const imgUrl = (p.images && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400';

        item.innerHTML = `
            <div class="modal-prod-left">
                <img src="${imgUrl}" alt="${p.name}" class="modal-prod-img">
                <div class="modal-prod-info">
                    <div class="modal-prod-title">${p.name}</div>
                    <div class="modal-prod-meta">
                        <span>Mã SP: ${p.sku || p.id}</span>
                        <span>Bảo hành: 36 tháng</span>
                        <span class="stock-ok">Kho hàng: Còn hàng</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div class="modal-prod-price">${priceVnd}</div>
                <button class="btn-add-to-build" onclick="selectComponentForBuild(${p.id})">
                    THÊM VÀO CẤU HÌNH &gt;
                </button>
            </div>
        `;

        listContainer.appendChild(item);
    });
}

// Chọn linh kiện đưa vào cấu hình
function selectComponentForBuild(productId) {
    const p = modalCategoryProducts.find(item => item.id === productId);
    if (!p || !activeModalComponentKey) return;

    selectedComponents[activeModalComponentKey] = {
        product: p,
        quantity: 1
    };

    closeModal();
    renderComponentRows();
}

// Xử lý Sự kiện Tìm kiếm & Sắp xếp trong Modal
function initModalEvents() {
    const searchInput = document.getElementById('modalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyModalFilters();
        });
    }
}

// POPUP XÁC NHẬN LÀM MỚI (Reset Confirmation Modal)
function openResetConfirmModal() {
    const modal = document.getElementById('resetConfirmModal');
    if (modal) modal.classList.add('open');
}

function closeResetConfirmModal() {
    const modal = document.getElementById('resetConfirmModal');
    if (modal) modal.classList.remove('open');
}

function confirmResetBuild() {
    selectedComponents = {};
    closeResetConfirmModal();
    renderComponentRows();
}

// Thêm toàn bộ cấu hình vào Giỏ hàng
function addBuildToCart() {
    const total = calculateTotalCost();
    if (total === 0) {
        alert('Vui lòng chọn ít nhất 1 linh kiện để thêm vào giỏ hàng!');
        return;
    }
    alert(`Đã thêm toàn bộ cấu hình PC (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}) vào giỏ hàng thành công!`);
}
