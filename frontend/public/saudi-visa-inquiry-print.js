(() => {
  'use strict';

  const copyStatus = document.getElementById('copyStatus');
  const whatsappForm = document.getElementById('whatsappHelpForm');
  const whatsappStatus = document.getElementById('whatsappStatus');
  const whatsappNumber = '962789881009';
  const tr = (ar, en) => window.SV_TRANSLATE?.t(ar, en) || ar;
  const isEnglish = () => window.SV_TRANSLATE?.isEnglish?.() === true;

  async function copyValue(value, button) {
    try {
      await navigator.clipboard.writeText(value);
      if (copyStatus) copyStatus.textContent = tr('تم نسخ المعلومة. يمكنك لصقها في المكان المطلوب.', 'The information was copied. You can paste it where needed.');
      if (button) {
        const original = button.textContent;
        button.textContent = tr('تم النسخ', 'Copied');
        window.setTimeout(() => { button.textContent = original; }, 1600);
      }
    } catch (_) {
      if (copyStatus) copyStatus.textContent = tr('تعذر النسخ التلقائي. حدد النص وانسخه بالطريقة المعتادة.', 'Automatic copying was unavailable. Select the text and copy it normally.');
    }
  }

  document.querySelectorAll('[data-copy-value]').forEach((button) => {
    button.addEventListener('click', () => copyValue(button.dataset.copyValue || '', button));
  });

  if (whatsappForm) {
    whatsappForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const visaType = document.getElementById('visaType')?.value || '';
      const arrivalPoint = document.getElementById('arrivalPoint')?.value.trim() || '';
      const needPassportHelp = document.getElementById('needPassportHelp')?.checked;
      if (!visaType || !arrivalPoint) {
        if (whatsappStatus) whatsappStatus.textContent = tr('اختر نوع التأشيرة واكتب جهة القدوم أولاً.', 'Choose a visa type and enter the country or point of application first.');
        return;
      }
      const passportLine = needPassportHelp
        ? (isEnglish() ? ' If needed, I will send the passport image only in this official conversation.' : ' وإذا احتجتم صورة الجواز، سأرسلها داخل هذه المحادثة الرسمية فقط.')
        : '';
      const message = isEnglish()
        ? `Hello, I need help inquiring about my ${visaType}. Country or point of application: ${arrivalPoint}.${passportLine}`
        : `مرحباً، أحتاج مساعدة في الاستعلام عن ${visaType}. جهة القدوم أو بلد التقديم: ${arrivalPoint}.${passportLine}`;
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      if (whatsappStatus) whatsappStatus.textContent = tr('سيتم فتح واتساب برسالة جاهزة من دون إرسالها تلقائياً.', 'WhatsApp will open with a prepared message; it will not be sent automatically.');
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  document.addEventListener('sv:languagechange', () => {
    if (copyStatus) copyStatus.textContent = '';
    if (whatsappStatus) whatsappStatus.textContent = '';
  });
})();
