/* Shared page tools for redesigned pages.
 * [data-sd-share]   share this page (Web Share API) or copy its link
 * [data-sd-back]    back inside the site if the visitor came from it; otherwise go to href
 * [data-share-result] (eligibility) copy a link that re-opens the same answers — choices only, never the date of birth
 * #masarLink        points «مسار أوراقي» at the chosen profession (?code=)
 * On load, ?m=&n=&p=… re-applies the saved answers and shows the result. */
(function () {
  'use strict';
  var toastEl;
  function toast(t) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'sd-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }
  function copy(text, msg) {
    var ok = function () { toast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fb); else fb();
    function fb() { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('تعذّر النسخ، انسخ الرابط من شريط العنوان'); } ta.remove(); }
  }
  window.sdCopy = copy; window.sdToast = toast;

  document.querySelectorAll('[data-sd-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = location.href.split('#')[0];
      if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function () {});
      else copy(url, 'نُسخ رابط الصفحة');
    });
  });
  document.querySelectorAll('[data-sd-back]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var fromSite = document.referrer && document.referrer.indexOf(location.origin) === 0;
      if (fromSite && history.length > 1) { e.preventDefault(); history.back(); }
    });
  });

  /* ── eligibility: shareable result + masar link ── */
  var form = document.getElementById('eligibilityForm');
  if (!form) return;
  var KEYS = { m: 'checkMode', n: 'nationality', g: 'applicantGender', r: 'jordanResidency', s: 'syrianException', d: 'employmentDocuments', p: 'profession', t: 'experienceTitle', y: 'graduationYears', b: 'saudiBorn', i: 'investorDocuments', e: 'education', x: 'experience', a: 'accreditation' };
  var $ = function (id) { return document.getElementById(id); };
  function resultUrl() {
    var q = new URLSearchParams();
    Object.keys(KEYS).forEach(function (k) { var el = $(KEYS[k]); if (el && el.value && !el.closest('[hidden]')) q.set(k, el.value); });
    return location.origin + location.pathname + '?' + q.toString() + '#eligibilityResult';
  }
  document.querySelectorAll('[data-share-result]').forEach(function (b) { b.addEventListener('click', function () { copy(resultUrl(), 'نُسخ رابط النتيجة (اختياراتك فقط، دون تاريخ الميلاد)'); }); });

  var codes = null;
  function codeOf(name) {
    var go = function () { var n = String(name || '').trim(); var hit = codes.find(function (p) { return p.name_ar === n; }); return hit && /^\d{6}$/.test(String(hit.code)) ? hit.code : null; };
    if (codes) return Promise.resolve(go());
    return fetch('/professions.json').then(function (r) { return r.json(); }).then(function (d) { codes = d; return go(); });
  }
  var result = $('eligibilityResult');
  if (result) new MutationObserver(function () {
    if (result.hidden) return;
    var link = $('masarLink'); if (!link) return;
    codeOf($('profession').value).then(function (c) { link.href = '/saudi-visa-documents-tracker.html' + (c ? '?code=' + c : ''); });
  }).observe(result, { attributes: true, attributeFilter: ['hidden', 'data-state'] });

  // re-apply answers from a shared result link
  var params = new URLSearchParams(location.search);
  if (!params.has('n')) return;
  var tries = 0;
  (function apply() {
    var natReady = $('nationality').options.length > 1, profReady = $('professionOptions').options.length > 0;
    if ((!natReady || !profReady) && tries++ < 60) return setTimeout(apply, 100);
    ['m', 'n', 'g', 'r', 's', 'd', 'p', 't', 'y', 'b', 'i', 'e', 'x', 'a'].forEach(function (k) {
      var el = $(KEYS[k]); if (!el || !params.has(k)) return;
      el.value = params.get(k);
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
    setTimeout(function () { result.scrollIntoView({ block: 'start' }); }, 50);
  })();
})();
