/* «شاهد نموذج الشهادة» — one shared preview for sample documents (owner 2026-10-27).
 * Samples (personal data covered, made by tools/redact-samples.js): SVP professional examination, QVP professional
 * verification, Musadaqa university-degree verification notice. The SVP and QVP certificates look alike (same platform);
 * the KIND shown is decided by the profession's own requirement (its list says (SVP) or (QVP)), never by the picture.
 * Nothing loads until needed: a 7 KB thumbnail when a trigger is shown, the full image only when the visitor opens it.
 * API: SD_CERT.button(kind, {profession, onChoice}) → <button>; SD_CERT.open(kind, opts); SD_CERT.kindOf(text) → kind|null;
 *      SD_CERT.enhance(root) adds a trigger next to every list item in [data-sd-cert-auto] that names SVP / QVP / Musadaqa. */
(function () {
  'use strict';
  if (window.SD_CERT) return;
  var BASE = '/images/samples/sample-';
  var KINDS = {
    svp: {
      title: 'نموذج شهادة الفحص المهني SVP', btn: 'شاهد نموذج الشهادة',
      short: 'الفحص المهني (SVP)',
      what: 'تصدر بعد اجتياز الفحص المهني. عنوانها «شهادة الاعتماد المهني»، وما يميزها عبارة «قد استوفى بنجاح المؤهلات المطلوبة والكفاءات اللازمة لمزاولة مهنة» (مؤطرة بخط متقطع).',
      who: 'للمهن التي يسري عليها الفحص المهني، ومنها مهن الثانوية العامة أو أقل حسب قواعد كل مهنة.',
    },
    qvp: {
      title: 'نموذج شهادة التحقق المهني QVP', btn: 'شاهد نموذج الشهادة',
      short: 'التحقق المهني (QVP)',
      what: 'شكلها قريب من شهادة الفحص المهني لأن المنصة واحدة، لكن ما يميزها عبارة «قد تم التحقق من موائمة المؤهلات مع متطلبات المهنة» (مؤطرة بخط متقطع).',
      who: 'للمهن التي تتطلب دبلومًا شاملًا فما فوق حسب قواعد كل مهنة. مثال النموذج: محلل بيانات.',
    },
    musadaqa: {
      title: 'نموذج مصادقة الشهادة الجامعية', btn: 'شاهد نموذج شهادة مصادقة',
      short: 'مصادقة الشهادة الجامعية',
      what: 'يصدر من منصة «مصادقة» بعد التحقق من الشهادة الجامعية نفسها، وفيه «نتيجة التوثيق» (مؤطرة بخط متقطع).',
      who: 'يخص الشهادة الجامعية، وهو مختلف عن التحقق المهني (QVP) والفحص المهني (SVP) اللذين يخصان المهنة.',
    },
  };
  var CSS = '.sdc-trigger{display:inline-flex;align-items:center;gap:10px;margin:8px 0 0;padding:6px 12px 6px 6px;min-height:44px;border:1px solid #DDE3EC;border-radius:12px;background:#fff;color:#1B2A41;font:inherit;font-size:14px;cursor:pointer;text-align:start;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}' +
    '.sdc-trigger:hover{border-color:#C9A35E;box-shadow:0 6px 16px -10px rgba(15,27,45,.45);transform:translateY(-1px)}.sdc-trigger:focus-visible{outline:3px solid #C9A35E;outline-offset:2px}' +
    '.sdc-trigger img{width:64px;height:auto;max-height:90px;object-fit:cover;object-position:top;border-radius:6px;border:1px solid #E3DED2;background:#F4F6F9}' +
    '.sdc-trigger b{display:block;font-family:"Noto Kufi Arabic",Tahoma,sans-serif;font-size:13.5px}.sdc-trigger small{display:block;color:#8A5A0A;font-size:12.5px}' +
    '.sdc-note{display:block;margin-top:6px;font-size:13.5px;color:#475569}' +
    '.sdc-dialog{width:min(920px,calc(100vw - 24px));max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);padding:0;border:0;border-radius:18px;box-shadow:0 30px 60px -20px rgba(15,27,45,.55);color:#24324A;direction:rtl;overflow:auto}' +
    '.sdc-dialog::backdrop{background:rgba(15,27,45,.55)}' +
    '.sdc-dialog[open]{animation:sdc-in .18s ease-out}@keyframes sdc-in{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.sdc-dialog[open]{animation:none}.sdc-trigger{transition:none}}' +
    '.sdc-head{position:relative;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px;background:#1B2A41;color:#fff}' +
    '.sdc-dialog .sdc-head h2{margin:0;font-family:"Noto Kufi Arabic",Tahoma,sans-serif;font-size:17px;color:#fff!important;line-height:1.5}' +
    '.sdc-x{width:44px;height:44px;border-radius:50%;border:1px solid rgba(201,163,94,.6);background:transparent;color:#F6E9C9;font-size:26px;line-height:1;cursor:pointer}' +
    '.sdc-flag{margin:12px 18px 0;padding:8px 12px;border-radius:10px;background:#FBF6EA;border:1px solid #E7CD97;color:#6E4808;font-size:14px}' +
    '.sdc-stage{margin:8px 18px 0;max-height:56vh;max-height:56dvh;overflow:auto;overscroll-behavior:contain;border:1px solid #DDE3EC;border-radius:12px;background:#F4F6F9}.sdc-dialog .sdc-stage img{display:block;width:100%;height:auto;max-width:none!important;margin-inline:auto}' +
    '.sdc-zoom{display:flex;justify-content:center;align-items:center;gap:10px;margin:10px 18px 0}.sdc-zoom button{width:44px;height:44px;border-radius:50%;border:1px solid #DDE3EC;background:#fff;color:#1B2A41;font-size:22px;cursor:pointer}.sdc-zoom button[data-sdc=reset]{width:auto;padding:0 14px;border-radius:999px;font-size:14px}.sdc-zoom button:disabled{opacity:.45;cursor:default}.sdc-zoom span{min-width:52px;text-align:center}'+
    '.sdc-for{margin:12px 18px 0;padding:10px 14px;border-radius:12px;background:#1B2A41;color:#fff;font-size:15px;line-height:1.7}.sdc-for b{color:#E7CD97}.sdc-for small{display:block;color:#DDE3EC;font-size:13px}' +
    '.sdc-text{padding:6px 18px 0;font-size:15px;line-height:1.8}.sdc-text p{margin:6px 0}.sdc-prof{color:#1B2A41;font-weight:700}' +
    '.sdc-choice{margin:8px 18px 0;padding:12px;border-radius:12px;background:#F4F6F9}.sdc-choice p{margin:0 0 8px;font-weight:700}.sdc-choice div{display:flex;flex-wrap:wrap;gap:8px}' +
    '.sdc-choice button{min-height:44px;padding:6px 14px;border-radius:999px;border:1.5px solid #DDE3EC;background:#fff;color:#1B2A41;font:inherit;cursor:pointer}.sdc-choice button:hover{border-color:#1B2A41}.sdc-choice small{display:block;margin-top:8px;color:#475569}' +
    '.sdc-foot{display:flex;justify-content:flex-end;padding:12px 18px 16px}' +
    '@media print{.sdc-trigger,.sdc-dialog{display:none!important}}';
  if (!document.getElementById('sdc-css')) { var st = document.createElement('style'); st.id = 'sdc-css'; st.textContent = CSS; document.head.appendChild(st); }
  // owner 2026-10-27: when the profession's own rules do not fit the sample (QVP without a diploma/degree, SVP with a degree),
  // no picture is shown — a short note asks the office instead of showing a misleading sample
  function fits(kind, hasDegree) { if (kind === 'qvp') return hasDegree !== false; if (kind === 'svp') return hasDegree !== true; return true; }
  function note(kind) { var s = document.createElement('small'); s.className = 'sdc-note'; s.textContent = 'نوع الإجراء المهني لهذه المهنة يحتاج تأكيد المكتب، لذلك لا نعرض نموذجًا هنا.'; return s; }
  var esc = function (s) { return String(s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  function kindOf(text) {
    var t = String(text || '');
    if (/\(SVP\)|الفحص المهني/.test(t)) return 'svp';
    if (/\(QVP\)|التحقق المهني/.test(t)) return 'qvp';
    if (/مصادقة/.test(t)) return 'musadaqa';
    return null;
  }

  var dlg = null, img = null, zoom = 1, lastTrigger = null, choiceCb = null;
  function build() {
    if (dlg) return;
    dlg = document.createElement('dialog');
    dlg.className = 'sdc-dialog';
    dlg.setAttribute('aria-labelledby', 'sdc-title');
    dlg.innerHTML = '<div class="sdc-head"><h2 id="sdc-title"></h2><button type="button" class="sdc-x" data-sdc="close" aria-label="إغلاق النموذج">×</button></div>' +
      // owner 2026-10-29: the chosen profession sits ABOVE the sample (the original sample image is never edited)
      '<p class="sdc-for" hidden></p>' +
      '<p class="sdc-flag">نموذج يوضح شكل الوثيقة فقط — ليس شهادة صادرة لك، ولا يثبت صحة شهادتك.</p>' +
      '<div class="sdc-zoom"><button type="button" data-sdc="out" aria-label="تصغير">−</button><span aria-live="polite">100%</span><button type="button" data-sdc="in" aria-label="تكبير">+</button><button type="button" data-sdc="reset">الحجم الأصلي</button></div>' +
      '<div class="sdc-stage" tabindex="0" aria-label="صورة النموذج؛ استخدم التكبير للتفاصيل"><img alt="" decoding="async"></div>' +
      '<div class="sdc-text"><p class="sdc-what"></p><p class="sdc-who"></p></div>' +
      '<div class="sdc-choice" hidden><p>هل لديك هذه الوثيقة؟</p><div><button type="button" data-sdc-choice="have">لديّ هذه الوثيقة</button><button type="button" data-sdc-choice="no">لا أملكها</button><button type="button" data-sdc-choice="unsure">لست متأكدًا من نوعها</button></div><small>اختيارك يساعدنا على ترتيب ملفك فقط، ولا يعني التحقق من صحة الوثيقة.</small></div>' +
      '<div class="sdc-foot"><button type="button" class="sd-btn sd-btn-outline sd-btn-sm" data-sdc="close">إغلاق</button></div>';
    document.body.appendChild(dlg);
    img = dlg.querySelector('img');
    dlg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sdc],[data-sdc-choice]');
      if (e.target === dlg) { close(); return; } // click on the backdrop
      if (!b) return;
      if (b.dataset.sdc === 'close') close();
      else if (b.dataset.sdc === 'in') setZoom(zoom + 0.25);
      else if (b.dataset.sdc === 'out') setZoom(zoom - 0.25);
      else if (b.dataset.sdc === 'reset') setZoom(1);
      else if (b.dataset.sdcChoice && choiceCb) { choiceCb(b.dataset.sdcChoice); close(); }
    });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  }
  // owner 2026-10-29: zoom really resizes the image (50%–300%; the site's «img {max-width:100%}» no longer caps it); the
  // image scrolls inside its own frame, so the page never scrolls sideways and the controls stay in view
  function setZoom(z) {
    zoom = Math.round(Math.max(0.5, Math.min(3, z)) * 100) / 100;
    img.style.setProperty('width', (zoom * 100) + '%', 'important');
    img.style.setProperty('max-width', 'none', 'important');
    dlg.querySelector('.sdc-zoom span').textContent = Math.round(zoom * 100) + '%';
    dlg.querySelector('[data-sdc=out]').disabled = zoom <= 0.5;
    dlg.querySelector('[data-sdc=in]').disabled = zoom >= 3;
    dlg.querySelector('[data-sdc=reset]').disabled = zoom === 1;
  }
  function open(kind, opts) {
    var k = KINDS[kind]; if (!k) return;
    opts = opts || {}; build();
    lastTrigger = document.activeElement; choiceCb = typeof opts.onChoice === 'function' ? opts.onChoice : null;
    dlg.querySelector('#sdc-title').textContent = k.title;
    img.alt = k.title;
    img.src = BASE + kind + '.webp'; // the full image loads only now
    setZoom(1);
    dlg.querySelector('.sdc-what').textContent = k.what;
    dlg.querySelector('.sdc-who').textContent = k.who;
    var prof = dlg.querySelector('.sdc-for');
    prof.hidden = !opts.profession;
    prof.innerHTML = opts.profession ? 'المهنة المختارة: <b>' + esc(opts.profession) + '</b><small>هذا نموذج عام لشكل «' + esc(k.short) + '». في شهادتك أنت يظهر مسمى مهنتك «' + esc(opts.profession) + '» ورمزها في خانة المهنة نفسها.</small>' : '';
    dlg.querySelector('.sdc-choice').hidden = !choiceCb;
    var y = window.scrollY; // the page does not move and keeps every answer
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    window.scrollTo(0, y);
    dlg.querySelector('.sdc-x').focus({ preventScroll: true });
  }
  function close() {
    if (!dlg) return;
    var y = window.scrollY;
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    window.scrollTo(0, y);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }
  function button(kind, opts) {
    var k = KINDS[kind]; if (!k) return null;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sdc-trigger sd-noprint';
    b.innerHTML = '<img src="' + BASE + kind + '-thumb.webp" alt="" width="64" height="' + (kind === 'musadaqa' ? 90 : 45) + '" loading="lazy" decoding="async"><span><b>' + esc(k.btn) + '</b><small>' + esc(k.short) + '</small></span>';
    b.addEventListener('click', function () { open(kind, opts); });
    return b;
  }
  function enhance(root) {
    // fixed placeholders: <div data-sd-cert="musadaqa"></div> (one chosen sample, e.g. the engineers page)
    [].forEach.call((root || document).querySelectorAll('[data-sd-cert]'), function (el) { if (!el.querySelector('.sdc-trigger')) { var b = button(el.getAttribute('data-sd-cert')); if (b) el.appendChild(b); } });
    [].forEach.call((root || document).querySelectorAll('[data-sd-cert-auto] li'), function (li) {
      if (li.querySelector('.sdc-trigger, .sdc-note')) return;
      var kind = kindOf(li.textContent); if (!kind) return;
      var host = li.closest('[data-sd-cert-auto]');
      var hasDegree = /الشهادة الجامعية|شهادة جامعية|دبلوم/.test(host.textContent);
      if (!fits(kind, hasDegree)) { li.appendChild(note(kind)); return; }
      var b = button(kind, { profession: host && host.getAttribute('data-profession') || '' });
      if (b) li.appendChild(b);
    });
  }
  window.SD_CERT = { open: open, close: close, button: button, kindOf: kindOf, enhance: enhance, fits: fits, note: note, KINDS: KINDS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { enhance(document); }); else enhance(document);
})();
