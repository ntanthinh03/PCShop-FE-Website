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
        status: 'Đã giao thành công'
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
    document.querySelectorAll('.manage-tab-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu .nav-item').forEach(btn => btn.classList.remove('active'));

    const activePage = document.getElementById(tabId === 'overview' ? 'tabOverview' :
        tabId === 'orders' ? 'tabOrders' :
        tabId === 'products' ? 'tabProducts' :
        tabId === 'customers' ? 'tabCustomers' : 'tabWarranties');

    if (activePage) activePage.classList.add('active');
    if (btnElem) btnElem.classList.add('active');

    if (tabId === 'overview') {
        renderCharts();
    }
}

function initDashboardData() {
    syncLatestOrders();
    renderKPIs();
    renderOverviewOrdersTable();
    renderFullOrdersTable();
    renderProductsTable();
    renderCustomersTable();
    renderWarrantiesTable();
    renderCharts();
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
    const tbody = document.getElementById('fullOrdersTbody');
    if (!tbody) return;

    tbody.innerHTML = allManageOrders.map(ord => `
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
                <select class="status-select-action" onchange="updateOrderStatus('${ord.id}', this.value)">
                    <option value="Chờ xử lý" ${ord.status === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
                    <option value="Đã xác nhận" ${ord.status === 'Đã xác nhận' ? 'selected' : ''}>Đã xác nhận</option>
                    <option value="Đang giao hàng" ${ord.status === 'Đang giao hàng' ? 'selected' : ''}>Đang giao hàng</option>
                    <option value="Đã giao thành công" ${ord.status === 'Đã giao thành công' ? 'selected' : ''}>Đã giao thành công</option>
                    <option value="Đã hủy" ${ord.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const index = allManageOrders.findIndex(o => o.id === orderId);
    if (index > -1) {
        allManageOrders[index].status = newStatus;
        localStorage.setItem('pcshop_orders', JSON.stringify(allManageOrders));
        renderKPIs();
        renderOverviewOrdersTable();
        renderFullOrdersTable();
    }
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
                    <p><strong>Ghi chú:</strong> ${ord.note || 'Không có ghi chú'}</p>
                </div>
                <div class="info-block">
                    <h4><i class="fa-solid fa-credit-card"></i> THANH TOÁN & TRẠNG THÁI</h4>
                    <p><strong>Hình thức:</strong> ${ord.paymentMethod || 'COD'}</p>
                    <p><strong>Tổng tiền:</strong> <strong style="color:#0284c7; font-size:16px;">${ord.total}</strong></p>
                    <p><strong>Trạng thái hiện tại:</strong> <span class="status-pill ${getStatusClass(ord.status)}">${ord.status}</span></p>
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

function renderProductsTable() {
    const tbody = document.getElementById('manageProductsTbody');
    if (!tbody) return;

    if (typeof liveProducts !== 'undefined' && liveProducts.length > 0) {
        tbody.innerHTML = liveProducts.slice(0, 15).map(p => `
            <tr>
                <td><img src="${formatImageUrl(p.images)}" style="width:45px; height:45px; object-fit:cover; border-radius:6px;"></td>
                <td><code>${p.sku || 'SKU-001'}</code></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="brand-pill">${p.brand || 'PCShop'}</span></td>
                <td><strong style="color:#0284c7;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</strong></td>
                <td><span class="stock-badge">${p.stock_quantity || 15}</span></td>
                <td>
                    <button class="btn-table-action" onclick="alert('Tính năng chỉnh sửa sản phẩm #${p.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-table-action btn-danger" onclick="alert('Tính năng xóa sản phẩm #${p.id}')"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

function renderCustomersTable() {
    const tbody = document.getElementById('manageCustomersTbody');
    if (!tbody) return;

    const customers = [
        { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234567', address: 'Quận 1, TP.HCM', count: 3, spend: '46.248.000đ' },
        { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', phone: '0988777666', address: 'Quận 3, TP.HCM', count: 1, spend: '29.099.000đ' },
        { id: 3, name: 'Lê Hoàng Nam', email: 'nam.le@gmail.com', phone: '0933221100', address: 'Quận 7, TP.HCM', count: 2, spend: '18.500.000đ' },
    ];

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td>#CUST-${c.id}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.address}</td>
            <td><span class="badge-count">${c.count} đơn</span></td>
            <td><strong style="color:#0284c7;">${c.spend}</strong></td>
        </tr>
    `).join('');
}

function renderWarrantiesTable() {
    const tbody = document.getElementById('manageWarrantiesTbody');
    if (!tbody) return;

    tbody.innerHTML = allWarranties.map(w => `
        <tr>
            <td><strong>${w.id}</strong></td>
            <td>${w.customer}</td>
            <td>${w.product}</td>
            <td style="max-width:200px; font-size:12px; color:#ef4444;">${w.issue}</td>
            <td>${w.date}</td>
            <td><span class="status-pill status-shipping">${w.status}</span></td>
            <td>
                <button class="btn-table-action" onclick="alert('Cập nhật trạng thái bảo hành ${w.id}')"><i class="fa-solid fa-wrench"></i> Xử lý</button>
            </td>
        </tr>
    `).join('');
}

function openAddProductModal() {
    alert('Mở form Thêm Sản Phẩm Mới (Tính năng Quản Trị Admin)');
}

function openAddWarrantyModal() {
    alert('Mở form Tạo Phiếu Tiếp Nhận Bảo Hành Mới');
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
