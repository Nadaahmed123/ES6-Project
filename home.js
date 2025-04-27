document.addEventListener('DOMContentLoaded', () => {
  // Authentication and User Management
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (!isLoggedIn && !window.location.href.includes('index.html')) {
    window.location.href = 'index.html';
    return;
  }

  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay && currentUser.username) {
    usernameDisplay.textContent = "Welcome " + currentUser.username;
  }

  document.getElementById('logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    window.location.href = 'index.html';
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });

    const navLinks = document.querySelectorAll('.nav-menu a');
    if (navLinks) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 992) {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
              icon.classList.remove('fa-times');
              icon.classList.add('fa-bars');
            }
          }
        });
      });
    }
  }

  // Cart Functionality
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartElements = {
    overlay: document.querySelector('.cart-overlay'),
    sidebar: document.querySelector('.cart-sidebar'),
    icon: document.querySelector('.cart-icon'),
    closeBtn: document.querySelector('.close-cart'),
    itemsContainer: document.getElementById('cart-items'),
    count: document.querySelector('.cart-count'),
    total: document.getElementById('cart-total'),
    checkoutBtn: document.querySelector('.checkout-btn')
  };

  const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));

  const updateCartCount = () => {
    if (!cartElements.count) return;
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartElements.count.textContent = totalItems;
    cartElements.count.style.display = totalItems > 0 ? 'flex' : 'none';
  };

  const renderCartItems = () => {
    if (!cartElements.itemsContainer) return;

    cartElements.itemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartElements.itemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      return;
    }

    cart.forEach((item, index) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <p class="cart-item-price">$${item.price}</p>
          <div class="quantity-controls">
            <button class="quantity-btn minus" data-index="${index}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn plus" data-index="${index}">+</button>
          </div>
        </div>
        <i class="fas fa-trash remove-item" data-index="${index}"></i>
      `;
      cartElements.itemsContainer.appendChild(cartItem);
    });

    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        const isPlus = this.classList.contains('plus');
        updateQuantity(index, isPlus);
      });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        removeFromCart(index);
      });
    });
  };

  const calculateCartTotal = () => {
    if (!cartElements.total) return;
    
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    cartElements.total.textContent = `$${total.toFixed(2)}`;
  };

  const initCart = () => {
    updateCartCount();
    renderCartItems();
    calculateCartTotal();
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    initCart();
    showCartAddedAnimation();
    
    if (cartElements.overlay) cartElements.overlay.classList.add('active');
  };

  const showCartAddedAnimation = () => {
    if (cartElements.count) {
      cartElements.count.classList.add('pulse');
      setTimeout(() => cartElements.count.classList.remove('pulse'), 500);
    }
  };

  const updateQuantity = (index, isPlus) => {
    if (isPlus) {
      cart[index].quantity += 1;
    } else {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        removeFromCart(index);
        return;
      }
    }
    saveCart();
    initCart();
  };

  const removeFromCart = (index) => {
    cart.splice(index, 1);
    saveCart();
    initCart();
    
    if (cart.length === 0 && cartElements.overlay) {
      setTimeout(() => cartElements.overlay.classList.remove('active'), 500);
    }
  };

  if (cartElements.icon) {
    cartElements.icon.addEventListener('click', e => {
      e.stopPropagation();
      if (cartElements.overlay) cartElements.overlay.classList.add('active');
    });
  }

  if (cartElements.closeBtn) {
    cartElements.closeBtn.addEventListener('click', () => {
      if (cartElements.overlay) cartElements.overlay.classList.remove('active');
    });
  }

  if (cartElements.overlay) {
    cartElements.overlay.addEventListener('click', e => {
      if (e.target === cartElements.overlay) {
        cartElements.overlay.classList.remove('active');
      }
    });
  }

  if (cartElements.checkoutBtn) {
    cartElements.checkoutBtn.addEventListener('click', () => {
      if (cart.length > 0) {
        window.location.href = 'checkout.html';
      } else {
        alert('Your cart is empty!');
      }
    });
  }

  initCart();

  // Wishlist Functionality
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const wishlistCount = document.querySelector('.wishlist-count');
  const wishlistIcon = document.querySelector('.wishlist-icon');

  const saveWishlist = () => localStorage.setItem('wishlist', JSON.stringify(wishlist));

  const updateWishlistCount = () => {
    if (wishlistCount) {
      wishlistCount.textContent = wishlist.length;
      wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
  };

  const isInWishlist = product => wishlist.some(item => item.id === product.id);

  const toggleWishlist = product => {
    if (isInWishlist(product)) {
      wishlist = wishlist.filter(item => item.id !== product.id);
      return false;
    } else {
      wishlist.push(product);
      return true;
    }
  };

  const removeFromWishlistById = productId => {
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist();
    updateWishlistCount();
    
    const sidebar = document.querySelector('.wishlist-sidebar');
    if (sidebar) {
      showWishlistSidebar();
    }
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const productCard = btn.closest('.product-card');
      if (productCard) {
        const cardProductId = parseInt(productCard.dataset.id);
        if (cardProductId === productId) {
          updateWishlistButton(btn, false);
        }
      }
    });
  };

  const updateWishlistButton = (button, isInWishlist) => {
    if (!button) return;
    
    const icon = button.querySelector('i');
    if (icon) {
      if (isInWishlist) {
        icon.classList.remove('far');
        icon.classList.add('fas', 'text-red-500');
        button.classList.add('in-wishlist');
      } else {
        icon.classList.remove('fas', 'text-red-500');
        icon.classList.add('far');
        button.classList.remove('in-wishlist');
      }
    }
  };

  if (wishlistIcon) {
    wishlistIcon.addEventListener('click', e => {
      e.stopPropagation();
      showWishlistSidebar();
    });
  }

  const createWishlistItem = item => `
    <div class="wishlist-item" data-id="${item.id}">
      <img src="${item.thumbnail}" alt="${item.title}" class="wishlist-item-img">
      <div class="wishlist-item-details">
        <h4 class="wishlist-item-title">${item.title}</h4>
        <p class="wishlist-item-price">$${item.price.toFixed(2)}</p>
      </div>
      <div class="wishlist-item-actions">
        <button class="btn add-to-cart-from-wishlist" data-id="${item.id}">
          <i class="fas fa-shopping-cart"></i>
        </button>
        <button class="btn remove-from-wishlist" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  const showWishlistSidebar = () => {
    let sidebar = document.querySelector('.wishlist-sidebar');
    
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.className = 'wishlist-sidebar';
      sidebar.innerHTML = `
        <div class="wishlist-header">
          <h2>Your Wishlist</h2>
          <i class="fas fa-times close-wishlist"></i>
        </div>
        <div class="wishlist-items" id="wishlist-items">
          ${wishlist.length === 0 ? 
            '<p class="empty-wishlist">Your wishlist is empty</p>' : 
            wishlist.map(item => createWishlistItem(item)).join('')
          }
        </div>
      `;
      
      document.body.appendChild(sidebar);
      
      const closeBtn = document.querySelector('.close-wishlist');
      if (closeBtn) {
        closeBtn.addEventListener('click', hideWishlistSidebar);
      }
      
      document.querySelectorAll('.remove-from-wishlist').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.getAttribute('data-id'));
          removeFromWishlistById(productId);
        });
      });
      
      document.querySelectorAll('.add-to-cart-from-wishlist').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = parseInt(this.getAttribute('data-id'));
          const product = wishlist.find(item => item.id === productId);
          if (product) {
            addToCart({
              id: product.id,
              name: product.title,
              price: product.price.toFixed(2),
              image: product.thumbnail
            });
          }
        });
      });
    } else {
      const wishlistItemsContainer = sidebar.querySelector('#wishlist-items');
      if (wishlistItemsContainer) {
        wishlistItemsContainer.innerHTML = wishlist.length === 0 ? 
          '<p class="empty-wishlist">Your wishlist is empty</p>' : 
          wishlist.map(item => createWishlistItem(item)).join('');
          
          document.querySelectorAll('.remove-from-wishlist').forEach(btn => {
          btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromWishlistById(productId);
          });
        });
        
        document.querySelectorAll('.add-to-cart-from-wishlist').forEach(btn => {
          btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = wishlist.find(item => item.id === productId);
            if (product) {
              addToCart({
                id: product.id,
                name: product.title,
                price: product.price.toFixed(2),
                image: product.thumbnail
              });
            }
          });
        });
      }
    }
    
    sidebar.classList.add('active');
  };

  const hideWishlistSidebar = () => {
    const sidebar = document.querySelector('.wishlist-sidebar');
    if (sidebar) {
      sidebar.classList.remove('active');
      setTimeout(() => sidebar.remove(), 300);
    }
  };

  updateWishlistCount();

  // Product Display and Filtering
  const productsGrid = document.querySelector(".products-grid");
  const filterLinks = document.querySelectorAll('.product-filters a');
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
  const sizeCheckboxes = document.querySelectorAll('input[name="size"]');
  const priceSlider = document.getElementById('price-slider');
  const maxPriceDisplay = document.getElementById('max-price-display');
  const applyFiltersBtn = document.querySelector('.apply-filters-btn');
  const resetFiltersBtn = document.querySelector('.reset-filters-btn');
  
  let allProducts = [];
  let filteredProducts = [];
  let currentCategoryFilter = 'all';
  let filterSettings = {
    categories: ['women', 'men', 'sports'],
    sizes: ['S', 'M', 'L', 'XL'],
    maxPrice: 500
  };

  // Price slider functionality
  if (priceSlider && maxPriceDisplay) {
    priceSlider.addEventListener('input', function() {
      maxPriceDisplay.textContent = `$${this.value}`;
      filterSettings.maxPrice = parseInt(this.value);
    });
  }

  // Initialize filter states from checkboxes
  const initializeFilters = () => {
    filterSettings.categories = Array.from(categoryCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
      
    filterSettings.sizes = Array.from(sizeCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
      
    if (priceSlider) {
      filterSettings.maxPrice = parseInt(priceSlider.value);
    }
  };

  // Apply filters to products
  const applyFilters = () => {
    initializeFilters();
    
    filteredProducts = allProducts.filter(product => {
      // Filter by category
      const categoryMatch = filterSettings.categories.length === 0 || 
        filterSettings.categories.some(cat => 
          product.category.toLowerCase().includes(cat.toLowerCase())
        );
      
      // Filter by price
      const priceMatch = product.price <= filterSettings.maxPrice;
      
      // Filter by size (assuming products have sizes property)
      const sizeMatch = filterSettings.sizes.length === 0 || 
        (product.sizes && product.sizes.some(size => 
          filterSettings.sizes.includes(size)
        ));
      
      // For products without size information, include them if no size filter is applied
      const hasSizes = product.sizes && product.sizes.length > 0;
      const sizeFilterApplied = filterSettings.sizes.length > 0;
      
      return categoryMatch && priceMatch && 
             (!sizeFilterApplied || !hasSizes || sizeMatch);
    });
    
    // Additional filter by selected category from top filter buttons
    if (currentCategoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === currentCategoryFilter
      );
    }
    
    renderProducts(filteredProducts);
  };

  // Reset all filters to default
  const resetFilters = () => {
    // Reset checkboxes
    categoryCheckboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
    
    sizeCheckboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
    
    // Reset price slider
    if (priceSlider) {
      priceSlider.value = 500;
      maxPriceDisplay.textContent = `$500`;
    }
    
    // Reset filter settings
    filterSettings = {
      categories: ['women', 'men', 'sports'],
      sizes: ['S', 'M', 'L', 'XL'],
      maxPrice: 500
    };
    
    // Reset category filter
    currentCategoryFilter = 'all';
    filterLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-category') === 'all') {
        link.classList.add('active');
      }
    });
    
    // Apply reset filters
    renderProducts(allProducts);
  };

  // Event listeners for filter controls
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }
  
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }

  // Add event listeners to category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // Ensure at least one category is selected
      const anyChecked = Array.from(categoryCheckboxes).some(cb => cb.checked);
      if (!anyChecked) {
        checkbox.checked = true;
      }
    });
  });

  // Add event listeners to size checkboxes
  sizeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // Ensure at least one size is selected
      const anyChecked = Array.from(sizeCheckboxes).some(cb => cb.checked);
      if (!anyChecked) {
        checkbox.checked = true;
      }
    });
  });

  // Render products function
  const renderProducts = productsToRender => {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';

    if (!productsToRender || productsToRender.length === 0) {
      productsGrid.innerHTML = '<p class="no-products">No products found</p>';
      return;
    }

    productsToRender.forEach(product => {
      const discount = product.discountPercentage ? `-${Math.round(product.discountPercentage)}%` : "";
      const productHTML = `
        <div class="product-card" data-id="${product.id}">
          ${discount ? `<span class="product-badge">${discount}</span>` : ""}
          <img src="${product.thumbnail}" alt="${product.title}" class="product-img">
          <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">
              ${product.discountPercentage ? 
                `<span class="old-price">$${(product.price * (1 + product.discountPercentage/100)).toFixed(2)}</span>` : 
                ""}
              <span class="current-price">$${product.price.toFixed(2)}</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="product-action-btn wishlist-btn">
              <i class="${isInWishlist(product) ? 'fas text-red-500' : 'far'} fa-heart"></i>
            </button>
            <button class="product-action-btn add-to-cart">
              <i class="fas fa-shopping-cart"></i>
            </button>
            <button class="product-action-btn quick-view-btn">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      `;
      productsGrid.insertAdjacentHTML("beforeend", productHTML);
    });

    addProductEventListeners();
  };

  // Add product event listeners
  const addProductEventListeners = () => {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        const productId = parseInt(productCard.dataset.id);
        const product = allProducts.find(p => p.id === productId);
        
        if (!product) return;
        
        addToCart({
          id: product.id,
          name: product.title,
          price: product.price.toFixed(2),
          image: product.thumbnail
        });

        this.innerHTML = '<i class="fas fa-check"></i>';
        this.classList.add('added');
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-shopping-cart"></i>';
          this.classList.remove('added');
        }, 1000);
      });
    });

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        const productId = parseInt(productCard.dataset.id);
        const product = allProducts.find(p => p.id === productId);
        
        if (!product) return;
        
        const wasAdded = toggleWishlist(product);
        saveWishlist();
        updateWishlistCount();
        updateWishlistButton(this, wasAdded);
        
        if (wishlistIcon && wasAdded) {
          wishlistIcon.classList.add('pulse');
          setTimeout(() => wishlistIcon.classList.remove('pulse'), 500);
        }
      });
    });

    document.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        if (!productCard) return;
        
        const productId = parseInt(productCard.dataset.id);
        const product = allProducts.find(p => p.id === productId);
        
        if (product) {
          showQuickViewModal(product);
        }
      });
    });
  };

  // Quick view modal
  const showQuickViewModal = product => {
    let modal = document.querySelector('.quick-view-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'quick-view-modal';
      modal.innerHTML = `
        <div class="quick-view-content">
          <i class="fas fa-times close-quick-view"></i>
          <div class="quick-view-left">
            <img src="${product.thumbnail}" alt="${product.title}" class="quick-view-img">
          </div>
          <div class="quick-view-right">
            <h3>${product.title}</h3>
            <div class="quick-view-price">
              ${product.discountPercentage ? 
                `<span class="old-price">$${(product.price * (1 + product.discountPercentage/100)).toFixed(2)}</span>` : 
                ''}
              <span class="current-price">$${product.price.toFixed(2)}</span>
              ${product.discountPercentage ? 
                `<span class="discount-badge">-${Math.round(product.discountPercentage)}%</span>` : 
                ''}
            </div>
            <p class="quick-view-description">${product.description}</p>
            <div class="quick-view-actions">
              <button class="quick-view-wishlist-btn">
                <i class="${isInWishlist(product) ? 'fas text-red-500' : 'far'} fa-heart"></i>
                ${isInWishlist(product) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
              <button class="quick-view-add-to-cart">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const closeBtn = document.querySelector('.close-quick-view');
      if (closeBtn) {
        closeBtn.addEventListener('click', hideQuickViewModal);
      }
      
      const wishlistBtn = document.querySelector('.quick-view-wishlist-btn');
      if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
          const wasAdded = toggleWishlist(product);
          saveWishlist();
          updateWishlistCount();
          
          const icon = this.querySelector('i');
          if (icon) {
            if (wasAdded) {
              icon.classList.remove('far');
              icon.classList.add('fas', 'text-red-500');
              this.innerHTML = `<i class="fas text-red-500 fa-heart"></i> Remove from Wishlist`;
            } else {
              icon.classList.remove('fas', 'text-red-500');
              icon.classList.add('far');
              this.innerHTML = `<i class="far fa-heart"></i> Add to Wishlist`;
            }
          }
          
          const productCard = document.querySelector(`.product-card[data-id="${product.id}"] .wishlist-btn`);
          if (productCard) {
            updateWishlistButton(productCard, wasAdded);
          }
          
          if (wishlistIcon && wasAdded) {
            wishlistIcon.classList.add('pulse');
            setTimeout(() => wishlistIcon.classList.remove('pulse'), 500);
          }
        });
      }
      
      const addToCartBtn = document.querySelector('.quick-view-add-to-cart');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
          addToCart({
            id: product.id,
            name: product.title,
            price: product.price.toFixed(2),
            image: product.thumbnail
          });
          this.textContent = 'Added to Cart!';
          setTimeout(() => {
            this.textContent = 'Add to Cart';
          }, 2000);
        });
      }
    }
    
    modal.classList.add('active');
  };

  const hideQuickViewModal = () => {
    const modal = document.querySelector('.quick-view-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  };

  // Helper function to generate random sizes for demo purposes
  function getRandomSizes() {
    const allSizes = ['S', 'M', 'L', 'XL'];
    const numberOfSizes = Math.floor(Math.random() * 4) + 1; // 1 to 4 sizes
    const shuffled = [...allSizes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numberOfSizes);
  }

  // Load products
  if (productsGrid) {
    fetch('products.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        // Filter products for clothing categories
        const clothingProducts = data.filter(product =>
          product.category.toLowerCase().includes('men') ||
          product.category.toLowerCase().includes('women') ||
          product.category.toLowerCase().includes('sports')
        );
  
        allProducts = clothingProducts.map(product => ({
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.image,
          discountPercentage: Math.floor(Math.random() * 30),
          description: product.description || "No description available.",
          rating: product.rating?.rate || 4.5,
          stock: product.stock || 50,
          category: product.category,
          sizes: getRandomSizes()
        }));
  
        filteredProducts = allProducts;
        renderProducts(allProducts);
        
        // Add filter category links functionality
        if (filterLinks) {
          filterLinks.forEach(link => {
            link.addEventListener('click', e => {
              e.preventDefault();
  
              filterLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
  
              currentCategoryFilter = link.getAttribute('data-category').toLowerCase();
              applyFilters();
            });
          });
        }
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        productsGrid.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>An error occurred while loading products. Please try again later.</p>
          </div>
        `;
      });
  }

  // Go to top button
  const goTopBtn = document.querySelector('.go-top');
  if (goTopBtn) {
    window.addEventListener('scroll', () => {
      goTopBtn.classList.toggle('show', window.scrollY > 200);
    });

    goTopBtn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Hero slider
  const hero = document.querySelector('.hero');
  if (hero) {
    const images = [
      'images/fashion-slideshow-01.jpg',
      'images/fashion-slideshow-02.jpg'
    ];
    let currentIndex = 0;

    const changeBackground = () => {
      hero.style.opacity = '0.7';
      setTimeout(() => {
        hero.style.backgroundImage = `url(${images[currentIndex]})`;
        hero.style.opacity = '1';
        currentIndex = (currentIndex + 1) % images.length;
      }, 500);
    };

    if (images.length > 1) {
      setInterval(changeBackground, 5000);
    }
  }

  // Initialize Swiper if it exists
  const swiperEl = document.querySelector('.sliders');
  if (swiperEl && typeof Swiper === 'function') {
    const swiper = new Swiper('.sliders', {
      loop: true,
      slidesPerView: 3,
      spaceBetween: 30,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        1024: {
          slidesPerView: 4,
        },
      },
    });
  }
});