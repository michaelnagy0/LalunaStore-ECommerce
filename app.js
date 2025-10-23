/**
 * * ملف JavaScript: app.js
 * * هذا الملف يقوم بتشغيل الوظائف التفاعلية للموقع:
 * 1. إدارة سلة التسوق (Add/Remove/Update Quantity) وحفظها في ذاكرة المتصفح (Local Storage).
 * 2. عرض محتوى سلة التسوق في صفحة cart.html وحساب الإجماليات.
 * 3. تفعيل فلاتر المنتجات في صفحات men.html و women.html.
 * 4. تفعيل وظيفة البحث والتصفية.
 * */

// --------------------------------------------------------
// 1. وظائف سلة التسوق (Cart Functionality)
// --------------------------------------------------------

const SHIPPING_FEE = 50.00; // قيمة الشحن الثابتة

// دالة لجلب العربة من Local Storage
function getCart() {
    return JSON.parse(localStorage.getItem('lalunaCart')) || [];
}

// دالة لحفظ العربة في Local Storage
function saveCart(cart) {
    localStorage.setItem('lalunaCart', JSON.stringify(cart));
}

/**
 * دالة إضافة المنتج للعربة (تُستدعى من زر "Add to Cart" في صفحات المنتجات)
 * @param {HTMLElement} button - زر الإضافة
 */
function addToCart(button) {
    const productElement = button.closest('.product');
    const name = productElement.getAttribute('data-name');
    const price = parseFloat(productElement.getAttribute('data-price'));
    
    const imgElement = productElement.querySelector('.product-img');
    const img = imgElement ? imgElement.src : 'placeholder.jpg'; 

    let cart = getCart();
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            img: img,
            qty: 1
        });
    }

    saveCart(cart);
    alert(`${name} has been added to your cart!`);
}

/**
 * دالة لحذف منتج بالكامل من العربة (تُستدعى عند الضغط على زر الحذف ❌)
 * @param {string} name - اسم المنتج المراد حذفه
 */
function removeItemFromCart(name) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== name);
    saveCart(cart);
    displayCart(); // إعادة عرض العربة لتحديث الجدول
}


/**
 * دالة لتحديث كمية المنتج (تُستدعى عند تغيير قيمة حقل الكمية)
 * @param {string} name - اسم المنتج
 * @param {number} newQty - الكمية الجديدة
 */
function updateCartQuantity(name, newQty) {
    let cart = getCart();
    const item = cart.find(i => i.name === name);

    if (item) {
        newQty = parseInt(newQty);

        if (newQty > 0) {
            item.qty = newQty;
        } else {
            // إذا كانت الكمية صفر أو أقل، نحذفه
            removeItemFromCart(name);
            return; 
        }
    }
    saveCart(cart);
    displayCart(); // إعادة عرض العربة لتحديث الأسعار والإجمالي
}


/**
 * دالة لعرض محتوى العربة في جدول صفحة cart.html
 */
function displayCart() {
    const tableBody = document.getElementById('cart-table-body');
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingFeeElement = document.getElementById('shipping-fee');
    const finalTotalElement = document.getElementById('final-total');
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
        
        const whatsappBtn = document.getElementById('whatsapp-order-btn');
        const checkoutBtn = document.querySelector('.checkout-button');
        if(whatsappBtn) whatsappBtn.style.display = 'none';
        if(checkoutBtn) checkoutBtn.style.display = 'none';

        return; 
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const row = document.createElement('tr');
        row.classList.add('cart-item-row');
        row.innerHTML = `
            <td>
                <div class="product-info">
                    <img src="${item.img || 'placeholder.jpg'}" alt="${item.name}">
                    <span>${item.name}</span>
                </div>
            </td>
            <td class="quantity-controls">
                <input type="number" 
                       value="${item.qty}" 
                       min="1" 
                       data-product-name="${item.name}" 
                       class="cart-qty-input" 
                       style="text-align: center;">
            </td>
            <td>${item.price.toFixed(2)} EGP</td>
            <td>${itemTotal.toFixed(2)} EGP</td>
            <td>
                <button class="remove-btn" data-product-name="${item.name}">❌</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    const finalTotal = subtotal + SHIPPING_FEE;
    
    subtotalElement.textContent = `${subtotal.toFixed(2)} EGP`;
    shippingFeeElement.textContent = `${SHIPPING_FEE.toFixed(2)} EGP`;
    finalTotalElement.textContent = `${finalTotal.toFixed(2)} EGP`;
    
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    const checkoutBtn = document.querySelector('.checkout-button');
    if(whatsappBtn) whatsappBtn.style.display = 'inline-block';
    if(checkoutBtn) checkoutBtn.style.display = 'inline-block';
    
    // ربط الأحداث بعد إنشاء العناصر
    setupCartEventListeners(); 
}

/**
 * دالة لربط معالجات الأحداث لحقول الكمية وأزرار الحذف بعد كل عرض للجدول.
 */
function setupCartEventListeners() {
    // 1. ربط حدث تغيير الكمية
    document.querySelectorAll('.cart-qty-input').forEach(input => {
        input.removeEventListener('change', handleQuantityChange); 
        input.addEventListener('change', handleQuantityChange);
    });

    // 2. ربط حدث زر الحذف
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.removeEventListener('click', handleRemoveClick); 
        button.addEventListener('click', handleRemoveClick);
    });
}

// معالج حدث لتغيير الكمية
function handleQuantityChange(event) {
    const input = event.target;
    const name = input.getAttribute('data-product-name');
    const newQty = input.value;
    updateCartQuantity(name, newQty);
}

// معالج حدث لزر الحذف
function handleRemoveClick(event) {
    const button = event.target;
    const name = button.getAttribute('data-product-name');
    if (confirm(`Are you sure you want to remove ${name} from your cart?`)) {
        removeItemFromCart(name);
    }
}


// --------------------------------------------------------
// 2. وظائف فلاتر المنتجات (Filtering Tabs)
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
            });
        });
    }
}


// --------------------------------------------------------
// 3. وظائف البحث (Search Functionality)
// --------------------------------------------------------

/**
 * الدالة المسؤولة عن معالجة عملية البحث وتوجيه المستخدم أو تصفية المنتجات.
 */
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
        alert("Please enter at least two letters to search.");
        return;
    }
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // محاولات استنتاج نية المستخدم (للتوجيه الأولي)
    const isMenQuery = query.includes('رجالي') || query.includes('men') || query.includes('رجل') || query.includes('سلسلة') || query.includes('محفظة');
    const isWomenQuery = query.includes('نسائي') || query.includes('women') || query.includes('سوار') || query.includes('قلادة') || query.includes('حلق');
    
    // 1. إذا كنا في صفحة لا تحتوي على منتجات، نقوم بإعادة التوجيه
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

    // 2. إذا كنا بالفعل في صفحة المنتجات (men.html أو women.html)
    if (currentPage === 'men.html' || currentPage === 'women.html') {
        applySearchFilter(query);
    }
}

/**
 * دالة تقوم بتصفية المنتجات في الصفحة الحالية بناءً على كلمة البحث.
 * @param {string} query - كلمة البحث
 */
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

    // إزالة تحديد الفلتر النشط
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    // إظهار رسالة إذا لم يتم العثور على نتائج (تتطلب عنصر HTML يحمل id="search-results-message")
    const resultsMessage = document.getElementById('search-results-message');
    if (resultsMessage) {
        resultsMessage.textContent = resultsFound === 0 ? `No results found for "${query}"` : `Showing ${resultsFound} results for "${query}"`;
    }

    // تنظيف حقل البحث بعد التصفية
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.value = '';
}


// --------------------------------------------------------
// 4. ربط الأحداث الرئيسية (Initialization)
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تشغيل عرض العربة إذا كنا في صفحة cart.html
    if (document.getElementById('cart-table-body')) {
        displayCart();
    }

    // 2. تشغيل فلاتر المنتجات إذا كنا في صفحات المنتجات
    setupFilterTabs();
    
    // 3. ربط وظيفة البحث بزر البحث (🔍)
    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    // 4. ربط وظيفة البحث بضغط Enter في حقل الإدخال
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // منع الإرسال الافتراضي للنموذج
                handleSearch();
            }
        });
    }

    // 5. معالجة البحث إذا تم القدوم للصفحة عبر رابط بحث
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('search');
    
    if (initialQuery) {
        applySearchFilter(initialQuery.toLowerCase());
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = initialQuery;
        }
    }
});