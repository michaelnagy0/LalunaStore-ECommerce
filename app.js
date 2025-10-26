/**
 * * ملف JavaScript: app.js
 * * المنطق الكامل لمتجر La Luna - الوظائف: سلة التسوق، البحث، واتساب.
 * * الواجهة إنجليزية، والتعليقات والرسالة النهائية عربية للمطور والعميل.
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
 * دالة إضافة المنتج للعربة - تتعامل مع كمية قطعة واحدة (من شبكة المنتجات) أو كمية محددة (من صفحة التفاصيل)
 * @param {HTMLElement} button - زر الإضافة
 */
function addToCart(button) {
    const productElement = button.closest('.product, .product-detail-card');
    const name = productElement.getAttribute('data-name'); // اسم المنتج
    const price = parseFloat(productElement.getAttribute('data-price')); // سعر المنتج

    // التحقق من الكمية: 1 من شبكة المنتجات، أو القيمة من حقل الإدخال في صفحة التفاصيل
    let qty = 1;
    const qtyInput = productElement.querySelector('#qty-input');
    if (qtyInput) {
        qty = parseInt(qtyInput.value) || 1;
        // التأكد من أن الكمية على الأقل 1
        if (qty < 1) qty = 1;
    }
    
    // جلب صورة المنتج
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
    alert(`Successfully added ${qty} of ${name} to your cart!`); 
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
                    <img src="${item.img || 'placeholder.jpg'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                    <span>${item.name}</span>
                </div>
            </td>
            <td class="quantity-controls">
                <input type="number" 
                       value="${item.qty}" 
                       min="1" 
                       data-product-name="${item.name}" 
                       class="cart-qty-input" 
                       style="text-align: center; width: 50px; padding: 5px;">
            </td>
            <td>${item.price.toFixed(2)} EGP</td>
            <td>${itemTotal.toFixed(2)} EGP</td>
            <td>
                <button class="remove-btn" data-product-name="${item.name}" style="background: none; border: none; cursor: pointer; font-size: 1.2em; color: #e74c3c;">❌</button>
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
    // إزالة المستمعات القديمة لمنع التكرار
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
    if (confirm(`Are you sure you want to remove ${name} from the cart?`)) {
        removeItemFromCart(name);
    }
}


// --------------------------------------------------------
// 2. وظيفة الطلب عبر WhatsApp (مع تفاصيل الدفع) - رسالة عربية واضحة
// --------------------------------------------------------

function generateWhatsAppOrderLink() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty. Please add products before sending the order.");
        return;
    }

    let subtotal = 0;
    // الرسالة باللغة العربية للعميل
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
// 3. ربط الأحداث الرئيسية (Initialization)
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // تشغيل عرض العربة إذا كنا في صفحة cart.html
    if (document.getElementById('cart-table-body')) {
        displayCart();
        
        const whatsappBtn = document.getElementById('whatsapp-order-btn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', generateWhatsAppOrderLink);
        }
    }

    // 💥 ربط سلس لجميع أزرار "Add to Cart" في كل الصفحات (المنتجات والتفاصيل)
    document.querySelectorAll('.product .cta-button, .add-to-cart-detail-btn').forEach(button => {
        button.removeEventListener('click', (e) => addToCart(e.currentTarget));
        button.addEventListener('click', (e) => {
            e.preventDefault(); 
            addToCart(e.currentTarget); 
        });
    });

    // (هنا كان يوجد أكواد البحث والفلاتر التي تم حذفها بناءً على طلب الرجوع للشكل القديم)
});