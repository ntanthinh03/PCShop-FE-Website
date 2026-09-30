// JavaScript điều khiển trang Chi tiết sản phẩm GearVN (product.html)
let currentProduct = null;
let currentDetailQty = 1;
let productImagesList = [];
let currentGalleryIndex = 0;
let isArticleExpanded = false;

document.addEventListener('DOMContentLoaded', () => {
    initProductDetailPage();
    initStickyHeaderScroll();
});

async function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.getElementById('productDetailTitle').textContent = 'Không tìm thấy ID sản phẩm.';
        return;
    }

    try {
        // 1. Gọi API nạp chi tiết 1 sản phẩm
        let res = await api.getProductDetail(productId);
        let product = (res && res.status === 'success') ? res.data : null;

        // Fallback tìm trong danh sách sản phẩm nếu API detail chưa có
        if (!product) {
            const listRes = await api.getProducts({ per_page: 250 });
            if (listRes.status === 'success' && listRes.data) {
                const all = Array.isArray(listRes.data) ? listRes.data : (listRes.data.data || []);
                product = all.find(p => String(p.id) === String(productId));
            }
        }

        if (product) {
            currentProduct = product;
            renderGearVNProductDetail(product);
            loadRelatedProducts(product.category_slug || (product.category ? product.category.slug : 'laptop'), product.id);
        } else {
            document.getElementById('productDetailTitle').textContent = `Sản phẩm ID ${productId} không tồn tại hoặc đã bị xóa.`;
        }
    } catch (e) {
        console.error('Lỗi tải sản phẩm:', e);
        document.getElementById('productDetailTitle').textContent = 'Có lỗi kết nối với máy chủ Backend.';
    }
}

function renderGearVNProductDetail(p) {
    const priceNum = Number(p.price) || 0;
    const priceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum);
    const oldPrice = priceNum > 0 ? Math.round(priceNum * 1.12) : 0;
    const oldPriceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(oldPrice);

    // 1. Page Title & Breadcrumbs
    document.getElementById('pageTitle').textContent = `${p.name} - PC SHOP`;
    document.getElementById('breadcrumbProductName').textContent = p.name;
    document.getElementById('productDetailTitle').textContent = p.name;
    document.getElementById('stickyTitle').textContent = p.name;

    const catSlug = p.category_slug || (p.category ? (p.category.slug || 'laptop') : 'laptop');
    const catName = p.category ? (p.category.name || 'Danh mục') : 'Danh mục';
    const catLink = document.getElementById('breadcrumbCategoryLink');
    if (catLink) {
        catLink.textContent = catName;
        catLink.href = `category.html?slug=${catSlug}`;
    }

    // 2. Pricing Info
    document.getElementById('detailPriceMain').textContent = priceVnd;
    document.getElementById('stickyPriceMain').textContent = priceVnd;
    
    const oldPriceElem = document.getElementById('detailPriceOld');
    const stickyOldPriceElem = document.getElementById('stickyPriceOld');
    const discountTag = document.getElementById('detailDiscountTag');

    if (oldPrice > priceNum) {
        oldPriceElem.textContent = oldPriceVnd;
        oldPriceElem.style.display = 'inline';
        if (stickyOldPriceElem) {
            stickyOldPriceElem.textContent = oldPriceVnd;
            stickyOldPriceElem.style.display = 'inline';
        }
        discountTag.style.display = 'inline';
        discountTag.textContent = '-12%';
    } else {
        oldPriceElem.style.display = 'none';
        if (stickyOldPriceElem) stickyOldPriceElem.style.display = 'none';
        discountTag.style.display = 'none';
    }

    // 3. Images Gallery
    const imgUrl = formatImageUrl(p.images);
    productImagesList = (Array.isArray(p.images) && p.images.length > 0) ? p.images.map(img => formatImageUrl(img)) : [imgUrl];
    
    // Nếu chỉ có 1 ảnh, tạo thêm ảnh mẫu để test carousel gallery
    if (productImagesList.length === 1) {
        productImagesList.push(imgUrl, imgUrl);
    }

    currentGalleryIndex = 0;
    updateGalleryView();

    // Sticky Thumb
    const stickyThumb = document.getElementById('stickyThumb');
    if (stickyThumb) stickyThumb.src = productImagesList[0];

    // 4. Render 6 Spec Chips ("Thông số nổi bật")
    renderSpecChips(p);

    // 5. Render Article & Table of Contents
    renderArticleContent(p);

    // 6. Render Full Specs Table
    renderFullSpecsTable(p);

    // 7. Bind Action Buttons
    bindActionButtons();
}

function updateGalleryView() {
    if (productImagesList.length === 0) return;

    const mainImg = document.getElementById('mainProductImg');
    if (mainImg) mainImg.src = productImagesList[currentGalleryIndex];

    const counterTag = document.getElementById('galleryCounter');
    if (counterTag) counterTag.textContent = `${currentGalleryIndex + 1}/${productImagesList.length}`;

    const thumbsContainer = document.getElementById('galleryThumbs');
    if (thumbsContainer) {
        thumbsContainer.innerHTML = productImagesList.map((img, idx) => `
            <div class="gearvn-thumb-item ${idx === currentGalleryIndex ? 'active' : ''}" onclick="selectGalleryImg(${idx})">
                <img src="${img}" alt="Thumb ${idx + 1}">
            </div>
        `).join('');
    }
}

function selectGalleryImg(idx) {
    currentGalleryIndex = idx;
    updateGalleryView();
}

function prevGalleryImg() {
    currentGalleryIndex = (currentGalleryIndex - 1 + productImagesList.length) % productImagesList.length;
    updateGalleryView();
}

function nextGalleryImg() {
    currentGalleryIndex = (currentGalleryIndex + 1) % productImagesList.length;
    updateGalleryView();
}

function renderSpecChips(p) {
    const grid = document.getElementById('specChipsGrid');
    if (!grid) return;

    const specs = p.specs || {};
    
    // Fallback extraction from title if specs object is incomplete
    const cpu = specs.cpu || extractSpecFromTitle(p.name, 'cpu') || 'Intel Core i5 / Ryzen 5';
    const ram = specs.ram || extractSpecFromTitle(p.name, 'ram') || '16 GB';
    const ssd = specs.storage || extractSpecFromTitle(p.name, 'ssd') || '512 GB';
    const gpu = specs.gpu || extractSpecFromTitle(p.name, 'gpu') || 'NVIDIA RTX 3050';
    const screenSize = specs.screen_size || extractSpecFromTitle(p.name, 'screen') || '16 inch';
    const resolution = specs.resolution || 'WUXGA (1920×1200)';

    const chips = [
        { label: 'Dòng CPU', val: cpu, icon: 'fa-microchip' },
        { label: 'Dung lượng RAM', val: ram, icon: 'fa-memory' },
        { label: 'Dung lượng SSD', val: ssd, icon: 'fa-hard-drive' },
        { label: 'Dòng GPU', val: gpu, icon: 'fa-cube' },
        { label: 'Kích thước màn hình', val: screenSize, icon: 'fa-laptop' },
        { label: 'Độ phân giải', val: resolution, icon: 'fa-tv' }
    ];

    grid.innerHTML = chips.map(c => `
        <div class="spec-chip-card">
            <span class="spec-chip-label">${c.label}</span>
            <div class="spec-chip-val-row">
                <i class="fa-solid ${c.icon}"></i>
                <span>${c.val}</span>
            </div>
        </div>
    `).join('');
}

function extractSpecFromTitle(title, type) {
    const t = title.toUpperCase();
    if (type === 'cpu') {
        if (t.includes('CORE 5') || t.includes('I5')) return 'Core 5 / i5';
        if (t.includes('CORE 7') || t.includes('I7')) return 'Core 7 / i7';
        if (t.includes('RYZEN 7')) return 'Ryzen 7';
        if (t.includes('RYZEN 5')) return 'Ryzen 5';
    } else if (type === 'ram') {
        if (t.includes('16GB')) return '16 GB';
        if (t.includes('8GB')) return '8 GB';
        if (t.includes('32GB')) return '32 GB';
    } else if (type === 'ssd') {
        if (t.includes('512GB')) return '512 GB';
        if (t.includes('1TB')) return '1 TB';
        if (t.includes('256GB')) return '256 GB';
    } else if (type === 'gpu') {
        if (t.includes('RTX 3050')) return 'RTX 3050';
        if (t.includes('RTX 4060')) return 'RTX 4060';
        if (t.includes('RTX 4050')) return 'RTX 4050';
    } else if (type === 'screen') {
        if (t.includes('16"')) return '16 inch';
        if (t.includes('15.6"')) return '15.6 inch';
        if (t.includes('14"')) return '14 inch';
        if (t.includes('27"')) return '27 inch';
    }
    return null;
}

function renderArticleContent(p) {
    const tocList = document.getElementById('tocList');
    const articleBody = document.getElementById('productArticleBody');

    const brand = p.brand || 'ASUS';
    
    const sections = [
        {
            title: `1. Khám phá ${p.name}`,
            text: `${p.name} là lựa chọn đáng cân nhắc dành cho người dùng cần một chiếc laptop / thiết bị cân bằng giữa hiệu năng làm việc và khả năng giải trí. Sản phẩm được trang bị cấu hình tân tiến, đáp ứng tốt từ học tập, lập trình, thiết kế đồ họa đến chơi nhiều tựa game mượt mà.`
        },
        {
            title: `2. Hiệu năng mạnh mẽ hàng đầu phân khúc`,
            text: `Sử dụng bộ vi xử lý thế hệ mới với nhiều nhân và luồng, mang lại khả năng xử lý ổn định cho các tác vụ đa nhiệm và công việc yêu cầu hiệu năng cao. Kiến trúc tối ưu giúp phân bổ tài nguyên hợp lý giữa các nhân hiệu năng cao và nhân tiết kiệm điện.`
        },
        {
            title: `3. Màn hình hiển thị mượt mà, sắc nét`,
            text: `Màn hình với độ phân giải cao cùng tần số quét ấn tượng mang đến góc nhìn rộng, màu sắc chân thực và chuyển động hình ảnh vô cùng mượt mà. Giảm thiểu tối đa tình trạng xé hình khi chơi game hoặc xem phim hành động.`
        },
        {
            title: `4. Sức mạnh đồ họa đỉnh cao`,
            text: `Card đồ họa thế hệ mới mang lại trải nghiệm đồ họa ấn tượng, tăng tốc xử lý cho các phần mềm dựng phim, Photoshop, Premiere cũng như chiến mượt các tựa game Esport hot nhất hiện nay.`
        },
        {
            title: `5. Thiết kế hiện đại cùng hệ thống tản nhiệt tối ưu`,
            text: `Khung máy được hoàn thiện tỉ mỉ, kiểu dáng gaming hiện đại nhưng vẫn đảm bảo tính di động cao. Khe tản nhiệt được bố trí thông minh giúp máy luôn duy trì nhiệt độ mát mẻ trong suốt thời gian dài hoạt động.`
        },
        {
            title: `6. Mua ngay ${p.name} chính hãng tại PCShop`,
            text: `Hãy đến ngay hệ thống showroom PCShop trên toàn quốc để trải nghiệm và mua ngay sản phẩm với mức giá ưu đãi cùng chính sách bảo hành 36 tháng uy tín!`
        }
    ];

    if (tocList) {
        tocList.innerHTML = sections.map((sec, idx) => `
            <li class="${idx === 0 ? 'active' : ''}">
                <a href="#sec-article-${idx}">${sec.title}</a>
            </li>
        `).join('');
    }

    if (articleBody) {
        let html = '';
        sections.forEach((sec, idx) => {
            html += `<h2 id="sec-article-${idx}">${sec.title}</h2>`;
            html += `<p>${sec.text}</p>`;
            if (idx === 1 || idx === 3) {
                html += `<img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&h=450&fit=crop" alt="Hình ảnh sản phẩm">`;
            }
        });
        articleBody.innerHTML = html;
    }
}

function renderFullSpecsTable(p) {
    const specsTable = document.getElementById('detailSpecsTable');
    if (!specsTable) return;

    const specs = p.specs || {};
    const brand = p.brand || (specs.brand ? specs.brand : 'PC SHOP');
    let rowsHtml = '';

    rowsHtml += `<tr><td>Tên sản phẩm</td><td>${p.name}</td></tr>`;
    rowsHtml += `<tr><td>Thương hiệu</td><td>${brand}</td></tr>`;
    if (p.category) {
        rowsHtml += `<tr><td>Danh mục</td><td>${p.category.name}</td></tr>`;
    }

    for (const [key, val] of Object.entries(specs)) {
        if (typeof val === 'string' || typeof val === 'number') {
            const prettyKey = formatSpecKeyName(key);
            rowsHtml += `<tr><td>${prettyKey}</td><td>${val}</td></tr>`;
        }
    }

    specsTable.innerHTML = rowsHtml;
}

function bindActionButtons() {
    const btnAddCart = document.getElementById('btnAddCartDetail');
    if (btnAddCart) {
        btnAddCart.onclick = () => addToCartFromDetail();
    }

    const btnBuyNow = document.getElementById('btnBuyNow');
    if (btnBuyNow) {
        btnBuyNow.onclick = () => {
            addToCartFromDetail();
            const drawer = document.getElementById('cartDrawer');
            if (drawer) drawer.classList.add('open');
        };
    }

    // Sticky bar buttons
    const btnStickyCart = document.getElementById('btnStickyCart');
    if (btnStickyCart) {
        btnStickyCart.onclick = () => addToCartFromDetail();
    }

    const btnStickyBuy = document.getElementById('btnStickyBuy');
    if (btnStickyBuy) {
        btnStickyBuy.onclick = () => {
            addToCartFromDetail();
            const drawer = document.getElementById('cartDrawer');
            if (drawer) drawer.classList.add('open');
        };
    }

    const btnConsult = document.getElementById('btnConsult');
    if (btnConsult) {
        btnConsult.onclick = () => alert('Nhân viên tư vấn PCShop sẽ liên hệ với bạn trong 1 phút!');
    }
}

function addToCartFromDetail() {
    if (!currentProduct) return;

    if (typeof addToCart === 'function') {
        addToCart(currentProduct);
    } else {
        alert(`Đã thêm "${currentProduct.name}" vào giỏ hàng thành công!`);
    }
}

function initStickyHeaderScroll() {
    const stickyBar = document.getElementById('stickyProductBar');
    const heroGrid = document.getElementById('gearvnHeroGrid');
    if (!stickyBar || !heroGrid) return;

    window.addEventListener('scroll', () => {
        const heroBottom = heroGrid.offsetTop + heroGrid.offsetHeight;
        if (window.scrollY > heroBottom - 100) {
            stickyBar.classList.add('show');
        } else {
            stickyBar.classList.remove('show');
        }
    });
}

function toggleToc() {
    const list = document.getElementById('tocList');
    const icon = document.querySelector('#tocToggleBtn i');
    if (!list) return;

    if (list.style.display === 'none') {
        list.style.display = 'block';
        if (icon) icon.className = 'fa-solid fa-chevron-up';
    } else {
        list.style.display = 'none';
        if (icon) icon.className = 'fa-solid fa-chevron-down';
    }
}

function toggleArticleExpand() {
    const wrap = document.getElementById('articleExpandWrap');
    const overlay = document.getElementById('articleGradientOverlay');
    const txt = document.getElementById('readMoreTxt');
    const icon = document.getElementById('readMoreIcon');
    if (!wrap) return;

    isArticleExpanded = !isArticleExpanded;

    if (isArticleExpanded) {
        wrap.classList.add('expanded');
        overlay.style.background = 'none';
        overlay.style.position = 'static';
        txt.textContent = 'Thu gọn';
        if (icon) icon.className = 'fa-solid fa-chevron-up';
    } else {
        wrap.classList.remove('expanded');
        overlay.style.background = 'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))';
        overlay.style.position = 'absolute';
        txt.textContent = 'Xem thêm';
        if (icon) icon.className = 'fa-solid fa-chevron-down';
    }
}

async function loadRelatedProducts(catSlug, currentId) {
    const grid = document.getElementById('relatedProductGrid');
    if (!grid) return;

    try {
        const res = await api.getProducts({ category: catSlug, per_page: 20 });
        if (res.status === 'success' && res.data) {
            const all = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const related = all.filter(p => String(p.id) !== String(currentId)).slice(0, 5);

            grid.innerHTML = related.map(p => {
                const priceNum = Number(p.price) || 0;
                const priceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceNum);
                const oldPrice = Math.round(priceNum * 1.13);
                const oldPriceVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(oldPrice);
                const imgUrl = formatImageUrl(p.images);

                return `
                    <div class="kcc-card" onclick="window.location.href='product.html?id=${p.id}'">
                        <div class="kcc-card-badge" style="background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd;">Giảm 13%</div>
                        <div class="kcc-card-img-wrap">
                            <img src="${imgUrl}" alt="${p.name}">
                        </div>
                        <div class="kcc-card-title" title="${p.name}">${p.name}</div>
                        
                        <!-- Quick Spec Badges -->
                        <div class="card-spec-pills">
                            <span class="spec-pill-badge">Core 5</span>
                            <span class="spec-pill-badge">144Hz</span>
                            <span class="spec-pill-badge">16GB</span>
                            <span class="spec-pill-badge">512GB</span>
                        </div>

                        <div class="kcc-card-price-row">
                            <div style="font-size:11px; color:#94a3b8;"><span style="text-decoration:line-through;">${oldPriceVnd}</span> <span style="color:#0284c7; font-weight:700;">-13%</span></div>
                            <div class="kcc-price-main">${priceVnd}</div>
                        </div>

                        <div>
                            <span class="card-gift-tag">Tặng Balo Predator SUV +2</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error('Lỗi nạp sản phẩm tương tự:', e);
    }
}

function scrollRelatedGrid(dir) {
    const grid = document.getElementById('relatedProductGrid');
    if (!grid) return;
    grid.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

function formatSpecKeyName(key) {
    const map = {
        'brand': 'Thương hiệu',
        'panel_type': 'Tấm nền',
        'refresh_rate': 'Tần số quét',
        'response_time': 'Thời gian phản hồi',
        'resolution': 'Độ phân giải',
        'surface': 'Bề mặt màn hình',
        'sync_tech': 'Công nghệ đồng bộ',
        'cpu': 'Bộ vi xử lý (CPU)',
        'gpu': 'Card đồ họa (VGA)',
        'ram': 'Dung lượng RAM',
        'vram': 'Bộ nhớ VRAM',
        'storage': 'Ổ cứng lưu trữ',
        'psu': 'Nguồn công suất',
        'form_factor': 'Kích thước Mainboard',
        'socket': 'Socket vi xử lý'
    };
    return map[key] || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '));
}
