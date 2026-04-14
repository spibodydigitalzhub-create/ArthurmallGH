const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const cartCount = document.getElementById("cartCount");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
}

/* CART STORAGE */
function getCart() {
  return JSON.parse(localStorage.getItem("arthurmallghCart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("arthurmallghCart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = total;
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: product.name,
      price: Number(product.price),
      image: product.image,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();
  alert(product.name + " added successfully");
}

function formatMoney(amount) {
  return "₵" + Number(amount).toLocaleString();
}

/* FILTER */
const filterButtons = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll(".product-card");
const searchInput = document.getElementById("searchInput");

function applyFilterAndSearch(selectedFilter = null) {
  const activeFilter =
    selectedFilter ||
    document.querySelector(".filter-btn.active")?.dataset.filter ||
    "all";

  const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

  productCards.forEach(card => {
    const category = card.dataset.category;
    const name = card.querySelector("h3").textContent.toLowerCase();

    const matchesFilter = activeFilter === "all" || activeFilter === category;
    const matchesSearch = name.includes(searchValue);

    card.style.display = matchesFilter && matchesSearch ? "block" : "none";
  });
}

if (filterButtons.length) {
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilterAndSearch(btn.dataset.filter);
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("keyup", () => {
    applyFilterAndSearch();
  });
}

function applyCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  if (!category) return;

  const matchingButton = document.querySelector(`.filter-btn[data-filter="${category}"]`);
  if (matchingButton) {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    matchingButton.classList.add("active");
    applyFilterAndSearch(category);
  }
}

/* MODAL */
const modal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalPrice = document.getElementById("modalPrice");
const modalDetails = document.getElementById("modalDetails");
const modalAdd = document.getElementById("modalAdd");

let currentProduct = null;

document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const card = btn.closest(".product-card");

    const product = {
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image,
      details: card.dataset.details
    };

    currentProduct = product;

    if (modalImage) modalImage.src = product.image;
    if (modalName) modalName.textContent = product.name;
    if (modalPrice) modalPrice.textContent = formatMoney(product.price);
    if (modalDetails) modalDetails.textContent = product.details;

    if (modal) modal.classList.add("show");
  });
});

if (closeModal && modal) {
  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });
}

if (modalAdd) {
  modalAdd.addEventListener("click", () => {
    if (currentProduct) addToCart(currentProduct);
  });
}

/* ADD TO CART BUTTONS */
document.querySelectorAll(".add-cart-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const card = btn.closest(".product-card");

    addToCart({
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image
    });
  });
});

/* CART PAGE */
function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartTotalItems = document.getElementById("cartTotalItems");
  const cartTotalPrice = document.getElementById("cartTotalPrice");

  if (!cartItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    if (cartTotalItems) cartTotalItems.textContent = "0";
    if (cartTotalPrice) cartTotalPrice.textContent = "₵0";
    return;
  }

  let totalItems = 0;
  let totalPrice = 0;
  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>Price: ${formatMoney(item.price)}</p>
        <p>Quantity: ${item.quantity}</p>
        <p>Total: ${formatMoney(item.price * item.quantity)}</p>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `;
    cartItems.appendChild(div);
  });

  if (cartTotalItems) cartTotalItems.textContent = totalItems;
  if (cartTotalPrice) cartTotalPrice.textContent = formatMoney(totalPrice);

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const cart = getCart();
      cart.splice(index, 1);
      saveCart(cart);
      updateCartCount();
      renderCartPage();
    });
  });
}

/* INIT */
updateCartCount();
renderCartPage();
applyCategoryFromUrl();
const viewButtons = document.querySelectorAll(".view-btn");

viewButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");

    const name = card.querySelector("h3").textContent;
    const price = card.querySelector(".price").textContent;
    const image = card.querySelector("img").src;

    alert(name + "\n" + price);
});
});