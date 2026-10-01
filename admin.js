import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ========== 🔥 FIREBASE CONFIG — same as script.js ========== */
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

/* ========== ELEMENTS ========== */
const plansContainer = document.getElementById("plansContainer");
const form = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const productIdInput = document.getElementById("productId");
const listContainer = document.getElementById("adminProductList");

/* ========== ADD PLAN ROW ========== */
function addPlanRow(name = "", price = "") {
  const row = document.createElement("div");
  row.className = "plan-row";
  row.innerHTML = `
    <input type="text" placeholder="Plan name (e.g. 1 Month)" class="plan-name" value="${name}" />
    <input type="number" placeholder="Price (GH₵)" class="plan-price" value="${price}" />
    <button type="button" class="remove-plan"><i class="fas fa-trash"></i></button>
  `;
  row.querySelector(".remove-plan").addEventListener("click", () => row.remove());
  plansContainer.appendChild(row);
}

document.getElementById("addPlanBtn").addEventListener("click", () => addPlanRow());

/* ========== SUBMIT FORM ========== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const description = document.getElementById("pDesc").value.trim();
  const image = document.getElementById("pImage").value.trim();

  const planRows = document.querySelectorAll(".plan-row");
  const plans = [];
  planRows.forEach((r) => {
    const pn = r.querySelector(".plan-name").value.trim();
    const pp = r.querySelector(".plan-price").value.trim();
    if (pn && pp) plans.push({ name: pn, price: Number(pp) });
  });

  if (!name) return alert("Product name required");
  if (plans.length === 0) return alert("Add at least one plan");

  const data = { name, description, image, plans };
  const editingId = productIdInput.value;

  try {
    if (editingId) {
      await updateDoc(doc(db, "products", editingId), data);
      alert("✅ Product updated!");
    } else {
      await addDoc(productsCol, data);
      alert("✅ Product added!");
    }
    resetForm();
  } catch (err) {
    console.error(err);
    alert("❌ Error: " + err.message);
  }
});

/* ========== RESET FORM ========== */
function resetForm() {
  form.reset();
  productIdInput.value = "";
  plansContainer.innerHTML = "";
  addPlanRow();
  formTitle.innerHTML = `<i class="fas fa-plus-circle"></i> Add Product`;
  submitBtn.innerHTML = `<i class="fas fa-save"></i> Save Product`;
  cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", resetForm);

/* ========== LIVE LIST (REAL-TIME) ========== */
onSnapshot(productsCol, (snapshot) => {
  listContainer.innerHTML = "";
  if (snapshot.empty) {
    listContainer.innerHTML = `<p style="color:#888;font-weight:700;">No products yet.</p>`;
    return;
  }

  snapshot.docs.forEach((d) => {
    const p = d.data();
    const item = document.createElement("div");
    item.className = "admin-product-item";
    item.innerHTML = `
      <div class="info">
        <strong>${p.name}</strong>
        <small>${p.plans?.length || 0} plan(s) • GH₵ ${p.plans?.[0]?.price || 0}+</small>
      </div>
      <div class="actions">
        <button class="edit-btn" data-id="${d.id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="delete-btn" data-id="${d.id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;

    item.querySelector(".edit-btn").addEventListener("click", () => {
      productIdInput.value = d.id;
      document.getElementById("pName").value = p.name || "";
      document.getElementById("pDesc").value = p.description || "";
      document.getElementById("pImage").value = p.image || "";
      plansContainer.innerHTML = "";
      (p.plans || []).forEach((pl) => addPlanRow(pl.name, pl.price));
      if (!p.plans || p.plans.length === 0) addPlanRow();
      formTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Product`;
      submitBtn.innerHTML = `<i class="fas fa-save"></i> Update Product`;
      cancelEditBtn.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    item.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm(`Delete "${p.name}"?`)) {
        await deleteDoc(doc(db, "products", d.id));
      }
    });

    listContainer.appendChild(item);
  });
});

/* ========== INIT ========== */
addPlanRow();
