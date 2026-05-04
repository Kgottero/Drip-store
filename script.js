/* ================================================================
   DRIP STORE — script.js
   Plain JS only. No frameworks, no libraries.
   ================================================================ */

"use strict";

// ── CONFIG ────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "2348067976904"; // Change this number if needed

// ── PRODUCTS ──────────────────────────────────────────────────────
const products = [
  {
    id: 1,
    name: "Sneakers",
    price: 25000,
    image: "IMG_2011.PNG"
  },
  {
    id: 2,
    name: "Hoodie",
    price: 15000,
   image: "IMG_2011.PNG"
  },
  {
    id: 3,
    name: "Cap",
    price: 5000,
    image: "IMG_2011.PNG"
  },
  {
    id: 4,
    name: "Wrist Watch",
    price: 500000,
    image: "IMG_2011.PNG"
  },
  {
    id: 5,
    name: "Backpack",
    price: 18000,
    image: "IMG_2011.PNG"
  },
  {
    id: 6,
    name: "Sunglasses",
    price: 12000,
    image: "IMG_2011.PNG"  
},
  {
    id: 7,
    name: "Slides",
    price: 10000,
    image: "IMG_2011.PNG"  },
  {
    id: 8,
    name: "T-Shirt",
    price: 8000,
    image: "IMG_2011.PNG"  },
  {
    id: 9,
    name: "Baseball Bat",
    price: 70000,
    image: "IMG_2011.PNG"
  }
];

// ── CART STATE ────────────────────────────────────────────────────
// cart is an array of { id, name, price, qty }
// Persisted to localStorage so it survives page refreshes.
let cart = loadCart();

function loadCart() {
  try {
    var saved = localStorage.getItem("dripstore_cart");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("dripstore_cart", JSON.stringify(cart));
  } catch (e) {
    // localStorage unavailable — fail silently
  }
}

// ── HELPERS ───────────────────────────────────────────────────────

/**
 * Format a number as Nigerian Naira string.
 * e.g. 25000 → "₦25,000"
 */
function formatNaira(amount) {
  return "₦" + amount.toLocaleString("en-NG");
}

/**
 * Find a cart item by product id, or return null.
 */
function findCartItem(productId) {
  return cart.find(function (item) { return item.id === productId; }) || null;
}

/**
 * Calculate total price of all cart items.
 */
function calcTotal() {
  return cart.reduce(function (sum, item) {
    return sum + item.price * item.qty;
  }, 0);
}

/**
 * Total number of individual units in cart.
 */
function calcTotalQty() {
  return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
}

// ── CART FUNCTIONS ─────────────────────────────────────────────────

/**
 * Add a product to the cart (or increment qty if already present).
 */
function addToCart(productId) {
  var product = products.find(function (p) { return p.id === productId; });
  if (!product) return;

  var existing = findCartItem(productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  // Persist & update UI
  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
  showToast("✔ " + product.name + " added to cart");
  updateAddButton(productId, true);
}

/**
 * Change the quantity of a cart item. If qty drops to 0, remove it.
 */
function changeQty(productId, delta) {
  var item = findCartItem(productId);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
}

/**
 * Remove a product from the cart entirely.
 */
function removeFromCart(productId) {
  cart = cart.filter(function (item) { return item.id !== productId; });
  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
  updateAddButton(productId, false);
}

/**
 * Clear the entire cart.
 */
function clearCart() {
  cart = [];
  saveCart();
  renderCartItems();
  updateCartCount();
  updateBottomBar();
  // Reset all add buttons
  products.forEach(function (p) { updateAddButton(p.id, false); });
}

// ── WHATSAPP FUNCTION ─────────────────────────────────────────────

/**
 * Generate the WhatsApp inquiry message and open the link.
 * Message format:
 *   Hello, I want to inquire about:
 *   • Product Name - ₦Price (qty x N)
 *   Total: ₦TotalPrice
 */
function inquireOnWhatsApp() {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  var lines = ["Hello, I want to inquire about:"];

  cart.forEach(function (item) {
    var line = "• " + item.name + " - " + formatNaira(item.price);
    if (item.qty > 1) {
      line += " (x" + item.qty + ")";
    }
    lines.push(line);
  });

  lines.push("");
  lines.push("Total: " + formatNaira(calcTotal()));

  var message = lines.join("\n");
  var encoded = encodeURIComponent(message);
  var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encoded;

  window.open(url, "_blank", "noopener,noreferrer");
}

// ── RENDER FUNCTIONS ──────────────────────────────────────────────

/**
 * Render all product cards into the grid.
 */
function renderProducts() {
  var grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  products.forEach(function (product, index) {
    var card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = (index * 0.07) + "s";
    card.dataset.id = product.id;

    card.innerHTML =
      '<div class="card-image">' +
  '<img src="' + product.image + '" alt="' + product.name + '">' +
  '<button class="card-gradient-add" onclick="addToCart(' + product.id + ')">+ Quick Add</button>' +
'</div>' +
        '<button class="card-gradient-add" onclick="addToCart(' + product.id + ')">+ Quick Add</button>' +
      '</div>' +
      '<div class="card-body">' +
        '<button class="card-add-btn" id="addBtn-' + product.id + '" onclick="addToCart(' + product.id + ')">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
            '<path d="M12 5v14M5 12h14"/>' +
          '</svg>' +
          'Add to Cart' +
        '</button>' +
      '</div>' +
      '<div class="card-info">' +
        '<div class="card-name">' + product.name + '</div>' +
        '<div class="card-price">' + formatNaira(product.price) + '</div>' +
      '</div>';

    grid.appendChild(card);
  });
}

/**
 * Render the cart items list inside the cart panel.
 */
function renderCartItems() {
  var container = document.getElementById("cartItems");
  var footer    = document.getElementById("cartFooter");

  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">Your cart is empty.<br/>Add a product to get started.</p>';
    footer.style.display = "none";
    return;
  }

  footer.style.display = "flex";

  var html = "";
  cart.forEach(function (item) {
    html +=
      '<div class="cart-item">' +
        '<div class="cart-item-left">' +
          '<div class="cart-item-name">' + item.name + '</div>' +
          '<div class="cart-item-price">' + formatNaira(item.price * item.qty) + '</div>' +
        '</div>' +
        '<div class="cart-item-qty">' +
          '<button class="qty-btn" onclick="changeQty(' + item.id + ', -1)" aria-label="Decrease">−</button>' +
          '<span class="qty-num">' + item.qty + '</span>' +
          '<button class="qty-btn" onclick="changeQty(' + item.id + ', 1)" aria-label="Increase">+</button>' +
        '</div>' +
      '</div>';
  });

  container.innerHTML = html;
  document.getElementById("cartTotalPrice").textContent = formatNaira(calcTotal());
}

/**
 * Update the cart badge count in the header.
 */
function updateCartCount() {
  var qty   = calcTotalQty();
  var el    = document.getElementById("cartCount");
  el.textContent = qty;
  if (qty > 0) {
    el.classList.add("visible");
  } else {
    el.classList.remove("visible");
  }
}

/**
 * Show or hide the bottom bar, and update its content.
 */
function updateBottomBar() {
  var bar   = document.getElementById("bottomBar");
  var qty   = calcTotalQty();
  var total = calcTotal();

  if (qty === 0) {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "flex";
  document.getElementById("bottomCount").textContent = qty + (qty === 1 ? " item" : " items");
  document.getElementById("bottomTotal").textContent = formatNaira(total);
}

/**
 * Toggle the visual state of an "Add to Cart" button.
 */
function updateAddButton(productId, added) {
  var btn = document.getElementById("addBtn-" + productId);
  if (!btn) return;

  if (added) {
    btn.classList.add("added");
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M20 6L9 17l-5-5"/>' +
      '</svg>' +
      'Added';
  } else {
    btn.classList.remove("added");
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M12 5v14M5 12h14"/>' +
      '</svg>' +
      'Add to Cart';
  }
}

// ── TOAST ─────────────────────────────────────────────────────────

var toastTimer = null;

/**
 * Show a brief notification toast.
 */
function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

// ── CART PANEL OPEN / CLOSE ───────────────────────────────────────

function openCart() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
  document.body.style.overflow = "";
}

// ── EVENT LISTENERS ───────────────────────────────────────────────

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);

document.getElementById("whatsappBtn").addEventListener("click", inquireOnWhatsApp);
document.getElementById("bottomWhatsapp").addEventListener("click", inquireOnWhatsApp);
document.getElementById("clearCart").addEventListener("click", clearCart);

// Keyboard: close cart on Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeCart();
});

// ── INIT ──────────────────────────────────────────────────────────
renderProducts();

// Restore persisted cart state into the UI
cart.forEach(function (item) { updateAddButton(item.id, true); });
renderCartItems();
updateCartCount();
updateBottomBar();