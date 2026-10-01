import {
  getProducts, getBanners, getSettings, addOrder, generateOrderId
} from './data.js';

let products = [], banners = [], settings = {};
let currentProduct = null, currentPlan = null;

async function init() {
  try {
    settings = await getSettings();
    document.getElementById('footerName').textContent =
      (settings.siteName || 'CRAZY FLIP') + ' © 2026';
    document.title = settings.siteName || 'CRAZY FLIP';
    banners = await getBanners();
    renderBanners();
    products = await getProducts();
    renderProducts(products);
  } catch (e) {
    console.error(e);
    document.getElementById('productsGrid').innerHTML =
      '<div class="loading">Firebase connection failed</div>';
  }
}

let bannerIndex = 0, bannerTimer;
function renderBanners() {
  const el = document.getElementById('bannerSlider');
  if (!banners.length) return;
  el.innerHTML = banners.map((b,i) => `
    <div class="banner-slide ${i===0?'active':''}"
         style="background-image:url('${b.image}')">
      <h2>${b.title || ''}</h2>
    </div>
  `).join('') + `<div class="banner-dots">${
    banners.map((_,i)=>`<span class="${i===0?'active':''}" data-i="${i}"></span>`).join('')
  }</div>`;
  el.querySelectorAll('.banner-dots span').forEach(dot => {
    dot.onclick = () => goBanner(+dot.dataset.i);
  });
  bannerTimer = setInterval(() => goBanner((bannerIndex+1)%banners.length), 4000);
}
function goBanner(i) {
  bannerIndex = i;
  document.querySelectorAll('.banner-slide').forEach((s,idx) =>
    s.classList.toggle('active', idx===i));
  document.querySelectorAll('.banner-dots span').forEach((d,idx) =>
    d.classList.toggle('active', idx===i));
}

function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!list.length) {
    grid.innerHTML = '<div class="loading">No products yet.</div>';
    return;
  }
  grid.innerHTML = list.map((p,i) => `
    <div class="product-card" style="animation-delay:${i*.05}s">
      <img src="${p.image}" alt="${p.name}"
        onerror="this.src='https://via.placeholder.com/300x180/111/fff?text=CF'"/>
      <div class="pc-body">
        <div class="pc-name">${p.name}</div>
        <div class="pc-price">Starting <b>GH₵ ${p.plans?.[0]?.price ?? 0}</b></div>
        <button class="btn-view" data-id="${p.id}">VIEW PRODUCT</button>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.btn-view').forEach(btn => {
    btn.onclick = () => openProduct(btn.dataset.id);
  });
}

document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
});

function openProduct(id) {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;
  document.getElementById('pdImage').src = currentProduct.image;
  document.getElementById('pdName').textContent = currentProduct.name;
  document.getElementById('pdDesc').textContent = currentProduct.description || '';
  const plans = currentProduct.plans || [];
  currentPlan = plans[0] || null;
  document.getElementById('pdPlans').innerHTML = plans.map((pl,i) => `
    <div class="plan-item ${i===0?'active':''}" data-i="${i}">
      <span>${pl.name}</span><b>GH₵ ${pl.price}</b>
    </div>
  `).join('');
  document.querySelectorAll('.plan-item').forEach(item => {
    item.onclick = () => {
      document.querySelectorAll('.plan-item').forEach(x=>x.classList.remove('active'));
      item.classList.add('active');
      currentPlan = plans[+item.dataset.i];
      document.getElementById('pdPrice').textContent = `GH₵ ${currentPlan.price}`;
    };
  });
  document.getElementById('pdPrice').textContent = `GH₵ ${currentPlan?.price ?? 0}`;
  document.getElementById('productPopup').classList.add('open');
}

document.getElementById('buyNowBtn').onclick = () => {
  if (!currentPlan) return alert('Select a plan');
  closeAll();
  document.getElementById('payProduct').textContent = currentProduct.name;
  document.getElementById('payPlan').textContent = currentPlan.name;
  document.getElementById('payPrice').textContent = `GH₵ ${currentPlan.price}`;
  document.getElementById('payMomo').textContent = settings.momoNumber || '-';
  document.getElementById('payAcc').textContent = settings.accountName || '-';
  document.getElementById('payText').textContent = settings.paymentText || '';
  document.getElementById('paymentPopup').classList.add('open');
};

document.getElementById('copyMomo').onclick = () => {
  navigator.clipboard.writeText(settings.momoNumber || '');
  const b = document.getElementById('copyMomo');
  b.textContent = 'COPIED!';
  setTimeout(()=>b.textContent='COPY',1500);
};

async function confirmOrder(method) {
  const wp = document.getElementById('inpWhatsapp').value.trim();
  const tx = document.getElementById('inpTxid').value.trim();
  if (!wp || !tx) return alert('WhatsApp & Transaction ID দিন!');

  const orderId = await generateOrderId();
  await addOrder({
    orderId, product: currentProduct.name, plan: currentPlan.name,
    price: currentPlan.price, whatsappNumber: wp, transactionId: tx,
    date: new Date().toISOString().slice(0,10),
    status: 'Pending', createdAt: Date.now()
  });

  const msg =
`Order ID: ${orderId}

Product: ${currentProduct.name}
Plan: ${currentPlan.name}
Price: GH₵ ${currentPlan.price}

WhatsApp Number:
${wp}

Transaction ID:
${tx}`;

  const encoded = encodeURIComponent(msg);

  if (method === 'whatsapp') {
    const num = (settings.whatsapp || '').replace(/\D/g,'');
    if (!num) return alert('Admin WhatsApp number set করা নেই');
    window.open(`https://wa.me/${num}?text=${encoded}`, '_blank');
  } else {
    const tg = (settings.telegram || '').replace('@','');
    if (!tg) return alert('Admin Telegram set করা নেই');
    navigator.clipboard.writeText(msg);
    window.open(`https://t.me/${tg}`, '_blank');
    alert('Order saved! Telegram এ message paste করে পাঠান।');
  }

  closeAll();
  document.getElementById('inpWhatsapp').value = '';
  document.getElementById('inpTxid').value = '';
}

document.getElementById('btnWhatsapp').onclick = () => confirmOrder('whatsapp');
document.getElementById('btnTelegram').onclick = () => confirmOrder('telegram');

function closeAll() {
  document.querySelectorAll('.popup').forEach(p => p.classList.remove('open'));
}
document.querySelectorAll('[data-close]').forEach(btn => btn.onclick = closeAll);
document.querySelectorAll('.popup').forEach(p => {
  p.onclick = e => { if (e.target === p) closeAll(); };
});

init();
