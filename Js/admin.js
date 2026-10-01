import {
  getOrders, updateOrder, deleteOrder, listenOrders,
  getProducts, addProduct, updateProduct, deleteProduct,
  getBanners, addBanner, updateBanner, deleteBanner,
  getSettings, saveSettings
} from './data.js';

// ===== TABS =====
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  };
});

// ===== MODAL =====
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
document.getElementById('modalClose').onclick = () => modal.classList.remove('open');
modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
function openModal(html) { modalContent.innerHTML = html; modal.classList.add('open'); }

// =========================================
// DASHBOARD
// =========================================
listenOrders(orders => {
  document.getElementById('stTotal').textContent = orders.length;
  document.getElementById('stPending').textContent =
    orders.filter(o=>o.status==='Pending').length;
  document.getElementById('stCompleted').textContent =
    orders.filter(o=>o.status==='Completed').length;
  document.getElementById('stRevenue').textContent =
    orders.filter(o=>o.status==='Completed')
          .reduce((s,o)=>s+(o.price||0),0);
  renderOrders(orders);
});

// =========================================
// ORDERS
// =========================================
let currentOrders = [];
function renderOrders(orders) {
  currentOrders = orders;
  const list = document.getElementById('ordersList');
  if (!orders.length) { list.innerHTML = '<p style="color:#666">No orders yet.</p>'; return; }
  list.innerHTML = orders.map(o => `
    <div class="item-card">
      <div class="item-info">
        <h4>${o.orderId} — ${o.product}</h4>
        <p>Plan: <b>${o.plan}</b> · Price: <b>GH₵ ${o.price}</b> · ${o.date}</p>
        <p>WhatsApp: <b>${o.whatsappNumber}</b> · TXID: <b>${o.transactionId}</b></p>
      </div>
      <span class="status ${o.status}">${o.status}</span>
      <div class="actions">
        <button class="btn-view-o" data-view="${o.id}">VIEW</button>
        <button class="btn-complete" data-complete="${o.id}">COMPLETE</button>
        <button class="btn-cancel" data-cancel="${o.id}">CANCEL</button>
        <button class="btn-delete" data-del="${o.id}">DELETE</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {
    const o = currentOrders.find(x=>x.id===b.dataset.view);
    openModal(`
      <h2>Order ${o.orderId}</h2>
      <p><b>Product:</b> ${o.product}</p>
      <p><b>Plan:</b> ${o.plan}</p>
      <p><b>Price:</b> GH₵ ${o.price}</p>
      <p><b>WhatsApp:</b> ${o.whatsappNumber}</p>
      <p><b>Transaction ID:</b> ${o.transactionId}</p>
      <p><b>Date:</b> ${o.date}</p>
      <p><b>Status:</b> ${o.status}</p>
    `);
  });

  list.querySelectorAll('[data-complete]').forEach(b =>
    b.onclick = () => updateOrder(b.dataset.complete, { status:'Completed' }));
  list.querySelectorAll('[data-cancel]').forEach(b =>
    b.onclick = () => updateOrder(b.dataset.cancel, { status:'Cancelled' }));
  list.querySelectorAll('[data-del]').forEach(b =>
    b.onclick = () => { if (confirm('Delete this order?')) deleteOrder(b.dataset.del); });
}

// =========================================
// PRODUCTS
// =========================================
async function loadProducts() {
  const products = await getProducts();
  const list = document.getElementById('productsList');
  if (!products.length) { list.innerHTML = '<p style="color:#666">No products yet.</p>'; return; }
  list.innerHTML = products.map(p => `
    <div class="item-card">
      <div class="item-info">
        <h4>${p.name}</h4>
        <p>Starting: <b>GH₵ ${p.plans?.[0]?.price ?? 0}</b> · Plans: <b>${p.plans?.length||0}</b></p>
      </div>
      <div class="actions">
        <button class="btn-edit" data-edit-p="${p.id}">EDIT</button>
        <button class="btn-delete" data-del-p="${p.id}">DELETE</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-edit-p]').forEach(b =>
    b.onclick = () => productForm(products.find(x=>x.id===b.dataset.edit_p || x.id===b.dataset.editP)));
  list.querySelectorAll('[data-del-p]').forEach(b =>
    b.onclick = () => { if (confirm('Delete product?')) deleteProduct(b.dataset.delP).then(loadProducts); });
}

document.getElementById('addProductBtn').onclick = () => productForm(null);

function productForm(p) {
  openModal(`
    <h2>${p ? 'Edit' : 'Add'} Product</h2>
    <label>Name</label><input id="fpName" value="${p?.name||''}" />
    <label>Image URL</label><input id="fpImage" value="${p?.image||''}" />
    <label>Description</label><textarea id="fpDesc" rows="3">${p?.description||''}</textarea>
    <label>Plans (format: Plan Name|Price, প্রতিটি লাইনে আলাদা)</label>
    <textarea id="fpPlans" rows="4" placeholder="1 Month|30&#10;3 Months|90&#10;6 Months|170">${
      (p?.plans||[]).map(x=>`${x.name}|${x.price}`).join('\n')
    }</textarea>
    <button class="save-btn" id="fpSave">SAVE</button>
  `);
  document.getElementById('fpSave').onclick = async () => {
    const plans = document.getElementById('fpPlans').value
      .split('\n').map(l=>l.trim()).filter(Boolean)
      .map(l=>{
        const [name, price] = l.split('|').map(s=>s.trim());
        return { name, price: Number(price)||0 };
      });
    const data = {
      name: document.getElementById('fpName').value.trim(),
      image: document.getElementById('fpImage').value.trim(),
      description: document.getElementById('fpDesc').value.trim(),
      plans
    };
    if (!data.name) return alert('Name দিন');
    if (p) await updateProduct(p.id, data);
    else await addProduct(data);
    modal.classList.remove('open');
    loadProducts();
  };
}

// =========================================
// BANNERS
// =========================================
async function loadBanners() {
  const banners = await getBanners();
  const list = document.getElementById('bannersList');
  if (!banners.length) { list.innerHTML = '<p style="color:#666">No banners yet.</p>'; return; }
  list.innerHTML = banners.map(b => `
    <div class="item-card">
      <div class="item-info">
        <h4>${b.title||'(no title)'}</h4>
        <p style="word-break:break-all">${b.image}</p>
      </div>
      <div class="actions">
        <button class="btn-edit" data-edit-b="${b.id}">EDIT</button>
        <button class="btn-delete" data-del-b="${b.id}">DELETE</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-edit-b]').forEach(btn =>
    btn.onclick = () => bannerForm(banners.find(x=>x.id===btn.dataset.editB)));
  list.querySelectorAll('[data-del-b]').forEach(btn =>
    btn.onclick = () => { if (confirm('Delete banner?')) deleteBanner(btn.dataset.delB).then(loadBanners); });
}

document.getElementById('addBannerBtn').onclick = () => bannerForm(null);

function bannerForm(b) {
  openModal(`
    <h2>${b ? 'Edit' : 'Add'} Banner</h2>
    <label>Image URL</label><input id="fbImage" value="${b?.image||''}" />
    <label>Title (optional)</label><input id="fbTitle" value="${b?.title||''}" />
    <label>Link (optional)</label><input id="fbLink" value="${b?.link||''}" />
    <button class="save-btn" id="fbSave">SAVE</button>
  `);
  document.getElementById('fbSave').onclick = async () => {
    const data = {
      image: document.getElementById('fbImage').value.trim(),
      title: document.getElementById('fbTitle').value.trim(),
      link: document.getElementById('fbLink').value.trim()
    };
    if (!data.image) return alert('Image URL দিন');
    if (b) await updateBanner(b.id, data);
    else await addBanner(data);
    modal.classList.remove('open');
    loadBanners();
  };
}

// =========================================
// SETTINGS
// =========================================
async function loadSettings() {
  const s = await getSettings();
  document.getElementById('setMomo').value = s.momoNumber || '';
  document.getElementById('setAcc').value = s.accountName || '';
  document.getElementById('setPayText').value = s.paymentText || '';
  document.getElementById('setSiteName').value = s.siteName || '';
  document.getElementById('setLogo').value = s.logo || '';
  document.getElementById('setWhatsapp').value = s.whatsapp || '';
  document.getElementById('setTelegram').value = s.telegram || '';
}

document.getElementById('savePayment').onclick = async () => {
  await saveSettings({
    momoNumber: document.getElementById('setMomo').value.trim(),
    accountName: document.getElementById('setAcc').value.trim(),
    paymentText: document.getElementById('setPayText').value.trim()
  });
  alert('Saved!');
};

document.getElementById('saveSite').onclick = async () => {
  await saveSettings({
    siteName: document.getElementById('setSiteName').value.trim(),
    logo: document.getElementById('setLogo').value.trim(),
    whatsapp: document.getElementById('setWhatsapp').value.trim(),
    telegram: document.getElementById('setTelegram').value.trim()
  });
  alert('Saved!');
};

// ===== INIT =====
loadProducts();
loadBanners();
loadSettings();
