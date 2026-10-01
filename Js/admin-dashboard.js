import { renderSidebar } from './admin-shared.js';
import { listenOrders } from './data.js';

document.getElementById('sidebar').innerHTML = renderSidebar('dashboard');

listenOrders(orders => {
  document.getElementById('stTotal').textContent = orders.length;
  document.getElementById('stPending').textContent =
    orders.filter(o => o.status === 'Pending').length;
  document.getElementById('stCompleted').textContent =
    orders.filter(o => o.status === 'Completed').length;
  document.getElementById('stRevenue').textContent =
    orders.filter(o => o.status === 'Completed').reduce((s, o) => s + (o.price || 0), 0);
});
