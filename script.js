
const products = [
  { id: 1, name: "Classic Margherita", category: "pizza", price: 249, badge: "A classic", desc: "Tomato, mozzarella, basil and a little magic.", image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Farmhouse Feast", category: "pizza", price: 299, badge: "Fan favourite", desc: "Peppers, onion, mushrooms and golden cheese.", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Tandoori Paneer", category: "pizza", price: 329, badge: "Indian twist", desc: "Smoky paneer, peppers and creamy tandoori sauce.", image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Peri Peri Veg", category: "pizza", price: 319, badge: "A little heat", desc: "Spicy peri peri, crisp vegetables and melted cheese.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Cheesy Garlic Bread", category: "sides", price: 129, badge: "Perfect side", desc: "Toasted bread, garlic butter and stretchy cheese.", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Loaded Potato Wedges", category: "sides", price: 119, badge: "Golden & crisp", desc: "Seasoned potato wedges with a creamy dip.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Chilled Lemon Soda", category: "drinks", price: 79, badge: "Cool down", desc: "Fresh lemon, sparkling fizz and lots of ice.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Chocolate Shake", category: "drinks", price: 149, badge: "Sweet finish", desc: "A rich, creamy chocolate treat.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=80" }
];

const cart = [];
let currentCategory = "all";
const $ = id => document.getElementById(id);
const money = amount => "₹" + amount.toLocaleString("en-IN");

function renderMenu() {
  const visible = products.filter(product =>
    currentCategory === "all" || product.category === currentCategory
  );

  $("menuGrid").innerHTML = visible.map(product => `
    <article class="food-card">
      <div class="food-img">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="food-badge">${product.badge}</span>
      </div>
      <div class="food-content">
        <div class="food-title">
          <h3>${product.name}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${product.desc}</p>
        <div class="food-bottom">
          ${product.category === "pizza" ? `
            <select class="size-select" id="size-${product.id}" aria-label="${product.name} size">
              <option value="0">Regular</option>
              <option value="50">Medium +₹50</option>
              <option value="100">Large +₹100</option>
            </select>` : ""}
          <button class="add-btn" data-add="${product.id}">+ Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

$("filters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  currentCategory = button.dataset.category;
  document.querySelectorAll(".filter").forEach(filter =>
    filter.classList.toggle("active", filter === button)
  );
  renderMenu();
});

$("menuGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const product = products.find(item => item.id === Number(button.dataset.add));
  const select = $("size-" + product.id);
  const extra = select ? Number(select.value) : 0;
  const size = select ? select.options[select.selectedIndex].text.split(" +")[0] : "";
  const key = product.id + "-" + size;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      size,
      price: product.price + extra,
      qty: 1
    });
  }

  renderCart();
  showToast(product.name + " added to your bag!");
});

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  $("cartCount").textContent = count;
  $("cartHeadingCount").textContent = "(" + count + ")";
  $("cartTotal").textContent = money(total);

  if (!cart.length) {
    $("cartItems").innerHTML = `
      <div class="cart-empty">🍕<br>
        <strong>Your bag is looking a little empty.</strong><br>
        Pick something delicious from our menu.
      </div>`;
    return;
  }

  $("cartItems").innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <small>${item.size ? item.size + " size · " : ""}${money(item.price)} each</small>
        <div class="qty">
          <button data-qty="${item.key}" data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button data-qty="${item.key}" data-change="1" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div>
        <div class="item-price">${money(item.qty * item.price)}</div>
        <button class="remove" data-remove="${item.key}">Remove</button>
      </div>
    </div>
  `).join("");
}

$("cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const item = cart.find(product => product.key === quantityButton.dataset.qty);
    if (item) {
      item.qty += Number(quantityButton.dataset.change);
      if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
    }
    renderCart();
  }

  if (removeButton) {
    const index = cart.findIndex(item => item.key === removeButton.dataset.remove);
    if (index !== -1) cart.splice(index, 1);
    renderCart();
  }
});

function openCart() {
  $("cartPanel").classList.add("show");
  $("overlay").classList.add("show");
  $("cartPanel").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("cartPanel").classList.remove("show");
  $("overlay").classList.remove("show");
  $("cartPanel").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("continueBtn").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

$("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your bag is empty. Add something first!");
    return;
  }

  const lines = cart.map(item =>
    `• ${item.name}${item.size ? " (" + item.size + ")" : ""} × ${item.qty} = ${money(item.price * item.qty)}`
  ).join("\n");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const message = `Hello Crust & Crave! I'd like to enquire about this order:\n\n${lines}\n\nSubtotal: ${money(total)}\n\nPlease confirm availability and delivery details.`;

  // Replace with the restaurant's actual WhatsApp number.
  const whatsappNumber = "919876543210";
  window.open(
    "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message),
    "_blank",
    "noopener,noreferrer"
  );
});

$("menuToggle").addEventListener("click", () => {
  $("navlinks").classList.toggle("open");
});

document.querySelectorAll("#navlinks a").forEach(link => {
  link.addEventListener("click", () => $("navlinks").classList.remove("open"));
});

let toastTimer;
function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2200);
}

$("year").textContent = new Date().getFullYear();
renderMenu();
renderCart();
