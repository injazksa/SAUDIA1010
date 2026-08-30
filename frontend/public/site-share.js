(() => {
  'use strict';

  const tr = (ar, en) => window.SV_TRANSLATE?.t(ar, en) || ar;
  const isEnglish = () => window.SV_TRANSLATE?.isEnglish?.() === true;

  function pageTitle() {
    const title = document.querySelector('h1')?.textContent?.trim();
    return title || document.title;
  }

  async function sharePage(button) {
    const url = window.location.href.split('#')[0];
    const payload = { title: pageTitle(), text: pageTitle(), url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      button.dataset.shareStatus = 'copied';
      button.textContent = tr('تم نسخ رابط الصفحة', 'Page link copied');
    } catch (_) {
      const input = document.createElement('input');
      input.value = url;
      input.setAttribute('readonly', 'readonly');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      button.dataset.shareStatus = copied ? 'copied' : 'manual';
      button.textContent = copied ? tr('تم نسخ رابط الصفحة', 'Page link copied') : tr('انسخ الرابط يدويًا', 'Copy the link manually');
    }
    window.setTimeout(() => {
      button.textContent = tr('مشاركة الصفحة', 'Share this page');
      delete button.dataset.shareStatus;
    }, 2600);
  }

  document.querySelectorAll('[data-share-page]').forEach((button) => {
    button.addEventListener('click', () => sharePage(button));
  });

  document.addEventListener('sv:languagechange', () => {
    document.querySelectorAll('[data-share-page]').forEach((button) => {
      if (!button.dataset.shareStatus) button.textContent = tr('مشاركة الصفحة', 'Share this page');
    });
  });
})();
