document.addEventListener('DOMContentLoaded', function () {
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
    if (!isLoggedIn) {
      window.location.href = 'index.html';
      return;
    }
  
    const usernameDisplay = document.getElementById('checkout-username');
    if (usernameDisplay) {
      usernameDisplay.textContent = currentUser.username || 'Guest';
    }
  
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        window.location.href = 'auth.html';
      });
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    const placeOrderBtn = document.getElementById('place-order');
    const cancelOrderBtn = document.getElementById('cancel-order');
  
    function renderCheckoutItems() {
      if (!checkoutItems) return;
  
      checkoutItems.innerHTML = '';
  
      if (cart.length === 0) {
        checkoutItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        placeOrderBtn.disabled = true;
        return;
      }
  
      cart.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="checkout-item-img">
          <div class="checkout-item-details">
            <h4 class="checkout-item-title">${item.name}</h4>
            <p class="checkout-item-price">Price: $${item.price}</p>
            <p class="checkout-item-quantity">Quantity: ${item.quantity}</p>
          </div>
        `;
        checkoutItems.appendChild(itemDiv);
      });
    }
  
    function calculateTotal() {
      if (!checkoutTotal) return;
      const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      checkoutTotal.textContent = `$${total.toFixed(2)}`;
    }
  
    renderCheckoutItems();
    calculateTotal();
  
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', function () {
        alert('Order placed successfully! Thank you for shopping with us. 🛒');
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
      });
    }
  
    if (cancelOrderBtn) {
      cancelOrderBtn.addEventListener('click', function () {
        const confirmCancel = confirm('Are you sure you want to cancel your order?');
        if (confirmCancel) {
          window.location.href = 'index.html';
        }
      });
    }
  });
  