/**
 * * ملف JavaScript: app.js
 * * الكود النهائي لوظائف الموقع التفاعلية (سلة التسوق، البحث، واتساب).
 * */

// --------------------------------------------------------
// المتغيرات الثابتة - تم تحديثها ببياناتك
// --------------------------------------------------------

const SHIPPING_FEE = 50.00; // قيمة الشحن الثابتة
const PHONE_NUMBER = "+201281277953"; // رقم الواتساب الخاص بك
const INSTAPAY_NUMBER = "01281277953"; // رقم InstaPay الخاص بك
const ORANGE_CASH_NUMBER = "01280771175"; // رقم Orange Cash الخاص بك

// --------------------------------------------------------
// 1. وظائف سلة التسوق (Cart Functionality)
// --------------------------------------------------------

function getCart() {
    return JSON.parse(localStorage.getItem('lalunaCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('lalunaCart', JSON.stringify(cart));
}

/**
 * دالة إضافة المنتج للعربة - تعمل بسلاسة من أي صفحة
 * @param {HTMLElement} button - زر الإضافة
 */
function addToCart(button) {
    const productElement = button.closest('.product');
    const name = productElement.getAttribute('data-name');
    const price = parseFloat(productElement.getAttribute('data-price'));
    const imgElement = productElement.querySelector('img');
    const img = imgElement ? imgElement.src : 'placeholder.jpg'; 

    let cart = getCart();
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name: name, price: price, img: img, qty: 1 });
    }

    saveCart(cart);
    alert(`تم إضافة ${name} إلى سلة التسوق!`);
}

function removeItemFromCart(name) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== name);
    saveCart(cart);
    displayCart(); 
}

function updateCartQuantity(name, newQty) {
    let cart = getCart();
    const item = cart.find(i => i.name === name);

    if (item) {
        newQty = parseInt(newQty);
        if (newQty > 0) {
            item.qty = newQty;
        } else {
            removeItemFromCart(name);
            return; 
        }
    }
    saveCart(cart);
    displayCart(); 
}

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
        row.innerHTML = `<td colspan="5" style="padding: 20px; text-align: center; color: var(--color-gold); font-weight: 700;">سلة التسوق فارغة. يرجى إضافة منتجات!</td>`;
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
    
    setupCartEventListeners(); 
}

function setupCartEventListeners() {
    document.querySelectorAll('.cart-qty-input').forEach(input => {
        input.removeEventListener('change', handleQuantityChange); 
        input.addEventListener('change', handleQuantityChange);
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.removeEventListener('click', handleRemoveClick); 
        button.addEventListener('click', handleRemoveClick);
    });
}

function handleQuantityChange(event) {
    const input = event.target;
    const name = input.getAttribute('data-product-name');
    const newQty = input.value;
    updateCartQuantity(name, newQty);
}

function handleRemoveClick(event) {
    const button = event.target;
    const name = button.getAttribute('data-product-name');
    if (confirm(`هل أنت متأكد من حذف ${name} من سلة التسوق؟`)) {
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

function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
        alert("يرجى إدخال حرفين على الأقل للبحث.");
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
        resultsMessage.textContent = resultsFound === 0 ? `لم يتم العثور على نتائج لـ "${query}"` : `عرض ${resultsFound} نتائج لـ "${query}"`;
    }

    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.value = '';
}


// --------------------------------------------------------
// 4. وظيفة الطلب عبر WhatsApp (مع تفاصيل الدفع)
// --------------------------------------------------------

function generateWhatsAppOrderLink() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("سلة التسوق فارغة. يرجى إضافة منتجات قبل إرسال الطلب.");
        return;
    }

    let subtotal = 0;
    let message = "مرحباً متجر La Luna! أرغب بتقديم الطلب التالي:\n\n";

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        message += `${index + 1}. ${item.name} (السعر: ${item.price.toFixed(2)} جنيه) × ${item.qty} = ${itemTotal.toFixed(2)} جنيه\n`;
    });

    const finalTotal = subtotal + SHIPPING_FEE;
    
    message += "\n-------------------------------------\n";
    message += `الإجمالي الفرعي: ${subtotal.toFixed(2)} جنيه\n`;
    message += `رسوم الشحن: ${SHIPPING_FEE.toFixed(2)} جنيه\n`;
    message += `الإجمالي الكلي: *${finalTotal.toFixed(2)} جنيه*\n`; 
    
    message += "\n=====================================\n";
    message += "✅ طريقة الدفع: تحويل المبلغ المطلوب:\n";
    
    message += "اختر إحدى طرق التحويل التالية:\n";
    message += `⬅️ *إنستا باي (InstaPay):* ${INSTAPAY_NUMBER}\n`;
    message += `⬅️ *أورانج كاش (Orange Cash):* ${ORANGE_CASH_NUMBER}\n\n`;

    message += "🚨 *الخطوة الأخيرة لتأكيد الطلب:*\n";
    message += "بعد التحويل، *يرجى إرسال صورة إيصال التحويل في هذه المحادثة مباشرةً* لتأكيد الطلب والشحن. شكراً جزيلاً!";
    message += "\n=====================================\n";


    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${PHONE_NUMBER.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
}


// --------------------------------------------------------
// 5. ربط الأحداث الرئيسية (Initialization)
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تشغيل عرض العربة إذا كنا في صفحة cart.html
    if (document.getElementById('cart-table-body')) {
        displayCart();
        
        const whatsappBtn = document.getElementById('whatsapp-order-btn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', generateWhatsAppOrderLink);
        }
    }

    // 💥 ربط سلس لجميع أزرار "Add to Cart" في كل صفحات المنتجات
    document.querySelectorAll('.product .cta-button').forEach(button => {
        button.removeEventListener('click', (e) => addToCart(e.currentTarget));
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            addToCart(e.currentTarget);
        });
    });

    // 2. تشغيل فلاتر المنتجات إذا كنا في صفحات المنتجات
    setupFilterTabs();
    
    // 3. ربط وظيفة البحث
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

    // 4. معالجة البحث الأولي من رابط
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