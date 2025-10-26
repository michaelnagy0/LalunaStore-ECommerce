/**
 * * ملف JavaScript: app.js (النسخة النهائية المصححة)
 * * تم إلغاء دعم المنتجات الثابتة بالكامل.
 * */

// --------------------------------------------------------
// 1. وظائف سلة التسوق (Cart Functionality)
// --------------------------------------------------------

const SHIPPING_FEE = 50.00; // قيمة الشحن الثابتة

// دالة لجلب العربة من Local Storage (سلة العميل فقط)
function getCart() {
    return JSON.parse(localStorage.getItem('lalunaCart')) || [];
}

// دالة لحفظ العربة في Local Storage
function saveCart(cart) {
    // التأكد من حفظ سلة العميل فقط
    localStorage.setItem('lalunaCart', JSON.stringify(cart.filter(item => !item.isFixed)));
}

/**
 * دالة لإضافة منتج للعربة (الصفحات العادية)
 */
function addToCart(button) {
    const productElement = button.closest('.product');
    const name = productElement.getAttribute('data-name');
    const price = parseFloat(productElement.getAttribute('data-price'));
    
    const imgElement = productElement.querySelector('.product-img');
    const img = imgElement ? imgElement.src : 'placeholder.jpg'; 
    
    const key = name; 

    let cart = getCart();
    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            img: img,
            qty: 1,
            key: key, 
            size: null, 
            color: null,
            isFixed: false
        });
    }

    saveCart(cart);
    alert(`${name} has been added to your cart!`);
    updateCartIconCount();
}

/**
 * دالة لإضافة منتج للعربة من صفحة التفاصيل (product-details.html)
 */
function addToCartFromDetails(productCard) {
    const name = productCard.getAttribute('data-name');
    const price = parseFloat(productCard.getAttribute('data-price'));
    
    const qtyInput = document.getElementById('qty-input');
    const sizeSelect = document.getElementById('size-select');
    const colorSelect = document.getElementById('color-select'); 
    
    const mainImg = productCard.querySelector('.main-image');
    const img = mainImg ? mainImg.src : 'placeholder.jpg'; 

    const qty = parseInt(qtyInput ? qtyInput.value : 1);
    const size = sizeSelect ? sizeSelect.value : null;
    const color = colorSelect ? colorSelect.value : null;

    
    if (qty < 1 || isNaN(qty)) {
        alert("Quantity must be at least 1.");
        return;
    }

    const key = `${name}-${size || 'NoSize'}-${color || 'NoColor'}`; 

    let cart = getCart();
    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({
            name: name,
            price: price,
            img: img,
            qty: qty,
            key: key, 
            size: size, 
            color: color,
            isFixed: false
        });
    }

    saveCart(cart);
    
    let alertMessage = `${name} has been added to your cart! (${qty} pcs)`;
    if (size) alertMessage += `\nSize: ${size}`;
    if (color) alertMessage += `\nColor: ${color}`;
    
    alert(alertMessage);
    updateCartIconCount();
}


/**
 * دالة لحذف منتج بالكامل من العربة 
 */
function removeItemFromCart(key) {
    let cart = getCart();
    const updatedCart = cart.filter(item => item.key !== key);

    saveCart(updatedCart); 
    updateCartDisplay(); 
    updateCartIconCount();
}


/**
 * دالة لتحديث كمية المنتج
 */
function updateCartQuantity(key, newQty) {
    let cart = getCart();
    const item = cart.find(i => i.key === key);

    if (item) {
        newQty = parseInt(newQty);

        if (newQty > 0) {
            item.qty = newQty;
        } else {
            removeItemFromCart(key);
            return; 
        }
    }
    
    saveCart(cart); 
    updateCartDisplay(); 
    updateCartIconCount();
}

/**
 * دالة لعرض محتوى العربة في جدول صفحة cart.html
 */
function updateCartDisplay() {
    const tableBody = document.getElementById('cart-table-body');
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingFeeElement = document.getElementById('shipping-fee');
    const finalTotalElement = document.getElementById('final-total');
    const finalTotalCheckoutElement = document.getElementById('final-total-checkout');

    const cart = getCart();
    let subtotal = 0;
    
    if (!tableBody || !subtotalElement || !finalTotalElement) return; 

    tableBody.innerHTML = ''; 

    if (cart.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="padding: 20px; text-align: center; color: var(--color-gold); font-weight: 700;">Your cart is empty. Add some luxury items!</td>`;
        tableBody.appendChild(row);
        
        subtotalElement.textContent = `0.00 EGP`;
        shippingFeeElement.textContent = `0.00 EGP`;
        finalTotalElement.textContent = `0.00 EGP`;
        if (finalTotalCheckoutElement) finalTotalCheckoutElement.textContent = `0.00 EGP`;

        const whatsappBtn = document.getElementById('whatsapp-order-btn');
        const checkoutForm = document.getElementById('checkout-form');
        if(whatsappBtn) whatsappBtn.style.display = 'none';
        if(checkoutForm) checkoutForm.style.display = 'none';

        return; 
    }
    
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    const checkoutForm = document.getElementById('checkout-form');
    if(whatsappBtn) whatsappBtn.style.display = 'inline-block';
    if(checkoutForm) checkoutForm.style.display = 'block';

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        
        const sizeDetail = item.size ? `<br><small>Size: ${item.size}</small>` : '';
        const colorDetail = item.color ? `<br><small>Color: ${item.color}</small>` : '';

        const quantityControl = `
            <input type="number" 
                    value="${item.qty}" 
                    min="1" 
                    data-product-key="${item.key}" 
                    class="cart-qty-input" 
                    style="text-align: center;">`;
        const removeButton = `
            <button class="remove-btn" data-product-key="${item.key}">❌</button>`;
        

        const row = document.createElement('tr');
        row.classList.add('cart-item-row');

        row.innerHTML = `
            <td>
                <div class="product-info">
                    <img src="${item.img || 'placeholder.jpg'}" alt="${item.name}">
                    <span>${item.name} ${sizeDetail} ${colorDetail}</span>
                </div>
            </td>
            <td class="quantity-controls">
                ${quantityControl}
            </td>
            <td>${item.price.toFixed(2)} EGP</td>
            <td>${itemTotal.toFixed(2)} EGP</td>
            <td>
                ${removeButton}
            </td>
        `;
        tableBody.appendChild(row);
    });

    const finalTotal = subtotal + SHIPPING_FEE;
    
    subtotalElement.textContent = `${subtotal.toFixed(2)} EGP`;
    shippingFeeElement.textContent = `${SHIPPING_FEE.toFixed(2)} EGP`;
    finalTotalElement.textContent = `${finalTotal.toFixed(2)} EGP`;
    if (finalTotalCheckoutElement) finalTotalCheckoutElement.textContent = `${finalTotal.toFixed(2)} EGP`;
    
    setupCartEventListeners(); 
}

/**
 * دالة لربط معالجات الأحداث لحقول الكمية وأزرار الحذف
 */
function setupCartEventListeners() {
    document.querySelectorAll('.cart-qty-input').forEach(input => {
        input.removeEventListener('change', handleQuantityChange); 
        input.addEventListener('change', handleQuantityChange);
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.removeEventListener('click', handleRemoveClick); 
        button.addEventListener('click', handleRemoveClick);
    });
    
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    if(whatsappBtn) {
        whatsappBtn.removeEventListener('click', generateWhatsAppOrder);
        whatsappBtn.addEventListener('click', generateWhatsAppOrder);
    }
}

function handleQuantityChange(event) {
    const input = event.target;
    const key = input.getAttribute('data-product-key'); 
    const newQty = input.value;
    updateCartQuantity(key, newQty);
}

function handleRemoveClick(event) {
    const button = event.target;
    const key = button.getAttribute('data-product-key'); 
    const item = getCart().find(i => i.key === key);
    const name = item ? item.name : 'this item';
    
    if (confirm(`Are you sure you want to remove ${name} from your cart?`)) {
        removeItemFromCart(key);
    }
}

/**
 * دالة تحديث عدد المنتجات في أيقونة السلة بالهيدر
 */
function updateCartIconCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.qty, 0);
    const cartIcon = document.querySelector('nav ul li a[href="cart.html"]');
    
    if (cartIcon) {
        const newText = totalItems > 0 ? `🛒 Cart (${totalItems})` : `🛒 Cart`;
        cartIcon.textContent = newText;
    }
}

/**
 * دالة لتوليد رسالة طلب WhatsApp مفصلة
 */
function generateWhatsAppOrder() {
    const cart = getCart();
    const form = document.getElementById('checkout-form');

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const city = document.getElementById('city').value.trim();
    const address = document.getElementById('address').value.trim();
    
    if (!name || !phone || !city || !address) {
        alert("Please fill in all required fields (Name, Phone, City, Address) before completing the order.");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty. Please add items to order.");
        return;
    }

    let orderDetails = "🛍️ *New Order Details (Laluna Store)* 🛍️\n\n";
    orderDetails += "--- *Items List* ---\n";

    let itemNumber = 1;
    let totalItemsPrice = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        totalItemsPrice += itemTotal;
        
        let details = '';
        if (item.size) details += ` | Size: ${item.size}`;
        if (item.color) details += ` | Color: ${item.color}`;
        
        orderDetails += `${itemNumber}. ${item.name} (${item.qty} pcs)\n`;
        orderDetails += `   - Price: ${itemTotal.toFixed(2)} EGP${details}\n`;
        itemNumber++;
    });

    const shippingFee = SHIPPING_FEE;
    const finalTotal = totalItemsPrice + shippingFee;

    orderDetails += "\n--- *Order Summary* ---\n";
    orderDetails += `Subtotal: ${totalItemsPrice.toFixed(2)} EGP\n`;
    orderDetails += `Shipping: ${shippingFee.toFixed(2)} EGP\n`;
    orderDetails += `*FINAL TOTAL: ${finalTotal.toFixed(2)} EGP*\n\n`;

    const email = document.getElementById('email').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    orderDetails += "--- *Customer & Shipping Info* ---\n";
    orderDetails += `👤 Name: ${name}\n`;
    orderDetails += `📞 Phone: ${phone}\n`;
    if (email) orderDetails += `📧 Email: ${email}\n`;
    orderDetails += `📍 City/Gov.: ${city}\n`;
    orderDetails += `🏠 Address: ${address}\n`;
    if (notes) orderDetails += `📝 Notes: ${notes}\n`;
    orderDetails += `💵 Payment: Cash on Delivery\n\n`;
    
    orderDetails += "Please confirm the order and total. Thank you!";
    
    const whatsappNumber = "201281277953"; 
    const encodedMessage = encodeURIComponent(orderDetails);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}


// --------------------------------------------------------
// 2. وظيفة إزالة المنتجات الثابتة القديمة من التخزين المحلي
// --------------------------------------------------------

function cleanLocalStorage() {
    let cart = JSON.parse(localStorage.getItem('lalunaCart')) || [];
    const cleanedCart = cart.filter(item => !item.isFixed);
    localStorage.setItem('lalunaCart', JSON.stringify(cleanedCart));
}

// --------------------------------------------------------
// 3. وظائف الفلاتر والبحث (تبقى كما هي)
// --------------------------------------------------------

function setupFilterTabs() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productGrid = document.querySelector('.products-grid');
    
    if (filterButtons.length > 0 && productGrid) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const products = productGrid.querySelectorAll('.product');
                products.forEach(product => {
                    const category = product.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
                
                const resultsMessage = document.getElementById('search-results-message');
                if (resultsMessage) resultsMessage.textContent = '';
            });
        });
    }
}

function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
        alert("Please enter at least two letters to search.");
        return;
    }
    
    const currentPage = window.location.pathname.split('/').pop();
    
    const isMenQuery = query.includes('رجالي') || query.includes('men') || query.includes('رجل') || query.includes('سلسلة') || query.includes('محفظة');
    const isWomenQuery = query.includes('نسائي') || query.includes('women') || query.includes('سوار') || query.includes('قلادة') || query.includes('حلق');
    
    if (currentPage === 'index.html' || currentPage === '' || currentPage === 'contact.html' || currentPage === 'cart.html' || currentPage === 'product-details.html') {
        let targetPage = 'men.html'; 
        
        if (isWomenQuery) {
            targetPage = 'women.html';
        } else if (isMenQuery) {
            targetPage = 'men.html';
        }
        
        window.location.href = `${targetPage}?search=${encodeURIComponent(query)}`;
        return;
    }

    if (currentPage === 'men.html' || currentPage === 'women.html') {
        applySearchFilter(query);
    }
}

function applySearchFilter(query) {
    const productGrid = document.querySelector('.products-grid');
    if (!productGrid) return; 

    const products = productGrid.querySelectorAll('.product');
    let resultsFound = 0;
    
    products.forEach(product => {
        const name = product.getAttribute('data-name').toLowerCase();
        const description = product.querySelector('.description')?.textContent.toLowerCase() || '';
        
        if (name.includes(query) || description.includes(query)) {
            product.style.display = 'block';
            resultsFound++;
        } else {
            product.style.display = 'none';
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    const resultsMessage = document.getElementById('search-results-message');
    if (resultsMessage) {
        resultsMessage.textContent = resultsFound === 0 ? `No results found for "${query}"` : `Showing ${resultsFound} results for "${query}"`;
    }

    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.value = '';
}


// --------------------------------------------------------
// 4. ربط الأحداث الرئيسية (Initialization)
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. أهم خطوة: تنظيف السلة من المنتجات الثابتة السابقة
    cleanLocalStorage(); 
    
    // 2. تحديث السلة إذا كنا في صفحة السلة
    if (document.getElementById('cart-table-body')) {
        updateCartDisplay();
    }
    
    // 3. تحديث أيقونة السلة (يعمل في كل الصفحات)
    updateCartIconCount();

    // 4. ربط الفلاتر
    setupFilterTabs();
    
    // 5. ربط وظيفة البحث
    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                handleSearch();
            }
        });
    }

    // 6. معالجة البحث إذا تم القدوم للصفحة عبر رابط بحث
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('search');
    
    if (initialQuery) {
        applySearchFilter(initialQuery.toLowerCase());
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = initialQuery;
        }
    }
    
    // 7. ربط زر الإضافة للسلة في صفحة التفاصيل
    const detailAddToCartBtn = document.querySelector('.add-to-cart-detail-btn');
    const productDetailCard = document.querySelector('.product-detail-card');
    
    if (detailAddToCartBtn && productDetailCard) {
        detailAddToCartBtn.addEventListener('click', () => {
            addToCartFromDetails(productDetailCard);
        });
    }
});