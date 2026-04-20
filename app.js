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

const whatsappNumber = "233570848484";
const contactWhatsappNumber = "233570848484";

let currentProduct = null;

/* MENU */
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
}

/* HELPERS */
function formatMoney(amount) {
  return "₵" + Number(amount).toLocaleString();
}

function updateCartCountFromCheckoutProduct() {
  const savedProduct = JSON.parse(localStorage.getItem("arthurmallghCheckoutProduct"));
  if (cartCount) {
    cartCount.textContent = savedProduct ? "1" : "0";
  }
}

function saveSelectedProduct(product) {
  localStorage.setItem("arthurmallghCheckoutProduct", JSON.stringify(product));
  updateCartCountFromCheckoutProduct();
}

function goToCheckout(product) {
  saveSelectedProduct(product);

  // META PIXEL: checkout started
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

/* FILTER */
function applyFilterAndSearch(selectedFilter = null) {
  if (!productCards.length) return;

  const activeFilter =
    selectedFilter ||
    document.querySelector(".filter-btn.active")?.dataset.filter ||
    "all";

  const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

  productCards.forEach((card) => {
    const category = card.dataset.category;
    const name = card.dataset.name
      ? card.dataset.name.toLowerCase()
      : card.querySelector("h3").textContent.toLowerCase();

    const matchesFilter = activeFilter === "all" || activeFilter === category;
    const matchesSearch = name.includes(searchValue);

    card.style.display = matchesFilter && matchesSearch ? "block" : "none";
  });
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

/* VIEW DETAILS MODAL */
document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const card = btn.closest(".product-card");
    if (!card) return;

    currentProduct = {
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image,
      details: card.dataset.details || ""
    };

    if (modalImage) modalImage.src = currentProduct.image;
    if (modalName) modalName.textContent = currentProduct.name;
    if (modalPrice) modalPrice.textContent = formatMoney(currentProduct.price);
    if (modalDetails) modalDetails.textContent = currentProduct.details;

    // META PIXEL: product viewed
    if (typeof fbq !== "undefined") {
      fbq("track", "ViewContent", {
        content_name: currentProduct.name,
        content_type: "product",
        value: Number(currentProduct.price),
        currency: "GHS"
      });
    }

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

/* CARD ORDER NOW */
document.querySelectorAll(".order-btn").forEach((btn) => {
  if (btn.id === "modalOrderBtn") return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const card = btn.closest(".product-card");
    if (!card) return;

    const product = {
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image,
      quantity: 1
    };

    goToCheckout(product);
  });
});

/* MODAL ORDER NOW */
if (modalOrderBtn) {
  modalOrderBtn.addEventListener("click", () => {
    if (!currentProduct) return;

    const product = {
      name: currentProduct.name,
      price: Number(currentProduct.price),
      image: currentProduct.image,
      quantity: 1
    };

    goToCheckout(product);
  });
}

/* CHECKOUT PAGE */
function renderSingleCheckoutProduct() {
  if (!checkoutItems) return;

  const singleProduct = JSON.parse(localStorage.getItem("arthurmallghCheckoutProduct"));

  if (!singleProduct) {
    checkoutItems.innerHTML = "<p>No product selected.</p>";
    if (checkoutTotalItems) checkoutTotalItems.textContent = "0";
    if (checkoutTotalPrice) checkoutTotalPrice.textContent = "₵0";
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

/* CHECKOUT FORM */
if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const singleProduct = JSON.parse(localStorage.getItem("arthurmallghCheckoutProduct"));

    if (!singleProduct) return;

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const customerAddress = document.getElementById("customerAddress").value.trim();
    const customerNote = document.getElementById("customerNote").value.trim();

    // META PIXEL: lead generated from checkout
    if (typeof fbq !== "undefined") {
      fbq("track", "Lead");
      fbq("trackCustom", "WhatsAppOrder", {
        content_name: singleProduct.name,
        content_type: "product",
        value: Number(singleProduct.price),
        currency: "GHS"
      });
    }

    const message = `Hello, I want to place an order.

Product: ${singleProduct.name}
Price: ${formatMoney(singleProduct.price)}

Name: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}
Note: ${customerNote || "None"}`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  });
}

/* CONTACT FORM */
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    // META PIXEL: contact / inquiry
    if (typeof fbq !== "undefined") {
      fbq("track", "Contact");
      fbq("trackCustom", "WhatsAppInquiry");
    }

    const text = `Hello, I want to make an inquiry.

Name: ${name}
Phone: ${phone}
Message: ${message}`;

    window.open(
      `https://wa.me/${contactWhatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  });
}

/* INIT */
updateCartCountFromCheckoutProduct();
renderSingleCheckoutProduct();