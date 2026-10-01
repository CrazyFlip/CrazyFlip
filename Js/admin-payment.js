import { renderSidebar } from './admin-shared.js';
import { getSettings, saveSettings } from './data.js';

document.getElementById('sidebar').innerHTML = renderSidebar('payment');

(async () => {
  const s = await getSettings();
  document.getElementById('setMomo').value = s.momoNumber || '';
  document.getElementById('setAcc').value = s.accountName || '';
  document.getElementById('setPayText').value = s.paymentText || '';

  document.getElementById('saveBtn').onclick = async () => {
    await saveSettings({
      momoNumber: document.getElementById('setMomo').value.trim(),
      accountName: document.getElementById('setAcc').value.trim(),
      paymentText: document.getElementById('setPayText').value.trim()
    });
    alert('Saved!');
  };
})();
