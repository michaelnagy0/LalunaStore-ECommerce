/**
 * * ملف JavaScript: app.js
 * * المنطق الكامل لمتجر La Luna - الوظائف: سلة التسوق، البحث، واتساب.
 * */

// --------------------------------------------------------
// المتغيرات الثابتة - بيانات المتجر وخدمات الدفع (يرجى مراجعتها)
// --------------------------------------------------------

const SHIPPING_FEE = 50.00; // قيمة الشحن الثابتة
const PHONE_NUMBER = "+201281277953"; // رقم الواتساب الخاص بالطلبات (الرئيسي)
const INSTAPAY_NUMBER = "01281277953"; // رقم InstaPay
const ORANGE_CASH_NUMBER = "01280771175"; // رقم Orange Cash

// --------------------------------------------------------
// 1. وظائف سلة التسوق (Cart Functionality)
// --------------------------------------------------------

function getCart() {
    // جلب محتوى السلة من التخزين المحلي
    return JSON.parse(localStorage.getItem('lalunaCart')) || [];
}

function saveCart(cart) {
    // حفظ محتوى السلة في التخزين المحلي
    localStorage.setItem('lalunaCart', JSON.stringify(cart));
}

/**
 * دالة إضافة المنتج للعربة - تعمل بسلاسة من أي صفحة
 * @param {HTMLElement} button - زر الإضافة
 */
function addToCart(button) {
    const productElement = button.closest('.product, .product-detail-card');
    const name = productElement.getAttribute('data-name'); // اسم المنتج
    const price = parseFloat(productElement.getAttribute('data-price')); // سعر المنتج

    // التأكد من جلب الكمية إذا كانت من صفحة التفاصيل
    let qty = 1;
    const qtyInput = productElement.querySelector('#qty-input');
    if (qtyInput) {
        qty = parseInt(qtyInput.value) || 1;
    }
    
    // محاولة جلب صورة المنتج
    const imgElement = productElement.querySelector('.product-img, .details-image img');
    const img = imgElement ? imgElement.src : 'placeholder.jpg'; 

    let cart = getCart();
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.qty += qty; // زيادة الكمية المطلوبة
    } else {
        cart.push({ name: name, price: price, img: img, qty: qty });
    }

    saveCart(cart);
    alert(`Successfully added ${qty} of ${name} to your cart!`); // رسالة بالإنجليزية للمستخدم
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
            removeItemFromCart(name); // حذف إذا أصبحت الكمية صفر
            return; 
        }
    }
    saveCart(cart);
    displayCart(); // إعادة عرض السلة بعد التحديث
}

// دالة عرض محتوى العربة في صفحة cart.html (تبقى كما هي)
function displayCart() {
    // ... (الكود بالكامل كما هو في الإصدار السابق لـ displayCart) ...
    // Note: This function depends on English class names in HTML (e.g., 'cart-table-body').
    
    // (بما أن هذا الكود طويل وتم إرساله سابقًا، سنتركه بدون تغيير في المنطق هنا)
    
    // ------------------------------------------------
    // هذا الجزء يعرض تفاصيل السلة ويحسب الإجماليات
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
        row.innerHTML = `<td colspan="5" style="padding: 20px; text-align: center; color: var(--color-gold); font-weight: 700;">Your cart is empty. Please add some products!</td>`;
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
    // ------------------------------------------------
}

// ... (بقية دوال setupCartEventListeners و handleQuantityChange و handleRemoveClick كما هي) ...

// --------------------------------------------------------
// 4. وظيفة الطلب عبر WhatsApp (مع تفاصيل الدفع) - تم تحديث اللغة
// --------------------------------------------------------

function generateWhatsAppOrderLink() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty. Please add products before sending the order.");
        return;
    }

    let subtotal = 0;
    // الرسالة باللغة العربية (كما طلبت لسهولة التعامل مع العميل)
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
// 5. ربط الأحداث الرئيسية (Initialization) - تم تحديث الربط لصفحة التفاصيل
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

    // 💥 ربط سلس لجميع أزرار "Add to Cart" في كل صفحات المنتجات + صفحة التفاصيل
    document.querySelectorAll('.product .cta-button, .add-to-cart-detail-btn').forEach(button => {
        button.removeEventListener('click', (e) => addToCart(e.currentTarget));
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            addToCart(e.currentTarget); // الدالة الآن تتعامل مع الكمية من صفحة التفاصيل تلقائيًا
        });
    });

    // ... (بقية أكواد ربط الفلاتر والبحث كما هي) ...
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