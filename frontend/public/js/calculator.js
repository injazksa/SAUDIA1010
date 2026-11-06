/* Fee calculator (rebuilt 2026-10-27). Prices: js/prices.js only.
 * SD_calcEstimate(input) is a pure function (also run by tests/snapshot.js); the page code below only reads the form and draws.
 * Sections are kept apart: office fees · professional procedures · attestation · medical exam · conditional extras ·
 * government / embassy fees (not included, never assumed to be zero) · estimated total. */
var SD_CALC_SERVICES = {
  domestic: { qvp: false, exam: false, cert: false },
  worker: { qvp: false, exam: true, cert: false },
  gm: { qvp: false, exam: false, cert: false },
  senior: { qvp: false, exam: false, cert: false },
  ceo: { qvp: false, exam: false, cert: false },
  secondary: { qvp: false, exam: true, cert: false },
  professional: { qvp: true, exam: false, cert: false },
  engineer: { qvp: true, exam: false, cert: true },
  doctor: { qvp: false, exam: false, cert: false }
};
var SD_VISA_NAMES = { work: 'تأشيرة العمل', residence: 'الإقامة (الاستقدام)', visit: 'تأشيرة الزيارة', family: 'تأشيرة الزيارة العائلية', personal: 'التأشيرة الشخصية', government: 'التأشيرة الحكومية', business: 'تأشيرة الأعمال' };

// input: { visa, cat, exp ('none'|'one'|'two-plus'), cert, copies (1|2), qvp, svp, medical, vaccine }
function SD_calcEstimate(input, P) {
  P = P || (typeof SD_PRICES !== 'undefined' ? SD_PRICES : window.SD_PRICES);
  var i = input || {}, out = { sections: [], total: { min: 0, max: 0 }, notes: [], error: '' };
  var add = function (key, title, label, min, max, note) {
    var s = out.sections.filter(function (x) { return x.key === key; })[0];
    if (!s) { s = { key: key, title: title, items: [] }; out.sections.push(s); }
    s.items.push({ label: label, min: min, max: max === undefined ? min : max, note: note || '' });
    out.total.min += min; out.total.max += (max === undefined ? min : max);
  };
  var note = function (key, title, label, text) {
    var s = out.sections.filter(function (x) { return x.key === key; })[0];
    if (!s) { s = { key: key, title: title, items: [] }; out.sections.push(s); }
    s.items.push({ label: label, info: true, note: text });
  };
  var medicalApplies = i.visa === 'work' || i.visa === 'residence';
  if (i.visa === 'work') {
    var cat = P.workVisa[i.cat];
    if (!cat) { out.error = 'اختر المهنة أو فئتها أولًا.'; return out; }
    add('office', 'رسوم المكتب', 'خدمة تأشيرة العمل — ' + cat.label, cat.min, cat.max, cat.min === cat.max ? '' : 'نطاق تقديري حسب المهنة والإجراءات');
    var rules = SD_CALC_SERVICES[i.cat] || {};
    if (i.qvp && rules.qvp) {
      if (i.exp === 'two-plus') add('pro', 'الإجراءات المهنية', 'التحقق المهني (QVP): تجهيز ورفع الشهادات والخبرة ومراجعة المستندات', P.qvp);
      else note('pro', 'الإجراءات المهنية', 'التحقق المهني (QVP)', 'يتطلب خبرة لا تقل عن سنتين؛ لم يُحتسب (' + P.qvp + ' دينار). راجع المكتب لحالتك.');
    }
    if (i.svp && rules.exam) add('pro', 'الإجراءات المهنية', 'الفحص المهني (SVP): حجز موعد الامتحان في AMIDEAST', P.labourExam, P.labourExam, 'النتيجة حسب أداء المتقدم');
    if (i.cert && rules.cert) { var c = i.copies === 2 ? 2 : 1; add('attest', 'تصديق الوثائق', 'تصديق الشهادة الجامعية للمهندس (مصادقة + السفارة): ' + (c === 2 ? 'نسختان' : 'نسخة واحدة'), P.engineerCertificates[c]); }
  } else if (P.otherVisas[i.visa]) {
    var o = P.otherVisas[i.visa];
    add('office', 'رسوم المكتب', 'خدمة ' + (SD_VISA_NAMES[i.visa] || 'التأشيرة'), o.min, o.max, 'نطاق تقديري');
  } else { out.error = 'اختر نوع المعاملة.'; return out; }
  if (i.medical) {
    if (medicalApplies) {
      add('medical', 'الفحص الطبي', 'الفحص الطبي', P.medicalExam);
      add('medical', 'الفحص الطبي', 'موعد الفحص الطبي', P.appointmentBooking);
    } else out.notes.push('هذا النوع من التأشيرات لا يحتاج فحصًا طبيًا، فلم نحتسبه.');
  }
  if (i.vaccine) {
    if (medicalApplies) add('extra', 'إضافات مشروطة', 'مطعوم السحايا (لمن لم يحصل عليه)', P.meningitisVaccine);
    else out.notes.push('مطعوم السحايا لا يُحتسب لهذا النوع من التأشيرات.');
  }
  note('gov', 'الرسوم الحكومية والخارجية', 'غير مشمولة في هذا التقدير', 'رسوم السفارة والجهات الحكومية وتصديقات الجهات الأخرى تختلف حسب المعاملة والجهة؛ يؤكدها المكتب عند مراجعة حالتك.');
  return out;
}
var SD_money = function (min, max) { return min === max ? min + ' دينار' : min + ' – ' + max + ' دينار'; };
if (typeof window !== 'undefined') { window.SD_calcEstimate = SD_calcEstimate; window.SD_CALC_SERVICES = SD_CALC_SERVICES; }

/* ── page ── */
(function () {
  if (typeof document === 'undefined') return;
  var form = document.getElementById('calcForm'); if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var list = null, last = null;

  function rules() { return SD_CALC_SERVICES[$('calcCategory').value] || {}; }
  function sync() {
    var work = $('calcVisa').value === 'work', r = rules(), medicalApplies = work || $('calcVisa').value === 'residence';
    $('calcWorkBlock').hidden = !work;
    $('calcRowQvp').hidden = !(work && r.qvp);
    $('calcRowExp').hidden = !(work && r.qvp && $('calcQvp').checked);
    $('calcRowSvp').hidden = !(work && r.exam);
    $('calcRowCert').hidden = !(work && r.cert);
    $('calcRowCopies').hidden = !(work && r.cert && $('calcCert').checked);
    $('calcRowMedical').hidden = !medicalApplies; $('calcRowVaccine').hidden = !medicalApplies;
    $('calcServicesBlock').hidden = !medicalApplies && !work;
    if (!medicalApplies) { $('calcMedical').checked = false; $('calcVaccine').checked = false; }
  }
  function read() {
    var r = rules();
    return { visa: $('calcVisa').value, cat: $('calcCategory').value, exp: (form.querySelector('input[name=calcExp]:checked') || {}).value || 'none',
      qvp: r.qvp && $('calcQvp').checked, svp: r.exam && $('calcSvp').checked, cert: r.cert && $('calcCert').checked, copies: $('calcCopies2').checked ? 2 : 1,
      medical: $('calcMedical').checked, vaccine: $('calcVaccine').checked };
  }
  function render() {
    var res = SD_calcEstimate(read()); last = res;
    var box = $('calcResult');
    if (res.error) { $('calcError').textContent = res.error; $('calcError').hidden = false; box.hidden = true; ($('calcVisa').value === 'work' ? $('calcProfession') : $('calcVisa')).focus(); return; }
    $('calcError').hidden = true;
    $('calcTotal').textContent = SD_money(res.total.min, res.total.max);
    $('calcSections').innerHTML = res.sections.map(function (s) {
      return '<section class="cx-sec cx-' + s.key + '"><h3>' + esc(s.title) + '</h3><ul>' + s.items.map(function (it) {
        return '<li' + (it.info ? ' class="info"' : '') + '><span>' + esc(it.label) + (it.note ? '<small>' + esc(it.note) + '</small>' : '') + '</span><b class="sd-num">' + (it.info ? '—' : esc(SD_money(it.min, it.max))) + '</b></li>';
      }).join('') + '</ul></section>';
    }).join('') + res.notes.map(function (n) { return '<p class="sd-notice">' + esc(n) + '</p>'; }).join('');
    var prof = $('calcProfession').value.trim();
    var msg = 'مرحبًا، أود تأكيد تكلفة ' + (SD_VISA_NAMES[$('calcVisa').value] || '') + (prof ? ' لمهنة ' + prof : '') + '. التقدير في الحاسبة: ' + SD_money(res.total.min, res.total.max) + ' (دون الرسوم الحكومية).';
    $('calcWa').href = 'https://wa.me/962789881009?text=' + encodeURIComponent(msg);
    box.hidden = false;
    box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  function asText(res) {
    return ['تقدير رسوم ' + (SD_VISA_NAMES[$('calcVisa').value] || '') + ' — مكتب تأشيرات السعودية في الأردن', $('calcProfession').value ? 'المهنة: ' + $('calcProfession').value : '']
      .concat(res.sections.map(function (s) { return '\n' + s.title + ':\n' + s.items.map(function (it) { return '- ' + it.label + ': ' + (it.info ? it.note : SD_money(it.min, it.max)); }).join('\n'); }))
      .concat(['\nالإجمالي التقديري: ' + SD_money(res.total.min, res.total.max) + ' (لا يشمل الرسوم الحكومية)', 'السعر النهائي يؤكده المكتب بعد مراجعة الحالة.', 'saudia-visa.com/calculator.html']).filter(Boolean).join('\n');
  }

  /* profession search → its category (from the profession's own documents: SD_calcCategory in professions.js) */
  var input = $('calcProfession'), sug = $('calcProfList'), picked = $('calcPicked'), hits = [];
  function setCategory(cat, label) { if (cat && $('calcCategory').querySelector('option[value="' + cat + '"]')) { $('calcCategory').value = cat; } picked.textContent = label || ''; sync(); }
  function pick(p) {
    if (!p) return;
    if (p.__query) { input.value = p.__query; input.dispatchEvent(new Event('input')); return; }
    input.value = p.name_ar; sug.hidden = true;
    var cat = window.SD_calcCategory ? window.SD_calcCategory(p) : '';
    setCategory(cat, 'فئة المهنة: ' + ($('calcCategory').querySelector('option[value="' + cat + '"]') || { text: '' }).text + (p.isEstimate ? ' (نتيجة تقديرية؛ يؤكدها المكتب)' : ''));
  }
  input.addEventListener('input', function () {
    var v = input.value.trim(); if (!v || !list) { sug.hidden = true; return; }
    hits = window.SD_searchProfessions(list, v, 6);
    var r = window.SD_resolveTitle(list, v);
    if (r && r.record && (r.kind === 'estimate' || r.kind === 'synonym')) hits = [r.record].concat(hits.filter(function (p) { return p !== r.record; })).slice(0, 6);
    if (r && r.kind === 'choose') hits = window.SD_choiceHits(r);
    sug.innerHTML = hits.length ? hits.map(function (p, k) { return '<li role="option" data-k="' + k + '"' + (p.isEstimate || p.__query ? ' class="m-est"' : '') + '><span>' + esc(p.name_ar) + (p.__query ? ' <small>اعرض المهن المطابقة</small>' : '') + (p.isEstimate ? ' <small>نتيجة تقديرية · ' + esc(p.estimateLabel) + '</small>' : '') + '</span><span class="sd-num">' + esc(/^\d{6}$/.test(String(p.code)) ? p.code : (p.officialCode || '—')) + '</span></li>'; }).join('')
      : '<li class="m-none">' + esc(r && r.message ? r.message : 'لم نجد المهنة. اختر فئتها من القائمة التالية.') + '</li>';
    sug.hidden = false; input.setAttribute('aria-expanded', 'true');
  });
  sug.addEventListener('mousedown', function (e) { var li = e.target.closest('li[data-k]'); if (li) { e.preventDefault(); pick(hits[+li.dataset.k]); } });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (!sug.hidden && hits[0]) pick(hits[0]); } else if (e.key === 'Escape') sug.hidden = true; });
  input.addEventListener('blur', function () { setTimeout(function () { sug.hidden = true; input.setAttribute('aria-expanded', 'false'); }, 150); });
  // the profession list (1.9 MB) loads when the visitor starts on the profession field, not with the page (speed)
  var loading = null;
  function ensureList() { if (list || loading) return loading; loading = fetch('/professions.json').then(function (r) { return r.json(); }).then(function (d) { list = d; if (input.value.trim()) input.dispatchEvent(new Event('input')); }).catch(function () { loading = null; picked.textContent = 'تعذّر تحميل قائمة المهن؛ اختر الفئة من القائمة.'; }); if (window.SD_loadDictionary) window.SD_loadDictionary(); return loading; }
  input.addEventListener('focus', ensureList); input.addEventListener('pointerdown', ensureList); input.addEventListener('input', ensureList);

  form.addEventListener('change', function (e) { if (e.target.id === 'calcCategory') picked.textContent = ''; sync(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
  $('calcPrint').addEventListener('click', function () { if (!last) return; var prof = $('calcProfession').value.trim(); if (window.SD_print) window.SD_print($('calcResult'), 'تقدير رسوم ' + (SD_VISA_NAMES[$('calcVisa').value] || ''), prof ? 'المهنة: ' + prof : ''); else window.print(); });

  // arriving from «مسار أوراقي»: ?cat=<category>&p=<profession> preselects the same profession's category
  try {
    var q = new URLSearchParams(location.search), cat = (q.get('cat') || '').replace(/[^a-z]/g, ''), name = (q.get('p') || '').slice(0, 80);
    if (cat === 'ceo') cat = 'senior';
    if (cat && $('calcCategory').querySelector('option[value="' + cat + '"]')) { $('calcVisa').value = 'work'; if (name) input.value = name; setCategory(cat, 'المهنة من «مسار أوراقي»: ' + (name || '') + (q.get('est') ? ' (نتيجة تقديرية)' : '') + '. اخترنا فئتها تلقائيًا، ويمكنك تغييرها.'); }
  } catch (e) {}
  sync();
})();
