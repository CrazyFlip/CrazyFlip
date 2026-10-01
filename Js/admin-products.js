import { renderSidebar, setupModal } from './admin-shared.js';
import { getProducts, addProduct, updateProduct, deleteProduct } from './data.js';

document.getElementById('sidebar').innerHTML = renderSidebar('products');
const modal = setupModal();
let allProducts = [];

async function load() {
  allProducts = await getProducts();
  const list = document.getElementById('productsList');

  if (!allProducts.length) {
    list.innerHTML = '<p style="color:#666">No products yet.</p>';
    return;
  }

  list.innerHTML = allProducts.map(p => `
    <div class="item-card">
      <div class="item-info">
        <h4>${p.name}</h4>
        <p>Starting: <b>GH₵ ${p.plans?.[0]?.price ?? 0}</b> · Plans: <b>${p.plans?.length || 0}</b></p>
      </div>
      <div class="actions">
        <button class="btn-edit" data-edit="${p.id}">EDIT</button>
        <button class="btn-delete" data-del="${p.id}">DELETE</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach(b =>
    b.onclick = () => productForm(allProducts.find(x => x.id === b.dataset.edit)));

  list.querySelectorAll('[data-del]').forEach(b =>
    b.onclick = async () => {
      if (confirm('Delete product?')) { await deleteProduct(b.dataset.del); load(); }
    });
}

document.getElementById('addProductBtn').onclick = () => productForm(null);

function productForm(p) {
  modal.open(`
    <h2>${p ? 'Edit' : 'Add'} Product</h2>
    <label>Name</label><input id="fpName" value="${p?.name || ''}" />
    <label>Image URL</label><input id="fpImage" value="${p?.image || ''}" />
    <label>Description</label><textarea id="fpDesc" rows="3">${p?.description || ''}</textarea>
    <label>Plans (Plan Name|Price, প্রতিটি নতুন লাইনে)</label>
    <textarea id="fpPlans" rows="4" placeholder="1 Month|30&#10;3 Months|90&#10;6 Months|170">${
      (p?.plans || []).map(x => `${x.name}|${x.price}`).join('\n')
    }</textarea>
    <button class="save-btn" id="fpSave">SAVE</button>
  `);

  document.getElementById('fpSave').onclick = async () => {
    const plans = document.getElementById('fpPlans').value
      .split('\n').map(l => l.trim()).filter(Boolean)
      .map(l => {
        const [name, price] = l.split('|').map(s => s.trim());
        return { name, price: Number(price) || 0 };
      });

    const data = {
      name: document.getElementById('fpName').value.trim(),
      image: document.getElementById('fpImage').value.trim(),
      description: document.getElementById('fpDesc').value.trim(),
      plans
    };

    if (!data.name || !data.image) return alert('Name & Image URL দিন');

    if (p) await updateProduct(p.id, data);
    else await addProduct(data);

    modal.close();
    load();
  };
}

load();
