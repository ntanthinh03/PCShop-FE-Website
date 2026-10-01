// JavaScript cho Dashboard Quản trị Nội bộ PCShop (manage.html)
let currentStaffUser = JSON.parse(localStorage.getItem('pcshop_manage_user')) || null;
let allManageOrders = JSON.parse(localStorage.getItem('pcshop_orders')) || [
    {
        id: 'ORD-2026-4574',
        date: '30/09/2026',
        items: ['1x Laptop Gaming Logitech ROG Strix V43 (RTX 4070 8GB)'],
        total: '29.099.000đ',
        rawTotal: 29099000,
        customerName: 'Nguyễn Tấn Thịnh',
        customerPhone: '0932262415',
        customerEmail: 'ntanthinh03@gmail.com',
        shippingAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
        paymentMethod: 'COD',
        status: 'Chờ xử lý'
    },
    {
        id: 'ORD-2026-9812',
        date: '28/09/2026',
        items: ['1x PC Gaming PCShop Ultra V198 (RTX 5070 Ti 16GB)', '1x Bàn Phím Cơ Gaming Akko Mod007'],
        total: '17.149.000đ',
        rawTotal: 17149000,
        customerName: 'Nguyễn Văn An',
        customerPhone: '0901234567',
        customerEmail: 'an.nguyen@gmail.com',
        shippingAddress: '123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
        paymentMethod: 'PAYOS',
        status: 'Đang giao hàng'
    }
];

let allWarranties = JSON.parse(localStorage.getItem('pcshop_warranties')) || [
    {
        id: 'BH-2026-001',
        customer: 'Trần Văn Cường (0912345678)',
        product: 'VGA ASUS RTX 4070 SUPER 12GB (Serial: SN4070S9912)',
        issue: 'Quạt kêu to khi chạy nặng, thi thoảng mất hình',
        date: '25/09/2026',
        status: 'Đang kiểm tra kỹ thuật'
    },
    {
        id: 'BH-2026-002',
        customer: 'Lê Hoàng Nam (0933221100)',
        product: 'Màn hình LG 27" 240Hz IPS Gaming',
        issue: 'Có 1 điểm chết trên màn hình',
        date: '29/09/2026',
        status: 'Đã đổi mới cho khách'
    }
];

let revenueChartInstance = null;
let categoryPieChartInstance = null;
let currentActiveTab = 'overview';

document.addEventListener('DOMContentLoaded', () => {
    checkManageAuth();
});

function checkManageAuth() {
    const overlay = document.getElementById('manageLoginOverlay');
    const layout = document.getElementById('manageAppLayout');

    if (!currentStaffUser) {
        if (overlay) overlay.style.display = 'flex';
        if (layout) layout.style.display = 'none';
    } else {
        if (overlay) overlay.style.display = 'none';
        if (layout) layout.style.display = 'flex';
        updateManageUserInfo();
        initDashboardData();
    }
}

function handleManageLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById('manageUsername')?.value.trim();
    const passVal = document.getElementById('managePassword')?.value.trim();
    const alertBox = document.getElementById('manageLoginAlert');

    if ((userVal === 'admin' || userVal === 'admin@pcshop.vn') && passVal === 'admin123') {
        currentStaffUser = { name: 'Quản Trị Viên (Admin)', username: 'admin', role: 'ADMIN' };
    } else if ((userVal === 'staff' || userVal === 'staff@pcshop.vn') && passVal === 'staff123') {
        currentStaffUser = { name: 'Nhân Viên Kỹ Thuật', username: 'staff', role: 'STAFF' };
    } else {
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Tên đăng nhập hoặc mật khẩu quản trị không chính xác!';
        }
        return;
    }

    localStorage.setItem('pcshop_manage_user', JSON.stringify(currentStaffUser));
    checkManageAuth();
}

function handleManageLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi Dashboard quản trị?')) {
        localStorage.removeItem('pcshop_manage_user');
        currentStaffUser = null;
        checkManageAuth();
    }
}

function updateManageUserInfo() {
    if (!currentStaffUser) return;
    const avatar = document.getElementById('sidebarAvatar');
    const name = document.getElementById('sidebarUserName');
    const role = document.getElementById('sidebarUserRole');

    if (avatar) avatar.textContent = currentStaffUser.name.charAt(0).toUpperCase();
    if (name) name.textContent = currentStaffUser.name;
    if (role) {
        role.textContent = currentStaffUser.role;
        role.className = currentStaffUser.role === 'ADMIN' ? 'role-pill-admin' : 'role-pill-staff';
    }
}

function switchManageTab(tabId, btnElem) {
    currentActiveTab = tabId;
    document.querySelectorAll('.manage-tab-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu .nav-item').forEach(btn => btn.classList.remove('active'));

    const activePage = document.getElementById(
        tabId === 'overview' ? 'tabOverview' :
        tabId === 'orders' ? 'tabOrders' :
        tabId === 'products' ? 'tabProducts' :
        tabId === 'customers' ? 'tabCustomers' : 'tabWarranties'
    );

    if (activePage) activePage.classList.add('active');
    if (btnElem) btnElem.classList.add('active');

    const searchWrap = document.getElementById('manageSearchWrap');
    const searchInput = document.getElementById('globalManageSearch');

    if (tabId === 'overview') {
        if (searchWrap) searchWrap.style.visibility = 'hidden';
        renderCharts();
    } else {
        if (searchWrap) searchWrap.style.visibility = 'visible';
        if (searchInput) {
            searchInput.value = '';
            searchInput.placeholder = 
                tabId === 'orders' ? 'Tìm mã đơn hàng, tên khách, số điện thoại...' :
                tabId === 'products' ? 'Tìm tên sản phẩm, mã SKU, hãng sản xuất...' :
                tabId === 'customers' ? 'Tìm tên khách hàng, email, số điện thoại...' :
                'Tìm mã phiếu BH, tên khách, sản phẩm...';
        }
    }
}

async function initDashboardData() {
    syncLatestOrders();
    await loadApiProductsIfNeeded();
    renderKPIs();
    renderOverviewOrdersTable();
    renderFullOrdersTable();
    renderProductsTable(null, 1);
    renderCustomersTable();
    renderWarrantiesTable();
    renderCharts();
    renderNotifications();
}

function syncLatestOrders() {
    const storedOrders = JSON.parse(localStorage.getItem('pcshop_orders')) || [];
    allManageOrders = storedOrders;
}

function renderKPIs() {
    let totalRev = 0;
    let pendingCount = 0;

    allManageOrders.forEach(ord => {
        if (ord.status !== 'Đã hủy') {
            const rawVal = ord.rawTotal || parsePriceString(ord.total);
            totalRev += rawVal;
        }
        if (ord.status === 'Chờ xử lý') {
            pendingCount++;
        }
    });

    const kpiRev = document.getElementById('kpiRevenue');
    const kpiTotalOrd = document.getElementById('kpiTotalOrders');
    const kpiCust = document.getElementById('kpiCustomers');
    const kpiWar = document.getElementById('kpiWarranties');
    const pendingBadge = document.getElementById('pendingOrdersCount');

    if (kpiRev) kpiRev.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRev);
    if (kpiTotalOrd) kpiTotalOrd.textContent = allManageOrders.length;
    if (kpiCust) kpiCust.textContent = Math.max(12, allManageOrders.length + 5);
    if (kpiWar) kpiWar.textContent = allWarranties.length;
    if (pendingBadge) pendingBadge.textContent = pendingCount;
}

function parsePriceString(str) {
    if (!str) return 0;
    return Number(String(str).replace(/[^\d]/g, '')) || 0;
}

function renderOverviewOrdersTable() {
    const tbody = document.getElementById('overviewRecentOrdersTbody');
    if (!tbody) return;

    const recent = allManageOrders.slice(0, 5);
    tbody.innerHTML = recent.map(ord => `
        <tr>
            <td><strong>#${ord.id}</strong></td>
            <td>${ord.customerName || 'Khách lẻ'}</td>
            <td>${ord.customerPhone || 'N/A'}</td>
            <td><strong style="color: #0284c7;">${ord.total}</strong></td>
            <td><span class="pay-badge-mini">${ord.paymentMethod || 'COD'}</span></td>
            <td><span class="status-pill ${getStatusClass(ord.status)}">${ord.status}</span></td>
            <td>
                <button class="btn-table-action" onclick="viewOrderDetail('${ord.id}')">
                    <i class="fa-solid fa-eye"></i> Xử lý
                </button>
            </td>
        </tr>
    `).join('');
}

function renderFullOrdersTable() {
    renderFullOrdersTableFiltered(allManageOrders);
}

function updateOrderStatus(orderId, newStatus) {
    const index = allManageOrders.findIndex(o => o.id === orderId);
    if (index === -1) return;

    const ord = allManageOrders[index];
    const oldStatus = ord.status;

    if (oldStatus === 'Đã giao thành công' && newStatus !== 'Đã giao thành công') {
        alert('Đơn hàng đã giao thành công không thể quay lại trạng thái cũ!');
        renderFullOrdersTable();
        return;
    }

    ord.status = newStatus;
    ord.updatedAt = new Date().toLocaleString('vi-VN');

    // Nút HỦY đơn: Cộng trả số lượng sản phẩm về kho
    if (newStatus === 'Đã hủy' && oldStatus !== 'Đã hủy') {
        restoreStockFromOrder(ord);
        alert(`Đã chuyển đơn hàng #${orderId} sang ĐÃ HỦY và hoàn số lượng sản phẩm về kho thành công!`);
    }

    localStorage.setItem('pcshop_orders', JSON.stringify(allManageOrders));
    renderKPIs();
    renderOverviewOrdersTable();
    renderFullOrdersTable();
    renderProductsTable(null, currentProdPage);
    renderNotifications();
}

function restoreStockFromOrder(ord) {
    if (!ord || !ord.items) return;
    let customProds = JSON.parse(localStorage.getItem('pcshop_custom_products')) || [];
    const allProds = getCombinedProducts();

    const itemsList = Array.isArray(ord.items) ? ord.items : [ord.items];
    itemsList.forEach(itemStr => {
        const match = itemStr.match(/^(\d+)x\s+(.+)$/);
        let qty = 1;
        let name = itemStr;
        if (match) {
            qty = parseInt(match[1]) || 1;
            name = match[2].trim();
        }

        const prod = allProds.find(p => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
        if (prod) {
            const customIdx = customProds.findIndex(cp => String(cp.id) === String(prod.id));
            if (customIdx > -1) {
                customProds[customIdx].stock_quantity = (customProds[customIdx].stock_quantity || 10) + qty;
            } else {
                customProds.push({
                    ...prod,
                    stock_quantity: (prod.stock_quantity || 10) + qty
                });
            }
        }
    });

    localStorage.setItem('pcshop_custom_products', JSON.stringify(customProds));
}

function getStatusClass(status) {
    switch (status) {
        case 'Chờ xử lý': return 'status-pending';
        case 'Đã xác nhận': return 'status-confirmed';
        case 'Đang giao hàng': return 'status-shipping';
        case 'Đã giao thành công': return 'status-success';
        case 'Đã hủy': return 'status-canceled';
        default: return 'status-pending';
    }
}

function viewOrderDetail(orderId) {
    const ord = allManageOrders.find(o => o.id === orderId);
    if (!ord) return;

    const modal = document.getElementById('orderDetailModal');
    const body = document.getElementById('orderDetailModalBody');
    const titleId = document.getElementById('modalOrderId');

    if (titleId) titleId.textContent = `#${ord.id}`;
    if (body) {
        body.innerHTML = `
            <div class="order-detail-grid">
                <div class="info-block">
                    <h4><i class="fa-solid fa-user"></i> THÔNG TIN KHÁCH HÀNG</h4>
                    <p><strong>Họ tên:</strong> ${ord.customerName || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> ${ord.customerPhone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${ord.customerEmail || 'N/A'}</p>
                    <p><strong>Địa chỉ giao:</strong> ${ord.shippingAddress || 'N/A'}</p>
                    <p><strong>Ngày tạo đơn:</strong> ${ord.date || 'N/A'}</p>
                </div>
                <div class="info-block">
                    <h4><i class="fa-solid fa-credit-card"></i> THANH TOÁN & TRẠNG THÁI</h4>
                    <p><strong>Hình thức:</strong> ${ord.paymentMethod || 'COD'}</p>
                    <p><strong>Tổng tiền:</strong> <strong style="color:#0284c7; font-size:16px;">${ord.total}</strong></p>
                    <p><strong>Trạng thái hiện tại:</strong> <span class="status-pill ${getStatusClass(ord.status)}">${ord.status}</span></p>
                    ${ord.updatedAt ? `<p><small style="color:#64748b;">Lần cuối cập nhật: ${ord.updatedAt}</small></p>` : ''}
                </div>
            </div>

            <h4 style="margin-top:20px; font-size:14px; font-weight:700;"><i class="fa-solid fa-box-open"></i> DANH SÁCH SẢN PHẨM ĐẶT HÀNG</h4>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-top:8px;">
                ${Array.isArray(ord.items) ? ord.items.map(it => `<div style="padding:6px 0; border-bottom:1px dashed #cbd5e1; font-weight:600;">• ${it}</div>`).join('') : ord.items}
            </div>

            <div style="margin-top:24px; text-align:right;">
                <button class="btn-primary-blue" onclick="closeManageModal('orderDetailModal')">Đóng cửa sổ</button>
            </div>
        `;
    }

    if (modal) modal.classList.add('open');
}

function closeManageModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
}

let manageProductsList = [
    { id: 'PROD-001', name: 'PC Gaming PCShop Ultra V198 (RTX 5070 Ti 16GB)', sku: 'SKU-ULTRA-01', brand: 'PCShop', category_name: 'PC Gaming', price: 17149000, stock_quantity: 12, images: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500' },
    { id: 'PROD-002', name: 'Laptop Gaming Logitech ROG Strix V43 (RTX 4070 8GB)', sku: 'SKU-ROG-V43', brand: 'ASUS', category_name: 'Laptop Gaming', price: 29099000, stock_quantity: 8, images: 'https://images.unsplash.com/photo-1593640408182-31c228f8a9e3?w=500' },
    { id: 'PROD-003', name: 'VGA ASUS ROG Strix GeForce RTX 4070 SUPER 12GB', sku: 'SKU-VGA-4070S', brand: 'ASUS', category_name: 'VGA - Card Màn Hình', price: 18990000, stock_quantity: 3, images: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500' },
    { id: 'PROD-004', name: 'Màn hình Gaming LG UltraGear 27 inch 240Hz IPS', sku: 'SKU-MON-LG27', brand: 'LG', category_name: 'Màn Hình Gaming', price: 6890000, stock_quantity: 20, images: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },
    { id: 'PROD-005', name: 'Bàn Phím Cơ Gaming Akko Mod007 v3 VIA RGB', sku: 'SKU-GEAR-AKKO', brand: 'Akko', category_name: 'Bàn Phím & Chuột', price: 2490000, stock_quantity: 35, images: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' }
];

async function loadApiProductsIfNeeded() {
    try {
        if (typeof api !== 'undefined' && api.getProducts) {
            const res = await api.getProducts({ per_page: 100 });
            if (res && res.status === 'success' && res.data) {
                const apiData = Array.isArray(res.data) ? res.data : (res.data.data || []);
                if (apiData.length > 0) {
                    manageProductsList = apiData;
                }
            }
        }
    } catch (e) {
        console.log('API call fallback to local products list');
    }
}

function getCombinedProducts() {
    let baseList = [...manageProductsList];
    const customProds = JSON.parse(localStorage.getItem('pcshop_custom_products')) || [];

    customProds.forEach(cp => {
        const idx = baseList.findIndex(p => String(p.id) === String(cp.id));
        if (idx > -1) {
            baseList[idx] = cp;
        } else {
            baseList.unshift(cp);
        }
    });

    const deletedIds = JSON.parse(localStorage.getItem('pcshop_deleted_product_ids')) || [];
    return baseList.filter(p => !deletedIds.includes(String(p.id)) && !deletedIds.includes(Number(p.id)));
}

let currentProdPage = 1;
const PRODS_PER_PAGE = 10;

function renderProductsTable(productsToRender = null, page = 1) {
    const tbody = document.getElementById('manageProductsTbody');
    if (!tbody) return;

    currentProdPage = page;
    const fullList = productsToRender || getCombinedProducts();
    const totalProds = fullList.length;

    if (totalProds === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">Không tìm thấy sản phẩm nào trong hệ thống kho.</td></tr>`;
        renderPaginationControls(0, 0, 0, fullList);
        return;
    }

    const totalPages = Math.ceil(totalProds / PRODS_PER_PAGE);
    if (currentProdPage > totalPages) currentProdPage = totalPages;

    const startIndex = (currentProdPage - 1) * PRODS_PER_PAGE;
    const endIndex = Math.min(startIndex + PRODS_PER_PAGE, totalProds);
    const paginatedList = fullList.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedList.map(p => `
        <tr>
            <td><img src="${formatImageUrl(p.images)}" style="width:45px; height:45px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;"></td>
            <td><code>${p.sku || ('SKU-' + p.id)}</code></td>
            <td><strong>${p.name}</strong><br><small style="color:#64748b;">${p.category_name || (p.category ? (p.category.name || p.category) : 'Linh Kiện')}</small></td>
            <td><span class="brand-pill">${p.brand || 'PCShop'}</span></td>
            <td><strong style="color:#0284c7;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</strong></td>
            <td><span class="stock-badge ${ (p.stock_quantity ?? p.stock ?? 10) <= 5 ? 'stock-low' : ''}">${p.stock_quantity ?? p.stock ?? 10}</span></td>
            <td>
                <button class="btn-table-action" onclick="editProduct('${p.id}')" title="Chỉnh sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-table-action btn-danger" onclick="deleteProduct('${p.id}')" title="Xóa"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>
    `).join('');

    renderPaginationControls(startIndex + 1, endIndex, totalProds, fullList);
}

function renderPaginationControls(start, end, total, fullList) {
    const info = document.getElementById('prodPaginationInfo');
    const btns = document.getElementById('prodPaginationBtns');
    if (!info || !btns) return;

    if (total === 0) {
        info.textContent = 'Chưa có sản phẩm';
        btns.innerHTML = '';
        return;
    }

    info.textContent = `Hiển thị ${start}-${end} trên tổng ${total} sản phẩm`;
    const totalPages = Math.ceil(total / PRODS_PER_PAGE);

    let btnsHtml = `
        <button class="page-btn" ${currentProdPage === 1 ? 'disabled' : ''} onclick="changeProdPage(${currentProdPage - 1})">‹ Trước</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        btnsHtml += `
            <button class="page-btn ${i === currentProdPage ? 'active' : ''}" onclick="changeProdPage(${i})">${i}</button>
        `;
    }

    btnsHtml += `
        <button class="page-btn" ${currentProdPage === totalPages ? 'disabled' : ''} onclick="changeProdPage(${currentProdPage + 1})">Sau ›</button>
    `;

    btns.innerHTML = btnsHtml;
    window._lastProdListForPagination = fullList;
}

function changeProdPage(page) {
    renderProductsTable(window._lastProdListForPagination, page);
}

function openAddProductModal() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    document.getElementById('prodEditId').value = '';
    document.getElementById('productModalTitle').innerHTML = '<i class="fa-solid fa-box-open"></i> Thêm Sản Phẩm Mới';
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.add('open');
}

function editProduct(productId) {
    const list = getCombinedProducts();
    const prod = list.find(p => String(p.id) === String(productId));
    if (!prod) return;

    document.getElementById('prodEditId').value = prod.id;
    document.getElementById('prodName').value = prod.name || '';
    document.getElementById('prodSku').value = prod.sku || '';
    document.getElementById('prodBrand').value = prod.brand || '';
    document.getElementById('prodCategory').value = prod.category_name || (prod.category ? (prod.category.name || prod.category) : 'PC Gaming');
    document.getElementById('prodPrice').value = prod.price || 0;
    document.getElementById('prodStock').value = prod.stock_quantity ?? prod.stock ?? 10;
    document.getElementById('prodImage').value = formatImageUrl(prod.images) || '';

    document.getElementById('productModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Chỉnh Sửa Sản Phẩm';
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.add('open');
}

function saveProduct(e) {
    e.preventDefault();
    const editId = document.getElementById('prodEditId').value.trim();
    const name = document.getElementById('prodName').value.trim();
    const sku = document.getElementById('prodSku').value.trim() || ('SKU-' + Math.floor(1000 + Math.random() * 9000));
    const brand = document.getElementById('prodBrand').value.trim() || 'PCShop';
    const category = document.getElementById('prodCategory').value;
    const price = Number(document.getElementById('prodPrice').value) || 0;
    const stock = Number(document.getElementById('prodStock').value) || 0;
    const image = document.getElementById('prodImage').value.trim() || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500';

    let customProds = JSON.parse(localStorage.getItem('pcshop_custom_products')) || [];

    if (editId) {
        const idx = customProds.findIndex(p => String(p.id) === String(editId));
        const updatedItem = {
            id: editId,
            name,
            sku,
            brand,
            category_name: category,
            price,
            stock_quantity: stock,
            images: image
        };

        if (idx > -1) {
            customProds[idx] = updatedItem;
        } else {
            customProds.push(updatedItem);
        }
    } else {
        const newItem = {
            id: 'PROD-NEW-' + Date.now(),
            name,
            sku,
            brand,
            category_name: category,
            price,
            stock_quantity: stock,
            images: image
        };
        customProds.unshift(newItem);
    }

    localStorage.setItem('pcshop_custom_products', JSON.stringify(customProds));
    renderProductsTable(null, currentProdPage);
    renderNotifications();
    closeManageModal('productModal');
    alert(editId ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm mới vào kho thành công!');
}

function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho hàng?')) return;

    let deletedIds = JSON.parse(localStorage.getItem('pcshop_deleted_product_ids')) || [];
    if (!deletedIds.includes(String(productId))) {
        deletedIds.push(String(productId));
        localStorage.setItem('pcshop_deleted_product_ids', JSON.stringify(deletedIds));
    }

    let customProds = JSON.parse(localStorage.getItem('pcshop_custom_products')) || [];
    customProds = customProds.filter(p => String(p.id) !== String(productId));
    localStorage.setItem('pcshop_custom_products', JSON.stringify(customProds));

    renderProductsTable(null, currentProdPage);
    renderNotifications();
}

function renderCustomersTable(customersToRender = null) {
    const tbody = document.getElementById('manageCustomersTbody');
    if (!tbody) return;

    const defaultCustomers = [
        { id: 1, name: 'Nguyễn Tấn Thịnh', email: 'ntanthinh03@gmail.com', phone: '0932262415', address: '456 Lê Văn Sỹ, Quận 3, TP.HCM' },
        { id: 2, name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', address: '123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM' },
        { id: 3, name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', phone: '0988777666', address: '789 Phạm Văn Đồng, TP. Thủ Đức, TP.HCM' },
        { id: 4, name: 'Lê Hoàng Nam', email: 'nam.le@gmail.com', phone: '0933221100', address: '12 Nguyễn Thị Thập, Quận 7, TP.HCM' }
    ];

    const list = customersToRender || defaultCustomers;

    tbody.innerHTML = list.map(c => {
        const custOrders = allManageOrders.filter(o => 
            (o.customerEmail && o.customerEmail.toLowerCase() === c.email.toLowerCase()) ||
            (o.customerName && o.customerName.toLowerCase() === c.name.toLowerCase()) ||
            (o.customerPhone && o.customerPhone === c.phone)
        );

        let totalSpend = 0;
        custOrders.forEach(o => {
            if (o.status !== 'Đã hủy') {
                totalSpend += (o.rawTotal || parsePriceString(o.total));
            }
        });

        const formattedSpend = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpend);

        return `
            <tr>
                <td>#CUST-${c.id}</td>
                <td><strong><a class="customer-name-link" onclick="viewCustomerHistory('${c.email}', '${c.name}', '${c.phone}')">${c.name}</a></strong></td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.address}</td>
                <td><span class="badge-count">${custOrders.length} đơn</span></td>
                <td><strong style="color:#0284c7;">${formattedSpend}</strong></td>
                <td>
                    <button class="btn-table-action" onclick="viewCustomerHistory('${c.email}', '${c.name}', '${c.phone}')">
                        <i class="fa-solid fa-clock-rotate-left"></i> Xem lịch sử mua
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewCustomerHistory(email, name, phone) {
    const modal = document.getElementById('customerDetailModal');
    const body = document.getElementById('customerDetailModalBody');
    const nameElem = document.getElementById('custModalName');

    if (nameElem) nameElem.textContent = `- ${name}`;

    const custOrders = allManageOrders.filter(o => 
        (o.customerEmail && o.customerEmail.toLowerCase() === (email||'').toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase() === (name||'').toLowerCase()) ||
        (o.customerPhone && o.customerPhone === phone)
    );

    if (body) {
        if (custOrders.length === 0) {
            body.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #94a3b8;">
                    <i class="fa-solid fa-receipt" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>Khách hàng <strong>${name}</strong> chưa có đơn hàng nào trong hệ thống.</p>
                </div>
            `;
        } else {
            let totalSpend = 0;
            custOrders.forEach(o => { if (o.status !== 'Đã hủy') totalSpend += (o.rawTotal || parsePriceString(o.total)); });

            body.innerHTML = `
                <div class="customer-info-box">
                    <div><strong>Họ tên:</strong> ${name}</div>
                    <div><strong>Email:</strong> ${email || 'N/A'}</div>
                    <div><strong>Số điện thoại:</strong> ${phone || 'N/A'}</div>
                    <div><strong>Tổng chi tiêu:</strong> <strong style="color:#0284c7;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpend)}</strong> (${custOrders.length} đơn)</div>
                </div>

                <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 10px; color: #0f172a;"><i class="fa-solid fa-box"></i> DANH SÁCH ĐƠN HÀNG ĐÃ ĐẶT</h4>

                <div class="table-responsive">
                    <table class="manage-table">
                        <thead>
                            <tr>
                                <th>Mã Đơn</th>
                                <th>Ngày Đặt</th>
                                <th>Sản Phẩm Mua</th>
                                <th>Tổng Tiền</th>
                                <th>Thanh Toán</th>
                                <th>Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${custOrders.map(o => `
                                <tr>
                                    <td><strong>#${o.id}</strong></td>
                                    <td>${o.date || 'N/A'}</td>
                                    <td>${Array.isArray(o.items) ? o.items.join('<br>') : o.items}</td>
                                    <td><strong style="color:#0284c7;">${o.total}</strong></td>
                                    <td><span class="pay-badge-mini">${o.paymentMethod || 'COD'}</span></td>
                                    <td><span class="status-pill ${getStatusClass(o.status)}">${o.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    if (modal) modal.classList.add('open');
}

let activeWarrantySubtab = 'all';

function switchWarrantySubtab(subtab, btnElem) {
    activeWarrantySubtab = subtab;
    document.querySelectorAll('.warranty-subtab').forEach(b => b.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');
    renderWarrantiesTable();
}

function renderWarrantiesTable(warrantiesToRender = null) {
    const tbody = document.getElementById('manageWarrantiesTbody');
    if (!tbody) return;

    let list = warrantiesToRender || allWarranties;

    // Update subtab counts
    const countAll = allWarranties.length;
    const countPending = allWarranties.filter(w => w.status.includes('kiểm tra') || w.status.includes('Tiếp nhận')).length;
    const countSending = allWarranties.filter(w => w.status.includes('gửi hãng')).length;
    const countRepairing = allWarranties.filter(w => w.status.includes('sửa chữa')).length;
    const countCompleted = allWarranties.filter(w => w.status.includes('đổi mới') || w.status.includes('thành công') || w.status.includes('hoàn thành')).length;

    if (document.getElementById('warCountAll')) document.getElementById('warCountAll').textContent = countAll;
    if (document.getElementById('warCountPending')) document.getElementById('warCountPending').textContent = countPending;
    if (document.getElementById('warCountSending')) document.getElementById('warCountSending').textContent = countSending;
    if (document.getElementById('warCountRepairing')) document.getElementById('warCountRepairing').textContent = countRepairing;
    if (document.getElementById('warCountCompleted')) document.getElementById('warCountCompleted').textContent = countCompleted;

    // Filter by active subtab
    if (!warrantiesToRender) {
        if (activeWarrantySubtab === 'pending') {
            list = allWarranties.filter(w => w.status.includes('kiểm tra') || w.status.includes('Tiếp nhận'));
        } else if (activeWarrantySubtab === 'sending') {
            list = allWarranties.filter(w => w.status.includes('gửi hãng'));
        } else if (activeWarrantySubtab === 'repairing') {
            list = allWarranties.filter(w => w.status.includes('sửa chữa'));
        } else if (activeWarrantySubtab === 'completed') {
            list = allWarranties.filter(w => w.status.includes('đổi mới') || w.status.includes('thành công') || w.status.includes('hoàn thành'));
        }
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">Không có phiếu bảo hành nào ở danh mục này.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(w => `
        <tr>
            <td><strong><a class="customer-name-link" onclick="viewWarrantyDetail('${w.id}')">${w.id}</a></strong></td>
            <td>${w.customer}</td>
            <td><strong>${w.product}</strong></td>
            <td style="max-width:200px; font-size:12px; color:#ef4444;">${w.issue}</td>
            <td>${w.date}</td>
            <td><span class="status-pill status-shipping">${w.status}</span></td>
            <td>
                <button class="btn-table-action" onclick="viewWarrantyDetail('${w.id}')" title="Chi tiết"><i class="fa-solid fa-eye"></i> Chi tiết</button>
                <button class="btn-table-action" onclick="changeWarrantyStatus('${w.id}')" title="Đổi trạng thái"><i class="fa-solid fa-wrench"></i> Xử lý</button>
            </td>
        </tr>
    `).join('');
}

function viewWarrantyDetail(warrantyId) {
    const war = allWarranties.find(w => w.id === warrantyId);
    if (!war) return;

    const modal = document.getElementById('warrantyDetailModal');
    const body = document.getElementById('warrantyDetailModalBody');
    const warModalId = document.getElementById('warModalId');

    if (warModalId) warModalId.textContent = `#${war.id}`;

    if (body) {
        body.innerHTML = `
            <div class="order-detail-grid">
                <div class="info-block">
                    <h4><i class="fa-solid fa-user"></i> THÔNG TIN KHÁCH HÀNG</h4>
                    <p><strong>Khách hàng:</strong> ${war.customer}</p>
                    <p><strong>Ngày tiếp nhận:</strong> ${war.date}</p>
                    <p><strong>Trạng thái xử lý:</strong> <span class="status-pill status-shipping">${war.status}</span></p>
                </div>
                <div class="info-block">
                    <h4><i class="fa-solid fa-desktop"></i> THÔNG TIN SẢN PHẨM BẢO HÀNH</h4>
                    <p><strong>Tên sản phẩm & Serial:</strong> ${war.product}</p>
                    <p><strong>Mô tả lỗi:</strong> <span style="color:#ef4444; font-weight:600;">${war.issue}</span></p>
                </div>
            </div>

            <div style="margin-top:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px;">
                <h4 style="font-size:12.5px; color:#0284c7; font-weight:700; margin-bottom:8px;"><i class="fa-solid fa-clipboard-check"></i> LỊCH SỬ XỬ LÝ KỸ THUẬT</h4>
                <p style="font-size:13px; color:#334155;">- Ngày ${war.date}: Tiếp nhận thiết bị từ khách hàng. Ghi nhận mô tả: "${war.issue}".</p>
                <p style="font-size:13px; color:#334155;">- Trạng thái kỹ thuật hiện tại: <strong>${war.status}</strong></p>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
                <button class="btn-primary-blue" onclick="changeWarrantyStatus('${war.id}'); closeManageModal('warrantyDetailModal');"><i class="fa-solid fa-wrench"></i> Cập Nhật Trạng Thái</button>
                <button class="btn-secondary" onclick="closeManageModal('warrantyDetailModal')">Đóng cửa sổ</button>
            </div>
        `;
    }

    if (modal) modal.classList.add('open');
}

function openAddWarrantyModal() {
    const form = document.getElementById('warrantyForm');
    if (form) form.reset();
    const modal = document.getElementById('warrantyModal');
    if (modal) modal.classList.add('open');
}

function saveWarranty(e) {
    e.preventDefault();
    const customer = document.getElementById('warCustomer').value.trim();
    const product = document.getElementById('warProduct').value.trim();
    const issue = document.getElementById('warIssue').value.trim();
    const status = document.getElementById('warStatus').value;

    const newWar = {
        id: 'BH-' + new Date().getFullYear() + '-' + String(allWarranties.length + 1).padStart(3, '0'),
        customer,
        product,
        issue,
        date: new Date().toLocaleDateString('vi-VN'),
        status
    };

    allWarranties.unshift(newWar);
    localStorage.setItem('pcshop_warranties', JSON.stringify(allWarranties));

    renderWarrantiesTable();
    renderKPIs();
    renderNotifications();
    closeManageModal('warrantyModal');
    alert('Tạo phiếu tiếp nhận bảo hành mới thành công!');
}

function changeWarrantyStatus(warrantyId) {
    const war = allWarranties.find(w => w.id === warrantyId);
    if (!war) return;

    const statuses = [
        'Đang kiểm tra kỹ thuật',
        'Đang gửi hãng bảo hành',
        'Đã sửa chữa thành công',
        'Đã đổi mới cho khách',
        'Từ chối bảo hành'
    ];

    const input = prompt(
        `Cập nhật trạng thái cho phiếu #${warrantyId}:\n1. Đang kiểm tra kỹ thuật\n2. Đang gửi hãng bảo hành\n3. Đã sửa chữa thành công\n4. Đã đổi mới cho khách\n5. Từ chối bảo hành\n\nNhập số tương ứng (1-5):`,
        "1"
    );

    if (input && Number(input) >= 1 && Number(input) <= 5) {
        war.status = statuses[Number(input) - 1];
        localStorage.setItem('pcshop_warranties', JSON.stringify(allWarranties));
        renderWarrantiesTable();
        renderKPIs();
        renderNotifications();
    }
}

function filterOrdersTable() {
    const select = document.getElementById('orderStatusFilter');
    if (!select) return;
    const val = select.value;

    if (val === 'all') {
        renderFullOrdersTable();
    } else {
        const filtered = allManageOrders.filter(o => o.status === val);
        renderFullOrdersTableFiltered(filtered);
    }
}

function renderFullOrdersTableFiltered(ordersList) {
    const tbody = document.getElementById('fullOrdersTbody');
    if (!tbody) return;

    if (ordersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#94a3b8;">Không tìm thấy đơn hàng nào ở trạng thái này.</td></tr>`;
        return;
    }

    tbody.innerHTML = ordersList.map(ord => {
        const isSuccess = ord.status === 'Đã giao thành công';
        return `
            <tr>
                <td><strong>#${ord.id}</strong></td>
                <td>${ord.date || '30/09/2026'}</td>
                <td>
                    <strong>${ord.customerName || 'Khách chưa đăng nhập'}</strong><br>
                    <small style="color:#64748b;">📞 ${ord.customerPhone || 'N/A'} | ✉️ ${ord.customerEmail || 'N/A'}</small>
                </td>
                <td style="max-width:200px; font-size:12px;">${ord.shippingAddress || 'Nhận tại Showroom'}</td>
                <td style="max-width:220px; font-size:12.5px;">${Array.isArray(ord.items) ? ord.items.join('<br>') : ord.items}</td>
                <td><strong style="color: #0284c7; font-size:14px;">${ord.total}</strong></td>
                <td><span class="pay-badge-mini">${ord.paymentMethod || 'COD'}</span></td>
                <td><span class="status-pill ${getStatusClass(ord.status)}">${ord.status}</span></td>
                <td>
                    <select class="status-select-action" onchange="updateOrderStatus('${ord.id}', this.value)" ${isSuccess ? 'disabled style="opacity:0.7; cursor:not-allowed;"' : ''}>
                        <option value="Chờ xử lý" ${ord.status === 'Chờ xử lý' ? 'selected' : ''} ${isSuccess ? 'disabled' : ''}>Chờ xử lý</option>
                        <option value="Đã xác nhận" ${ord.status === 'Đã xác nhận' ? 'selected' : ''} ${isSuccess ? 'disabled' : ''}>Đã xác nhận</option>
                        <option value="Đang giao hàng" ${ord.status === 'Đang giao hàng' ? 'selected' : ''} ${isSuccess ? 'disabled' : ''}>Đang giao hàng</option>
                        <option value="Đã giao thành công" ${ord.status === 'Đã giao thành công' ? 'selected' : ''}>Đã giao thành công</option>
                        <option value="Đã hủy" ${ord.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

function renderNotifications() {
    const badge = document.getElementById('notiBadgeCount');
    const headerCount = document.getElementById('notiHeaderCount');
    const body = document.getElementById('notiDropdownBody');
    if (!body) return;

    let notifications = [];

    // 1. Pending orders
    allManageOrders.forEach(ord => {
        if (ord.status === 'Chờ xử lý') {
            notifications.push({
                type: 'order',
                title: `Đơn hàng mới #${ord.id}`,
                desc: `Khách: <strong>${ord.customerName || 'Khách lẻ'}</strong> - ${ord.total}`,
                time: ord.date || 'Gần đây',
                action: () => { switchManageTab('orders'); viewOrderDetail(ord.id); }
            });
        }
    });

    // 2. Low stock products (<= 5)
    const allProds = getCombinedProducts();
    allProds.forEach(p => {
        const stock = p.stock_quantity ?? p.stock ?? 10;
        if (stock <= 5) {
            notifications.push({
                type: 'stock',
                title: `⚠️ Cảnh báo tồn kho thấp`,
                desc: `Sản phẩm <strong>${p.name}</strong> chỉ còn ${stock} món trong kho!`,
                time: 'Cần nhập thêm',
                action: () => { switchManageTab('products'); editProduct(p.id); }
            });
        }
    });

    if (badge) {
        if (notifications.length > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = notifications.length;
        } else {
            badge.style.display = 'none';
        }
    }

    if (headerCount) {
        headerCount.textContent = `${notifications.length} tin mới`;
    }

    if (notifications.length === 0) {
        body.innerHTML = `<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;">Không có thông báo mới nào.</div>`;
        return;
    }

    body.innerHTML = notifications.map((n, idx) => `
        <div class="noti-item unread" onclick="handleNotificationClick(${idx})">
            <div class="noti-icon-box ${n.type === 'order' ? 'noti-icon-order' : 'noti-icon-stock'}">
                <i class="fa-solid ${n.type === 'order' ? 'fa-cart-shopping' : 'fa-triangle-exclamation'}"></i>
            </div>
            <div class="noti-content">
                <div><strong>${n.title}</strong></div>
                <div>${n.desc}</div>
                <div class="noti-time"><i class="fa-regular fa-clock"></i> ${n.time}</div>
            </div>
        </div>
    `).join('');

    window._currentNotis = notifications;
}

function handleNotificationClick(idx) {
    if (window._currentNotis && window._currentNotis[idx]) {
        window._currentNotis[idx].action();
        const dropdown = document.getElementById('notiDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
}

function toggleNotificationDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notiDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.noti-bell-wrap')) {
        const dropdown = document.getElementById('notiDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});

function filterManageGlobal(query) {
    const q = (query || '').toLowerCase().trim();

    if (currentActiveTab === 'orders') {
        if (!q) {
            renderFullOrdersTable();
        } else {
            const filtered = allManageOrders.filter(o => 
                (o.id || '').toLowerCase().includes(q) ||
                (o.customerName || '').toLowerCase().includes(q) ||
                (o.customerPhone || '').toLowerCase().includes(q) ||
                (o.shippingAddress || '').toLowerCase().includes(q)
            );
            renderFullOrdersTableFiltered(filtered);
        }
    } else if (currentActiveTab === 'products') {
        const allProds = getCombinedProducts();
        if (!q) {
            renderProductsTable(allProds, 1);
        } else {
            const filtered = allProds.filter(p =>
                (p.name || '').toLowerCase().includes(q) ||
                (p.sku || '').toLowerCase().includes(q) ||
                (p.brand || '').toLowerCase().includes(q)
            );
            renderProductsTable(filtered, 1);
        }
    } else if (currentActiveTab === 'customers') {
        const defaultCustomers = [
            { id: 1, name: 'Nguyễn Tấn Thịnh', email: 'ntanthinh03@gmail.com', phone: '0932262415', address: '456 Lê Văn Sỹ, Quận 3, TP.HCM' },
            { id: 2, name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', address: '123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM' },
            { id: 3, name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', phone: '0988777666', address: '789 Phạm Văn Đồng, TP. Thủ Đức, TP.HCM' },
            { id: 4, name: 'Lê Hoàng Nam', email: 'nam.le@gmail.com', phone: '0933221100', address: '12 Nguyễn Thị Thập, Quận 7, TP.HCM' }
        ];
        if (!q) {
            renderCustomersTable(defaultCustomers);
        } else {
            const filtered = defaultCustomers.filter(c => 
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.phone.includes(q)
            );
            renderCustomersTable(filtered);
        }
    } else if (currentActiveTab === 'warranties') {
        if (!q) {
            renderWarrantiesTable();
        } else {
            const filtered = allWarranties.filter(w =>
                (w.id || '').toLowerCase().includes(q) ||
                (w.customer || '').toLowerCase().includes(q) ||
                (w.product || '').toLowerCase().includes(q)
            );
            renderWarrantiesTable(filtered);
        }
    }
}

function renderCharts() {
    const ctxRevenue = document.getElementById('revenueChart');
    const ctxPie = document.getElementById('categoryPieChart');

    if (ctxRevenue) {
        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(ctxRevenue, {
            type: 'bar',
            data: {
                labels: ['Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Hôm nay'],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: [15000000, 28000000, 45000000, 32000000, 22000000, 38000000, 46248000],
                    backgroundColor: '#0284c7',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    if (ctxPie) {
        if (categoryPieChartInstance) categoryPieChartInstance.destroy();
        categoryPieChartInstance = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['PC Gaming', 'Laptop Gaming', 'VGA & CPU', 'Màn Hình', 'Phụ Kiện Gear'],
                datasets: [{
                    data: [40, 25, 20, 10, 5],
                    backgroundColor: ['#0284c7', '#2563eb', '#38bdf8', '#60a5fa', '#93c5fd']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}
