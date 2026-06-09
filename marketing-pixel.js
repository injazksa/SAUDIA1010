/**
 * 📊 Marketing Analytics — Facebook Pixel + WhatsApp Click Tracking
 * Pixel ID: 2499298600459646
 * Saudia Visa Jordan — 2026
 *
 * Tracks:
 *  - PageView (auto on every page load)
 *  - ClickWhatsApp (custom event when user clicks any wa.me link)
 *  - ClickPhone (custom event when user clicks tel: link)
 *  - Lead (when user submits any contact form)
 */
(function () {
  'use strict';

  // ───── 1) Facebook Pixel Base Code ─────────────────────────────────
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e); t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '2499298600459646');
  fbq('track', 'PageView');

  // ───── 2) WhatsApp Click Tracking ──────────────────────────────────
  function attachWhatsAppTracking() {
    const links = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp://"]');
    links.forEach((btn) => {
      if (btn.dataset.fbTracked === '1') return; // avoid double-binding
      btn.dataset.fbTracked = '1';
      btn.addEventListener('click', function () {
        try {
          fbq('trackCustom', 'ClickWhatsApp', {
            destination: 'WhatsApp Chat',
            page: window.location.pathname,
            href: btn.getAttribute('href') || ''
          });
          // Also fire Lead event (high-intent action)
          fbq('track', 'Lead', { content_name: 'WhatsApp Contact' });
        } catch (e) {
          // silent failure — never break user experience
        }
      });
    });
  }

  // ───── 3) Phone Click Tracking ─────────────────────────────────────
  function attachPhoneTracking() {
    const links = document.querySelectorAll('a[href^="tel:"]');
    links.forEach((btn) => {
      if (btn.dataset.fbTracked === '1') return;
      btn.dataset.fbTracked = '1';
      btn.addEventListener('click', function () {
        try {
          fbq('trackCustom', 'ClickPhone', {
            page: window.location.pathname,
            number: btn.getAttribute('href').replace('tel:', '')
          });
          fbq('track', 'Lead', { content_name: 'Phone Call' });
        } catch (e) { /* silent */ }
      });
    });
  }

  // ───── 4) Email Click Tracking ─────────────────────────────────────
  function attachEmailTracking() {
    const links = document.querySelectorAll('a[href^="mailto:"]');
    links.forEach((btn) => {
      if (btn.dataset.fbTracked === '1') return;
      btn.dataset.fbTracked = '1';
      btn.addEventListener('click', function () {
        try {
          fbq('trackCustom', 'ClickEmail', { page: window.location.pathname });
          fbq('track', 'Contact', { content_name: 'Email Contact' });
        } catch (e) { /* silent */ }
      });
    });
  }

  // ───── 5) Init on DOM ready + observe dynamic additions ────────────
  function init() {
    attachWhatsAppTracking();
    attachPhoneTracking();
    attachEmailTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-scan when DOM changes (e.g. when professions load dynamically)
  const observer = new MutationObserver(() => {
    attachWhatsAppTracking();
    attachPhoneTracking();
    attachEmailTracking();
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
})();
