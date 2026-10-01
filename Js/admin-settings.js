import { renderSidebar } from './admin-shared.js';
import { getSettings, saveSettings } from './data.js';

document.getElementById('sidebar').innerHTML = renderSidebar('settings');

(async () => {
  const s = await getSettings();
  document.getElementById('setSiteName').value = s.siteName || '';
  document.getElementById('setLogo').value = s.logo || '';
  document.getElementById('setWhatsapp').value = s.whatsapp || '';
  document.getElementById('setTelegram').value = s.telegram || '';

  document.getElementById('saveBtn').onclick = async () => {
    await saveSettings({
      siteName: document.getElementById('setSiteName').value.trim(),
      logo: document.getElementById('setLogo').value.trim(),
      whatsapp: document.getElementById('setWhatsapp').value.trim(),
      telegram: document.getElementById('setTelegram').value.trim()
    });
    alert('Saved!');
  };
})();
