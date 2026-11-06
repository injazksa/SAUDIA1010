/* One nationality field for every tool (owner 2026-10-27): the visitor types («اردني», «أردني», «الأردن», «jordan») or
 * picks from the list in the SAME box. Search ignores hamza forms (أ إ آ ء), ة/ه, ى/ي, the article «ال» and adjective
 * endings («ي», «ية»), so the adjective and the country name find the same entry. Countries are kept as they are:
 * nothing is merged because two names look alike.
 * Use: SD_NAT.enhance(selectEl, otherInputEl?) — the original <select> stays as the source of truth (hidden): a country
 * that is one of its options sets that option; any other country sets «other» and writes its name in otherInputEl. */
(function () {
  'use strict';
  if (window.SD_NAT) return;
  // [Arabic country name, English name, extra spellings]
  var C = [
    ['الأردن', 'Jordan', 'اردني|أردنية'], ['سوريا', 'Syria', 'سوري|سورية'], ['العراق', 'Iraq', 'عراقي'], ['مصر', 'Egypt', 'مصري'], ['فلسطين', 'Palestine', 'فلسطيني'],
    ['لبنان', 'Lebanon', 'لبناني'], ['اليمن', 'Yemen', 'يمني'], ['السعودية', 'Saudi Arabia', 'سعودي|المملكة العربية السعودية'], ['الإمارات', 'United Arab Emirates', 'إماراتي|الامارات العربية المتحدة'],
    ['الكويت', 'Kuwait', 'كويتي'], ['قطر', 'Qatar', 'قطري'], ['البحرين', 'Bahrain', 'بحريني'], ['عُمان', 'Oman', 'عماني|سلطنة عمان'], ['ليبيا', 'Libya', 'ليبي'],
    ['تونس', 'Tunisia', 'تونسي'], ['الجزائر', 'Algeria', 'جزائري'], ['المغرب', 'Morocco', 'مغربي'], ['موريتانيا', 'Mauritania', 'موريتاني'], ['السودان', 'Sudan', 'سوداني'],
    ['جنوب السودان', 'South Sudan', ''], ['الصومال', 'Somalia', 'صومالي'], ['جيبوتي', 'Djibouti', ''], ['جزر القمر', 'Comoros', 'قمري'],
    ['الهند', 'India', 'هندي'], ['باكستان', 'Pakistan', 'باكستاني'], ['بنغلاديش', 'Bangladesh', 'بنغالي'], ['سريلانكا', 'Sri Lanka', 'سريلانكي'], ['نيبال', 'Nepal', 'نيبالي'],
    ['الفلبين', 'Philippines', 'فلبيني'], ['إندونيسيا', 'Indonesia', 'إندونيسي|اندونيسي'], ['ماليزيا', 'Malaysia', 'ماليزي'], ['أفغانستان', 'Afghanistan', 'أفغاني|افغاني'], ['إيران', 'Iran', 'إيراني'],
    ['تركيا', 'Turkey', 'تركي'], ['الصين', 'China', 'صيني'], ['اليابان', 'Japan', 'ياباني'], ['كوريا الجنوبية', 'South Korea', 'كوري'], ['تايلاند', 'Thailand', 'تايلندي'],
    ['فيتنام', 'Vietnam', 'فيتنامي'], ['ميانمار', 'Myanmar', 'بورما'], ['كازاخستان', 'Kazakhstan', ''], ['أوزبكستان', 'Uzbekistan', 'اوزبكي'], ['أذربيجان', 'Azerbaijan', 'أذربيجاني'],
    ['إثيوبيا', 'Ethiopia', 'إثيوبي|اثيوبي|حبشي'], ['إريتريا', 'Eritrea', 'إريتري|ارتيري'], ['كينيا', 'Kenya', 'كيني'], ['أوغندا', 'Uganda', 'أوغندي'], ['تنزانيا', 'Tanzania', ''],
    ['نيجيريا', 'Nigeria', 'نيجيري'], ['غانا', 'Ghana', 'غاني'], ['السنغال', 'Senegal', 'سنغالي'], ['مالي', 'Mali', ''], ['النيجر', 'Niger', ''], ['تشاد', 'Chad', 'تشادي'],
    ['الكاميرون', 'Cameroon', ''], ['جنوب أفريقيا', 'South Africa', ''], ['ساحل العاج', "Côte d'Ivoire", 'كوت ديفوار'], ['غينيا', 'Guinea', ''], ['رواندا', 'Rwanda', ''], ['زيمبابوي', 'Zimbabwe', ''],
    ['الولايات المتحدة الأمريكية', 'United States', 'أمريكا|أمريكي|امريكي|اميركي'], ['كندا', 'Canada', 'كندي'], ['المكسيك', 'Mexico', 'مكسيكي'], ['البرازيل', 'Brazil', 'برازيلي'], ['الأرجنتين', 'Argentina', ''],
    ['كولومبيا', 'Colombia', ''], ['تشيلي', 'Chile', ''], ['فنزويلا', 'Venezuela', ''], ['بيرو', 'Peru', ''],
    ['المملكة المتحدة', 'United Kingdom', 'بريطانيا|بريطاني|انجلترا'], ['أيرلندا', 'Ireland', 'ايرلندي'], ['فرنسا', 'France', 'فرنسي'], ['ألمانيا', 'Germany', 'ألماني|الماني'], ['إيطاليا', 'Italy', 'إيطالي'],
    ['إسبانيا', 'Spain', 'إسباني|اسباني'], ['البرتغال', 'Portugal', 'برتغالي'], ['هولندا', 'Netherlands', 'هولندي'], ['بلجيكا', 'Belgium', 'بلجيكي'], ['سويسرا', 'Switzerland', 'سويسري'], ['النمسا', 'Austria', 'نمساوي'],
    ['السويد', 'Sweden', 'سويدي'], ['النرويج', 'Norway', 'نرويجي'], ['الدنمارك', 'Denmark', 'دنماركي'], ['فنلندا', 'Finland', 'فنلندي'], ['بولندا', 'Poland', 'بولندي'], ['رومانيا', 'Romania', 'روماني'],
    ['بلغاريا', 'Bulgaria', 'بلغاري'], ['اليونان', 'Greece', 'يوناني'], ['قبرص', 'Cyprus', 'قبرصي'], ['التشيك', 'Czechia', 'تشيكي'], ['المجر', 'Hungary', 'مجري|هنغاري'], ['صربيا', 'Serbia', 'صربي'],
    ['البوسنة والهرسك', 'Bosnia and Herzegovina', 'بوسني'], ['ألبانيا', 'Albania', 'ألباني'], ['كرواتيا', 'Croatia', 'كرواتي'], ['أوكرانيا', 'Ukraine', 'أوكراني'], ['روسيا', 'Russia', 'روسي'],
    ['جورجيا', 'Georgia', 'جورجي'], ['أرمينيا', 'Armenia', 'أرمني'], ['أستراليا', 'Australia', 'أسترالي|استرالي'], ['نيوزيلندا', 'New Zealand', 'نيوزيلندي'],
  ];
  var norm = function (s) {
    return String(s || '').toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآٱء]/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  };
  // «الأردن» / «أردني» / «أردنية» → «اردن»; «سوريا» / «سوري» → «سور»; «السعودية» / «سعودي» → «سعود»
  var stem = function (w) { w = norm(w).replace(/^ال(?=..)/, ''); return w.replace(/(يين|يون|يه|ين|ون|ي|ه|ا)$/, '') || w; };
  // a searchable set: [name, english, aliases] → the normalised words and their stems
  function makeSet(items) {
    return { items: items, keys: items.map(function (c) {
      var words = [c[0], c[1]].concat((c[2] || '').split('|')).filter(Boolean);
      var all = []; words.forEach(function (w) { all.push(norm(w)); norm(w).split(' ').forEach(function (x) { all.push(stem(x)); }); });
      return all;
    }) };
  }
  var BASE = makeSet(C);
  function search(set, q) {
    var n = norm(q); if (!n) return set.items.map(function (c, i) { return i; });
    var parts = n.split(' ').map(stem).filter(Boolean);
    var scored = [];
    set.keys.forEach(function (k, i) {
      var score = 0;
      if (k[0] === n || k.indexOf(n) >= 0) score = 3;
      else if (parts.every(function (p) { return k.some(function (x) { return x.indexOf(p) === 0; }); })) score = 2;
      else if (parts.every(function (p) { return p.length > 1 && k.some(function (x) { return x.indexOf(p) >= 0; }); })) score = 1;
      if (score) scored.push([score, i]);
    });
    return scored.sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; }).map(function (s) { return s[1]; });
  }
  // a page that lists every country in its own <select> (e.g. the eligibility tool) keeps ITS names; the shared list only
  // lends its English names and spellings («الإمارات» → «الإمارات العربية المتحدة»)
  function setFor(sel) {
    var names = [].map.call(sel.options, function (o) { return o.value && o.value !== 'other' ? o.text.trim() : ''; }).filter(Boolean);
    if (names.length < 30) return BASE;
    return makeSet(names.map(function (nm) {
      var a = norm(nm), hit = C.find(function (c) { var b = norm(c[0]); return a === b || a.indexOf(b + ' ') === 0 || b.indexOf(a + ' ') === 0; });
      return hit ? [nm, hit[1], hit[2]] : [nm, '', ''];
    }));
  }  var CSS = '.sdn{position:relative}.sdn input{width:100%}.sdn-list{position:absolute;inset-inline:0;top:calc(100% + 4px);z-index:30;max-height:260px;overflow:auto;margin:0;padding:4px;list-style:none;background:#fff;border:1px solid #DDE3EC;border-radius:12px;box-shadow:0 16px 30px -18px rgba(15,27,45,.45)}' +
    '.sdn-list li{padding:8px 12px;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;gap:8px}.sdn-list li small{color:#64748b;direction:ltr}.sdn-list li[aria-selected="true"],.sdn-list li:hover{background:#F4F6F9}' +
    '.sdn-list .sdn-empty{cursor:default;color:#475569}';
  function enhance(sel, other) {
    if (!sel || sel.dataset.sdn) return; sel.dataset.sdn = '1';
    if (!document.getElementById('sdn-css')) { var st = document.createElement('style'); st.id = 'sdn-css'; st.textContent = CSS; document.head.appendChild(st); }
    var optVal = function (name) { var o = [].find.call(sel.options, function (x) { return x.value === name || x.text.trim() === name; }); return o ? o.value : null; };
    var wrap = document.createElement('div'); wrap.className = 'sdn';
    var inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.className = sel.className || ''; inp.setAttribute('role', 'combobox'); inp.setAttribute('aria-expanded', 'false'); inp.setAttribute('aria-autocomplete', 'list');
    inp.placeholder = 'اكتب الجنسية، مثل: أردني أو سوريا';
    var lid = (sel.id || 'nat') + '-sdn-list'; inp.setAttribute('aria-controls', lid);
    if (sel.id) { var lab = document.querySelector('label[for="' + sel.id + '"]'); if (lab) { inp.id = sel.id + '-sdn'; lab.htmlFor = inp.id; } }
    var list = document.createElement('ul'); list.className = 'sdn-list'; list.id = lid; list.setAttribute('role', 'listbox'); list.hidden = true;
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(inp); wrap.appendChild(list); wrap.appendChild(sel);
    sel.hidden = true; sel.setAttribute('aria-hidden', 'true'); sel.tabIndex = -1;
    if (other) { var ow = other.closest('[id$="Wrap"], [id$="-wrap"], .m-field, .sv-field') || other.parentNode; if (ow && ow !== wrap.parentNode) ow.hidden = true; other.tabIndex = -1; }
    var current = function () { if (sel.value === 'other' && other && other.value) return other.value; var o = sel.options[sel.selectedIndex]; return o && o.value ? o.text.trim() : ''; };
    inp.value = current();
    var SET = setFor(sel), hits = [], active = -1;
    var draw = function () {
      hits = search(SET, inp.value === current() ? '' : inp.value).slice(0, 60);
      list.innerHTML = hits.length ? hits.map(function (i, k) { return '<li role="option" id="' + lid + '-' + k + '" aria-selected="' + (k === active) + '" data-i="' + i + '"><span>' + SET.items[i][0] + '</span><small>' + (SET.items[i][1] || '') + '</small></li>'; }).join('')
        : '<li class="sdn-empty" role="option" aria-disabled="true">لم نجد هذه الجنسية. اكتبها كما هي، وسيراجعها المكتب.</li>';
      list.hidden = false; inp.setAttribute('aria-expanded', 'true');
      // the open list must sit above the next fields of the form (their own boxes come later in the page)
      var f = wrap.closest('.sd-pctx-field, .m-field, .sv-field') || wrap; f.style.position = 'relative'; f.style.zIndex = '60';
    };
    var close = function () { list.hidden = true; inp.setAttribute('aria-expanded', 'false'); active = -1; var f = wrap.closest('.sd-pctx-field, .m-field, .sv-field') || wrap; f.style.zIndex = ''; };
    var choose = function (name) {
      var v = optVal(name);
      if (v) { sel.value = v; if (other) other.value = ''; }
      else if (optVal('other') || [].some.call(sel.options, function (x) { return x.value === 'other'; })) { sel.value = 'other'; if (other) other.value = name; }
      inp.value = name; close();
      sel.dispatchEvent(new Event('change', { bubbles: true })); if (other) other.dispatchEvent(new Event('input', { bubbles: true }));
    };
    inp.addEventListener('focus', function () { inp.select(); draw(); });
    inp.addEventListener('input', function () { active = -1; draw(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (list.hidden) draw(); active = Math.max(0, Math.min(hits.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1))); draw(); inp.setAttribute('aria-activedescendant', lid + '-' + active); var li = list.children[active]; if (li) li.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter') { if (!list.hidden && hits.length) { e.preventDefault(); choose(SET.items[hits[Math.max(0, active)]][0]); } }
      else if (e.key === 'Escape') { inp.value = current(); close(); }
    });
    list.addEventListener('mousedown', function (e) { var li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); choose(SET.items[+li.dataset.i][0]); } });
    inp.addEventListener('blur', function () { setTimeout(function () {
      if (list.hidden) return; var typed = inp.value.trim();
      if (typed && typed !== current()) { var h = search(SET, typed); if (h.length) choose(SET.items[h[0]][0]); else if (optVal('other')) choose(typed); else inp.value = current(); } else inp.value = current();
      close(); }, 120); });
    sel.addEventListener('change', function () { if (document.activeElement !== inp) inp.value = current(); });
    sel._sdnSync = function () { inp.value = current(); };
  }
  window.SD_NAT = { enhance: enhance, search: function (q) { return search(BASE, q).map(function (i) { return C[i][0]; }); }, norm: norm };
})();
