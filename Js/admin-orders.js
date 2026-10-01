import { renderSidebar, setupModal } from './admin-shared.js';
import { listenOrders, updateOrder, deleteOrder } from './data.js';

document.getElementById('sidebar').innerHTML = renderSidebar('orders');
const modal = setupModal();
let allOrders = [];

listenOrders(orders => {
  allOrders = orders;
  const list = document.getElementById('ordersList');

  if (!orders.length) {
    list.innerHTML = '<p style="color:#666">No orders yet.</p>';
    return;
  }

  list.innerHTML = orders.map(o => `
    <div class="item-card">
      <div class="item-info">
        <h4>${o.orderId} — ${o.product}</h4>
        <p>Plan: <b>${o.plan}</b> · Price: <b>GH₵ ${o.price}</b> · ${o.date}</p>
        <p>WP: <b>${o.whatsappNumber}</b> · TXID: <b>${o.transactionId}</b></p>
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
    const o = allOrders.find(x => x.id === b.dataset.view);
    modal.open(`
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
    b.onclick = () => updateOrder(b.dataset.complete, { status: 'Completed' }));
  list.querySelectorAll('[data-cancel]').forEach(b =>
    b.onclick = () => updateOrder(b.dataset.cancel, { status: 'Cancelled' }));
  list.querySelectorAll('[data-del]').forEach(b =>
    b.onclick = () => { if (confirm('Delete order?')) deleteOrder(b.dataset.del); });
});
