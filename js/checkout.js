// JavaScript cho trang Thanh toán Checkout 3 bước (checkout.html)
let currentCheckoutStep = 1;

document.addEventListener('DOMContentLoaded', () => {
    initCheckoutPage();
});

function initCheckoutPage() {
    renderCheckoutCartList();
    updateCheckoutSummary();
    prefillUserData();
    switchCheckoutStep(1);
}

function prefillUserData() {
    const user = JSON.parse(localStorage.getItem('pcshop_user')) || null;
    if (user) {
        const nameInput = document.getElementById('custName');
        const emailInput = document.getElementById('custEmail');
        if (nameInput && user.name) nameInput.value = user.name;
        if (emailInput && user.email) emailInput.value = user.email;
    }
}

function switchCheckoutStep(step) {
    if (step < 1 || step > 3) return;

    if (step > 1 && cartItems.length === 0) {
        alert('Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.');
        window.location.href = 'index.html';
        return;
    }

    currentCheckoutStep = step;

    // Toggle panels
    for (let i = 1; i <= 3; i++) {
        const panel = document.getElementById(`stepPanel${i}`);
        const indicator = document.getElementById(`stepIndicator${i}`);
        const line = document.getElementById(`stepLine${i}`);

        if (panel) {
            panel.style.display = i === step ? 'block' : 'none';
        }

        if (indicator) {
            if (i <= step) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }

        if (line) {
            if (i < step) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        }
    }

    // Update main summary action button text
    const btnMainAction = document.getElementById('btnMainSummaryAction');
    if (btnMainAction) {
        if (step === 1) {
            btnMainAction.textContent = 'TIẾP THEO ›';
        } else if (step === 2) {
            btnMainAction.textContent = 'TIẾP THEO ›';
        } else if (step === 3) {
            btnMainAction.textContent = 'ĐẶT MUA HÀNG';
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSummaryMainAction() {
    if (currentCheckoutStep === 1) {
        switchCheckoutStep(2);
    } else if (currentCheckoutStep === 2) {
        const form = document.getElementById('shippingForm');
        if (form && form.checkValidity()) {
            switchCheckoutStep(3);
        } else if (form) {
            form.reportValidity();
        }
    } else if (currentCheckoutStep === 3) {
        submitFinalOrder();
    }
}

function renderCheckoutCartList() {
    const container = document.getElementById('checkoutCartItemsList');
    const countElem = document.getElementById('step1ProductCount');

    if (!container) return;

    const totalQty = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (countElem) countElem.textContent = totalQty;

    if (cartItems.length === 0) {
        container.innerHTML = `
            <div style="padding: 48px; text-align: center; color: #64748b;">
                <div style="font-size: 48px; margin-bottom: 12px;">🛒</div>
                <p style="font-size: 15px; font-weight: 600;">Giỏ hàng của bạn đang trống</p>
                <a href="index.html" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700;">Quay lại mua sắm</a>
            </div>
        `;
        return;
    }

    container.innerHTML = cartItems.map((item, idx) => {
        const itemPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price);
        const itemSubtotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.price || 0) * (item.qty || 1));
        const img = item.image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100';

        return `
            <div class="checkout-item-row">
                <input type="checkbox" checked onchange="updateCheckoutSummary()">
                <img src="${img}" alt="${item.name}" class="checkout-item-thumb">
                <div class="checkout-item-info">
                    <h4 class="checkout-item-name" title="${item.name}">${item.name}</h4>
                    <span class="checkout-item-warranty"><i class="fa-solid fa-shield-halved"></i> Bảo hành: 24 tháng chính hãng</span>
                    <span class="checkout-item-gift">[Tặng kèm] Chuột Silent + Balo PCShop Cao Cấp</span>
                </div>
                <div class="checkout-item-price-unit">${itemPrice}</div>
                <div class="checkout-item-qty">
                    <button onclick="changeCheckoutItemQty(${idx}, -1)">-</button>
                    <span>${item.qty || 1}</span>
                    <button onclick="changeCheckoutItemQty(${idx}, 1)">+</button>
                </div>
                <div class="checkout-item-subtotal">${itemSubtotal}</div>
                <button class="btn-delete-checkout-item" onclick="removeCheckoutItem(${idx})" title="Xóa khỏi đơn hàng">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    }).join('');
}

function changeCheckoutItemQty(idx, delta) {
    if (idx >= 0 && idx < cartItems.length) {
        cartItems[idx].qty = (cartItems[idx].qty || 1) + delta;
        if (cartItems[idx].qty <= 0) {
            cartItems.splice(idx, 1);
        }
        saveCartToStorage();
        updateCartUI();
        renderCheckoutCartList();
        updateCheckoutSummary();
    }
}

function removeCheckoutItem(idx) {
    if (idx >= 0 && idx < cartItems.length) {
        cartItems.splice(idx, 1);
        saveCartToStorage();
        updateCartUI();
        renderCheckoutCartList();
        updateCheckoutSummary();
    }
}

function clearCartItems() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
        cartItems = [];
        saveCartToStorage();
        updateCartUI();
        renderCheckoutCartList();
        updateCheckoutSummary();
    }
}

function toggleSelectAllCart(masterCb) {
    const checkboxes = document.querySelectorAll('#checkoutCartItemsList input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = masterCb.checked);
    updateCheckoutSummary();
}

function updateCheckoutSummary() {
    const totalPrice = cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.qty || 1)), 0);
    const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice);

    const subtotalElem = document.getElementById('summarySubtotal');
    const finalElem = document.getElementById('summaryTotalFinal');

    if (subtotalElem) subtotalElem.textContent = formattedTotal;
    if (finalElem) finalElem.textContent = formattedTotal;
}

function toggleShippingAddressField(isHome) {
    const addressWrap = document.getElementById('addressInputWrap');
    const addressInput = document.getElementById('custAddress');
    if (addressWrap && addressInput) {
        if (isHome) {
            addressWrap.style.display = 'block';
            addressInput.required = true;
        } else {
            addressWrap.style.display = 'none';
            addressInput.required = false;
        }
    }
}

function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-option-item').forEach(item => item.classList.remove('active'));
    const radio = document.querySelector(`input[name="paymentMethod"][value="${method}"]`);
    if (radio) {
        radio.checked = true;
        radio.closest('.payment-option-item').classList.add('active');
    }
}

function applyVoucher() {
    const code = (document.getElementById('voucherCodeInput')?.value || '').trim();
    if (code) {
        alert(`Mã giảm giá "${code}" không hợp lệ hoặc đã hết hạn.`);
    }
}

function submitFinalOrder() {
    if (cartItems.length === 0) return;

    const name = (document.getElementById('custName')?.value || '').trim();
    const phone = (document.getElementById('custPhone')?.value || '').trim();
    const email = (document.getElementById('custEmail')?.value || '').trim();
    const address = (document.getElementById('custAddress')?.value || '').trim() || 'Nhận tại Showroom';
    const selectedPay = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';
    const note = (document.getElementById('orderNote')?.value || '').trim();

    if (!name || !phone || !email) {
        alert('Vui lòng điền đầy đủ Họ và tên, Số điện thoại và Email giao hàng trước khi đặt hàng!');
        switchCheckoutStep(2);
        const form = document.getElementById('shippingForm');
        if (form) form.reportValidity();
        return;
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.qty || 1)), 0);
    const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice);
    const itemDetails = cartItems.map(it => ({
        name: it.name,
        qty: it.qty || 1,
        price: it.price || 0,
        image: it.image
    }));
    const itemNames = cartItems.map(it => `${it.qty || 1}x ${it.name}`);

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('vi-VN'),
        items: itemNames,
        itemDetails: itemDetails,
        rawTotal: totalPrice,
        total: formattedTotal,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress: address,
        note: note,
        paymentMethod: selectedPay.toUpperCase(),
        status: 'Chờ xử lý',
        createdAt: new Date().toISOString()
    };

    userOrders.unshift(newOrder);
    localStorage.setItem('pcshop_orders', JSON.stringify(userOrders));

    // Clear Cart
    cartItems = [];
    saveCartToStorage();
    updateCartUI();

    showOrderSuccessModal(newOrder);
}

function showOrderSuccessModal(order) {
    let modal = document.getElementById('orderSuccessModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orderSuccessModal';
        modal.className = 'order-success-modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="order-success-modal-box">
            <div class="success-icon-badge">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2>ĐẶT HÀNG THÀNH CÔNG!</h2>
            <p class="success-sub-desc">Cảm ơn bạn đã tin tưởng mua sắm tại PCShop. Mã đơn hàng của bạn là <strong style="color:#0284c7;">#${order.id}</strong></p>
            
            <div class="order-summary-mini-card">
                <div class="mini-row"><span>Khách hàng:</span><strong>${order.customerName} (${order.customerPhone})</strong></div>
                <div class="mini-row"><span>Địa chỉ giao:</span><span>${order.shippingAddress}</span></div>
                <div class="mini-row"><span>Hình thức thanh toán:</span><span class="pay-badge-mini">${order.paymentMethod}</span></div>
                <div class="mini-row"><span>Tổng giá trị đơn:</span><strong style="color:#0284c7; font-size:16px;">${order.total}</strong></div>
            </div>

            <div class="success-modal-actions">
                <button class="btn-secondary-home" onclick="window.location.href='index.html'">Về trang chủ</button>
                <button class="btn-primary-orders" onclick="openMyOrdersModalDirect()">Xem đơn hàng của tôi</button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function openMyOrdersModalDirect() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) modal.classList.remove('active');
    window.location.href = 'index.html?openOrders=true';
}
