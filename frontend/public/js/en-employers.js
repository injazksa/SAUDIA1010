/* Occupation & Qualification Matching — English employers page (2026-11-06).
   Data: /data/en-occupations.json, generated from professions.json and the official English titles by
   tools/en-occupations-data-2026-11-06.mjs (codes, titles and requirements exactly as in the office's records).
   Qualification rules = the readiness tool's (owner 2026-10-27): ranks none 0 · grade10 1 · school/secondary 2 ·
   diploma 3 · university 4; a comprehensive diploma is reviewed by the office for QVP occupations that ask for a degree. */
(function () {
  'use strict';
  var tool = document.getElementById('ee-tool'); if (!tool) return;
  var $ = function (id) { return document.getElementById(id); };
  var els = { act: $('ee-activity'), level: $('ee-level'), qual: $('ee-qual'), q: $('ee-q'), sum: $('ee-summary'), common: $('ee-common'), list: $('ee-results'), more: $('ee-more'), higher: $('ee-higher'), total: $('ee-total') };
  var WA = '962789881009'; // replaced by content/settings.json below (same source as the rest of the site)
  var SOURCE = 'SOURCE: EMPLOYERS_ENGLISH_PAGE';
  var LABEL = {
    conduct: 'Police clearance certificate (General Intelligence), attested by the Jordanian Ministry of Foreign Affairs',
    military: 'Military service documents (Jordanian male applicants)',
    meningitis: 'Meningitis vaccination certificate',
    medical: 'Medical examination and biometrics at a Saudi-embassy-approved centre',
    photos: 'Two recent photos with a white background',
    auth: 'Electronic visa authorization (delegation) to the office',
    authInvestment: 'Electronic authorization to the office through the Saudi investment authority',
    degree: 'University degree and transcript, attested by the Jordanian Ministry of Foreign Affairs',
    masters: "Master's degree and transcript, if held (attested)",
    phd: 'Doctorate, if held (attested)',
    secondary: 'Secondary school certificate (Tawjihi, pass), attested',
    grade10: 'School certificate showing at least a Grade 10 pass, attested',
    school: 'School certificate (original), attested by the Jordanian Ministry of Foreign Affairs',
    exp2: 'Two years of experience in the same visa title (Labour Office and Ministry of Foreign Affairs)',
    exp1: 'One year of experience (Labour Office and Ministry of Foreign Affairs)',
    expSame: 'Experience in the same visa title (Labour Office and Ministry of Foreign Affairs)',
    contractLetter: 'Employment contract and acknowledgement letter from the Saudi company, attested by the Chamber of Commerce and the Saudi Ministry of Foreign Affairs',
    contract: 'Employment contract attested by the Chamber of Commerce and the Saudi Ministry of Foreign Affairs',
    qvp: 'Professional Verification certificate (QVP)',
    svp: 'Skills Verification Program test (SVP), including a theory exam where applicable',
    mosadaqa: 'Degree verification certificate from the Saudi Mosadaqa platform',
    jea: 'Jordan Engineers Association membership and practising certificate',
    sce: 'Registration with the Saudi Council of Engineers',
    scfhs: 'Professional classification and registration with the Saudi Commission for Health Specialties',
    dataflow: 'DataFlow verification report for certificates and experience',
    practiceMpwh: 'Practising certificate attested by the Ministry of Public Works and Housing, then the Ministry of Foreign Affairs',
    practice: 'Professional practice certificate',
    driving: 'Driving licence copy attested by the Licensing Department',
    crInvestment: 'Saudi commercial register and investment licence (commercial register attested by the Saudi Ministry of Foreign Affairs)',
    crLicence: 'Commercial register and business licence',
    age21to60: 'Age between 21 and 60',
    age21plus: 'Age over 21, no upper limit'
  };
  var COMMON = ['conduct', 'medical', 'meningitis', 'photos'];
  var CHIP = { qvp: 'QVP', svp: 'SVP', sce: 'Saudi Council of Engineers', mosadaqa: 'Mosadaqa', jea: 'Engineers Association', scfhs: 'Health Specialties (SCFHS)', dataflow: 'DataFlow', practiceMpwh: 'Practising certificate', practice: 'Practising certificate', driving: 'Driving licence', crInvestment: 'Commercial register', crLicence: 'Commercial register' };
  var EDU = { university: 'University degree', secondary: 'Secondary school (Tawjihi)', school: 'School certificate', grade10: 'Grade 10 pass', none: 'No academic certificate in the record' };
  var LEVEL = { 1: 'Managers', 2: 'Professionals and specialists', 3: 'Technicians and associate professionals', 4: 'Clerical and administrative support', 5: 'Service and sales workers', 6: 'Skilled agricultural workers', 7: 'Craft and skilled trades', 8: 'Machine operators and drivers', 9: 'General and elementary work' };
  var QUAL = { bachelor: 4, comprehensive: 3, noncomprehensive: 3, highschool: 2, below: 0 };
  var data = null, loading = null, shown = 0, showHigher = false, PAGE = 12;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function fit(o) {
    var lv = els.qual.value; if (!lv) return 'none';
    var need = data.rank[o.e] != null ? data.rank[o.e] : 0, have = QUAL[lv];
    if (lv === 'comprehensive' && o.q && o.e === 'university') return 'review';
    if (have >= need) return 'match';
    if (lv === 'below' && o.e === 'grade10') return 'review';
    return 'nomatch';
  }
  var FIT = {
    match: 'Matches the qualification in the record',
    review: 'Needs office review',
    nomatch: 'Needs a higher qualification',
    none: 'Choose a qualification to compare'
  };
  function fitNote(o, f) {
    if (f === 'review' && els.qual.value === 'comprehensive') return 'The record asks for a university degree; for QVP occupations the office reviews a comprehensive diploma with at least four years of experience.';
    if (f === 'review') return 'The record asks for at least a Grade 10 pass.';
    if (f === 'nomatch') return 'The record asks for: ' + EDU[o.e] + '.';
    return 'Qualification in the record: ' + EDU[o.e] + '.';
  }
  function filtered() {
    var a = els.act.value, g = els.level.value, q = els.q.value.trim().toLowerCase();
    var ai = a ? data.activities.findIndex(function (x) { return x.id === a; }) : -1;
    var words = q ? q.split(/\s+/) : [];
    return data.occupations.filter(function (o) {
      if (ai >= 0 && o.a.indexOf(ai) < 0) return false;
      if (g && o.g !== g) return false;
      if (words.length) { var t = (o.n + ' ' + o.c).toLowerCase(); for (var i = 0; i < words.length; i++) if (t.indexOf(words[i]) < 0) return false; }
      return true;
    });
  }
  function card(o) {
    var f = fit(o), req = data.sets[o.s];
    var li = el('li', 'ee-occ is-' + f);
    var top = el('div', 'ee-occ-top'); top.appendChild(el('h3', null, o.n)); top.appendChild(el('span', 'ee-code', 'Code ' + o.c)); li.appendChild(top);
    li.appendChild(el('span', 'ee-fit is-' + f, FIT[f]));
    li.appendChild(el('p', 'ee-meta', (LEVEL[o.g] || '') + ' · ' + fitNote(o, f)));
    var chips = el('div', 'ee-chips'), seen = {};
    req.forEach(function (k) { var c = CHIP[k]; if (c && !seen[c]) { seen[c] = 1; chips.appendChild(el('span', 'sd-chip', c)); } });
    var exp = req.indexOf('exp2') >= 0 ? '2 years’ experience' : req.indexOf('exp1') >= 0 ? '1 year’s experience' : req.indexOf('expSame') >= 0 ? 'Experience in the same title' : '';
    if (exp) chips.appendChild(el('span', 'sd-chip', exp));
    if (chips.childNodes.length) li.appendChild(chips);
    var det = el('details'); det.appendChild(el('summary', null, 'All documents in the record (' + req.length + ')'));
    var ul = el('ul'); req.forEach(function (k) { ul.appendChild(el('li', null, LABEL[k] || k)); }); det.appendChild(ul); li.appendChild(det);
    var links = el('div', 'ee-links');
    var m = el('a', null, 'Check documents in Masar Awraqi'); m.href = '/saudi-visa-documents-tracker.html?code=' + o.c; m.hreflang = 'ar'; links.appendChild(m);
    if (o.p) { var p = el('a', null, 'Occupation page'); p.href = '/p/' + encodeURIComponent(o.p) + '.html'; p.hreflang = 'ar'; links.appendChild(p); }
    var w = el('a', null, 'Ask about this occupation'); w.target = '_blank'; w.rel = 'noopener noreferrer';
    w.href = waLink('Hello, I visited the For Employers – English page on the Saudia Visa website. I would like to ask about the occupation ' + o.n + ' (code ' + o.c + ') for a Saudi work visa.\n' + SOURCE + '\nSECTION: OCCUPATION_MATCHING\nالمصدر: صفحة الشركات الإنجليزية');
    links.appendChild(w); li.appendChild(links);
    return li;
  }
  function render(reset) {
    if (!data) return;
    var all = filtered();
    var lv = els.qual.value;
    var visible = all.filter(function (o) { return showHigher || !lv || fit(o) !== 'nomatch'; });
    var order = { match: 0, review: 1, none: 2, nomatch: 3 };
    visible.sort(function (a, b) { return (order[fit(a)] - order[fit(b)]) || a.n.localeCompare(b.n); });
    if (reset) { shown = 0; els.list.textContent = ''; }
    var next = visible.slice(shown, shown + PAGE); next.forEach(function (o) { els.list.appendChild(card(o)); }); shown += next.length;
    var higher = lv ? all.filter(function (o) { return fit(o) === 'nomatch'; }).length : 0;
    var n = function (x) { return x.toLocaleString('en-US'); };
    var parts = [n(visible.length) + ' occupation' + (visible.length === 1 ? '' : 's') + ' found'];
    if (lv) parts.push(n(all.filter(function (o) { return fit(o) === 'match'; }).length) + ' match the qualification', n(all.filter(function (o) { return fit(o) === 'review'; }).length) + ' need office review');
    els.sum.textContent = visible.length ? parts.join(' · ') : 'No occupation found with these choices. Try another activity or level, or contact us to review the case.';
    els.more.hidden = shown >= visible.length;
    els.higher.hidden = !higher;
    els.higher.textContent = showHigher ? 'Hide occupations that need a higher qualification' : 'Show ' + higher + ' occupation' + (higher === 1 ? '' : 's') + ' that need a higher qualification';
  }
  function load() {
    if (loading) return loading;
    loading = fetch('/data/en-occupations.json', { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
      data = d;
      d.activities.forEach(function (a) { var o = el('option', null, a.label); o.value = a.id; els.act.appendChild(o); });
      if (els.total) els.total.textContent = d.occupations.length.toLocaleString('en-US');
      els.common.hidden = false; els.common.textContent = '';
      els.common.appendChild(el('b', null, 'Every occupation also needs: ')); els.common.appendChild(document.createTextNode(COMMON.map(function (k) { return LABEL[k]; }).join('; ') + '.'));
      render(true);
    }).catch(function () { els.sum.textContent = 'The occupation list could not be loaded. Please refresh the page, or contact us on WhatsApp.'; loading = null; });
    return loading;
  }
  fetch('/content/settings.json', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (s) { if (s && /^\d{9,15}$/.test(String(s.whatsapp || ''))) WA = String(s.whatsapp); }).catch(function () {});
  ['change', 'input'].forEach(function (ev) { [els.act, els.level, els.qual, els.q].forEach(function (x) { x.addEventListener(ev, function () { load().then(function () { render(true); }); }); }); });
  [els.act, els.level, els.qual, els.q].forEach(function (x) { x.addEventListener('focus', load, { once: true }); });
  els.more.addEventListener('click', function () { render(false); });
  els.higher.addEventListener('click', function () { showHigher = !showHigher; render(true); });
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); } }, { rootMargin: '600px 0px' }); io.observe(tool); } else load();
})();
