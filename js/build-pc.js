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
let currentModalProducts = [];

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

// MỞ POPUP MODAL CHỌN LINH KIỆN (Exact Match to Image 1)
async function openComponentModal(key) {
    activeModalComponentKey = key;
    const comp = COMPONENT_TYPES.find(c => c.key === key);
    if (!comp) return;

    document.getElementById('modalTitle').textContent = `CHỌN LINH KIỆN: ${comp.name.toUpperCase()}`;
    document.getElementById('modalSearchInput').value = '';

    const modal = document.getElementById('pcBuilderModal');
    modal.classList.add('open');

    // Gọi API lấy danh sách linh kiện
    await loadModalProducts(comp);
}

function closeModal() {
    const modal = document.getElementById('pcBuilderModal');
    if (modal) modal.classList.remove('open');
}

// Gọi API nạp sản phẩm cho Modal Chọn Linh Kiện
async function loadModalProducts(comp) {
    const listContainer = document.getElementById('modalProductList');
    listContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Đang nạp danh sách sản phẩm từ hệ thống...</div>';

    try {
        const res = await api.getProducts({ category: comp.catSlug, per_page: 250 });
        if (res.status === 'success' && res.data) {
            const allProducts = Array.isArray(res.data) ? res.data : (res.data.data || []);

            // Lọc theo từ khóa loại linh kiện
            currentModalProducts = allProducts.filter(p => {
                const name = (p.name || '').toLowerCase();
                const catSlug = (p.category_slug || (p.category ? (p.category.slug || '') : '')).toLowerCase();
                const brand = (p.brand || '').toLowerCase();

                if (comp.key === 'cpu') {
                    return (name.includes('vi xử lý') || name.includes('cpu') || name.includes('intel core') || name.includes('amd ryzen')) && !name.includes('mainboard');
                }
                if (comp.key === 'mainboard') {
                    return (name.includes('mainboard') || name.includes('bo mạch') || name.includes('z790') || name.includes('b760') || name.includes('b650'));
                }
                if (comp.key === 'ram') {
                    return (name.includes('ram') || name.includes('ddr4') || name.includes('ddr5'));
                }
                if (comp.key === 'ssd') {
                    return (name.includes('ssd') || name.includes('nvme') || name.includes('m.2'));
                }
                if (comp.key === 'vga') {
                    return (name.includes('card màn hình') || name.includes('rtx') || name.includes('gtx') || name.includes('vga') || name.includes('radeon'));
                }

                return name.includes(comp.filterKeyword) || catSlug.includes(comp.filterKeyword) || brand.includes(comp.filterKeyword);
            });

            // Nếu danh mục chưa có sản phẩm khớp trực tiếp, hiển thị danh sách chung
            if (currentModalProducts.length === 0) {
                currentModalProducts = allProducts;
            }

            renderModalProducts(currentModalProducts);
            return;
        }
    } catch (e) {
        console.error('Lỗi nạp linh kiện modal:', e);
    }

    listContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;">Không thể kết nối Server Backend.</div>';
}

function renderModalProducts(products) {
    const listContainer = document.getElementById('modalProductList');
    listContainer.innerHTML = '';

    if (products.length === 0) {
        listContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #94a3b8;">Không tìm thấy linh kiện nào phù hợp.</div>';
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
    const p = currentModalProducts.find(item => item.id === productId);
    if (!p || !activeModalComponentKey) return;

    selectedComponents[activeModalComponentKey] = {
        product: p,
        quantity: 1
    };

    closeModal();
    renderComponentRows();
}

// Xử lý Lọc & Tìm kiếm trong Modal
function initModalEvents() {
    const searchInput = document.getElementById('modalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                renderModalProducts(currentModalProducts);
                return;
            }
            const filtered = currentModalProducts.filter(p => (p.name || '').toLowerCase().includes(query) || (p.brand || '').toLowerCase().includes(query));
            renderModalProducts(filtered);
        });
    }

    const sortSelect = document.getElementById('modalSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortVal = e.target.value;
            if (sortVal === 'price-asc') {
                currentModalProducts.sort((a, b) => a.price - b.price);
            } else if (sortVal === 'price-desc') {
                currentModalProducts.sort((a, b) => b.price - a.price);
            } else {
                currentModalProducts.sort((a, b) => b.id - a.id);
            }
            renderModalProducts(currentModalProducts);
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
