const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const cartCount = document.getElementById("cartCount");
const filterButtons = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll(".product-card");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalPrice = document.getElementById("modalPrice");
const modalDetails = document.getElementById("modalDetails");
const modalOrderBtn = document.getElementById("modalOrderBtn");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotalItems = document.getElementById("checkoutTotalItems");
const checkoutTotalPrice = document.getElementById("checkoutTotalPrice");
const checkoutForm = document.getElementById("checkoutForm");
const contactForm = document.getElementById("contactForm");

const WHATSAPP_NUMBER = "233570848484";
let currentProduct = null;

/* ================= MENU ================= */
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
}

/* ================= HELPERS ================= */
function formatMoney(amount) {
  return "₵" + Number(amount).toLocaleString();
}

function isOutOfStock(stockValue) {
  return stockValue === "out";
}

function updateCartCount() {
  const savedProduct = JSON.parse(localStorage.getItem("arthurmallghCheckoutProduct"));
  if (cartCount) {
    cartCount.textContent = savedProduct ? "1" : "0";
  }
}

function saveSelectedProduct(product) {
  localStorage.setItem("arthurmallghCheckoutProduct", JSON.stringify(product));
  updateCartCount();
}

function goToCheckout(product) {
  saveSelectedProduct(product);

  // META PIXEL: Initiate Checkout — genuine intent signal (not a duplicate)
  if (typeof fbq !== "undefined") {
    fbq("track", "InitiateCheckout", {
      content_name: product.name,
      content_type: "product",
      value: Number(product.price),
      currency: "GHS"
    });
  }

  window.location.href = "checkout.html";
}

function setModalOrderButton(stockStatus) {
  if (!modalOrderBtn) return;

  if (isOutOfStock(stockStatus)) {
    modalOrderBtn.textContent = "Out of Stock";
    modalOrderBtn.disabled = true;
    modalOrderBtn.classList.add("disabled");
  } else {
    modalOrderBtn.textContent = "Order Now";
    modalOrderBtn.disabled = false;
    modalOrderBtn.classList.remove("disabled");
  }
}

/* ================= FILTER & SEARCH ================= */
function applyFilterAndSearch(selectedFilter = null) {
  const grid = document.querySelector('.product-grid');
  if (!grid || !productCards.length) return;

  const activeFilter = selectedFilter ||
    document.querySelector(".filter-btn.active")?.dataset.filter ||
    "all";

  const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

  grid.classList.add('reflowing');

  productCards.forEach((card) => {
    const category = card.dataset.category?.toLowerCase().trim() || "";
    const name = card.dataset.name?.toLowerCase() ||
                 card.querySelector("h3")?.textContent.toLowerCase() || "";
    const normFilter = activeFilter.replace(/s$/, '').toLowerCase();
    const normCategory = category.replace(/s$/, '').toLowerCase();

    const matchesFilter = activeFilter === "all" ||
                          normCategory.includes(normFilter) ||
                          normFilter.includes(normCategory);

    const matchesSearch = name.includes(searchValue);

    card.style.display = (matchesFilter && matchesSearch) ? "block" : "none";
  });

  setTimeout(() => {
    grid.classList.remove('reflowing');
  }, 50);
}

if (filterButtons.length) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
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

/* ================= MODAL LOGIC ================= */
document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const card = btn.closest(".product-card");
    if (!card) return;

    let rawPrice = card.dataset.price;

    if (!rawPrice || isNaN(parseFloat(rawPrice))) {
      const priceText = card.querySelector(".price")?.textContent || "0";
      rawPrice = priceText.replace(/[^0-9.]/g, '');
    }

    currentProduct = {
      name: card.dataset.name || card.querySelector("h3")?.textContent || "Unknown Product",
      price: Number(rawPrice),
      image: card.dataset.image || card.querySelector("img")?.src || "",
      details: card.dataset.details || "",
      stock: card.dataset.stock || "in"
    };

    if (modalImage) modalImage.src = currentProduct.image;
    if (modalName) modalName.textContent = currentProduct.name;
    if (modalPrice) modalPrice.textContent = formatMoney(currentProduct.price);
    if (modalDetails) modalDetails.textContent = currentProduct.details;

    setModalOrderButton(currentProduct.stock);

    // META PIXEL: View Content — genuine distinct signal (not a duplicate)
    if (typeof fbq !== "undefined") {
      fbq("track", "ViewContent", {
        content_name: currentProduct.name,
        content_type: "product",
        value: currentProduct.price,
        currency: "GHS"
      });
    }

    if (modal) modal.classList.add("show");
  });
});

if (closeModal && modal) {
  closeModal.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });
}

/* ================= ORDER BUTTONS ================= */
document.querySelectorAll(".order-btn").forEach((btn) => {
  if (btn.id === "modalOrderBtn") return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const card = btn.closest(".product-card");
    if (!card) return;

    if (isOutOfStock(card.dataset.stock)) {
      alert("Sorry, this product is currently out of stock.");
      return;
    }

    goToCheckout({
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image,
      quantity: 1
    });
  });
});

if (modalOrderBtn) {
  modalOrderBtn.addEventListener("click", () => {
    if (!currentProduct) return;

    if (isOutOfStock(currentProduct.stock)) {
      alert("Sorry, this product is currently out of stock.");
      return;
    }

    goToCheckout({
      name: currentProduct.name,
      price: Number(currentProduct.price),
      image: currentProduct.image,
      quantity: 1
    });
  });
}

/* ================= CHECKOUT PAGE ================= */
function renderSingleCheckoutProduct() {
  if (!checkoutItems) return;

  const singleProduct = JSON.parse(localStorage.getItem("arthurmallghCheckoutProduct"));

  if (!singleProduct) {
    checkoutItems.innerHTML = "<p>No product selected.</p>";
    if (checkoutTotalItems) checkoutTotalItems.textContent = "0";
    if (checkoutTotalPrice) checkoutTotalPrice.textContent = "0";
    return;
  }

  checkoutItems.innerHTML = `
    <div class="checkout-item">
      <div>
        <strong>${singleProduct.name}</strong><br>
        <small>Qty: 1 × ${formatMoney(singleProduct.price)}</small>
      </div>
      <strong>${formatMoney(singleProduct.price)}</strong>
    </div>
  `;

  if (checkoutTotalItems) checkoutTotalItems.textContent = "1";
  if (checkoutTotalPrice) checkoutTotalPrice.textContent = formatMoney(singleProduct.price);
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const singleProduct = JSON.parse(localStorage.getItem("arthurmallghCheckoutProduct"));
    if (!singleProduct) return;

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const customerAddress = document.getElementById("customerAddress").value.trim();
    const customerNote = document.getElementById("customerNote").value.trim();

    const message = `Hello, I want to place an order.\n\nProduct: ${singleProduct.name}\nPrice: ${formatMoney(singleProduct.price)}\n\nName: ${customerName}\nPhone: ${customerPhone}\nAddress: ${customerAddress}\nNote: ${customerNote || "None"}`;

    // 1. Open WhatsApp in a new tab
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");

    // 2. Redirect to Thank You page where Purchase event will fire
    // This ensures the event fires AFTER the customer completes the checkout flow
    window.location.href = "thank-you.html";
  });
}

/* ================= CONTACT FORM ================= */
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    const text = `Hello, I want to make an inquiry.\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");

    // META PIXEL: Single consolidated event for inquiries (no duplicates)
    if (typeof fbq !== "undefined") {
      fbq("trackCustom", "WhatsAppInquiry");
    }
    
    // Optional: Reset form
    contactForm.reset();
  });
}

/* ================= INITIALIZATION ================= */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderSingleCheckoutProduct();

  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get('category');

  if (urlCategory) {
    const matchingBtn = document.querySelector(`.filter-btn[data-filter="${urlCategory}"]`);

    if (matchingBtn) {
      matchingBtn.click();
    } else {
      applyFilterAndSearch(urlCategory);
    }
  } else {
    applyFilterAndSearch('all');
  }
});
