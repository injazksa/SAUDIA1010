(() => {
  'use strict';

  const routeForm = document.getElementById('wafidRouteForm');
  const routeResult = document.getElementById('wafidRouteResult');
  const helpLink = document.querySelector('[data-wafid-whatsapp]');
  const whatsappNumber = '962789881009';
  const tr = (ar, en) => window.SV_TRANSLATE?.t(ar, en) || ar;
  const isEnglish = () => window.SV_TRANSLATE?.isEnglish?.() === true;

  function selectedRoute() {
    return document.querySelector('input[name="wafidVisaType"]:checked')?.value || 'work';
  }

  function updateHelpLink() {
    if (!helpLink) return;
    const message = isEnglish()
      ? 'Hello, I need guidance about a Wafid medical examination from Jordan. I am not sure which transaction type applies.'
      : 'مرحباً، أحتاج إرشاداً حول فحص وافد الطبي من الأردن، ولست متأكداً من نوع المعاملة المناسبة.';
    helpLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function routeContent(route) {
    if (route === 'family') {
      return {
        title: tr('مسار التأشيرة العائلية — Family Visa', 'Family Visa route'),
        text: tr('يظهر لك في نموذج وافد خيار Family Visa. قد يرتبط ذلك بمسار عائلي أو استقدام/إقامة عائلية بحسب نوع المعاملة والجهة الطالبة؛ أكمل التفاصيل داخل وافد.', 'The Wafid form shows a Family Visa option. This may relate to a family or family-recruitment/residence route depending on the transaction and requesting authority; complete the details inside Wafid.'),
        linkText: tr('احجز من وافد الرسمي', 'Book through official Wafid'),
      };
    }
    if (route === 'unknown') {
      return {
        title: tr('المعاملة غير واضحة بعد', 'The transaction type is not clear yet'),
        text: tr('لا تخمّن نوع الفحص. راجع نوع الطلب أو تواصل معنا لنوجهك إلى الرابط الرسمي المناسب، دون إرسال رقم الجواز داخل الموقع.', 'Do not guess the examination type. Check your application or contact us so we can direct you to the appropriate official link. Do not send your passport number through this website.'),
        linkText: tr('تواصل معنا للمساعدة', 'Contact us for guidance'),
      };
    }
    return {
      title: tr('مسار تأشيرة العمل — Work Visa', 'Work Visa route'),
      text: tr('يظهر لك في نموذج وافد خيار Work Visa. استخدم زر الحجز الرسمي، وأكمل بياناتك داخل منصة وافد فقط.', 'The Wafid form shows a Work Visa option. Use the official booking button and enter your details only on the Wafid platform.'),
      linkText: tr('احجز من وافد الرسمي', 'Book through official Wafid'),
    };
  }

  function renderRoute() {
    if (!routeResult) return;
    const route = selectedRoute();
    const content = routeContent(route);
    const href = route === 'unknown'
      ? (helpLink?.href || `https://wa.me/${whatsappNumber}`)
      : 'https://wafid.com/ar/book-appointment/';
    routeResult.innerHTML = `<strong>${content.title}</strong><p>${content.text}</p><a class="sv-btn sv-btn-secondary" href="${href}" target="_blank" rel="noopener noreferrer">${content.linkText} ↗</a>`;
    routeResult.hidden = false;
  }

  if (routeForm) routeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderRoute();
  });

  updateHelpLink();
  document.addEventListener('sv:languagechange', () => {
    updateHelpLink();
    if (routeResult && !routeResult.hidden) renderRoute();
  });
})();
