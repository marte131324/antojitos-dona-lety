document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen Logic ---
    const splash = document.getElementById('splashScreen');
    if (splash) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
                // Remove from DOM after transition to free GPU
                setTimeout(() => splash.remove(), 600);
            }, 500);
        });
    }

    // --- Navigation & Scroll Logic ---
    const categoryBtns = document.querySelectorAll('.category-btn');
    const sections = document.querySelectorAll('.category-section');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const navHeight = document.querySelector('.category-nav').offsetHeight;
            window.scrollTo({
                top: targetSection.offsetTop - navHeight - 10,
                behavior: 'smooth'
            });
        });
    });

    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = document.querySelector('.category-nav').offsetHeight + 20;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - navHeight) {
                current = section.getAttribute('id');
            }
        });

        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('href') === `#${current}`) {
                btn.classList.add('active');
            }
        });
    });

    // --- Shopping Cart Logic ---
    let cart = [];
    const waNumber = "522295483697"; // Official WhatsApp Number

    // DOM Elements
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const cartCountBadge = document.getElementById('cartCountBadge');
    
    // Modals
    const variantsModal = document.getElementById('variantsModal');
    const variantsContainer = document.getElementById('variantsContainer');
    const cartModal = document.getElementById('cartModal');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalDisplay = document.getElementById('cartTotalDisplay');
    const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');

    let currentItemToAdd = null; // Stores item info while variant is selected

    // 1. Add to cart button click
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            const variantsStr = btn.getAttribute('data-variants');

            if (variantsStr) {
                // Open variants modal
                const variants = variantsStr.split(',');
                currentItemToAdd = { id, name, price };
                openVariantsModal(variants);
            } else {
                // Add directly
                addItemToCart({ id, name, price, variant: null });
            }
        });
    });

    // 2. Open Variants Modal
    function openVariantsModal(variants) {
        variantsContainer.innerHTML = '';
        variants.forEach(variant => {
            const vBtn = document.createElement('button');
            vBtn.className = 'variant-btn';
            vBtn.textContent = variant.trim();
            vBtn.addEventListener('click', () => {
                addItemToCart({ 
                    id: currentItemToAdd.id + '-' + variant.trim(), 
                    name: currentItemToAdd.name, 
                    price: currentItemToAdd.price, 
                    variant: variant.trim() 
                });
                closeModal('variantsModal');
            });
            variantsContainer.appendChild(vBtn);
        });
        variantsModal.classList.add('active');
    }

    // 3. Add to Cart Array
    function addItemToCart(item) {
        cart.push(item);
        updateCartUI();
        
        // Simple visual feedback
        floatingCartBtn.style.transform = "scale(1.2)";
        setTimeout(() => floatingCartBtn.style.transform = "scale(1)", 200);
    }

    // 4. Update UI
    function updateCartUI() {
        cartCountBadge.textContent = cart.length;
        if (cart.length > 0) {
            floatingCartBtn.style.display = 'flex';
        } else {
            floatingCartBtn.style.display = 'none';
        }
        renderCartModal();
    }

    // 5. Render Cart Modal
    function renderCartModal() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            
            const div = document.createElement('div');
            div.className = 'cart-item';
            
            let nameDisplay = item.name;
            if (item.variant) {
                nameDisplay = `<strong>${item.name}</strong><small>(Guiso: ${item.variant})</small>`;
            } else {
                nameDisplay = `<strong>${item.name}</strong>`;
            }

            div.innerHTML = `
                <div class="cart-item-info">${nameDisplay}</div>
                <div style="display:flex; align-items:center;">
                    <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    <button class="remove-item" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        cartTotalDisplay.textContent = `$${total.toFixed(2)}`;
    }

    // Global func for removing items
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
        if (cart.length === 0) {
            closeModal('cartModal');
        }
    };

    // Global func for closing modals
    window.closeModal = function(modalId) {
        document.getElementById(modalId).classList.remove('active');
    };

    // Open cart modal
    floatingCartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    // 6. Checkout WhatsApp
    whatsappCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const customerName = document.getElementById('customerName').value.trim();
        const note = document.getElementById('customerNote').value.trim();

        let total = 0;
        let message = `*🥟 NUEVO PEDIDO - ANTOJITOS LETY*\n`;
        if (customerName) message += `*A nombre de:* ${customerName}\n`;
        message += `-------------------------------\n`;

        cart.forEach(item => {
            total += item.price;
            if (item.variant) {
                message += `▪️ 1x ${item.name} (${item.variant}) - $${item.price}\n`;
            } else {
                message += `▪️ 1x ${item.name} - $${item.price}\n`;
            }
        });

        message += `-------------------------------\n`;
        message += `*Total: $${total.toFixed(2)}*\n`;
        
        if (note) {
            message += `\n*Notas adicionales:* ${note}\n`;
        }

        const encodedMsg = encodeURIComponent(message);
        const waLink = `https://wa.me/${waNumber}?text=${encodedMsg}`;
        window.open(waLink, '_blank');
    });
});
