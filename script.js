import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ========== 🔥 FIREBASE CONFIG — apnar nijer config boshan ========== */
const firebaseConfig = {
  apiKey: "AIzaSyAtCagT7Al29I_WLsG4AFfy-DKGi_svA9A",
  authDomain: "crazy-flip.firebaseapp.com",
  projectId: "crazy-flip",
  storageBucket: "crazy-flip.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, "products");

/* ========== STATE ========== */
let allProducts = [];
let currentProduct = null;
let selectedPlan = null;

/* ========== SLIDER ========== */
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("sliderDots");
let currentSlide = 0;

slides.forEach((_, i) => {
  const dot = document.createElement("span");
  if (i === 0) dot.classList.add("active-dot");
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function goToSlide(index) {
  slides.forEach((s) => s.classList.remove("active"));
  document.querySelectorAll(".slider-dots span").forEach((d) => d.classList.remove("active-dot"));
  slides[index].classList.add("active");
  document.querySelectorAll(".slider-dots span")[index].classList.add("active-dot");
  currentSlide = index;
}

setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  goToSlide(currentSlide);
}, 4500);

/* ========== LOAD PRODUCTS (REAL-TIME) ========== */
onSnapshot(productsCol, (snapshot) => {
  allProducts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderProducts(allProducts);
}, (error) => {
  console.error("Firestore error:", error);
  document.getElementById("productsGrid").innerHTML =
    `<p style="color:#ff4444;padding:20px;font-weight:700;">⚠️ Firebase connection failed. Check config.</p>`;
});

function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `<p style="color:#888;padding:20px;font-weight:700;">No products found.</p>`;
    return;
  }

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    const startingPrice = p.plans?.length
      ? Math.min(...p.plans.map((pl) => Number(pl.price)))
      : 0;

    card.innerHTML = `
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" />` : `<i class="fas fa-box"></i>`}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">GH₵ ${startingPrice} <span>starting</span></div>
        <button class="view-btn"><i class="fas fa-eye"></i> View Product</button>
      </div>
    `;

    card.querySelector(".view-btn").addEventListener("click", () => openProductModal(p));
    grid.appendChild(card);
  });
}

/* ========== PRODUCT MODAL ========== */
function openProductModal(product) {
  currentProduct = product;
  selectedPlan = product.plans?.[0] || null;

  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalProductDesc").textContent = product.description || "No description available.";
  document.getElementById("modalProductIcon").innerHTML = product.image
    ? `<img src="${product.image}" alt="${product.name}" />`
    : `<i class="fas fa-box"></i>`;

  const plansList = document.getElementById("plansList");
  plansList.innerHTML = "";

  (product.plans || []).forEach((plan, idx) => {
    const div = document.createElement("div");
    div.className = "plan-option" + (idx === 0 ? " selected-plan" : "");
    div.innerHTML = `
      <span class="plan-name">${plan.name}</span>
      <span class="plan-price">GH₵ ${plan.price}</span>
    `;
    div.addEventListener("click", () => {
      document.querySelectorAll(".plan-option").forEach((el) => el.classList.remove("selected-plan"));
      div.classList.add("selected-plan");
      selectedPlan = plan;
      updateAutoPrice();
    });
    plansList.appendChild(div);
  });

  updateAutoPrice();
  document.getElementById("productModal").classList.add("active-modal");
}

function updateAutoPrice() {
  const price = selectedPlan ? selectedPlan.price : 0;
  document.getElementById("autoPrice").textContent = `GH₵ ${price}`;
}

window.closeProductModal = function () {
  document.getElementById("productModal").classList.remove("active-modal");
};

/* ========== BUY NOW → PAYMENT ========== */
document.getElementById("buyNowBtn").addEventListener("click", () => {
  if (!selectedPlan) return alert("Please select a plan.");

  document.getElementById("payProductName").textContent = currentProduct.name;
  document.getElementById("payPlan").textContent = selectedPlan.name;
  document.getElementById("payTotal").textContent = `GH₵ ${selectedPlan.price}`;

  closeProductModal();
  document.getElementById("paymentModal").classList.add("active-modal");
});

window.closePaymentModal = function () {
  document.getElementById("paymentModal").classList.remove("active-modal");
};

/* ========== COPY ========== */
window.copyText = function (text) {
  navigator.clipboard.writeText(text).then(() => alert("Copied: " + text));
};

/* ========== CONFIRM WHATSAPP ========== */
document.getElementById("confirmWhatsapp").addEventListener("click", () => {
  const phone = document.getElementById("whatsappInput").value.trim();
  const txn = document.getElementById("txnInput").value.trim();

  if (!phone || !txn) return alert("Please enter WhatsApp number and Transaction ID.");

  const msg = `🛒 *CRAZY FLIP ORDER*%0A%0A*Product:* ${currentProduct.name}%0A*Plan:* ${selectedPlan.name}%0A*Total:* GH₵ ${selectedPlan.price}%0A*WhatsApp:* ${phone}%0A*Txn ID:* ${txn}`;
  window.open(`https://wa.me/233240000000?text=${msg}`, "_blank");
});

/* ========== CONFIRM TELEGRAM ========== */
document.getElementById("confirmTelegram").addEventListener("click", () => {
  const phone = document.getElementById("whatsappInput").value.trim();
  const txn = document.getElementById("txnInput").value.trim();

  if (!phone || !txn) return alert("Please enter WhatsApp number and Transaction ID.");

  const msg = `CRAZY FLIP ORDER%0AProduct: ${currentProduct.name}%0APlan: ${selectedPlan.name}%0ATotal: GH₵ ${selectedPlan.price}%0APhone: ${phone}%0ATxn: ${txn}`;
  window.open(`https://t.me/CrazyFlipSupport?text=${msg}`, "_blank");
});

/* ========== SEARCH ========== */
document.getElementById("searchInput").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(q));
  renderProducts(filtered);
});

/* ========== CLOSE ON OUTSIDE CLICK ========== */
window.addEventListener("click", (e) => {
  if (e.target.id === "productModal") closeProductModal();
  if (e.target.id === "paymentModal") closePaymentModal();
});
