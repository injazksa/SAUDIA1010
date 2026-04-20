/**
 * ═══════════════════════════════════════════════════════════════════
 *  config-loader.js — يحمّل إعدادات الموقع من CMS ويطبّقها
 * ═══════════════════════════════════════════════════════════════════
 *  عناصر DOM المستهدَفة:
 *    [data-config="phone"]          → رقم الهاتف (href="tel:...")
 *    [data-config="phone_display"]  → الهاتف كما يظهر
 *    [data-config="whatsapp_url"]   → رابط واتساب
 *    [data-config="email"]          → البريد الإلكتروني
 *    [data-config="email_url"]      → href="mailto:..."
 *    [data-config="address"]        → العنوان
 *    [data-config="address_short"]  → العنوان المختصر
 *    [data-config="license"]        → رقم الترخيص
 *    [data-config="hours_full"]     → النص الكامل للدوام
 *    [data-ticker-items]            → حاوية الشريط الإخباري (يُعاد بناؤها)
 *    [data-config="stats.years"]    → عدد سنوات الخبرة
 *    [data-config="stats.clients"]  → عدد العملاء
 *    [data-config="stats.professions"] → عدد المهن
 *
 *  يعمل بشكل LAZY + CACHED في sessionStorage لمنع إبطاء الموقع.
 */
(function() {
  'use strict';
  const SETTINGS_URL = '/content/settings.json';
  const CACHE_KEY = 'sv_settings_v1';
  const CACHE_TTL = 10 * 60 * 1000; // 10 دقائق

  async function loadSettings() {
    // استخدم الذاكرة المؤقتة إذا كانت حديثة
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { t, d } = JSON.parse(cached);
        if (Date.now() - t < CACHE_TTL) return d;
      }
    } catch (_) { /* تجاهل أخطاء التخزين */ }

    try {
      const res = await fetch(SETTINGS_URL + '?v=' + Date.now().toString().slice(0,-4), { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: data }));
      } catch (_) {}
      return data;
    } catch (_) { return null; }
  }

  function applyText(el, value) {
    if (value == null || value === '') return;
    el.textContent = value;
  }

  function apply(settings) {
    if (!settings) return;

    // النصوص البسيطة
    document.querySelectorAll('[data-config]').forEach((el) => {
      const key = el.getAttribute('data-config');
      switch (key) {
        case 'phone':          applyText(el, settings.phone); if (el.tagName === 'A') el.setAttribute('href', 'tel:' + settings.phone); break;
        case 'phone_display':  applyText(el, settings.phone_display || settings.phone); break;
        case 'whatsapp_url':
          if (el.tagName === 'A' && settings.whatsapp) el.setAttribute('href', 'https://wa.me/' + settings.whatsapp);
          break;
        case 'email':          applyText(el, settings.email); break;
        case 'email_url':
          if (el.tagName === 'A' && settings.email) el.setAttribute('href', 'mailto:' + settings.email);
          break;
        case 'address':        applyText(el, settings.address); break;
        case 'address_short':  applyText(el, settings.address_short); break;
        case 'license':        applyText(el, settings.license); break;
        case 'hours_full':
          if (settings.hours) {
            const { days_arabic, opens, closes, closed_days } = settings.hours;
            // حوّل 09:00 إلى 9:00 صباحاً و 16:00 إلى 4:00 مساءً
            const fmt = (t) => {
              const [h, m] = (t || '').split(':').map(Number);
              if (isNaN(h)) return '';
              const ampm = h < 12 ? 'صباحاً' : 'مساءً';
              const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
              return `${hh}:${(m||0).toString().padStart(2,'0')} ${ampm}`;
            };
            el.textContent = `${days_arabic}، من ${fmt(opens)} إلى ${fmt(closes)}` + (closed_days ? ` (${closed_days}: مغلق)` : '');
          }
          break;
        case 'stats.years':       applyText(el, settings.stats?.years_experience); break;
        case 'stats.clients':     applyText(el, settings.stats?.happy_clients); break;
        case 'stats.professions': applyText(el, settings.stats?.professions); break;
      }
    });

    // الشريط الإخباري: أعد بناء الرسائل (مضاعفة للتمرير السلس)
    const tickerBox = document.querySelector('[data-ticker-items]');
    if (tickerBox && Array.isArray(settings.ticker_items) && settings.ticker_items.length) {
      const items = settings.ticker_items.filter(x => x && x.text);
      const build = () => items.map((it, i) => {
        const color = i % 2 === 0 ? 'text-white' : 'text-gold';
        return `<span class="${color} text-sm font-medium whitespace-nowrap">${escapeHtml(it.text)}</span>`;
      }).join('\n');
      // مضاعفة للـ scroll المستمر
      tickerBox.innerHTML = build() + '\n' + build();
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  async function boot() {
    const settings = await loadSettings();
    apply(settings);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
