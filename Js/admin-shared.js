export function renderSidebar(active) {
  const pages = [
    { key: 'dashboard', label: '📊 Dashboard', href: 'index.html' },
    { key: 'orders',    label: '📦 Orders',    href: 'orders.html' },
    { key: 'products',  label: '🛍️ Products',  href: 'products.html' },
    { key: 'banners',   label: '🖼️ Banner Manager', href: 'banners.html' },
    { key: 'payment',   label: '💳 Payment Settings', href: 'payment.html' },
    { key: 'settings',  label: '⚙️ Website Settings', href: 'settings.html' }
  ];
  return `
    <aside class="sidebar">
      <a href="../index.html" class="side-logo">CRAZY<span>FLIP</span></a>
      <nav>
        ${pages.map(p => `
          <a class="nav-btn ${p.key === active ? 'active' : ''}" href="${p.href}">
            ${p.label}
          </a>
        `).join('')}
      </nav>
    </aside>
  `;
}

export function setupModal() {
  const modal = document.getElementById('modal');
  if (!modal) return { open(){}, close(){} };
  const content = document.getElementById('modalContent');
  document.getElementById('modalClose').onclick = () => modal.classList.remove('open');
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
  return {
    open(html) { content.innerHTML = html; modal.classList.add('open'); },
    close() { modal.classList.remove('open'); }
  };
}
