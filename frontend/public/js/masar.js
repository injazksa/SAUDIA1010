/* «مسار أوراقي» — documents path for one profession.
 * Data: /professions.json. Documents: computeRequirements() from /professions.js (the SAME function the
 * professions list uses), so a profession always shows the same documents here and in the list.
 * Stamps are read from each document's own text; nothing is added. Conditional wording ("حسب بلد الإصدار")
 * is shown as written and flagged for the office to confirm.
 * Progress is a per-viewer convenience kept in localStorage (wrapped in try/catch). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var WA = '962789881009';
  var DATA = [];
  var cur = null, docs = [], st = {}, fresh = null;

  /* ── text helpers ── */
  var norm = function (s) {
    return String(s || '').replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/\s+/g, ' ').trim().toLowerCase();
  };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };

  /* ── document type, form and stamps (read from the text only) ── */
  var TYPES = [
    // the office's own photos — a separate item (owner 2026-10-29); the military and medical items carry their own photos
    [/خاصتان بالمكتب/, 'صور المكتب', 'doc'],
    // women's documents (owner 2026-10-29) — before the general patterns
    [/^عدم ممانعة من الزوج،/, 'عدم ممانعة الزوج', 'doc'], [/^عدم ممانعة من ولي الأمر،/, 'عدم ممانعة ولي الأمر', 'doc'], [/^عدم ممانعة/, 'عدم الممانعة', 'doc'],
    [/^أوراق الحالة الاجتماعية/, 'أوراق الحالة الاجتماعية', 'doc'], [/^عقد الزواج أو شهادة الزواج/, 'عقد الزواج أو شهادة الزواج', 'doc'],
    [/^قيد فردي/, 'القيد الفردي', 'doc'], [/جواز سفر الزوج/, 'صورة جواز الزوج', 'doc'], [/جواز سفر ولي الأمر/, 'صورة جواز ولي الأمر', 'doc'],
    [/حسن سيرة|حسن السيرة|لا حكم عليه/, 'حسن السيرة والسلوك', 'doc'],
    [/الوثائق العسكرية|مشروحات/, 'الوثائق العسكرية', 'doc'], [/^تصديق الشهادات الجامعية/, 'تصديق الشهادات', 'pro'],
    // university teaching titles (2026-10-29): each degree its own document
    [/^إحضار الشهادة الجامعية \(البكالوريوس\)|الشهادة الجامعية \(البكالوريوس\)/, 'شهادة البكالوريوس', 'doc'], [/شهادة الماجستير/, 'شهادة الماجستير', 'doc'], [/شهادة الدكتوراه/, 'شهادة الدكتوراه', 'doc'],
    [/الشهادة الجامعية|شهادة جامعية/, 'الشهادة الجامعية', 'doc'], [/الشهادة المدرسية|شهادة مدرسية|الثانوية|الصف العاشر/, 'الشهادة المدرسية', 'doc'],
    [/خبرة|خبره/, 'شهادة الخبرة', 'doc'], [/الفحص الطبي/, 'الفحص الطبي والبصمة', 'task'],
    [/خطاب\s*الاطلاع/, 'خطاب الاطلاع', 'doc'], [/عقد العمل|عقد عمل/, 'عقد العمل', 'doc'], [/تفويض/, 'التفويض الإلكتروني', 'task'],
    [/مطعوم/, 'مطعوم السحايا', 'task'], [/التخصصات الصحية|ممارس/, 'التصنيف المهني الصحي', 'pro'], [/DataFlow/, 'تقرير DataFlow', 'pro'],
    [/مصادقة/, 'مصادقة الشهادة الجامعية (منصة مصادقة)', 'pro'], [/الجهة الهندسية المختصة/, 'النقابة أو الجهة الهندسية في بلد الجنسية', 'pro'], [/نقابة المهندسين/, 'نقابة المهندسين الأردنية', 'pro'], [/هيئة المهندسين|الهيئة السعودية للمهندسين/, 'الهيئة السعودية للمهندسين', 'pro'],
    [/\(QVP\)|التحقق المهني/, 'التحقق المهني (QVP)', 'pro'], [/\(SVP\)|الفحص المهني/, 'الفحص المهني (SVP)', 'pro'], [/الاعتماد المهني/, 'الاعتماد المهني', 'pro'], [/مزاولة/, 'مزاولة المهنة', 'pro'], [/سجل تجاري|السجل التجاري/, 'السجل التجاري', 'doc'],
    [/رخصة السياقة|رخصة سياقة/, 'رخصة القيادة', 'doc'], [/قيد عائلي|بيان فردي/, 'القيد العائلي', 'doc'], [/بطاقة إقامة/, 'الإقامة الأردنية', 'doc'],
    [/Syrian Board/, 'وثائق مزاولة الطب (سوريا)', 'pro'], [/^عضوية (?:نقابة|النقابة)/, 'عضوية النقابة المهنية', 'pro'], [/البورد/, 'البورد أو المؤهل التخصصي', 'pro'],
  ];
  var typeOf = function (t) { for (var i = 0; i < TYPES.length; i++) if (TYPES[i][0].test(t)) return { label: TYPES[i][1], kind: TYPES[i][2] }; return { label: 'مستند', kind: 'doc' }; };
  var formOf = function (t) {
    if (/صورة طبق الأصل/.test(t)) return 'صورة طبق الأصل';
    if (/أصل الشهادة الجامعية مع صور/.test(t)) return 'الأصل مع صور';
    if (/^أصل الشهادة الجامعية وصورتان/.test(t)) return 'الأصل وصورتان';
    if (/^أصل [^،]* وصورة عنها/.test(t)) return 'الأصل مع صورة'; // e.g. practice certificate (owner 2026-10-26)
    if (/تُقبل صورة|صورة عن|\(صورة\)/.test(t)) return 'صورة';
    if (/\(الأصل|الأصل\)|الأصل\b|أصلي|الأصلية/.test(t)) return 'الأصل';
    return null;
  };
  // fixed chains that appear verbatim in the data
  var CHAINS = [
    [/الغرفة التجارية السعودية ووزارة الخارجية السعودية|الغرفة التجارية والخارجية السعودية/, ['الغرفة التجارية السعودية', 'وزارة الخارجية السعودية']],
    [/مكتب العمل ووزارة الخارجية الأردنية/, ['مكتب العمل', 'وزارة الخارجية الأردنية']],
    [/^وزارة الأشغال العامة والإسكان$/, ['وزارة الأشغال العامة والإسكان', 'وزارة الخارجية الأردنية']], // practice certificate (office rule)
    [/^وزارة الخارجية الأردنية$/, ['وزارة الخارجية الأردنية']],
    [/^وزارة الخارجية السعودية$/, ['وزارة الخارجية السعودية']],
    [/^إدارة الترخيص$/, ['إدارة الترخيص']],
  ];
  var STAMP_RE = /(?:مختوم(?:ة|ين|اً|ا)?|مصدق(?:ة)?|تُختم|تُصدق)\s+(?:حسب الأصول\s+)?(?:من|لدى)\s+([^().،؛]+)/g;
  function stampsOf(t) {
    var m, chain = [], conditional = [];
    STAMP_RE.lastIndex = 0;
    while ((m = STAMP_RE.exec(t))) {
      var ph = m[1].trim(), hit = null;
      for (var i = 0; i < CHAINS.length; i++) if (CHAINS[i][0].test(ph)) { hit = CHAINS[i][1]; break; }
      if (!hit && / ثم /.test(ph)) hit = ph.split(/\s+ثم\s+/).map(function (s) { return s.trim(); });
      if (hit) hit.forEach(function (s) { if (chain.indexOf(s) < 0) chain.push(s); });
      else if (conditional.indexOf(ph) < 0) conditional.push(ph);
    }
    return { chain: chain, conditional: conditional };
  }

  /* ── build the documents for the current profession + context ── */
  function build() {
    var r = window.computeRequirements(cur);
    var out = [], conds = [], seen = {};
    r.requirements.forEach(function (t) {
      if (/عمر المتعاقد/.test(t)) { conds.push(t); return; }
      var ty = typeOf(t), s = stampsOf(t);
      var d = { text: t, label: ty.label, kind: s.chain.length ? 'stamp' : ty.kind, form: formOf(t), chain: s.chain, conditional: s.conditional };
      d.flow = flowOf({ text: t, kind: ty.kind });
      if (!FLOWS[d.flow].stamps) { d.chain = []; d.conditional = []; if (d.kind === 'stamp') d.kind = ty.kind; }
      // owner 2026-10-29: a women's document whose stamps depend on an unanswered question (marital status / source of the
      // no-objection) cannot be marked ready — the question is asked above, never guessed
      if (/حدّدي (?:مصدرها|الحالة الاجتماعية)/.test(t)) { d.needsCtx = true; d.chain = []; d.conditional = []; if (d.kind === 'stamp') d.kind = 'doc'; }
      seen[d.label] = (seen[d.label] || 0) + 1; d.key = d.label + '#' + seen[d.label]; // stable per document, not per position
      out.push(d);
    });
    return { docs: out, conds: conds, note: r.note || '' };
  }

  /* ── status questions per document type (owner 2026-10-26) ──
   * Each document asks only what fits it: paper documents (have / missing / need to issue / office review, then their
   * stamps in order), the experience (having the experience ≠ having its certificate), the practice certificate
   * (original + copy), appointments (medical exam, vaccine), the professional verification QVP (application) and the
   * professional examination SVP, asked step by step (booked → taken → passed). «Passed» is the visitor's answer, not an
   * official check. Only these status codes are stored (localStorage, per profession + context); no personal data. */
  var FLOWS = {
    // a degree brought if held (master / doctorate of university teaching titles). Owner 2026-10-29 (appendix): held ≠ required
    // for the case. «لا أحمل هذه الشهادة» completes the item only when the visitor also says the university / transaction does
    // not ask for it (x.r = 'notreq'); required-but-not-held or «لا أعرف» stays open for the office.
    optdeg: { q: 'هل تحمل هذه الشهادة؟', done: 'have', skip: 'notheld', req: true, stamps: true, opts: [['have', 'أحملها وهي عندي'], ['notheld', 'لا أحمل هذه الشهادة'], ['missing', 'أحملها وليست عندي'], ['extract', 'أحتاج إلى استخراجها'], ['review', 'تحتاج مراجعة المكتب']] },
    paper: { q: 'حالة الورقة', done: 'have', stamps: true, opts: [['have', 'موجودة عندي'], ['missing', 'ليست عندي'], ['extract', 'أحتاج إلى استخراجها'], ['review', 'تحتاج مراجعة المكتب']] },
    experience: { q: 'الخبرة ووثيقتها', done: 'have', stamps: true, opts: [['have', 'لدي شهادة الخبرة'], ['nodoc', 'لدي الخبرة ولا أملك وثيقتها بعد'], ['none', 'ليست لدي الخبرة المطلوبة'], ['review', 'تحتاج مراجعة المكتب']] },
    practice: { q: 'شهادة مزاولة المهنة', done: 'have', stamps: true, opts: [['have', 'لدي الأصل وصورة عنه'], ['orig', 'لدي الأصل فقط'], ['missing', 'ليست عندي'], ['extract', 'أحتاج إلى استخراجها'], ['review', 'تحتاج مراجعة المكتب']] },
    medical: { q: 'الموعد', done: 'done', opts: [['none', 'لم أحجز موعدًا بعد'], ['booked', 'تم حجز موعد'], ['done', 'تم إجراء الفحص']] },
    vaccine: { q: 'المطعوم', done: 'done', opts: [['none', 'لم أحصل عليه بعد'], ['booked', 'حجزت موعدًا'], ['done', 'حصلت على الشهادة']] },
    auth: { q: 'التفويض', done: 'done', opts: [['none', 'لم يتم بعد'], ['done', 'تم التفويض']] },
    qvp: { q: 'التحقق المهني (QVP)', done: 'done', opts: [['none', 'لم أبدأ'], ['applied', 'قدّمت الطلب'], ['done', 'حصلت على شهادة التحقق المهني'], ['review', 'تحتاج مراجعة المكتب']] },
    pro: { q: 'الحالة', done: 'done', opts: [['none', 'ليست عندي بعد'], ['progress', 'قيد الاستخراج'], ['done', 'عندي'], ['review', 'تحتاج مراجعة المكتب']] },
    svp: { q: 'الفحص المهني (SVP)', done: 'passed', steps: true, opts: [['none', 'لم أحجز موعد الفحص'], ['booked', 'موعد محجوز'], ['taken', 'أجريت الفحص وأنتظر النتيجة'], ['passed', 'اجتزت الفحص (حسب إجابتك)'], ['failed', 'لم أجتز الفحص']] },
  };
  var HINTS = {
    'svp:none': 'هذه الخطوة ما زالت مطلوبة: احجز موعد الفحص المهني.', 'svp:booked': 'موعد محجوز، والفحص لم يُنجز بعد.', 'svp:taken': 'بانتظار النتيجة؛ لا يُعد الفحص منجزًا قبل اجتيازه.',
    'svp:passed': 'مكتمل حسب إجابتك. لم نتحقق من النتيجة رسميًا؛ أحضر إثبات النتيجة للمكتب.', 'svp:failed': 'راجع المكتب لمعرفة إمكانية إعادة الفحص.',
    'experience:nodoc': 'وجود الخبرة لا يكفي: يلزم استخراج شهادة الخبرة ثم استكمال أختامها.', 'experience:none': 'المهنة تتطلب خبرة؛ راجع المكتب قبل متابعة المعاملة.',
    'practice:orig': 'المطلوب الأصل وصورة عنه.', 'medical:booked': 'موعد محجوز، والفحص لم يُنجز بعد.', 'vaccine:booked': 'موعد محجوز، والشهادة لم تصدر بعد.',
    'qvp:applied': 'الطلب مقدَّم؛ تكتمل الخطوة عند صدور شهادة التحقق المهني.',
  };
  var flowOf = function (d) {
    var t = d.text;
    if (/\(SVP\)|الفحص المهني/.test(t)) return 'svp';
    if (/\(QVP\)|التحقق المهني/.test(t)) return 'qvp';
    if (/الفحص الطبي/.test(t)) return 'medical';
    if (/مطعوم/.test(t)) return 'vaccine';
    if (/تفويض/.test(t)) return 'auth';
    if (/إن كنت تحملها/.test(t)) return 'optdeg';
    if (/^خبرة|خبرة لمدة|^الخبرة/.test(t)) return 'experience';
    if (/شهادة مزاولة المهنة/.test(t)) return 'practice';
    if (d.kind === 'pro') return 'pro';
    return 'paper';
  };
  var REQ = [['req', 'نعم، مطلوبة لحالتي'], ['notreq', 'غير مطلوبة لحالتي'], ['unknown', 'لا أعرف']];
  var REQ_TXT = { req: 'مطلوبة لحالتك', notreq: 'غير مطلوبة لحالتك', unknown: 'لا تعرف إن كانت مطلوبة' };
  var statusText = function (d, x) {
    var f = FLOWS[d.flow]; var o = x && x.s && f.opts.filter(function (p) { return p[0] === x.s; })[0];
    if (!o) return 'لم تُحدَّد الحالة';
    // a degree not held: say whether the case needs it (held ≠ required)
    if (f.req && x.s === f.skip) return o[1] + '، ' + (REQ_TXT[x.r] || 'ولم تُحدِّد إن كانت مطلوبة لحالتك');
    return o[1];
  };

  /* ── persistence ── */
  var femCtx = function () { return $('m-gender').value === 'female' && $('m-marital') ? ':' + $('m-marital').value + ':' + $('m-consent').value : ''; };
  var ctxKey = function () { var d = $('m-degree') ? $('m-degree').value : 'auto'; return 'masar3:' + cur._id + ':' + $('m-nat').value + ':' + $('residencyFilter').value + ':' + $('m-gender').value + femCtx() + (d !== 'auto' ? ':' + d : '') + ($('m-nat').value === 'other' ? ':' + $('m-other').value.trim() : '') + ($('dualPassport') && $('dualPassport').checked ? ':dual' : ''); };
  var load = function () { try { var v = localStorage.getItem(ctxKey()); return v ? JSON.parse(v) : {}; } catch (e) { return {}; } };
  var save = function () { try { localStorage.setItem(ctxKey(), JSON.stringify(st)); } catch (e) {} };
  var sx = function (i) { return st[docs[i].key] || { s: '', n: 0, c: false }; };
  var isDone = function (i) {
    var d = docs[i], x = sx(i), f = FLOWS[d.flow];
    if (d.needsCtx) return false;
    // not held: nothing to bring — but only when the case does not need it (a required degree is never «ready» unheld)
    if (f.skip && x.s === f.skip) return !f.req || x.r === 'notreq';
    if (x.s !== f.done) return false;
    return !f.stamps || ((x.n || 0) >= d.chain.length && (!d.conditional.length || x.c));
  };

  /* ── render ── */
  var GROUPS = [
    ['stamp', 'وثائق تحتاج تصديقًا', 'جهّز الوثيقة، ثم صدّقها من الجهات بالترتيب. اضغط الختم بعد الحصول عليه.'],
    ['doc', 'وثائق تُحضرها', 'تُحضر كما هي أو حسب بلد إصدارها، بالأصل أو الصورة كما هو مكتوب على كل وثيقة.'],
    ['pro', 'إجراءات وشهادات مهنية', 'تخص مهنتك: التحقق المهني أو الفحص المهني أو الجهة المهنية المختصة.'],
    ['task', 'إجراءات المعاملة', 'خطوات تُنجز خلال المعاملة، مثل الفحص الطبي والتفويض.'],
  ];
  var GICO = {
    stamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3h6l-1 7h-4z"/><path d="M5 14h14v4H5z"/><path d="M4 21h16"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    pro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></svg>',
    task: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 3h6v3H9zM8 12l2.5 2.5L16 9"/></svg>',
  };
  // which answer changes the document (owner 2026-10-27: tell basic documents from profession / nationality ones)
  var SCOPE = function (d) {
    if (/حسن السيرة|الوثائق العسكرية|القيد العائلي|الإقامة الأردنية/.test(d.label)) return 'حسب الجنسية والإقامة';
    if (/ممانعة|الحالة الاجتماعية|الزواج|القيد الفردي|جواز الزوج|جواز ولي الأمر/.test(d.label)) return 'للمتقدمات';
    if (/^(?:مستند|عقد العمل|الفحص الطبي|التفويض|مطعوم)/.test(d.label)) return 'أساسية';
    return 'حسب المهنة';
  };
  function render() {
    // «بلد إصدار الشهادة الجامعية» only matters when the profession's data asks for a university degree
    if ($('m-degree-wrap') && typeof professionProfile === 'function') $('m-degree-wrap').hidden = !professionProfile(cur).university;
    var b = build(); docs = b.docs;
    $('m-empty').hidden = true; $('m-sheet').hidden = false;
    $('m-name').textContent = cur.name_ar;
    // a number that is not a confirmed official code is never shown as one (owner 2026-10-29)
    $('m-code').textContent = cur.no_official_code ? (window.SD_NO_CODE || 'بدون رمز رسمي مؤكد') : /^\d{6}$/.test(String(cur.code)) ? cur.code : cur.officialCode ? cur.officialCode + ' (' + window.SD_officialLabel(cur) + ')' : (cur.isEstimate ? 'نتيجة تقديرية' : 'غير محدد');
    $('m-sheet').classList.toggle('is-estimate', !!cur.isEstimate);
    $('m-cat').textContent = cur.category || '';
    $('m-print-ctx').textContent = context();
    if ($('m-calc') && typeof window.SD_calcCategory === 'function') $('m-calc').href = '/calculator.html?cat=' + window.SD_calcCategory(cur) + '&p=' + encodeURIComponent(cur.name_ar) + (cur.isEstimate ? '&est=1' : '');
    var pg = $('m-page');
    // owner 2026-10-27: the 4 records without a code carry the slug of ANOTHER profession's page — link only a page whose
    // file ends with this record's own code
    if (cur.slug && /^\d{6}$/.test(String(cur.code)) && new RegExp('-' + cur.code + '$').test(cur.slug)) { pg.href = '/p/' + cur.slug + '.html'; pg.hidden = false; } else pg.hidden = true;
    // owner 2026-10-27: notes are kept apart from the documents. Cautions (estimate, code review) above the list; notes about
    // a procedure's activation (SVP) once, in blue, below the list. Each note is shown once even if the data repeats it.
    var ICO_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></svg>';
    var ICO_W = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v5M12 17.5h.01"/></svg>';
    var parts = [], seenN = {};
    String(b.note || '').split(/\s*•\s*/).concat(typeof window.SD_officialNote === 'function' ? [window.SD_officialNote(cur)] : []).forEach(function (n) { n = (n || '').trim(); if (n && !seenN[n]) { seenN[n] = 1; parts.push(n); } });
    var isProc = function (n) { return /تفعيل|غير مفعّل|غير مفعل|غير مطلوب حاليًا/.test(n); };
    $('m-conds').innerHTML = b.conds.map(function (c) { return '<p class="sd-notice info">' + ICO_I + '<span><b>شرط:</b> ' + esc(c) + '</span></p>'; }).join('') +
      parts.filter(function (n) { return !isProc(n); }).map(function (n) { return '<p class="sd-notice">' + ICO_W + '<span><b>' + (/تقديرية/.test(n) ? 'نتيجة تقديرية:' : 'ملاحظة:') + '</b> ' + esc(n.replace(/^نتيجة تقديرية:\s*/, '')) + '</span></p>'; }).join('');
    // the optional Musadaqa note («أستاذ تعليم عالي»): the Musadaqa sample next to it, nowhere else
    if (window.SD_CERT) [].forEach.call($('m-conds').querySelectorAll('.sd-notice'), function (p) { if (/مصادقة/.test(p.textContent)) { var s = p.querySelector('span'); var b2 = window.SD_CERT.button('musadaqa'); if (s && b2) { b2.style.display = 'flex'; s.appendChild(b2); } } });
    var procNotes = parts.filter(isProc);
    $('m-notes').innerHTML = procNotes.length ? '<h3>ملاحظات المكتب</h3>' + procNotes.map(function (n) { return '<p class="m-note-blue">' + ICO_I + '<span>' + esc(n) + '</span></p>'; }).join('') : '';
    $('m-notes').hidden = !procNotes.length;
    var html = '';
    GROUPS.forEach(function (g) {
      var idx = docs.map(function (d, i) { return d.kind === g[0] ? i : -1; }).filter(function (i) { return i >= 0; });
      if (!idx.length) return;
      html += '<section class="m-group m-group-' + g[0] + '"><header><span class="m-gico" aria-hidden="true">' + GICO[g[0]] + '</span><div><h3>' + g[1] + ' <span class="sd-num">' + idx.length + '</span></h3><p>' + g[2] + '</p></div></header><ol class="m-slips">';
      idx.forEach(function (i) { html += slip(i); });
      html += '</ol></section>';
    });
    $('m-groups').innerHTML = html;
    if (window.SD_CERT) {
      var hasDegree = typeof window.professionProfile === 'function' ? !!window.professionProfile(cur).university || /دبلوم/.test(docs.map(function (d) { return d.text; }).join(' ')) : undefined;
      [].forEach.call($('m-groups').querySelectorAll('.m-cert'), function (slot) {
        var kind = slot.dataset.cert;
        slot.appendChild(window.SD_CERT.fits(kind, hasDegree) ? window.SD_CERT.button(kind, { profession: cur.name_ar }) : window.SD_CERT.note(kind));
      });
    }
    tally();
  }
  // SVP is asked one question at a time; the next question depends on the previous answer
  function svpSteps(i, x) {
    var s = x.s || '', q = [];
    var btn = function (val, label) { return '<button type="button" class="m-have small" data-act="status" data-v="' + val + '" aria-pressed="' + (s === val) + '">' + label + '</button>'; };
    q.push('<div class="m-q"><span>هل حجزت موعد الفحص المهني؟</span>' + btn('booked', 'نعم') + btn('none', 'لا، ليس بعد') + '</div>');
    if (s === 'booked' || s === 'taken' || s === 'passed' || s === 'failed') q.push('<div class="m-q"><span>هل أجريت الفحص؟</span>' + btn('taken', 'نعم') + btn('booked', 'ليس بعد') + '</div>');
    if (s === 'taken' || s === 'passed' || s === 'failed') q.push('<div class="m-q"><span>هل اجتزت الفحص ولديك النتيجة أو الإثبات؟</span>' + btn('passed', 'نعم') + btn('failed', 'لم أجتزه') + btn('taken', 'بانتظار النتيجة') + '</div>');
    return q.join('');
  }
  function slip(i) {
    var d = docs[i], x = sx(i), done = isDone(i), f = FLOWS[d.flow];
    var have = x.s === f.done && f.stamps; // stamps can be pressed once the document is at hand
    var h = '<li class="m-slip' + (done ? ' done' : '') + '" data-i="' + i + '">';
    h += '<div class="m-slip-top"><span class="m-type">' + esc(d.label) + '</span>' + (d.form ? '<span class="m-form">' + esc(d.form) + '</span>' : '') + '<span class="m-scope">' + esc(SCOPE(d)) + '</span>' + (done ? '<span class="m-ok">' + (f.req && x.s === f.skip ? 'غير مطلوبة لحالتك' : 'جاهزة') + '</span>' : '') + '</div>';
    h += '<p class="m-text flex-1">' + esc(d.text) + '</p>';
    // owner 2026-10-27: «شاهد نموذج الشهادة» next to the requirement it explains (SVP / QVP / Musadaqa) — filled after render
    if (window.SD_CERT && window.SD_CERT.kindOf(d.text)) h += '<div class="m-cert sd-noprint" data-cert="' + window.SD_CERT.kindOf(d.text) + '"></div>';
    if (f.steps) h += '<div class="m-steps sd-noprint">' + svpSteps(i, x) + '</div>';
    else h += '<div class="m-status sd-noprint"><label for="m-st' + i + '">' + esc(f.q) + '</label><select id="m-st' + i + '" data-act="status"><option value="">اختر الحالة</option>' +
      f.opts.map(function (o) { return '<option value="' + o[0] + '"' + (x.s === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
    // owner 2026-10-29 (appendix): a degree not held → is it required for this case? (asked, never assumed)
    if (f.req && x.s === f.skip) h += '<div class="m-steps sd-noprint"><div class="m-q"><span>هل تطلب الجامعة أو المعاملة هذه الشهادة لحالتك؟</span>' +
      REQ.map(function (o) { return '<button type="button" class="m-have small" data-act="req" data-v="' + o[0] + '" aria-pressed="' + (x.r === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    // the three facts kept apart: held / required for the case / extra attestation (only if the university asks)
    if (f.req) h += '<ul class="m-degfacts"><li><b>تحملها؟</b> ' + esc(x.s === 'have' || x.s === 'missing' || x.s === 'extract' ? 'نعم' : x.s === f.skip ? 'لا' : 'لم تُحدِّد') + '</li>' +
      '<li><b>مطلوبة لحالتك؟</b> ' + esc(x.s === f.skip ? (x.r === 'req' ? 'نعم' : x.r === 'notreq' ? 'لا' : x.r === 'unknown' ? 'غير معروف، يؤكده المكتب' : 'لم تُحدِّد') : 'إن كنت تحملها فأحضرها ضمن المؤهلات') + '</li>' +
      '<li><b>تصديق إضافي (مصادقة ثم السفارة السعودية)؟</b> فقط إذا طلبته الجامعة ضمن إجراءاتها</li></ul>';
    var REQ_HINT = { req: 'الشهادة مطلوبة لحالتك ولا تحملها: لا يكتمل الملف بدونها، راجع المكتب قبل البدء بالمعاملة.', unknown: 'يؤكد المكتب إن كانت الجامعة أو المعاملة تطلب هذه الشهادة.', '': 'أجب: هل تطلب الجامعة أو المعاملة هذه الشهادة لحالتك؟' };
    var hint = f.req && x.s === f.skip && x.r !== 'notreq' ? REQ_HINT[x.r || ''] : d.needsCtx ? (/مصدرها/.test(d.text) ? 'حدّدي مصدر عدم الممانعة في الأعلى (مركز أمني أو المحكمة أو من خارج الأردن) لتظهر أختامها؛ لا تكتمل الورقة قبل ذلك.' : 'حدّدي الحالة الاجتماعية في الأعلى لتظهر أوراقها؛ لا تكتمل قبل ذلك.')
      : HINTS[d.flow + ':' + x.s] || (x.s === 'review' ? 'ستُراجع مع المكتب قبل التقديم.' : '');
    h += '<p class="m-st-line"><b>الحالة:</b> ' + esc(statusText(d, x)) + (hint ? ' — <span>' + esc(hint) + '</span>' : '') + '</p>';
    if (!f.stamps || (f.req && x.s === f.skip)) return h + '</li>'; // a degree not held has no stamps to collect
    h += '<div class="m-path">';
    d.chain.forEach(function (name, k) {
      var on = have && x.n > k, next = have && x.n === k, last = have && x.n === k + 1;
      h += '<span class="m-seg' + (on ? ' on' : '') + '" aria-hidden="true"></span>';
      h += '<button type="button" class="m-stamp' + (on ? ' on' : '') + (on && fresh === i + ':' + k ? ' fresh' : '') + '" data-act="stamp" data-k="' + k + '"' + (next || last ? '' : ' disabled') +
        ' aria-pressed="' + on + '" aria-label="' + (on ? 'مختومة من ' : 'بانتظار ختم ') + esc(name) + '"><span>' + esc(name) + '</span><small>' + (on ? 'مختومة' : 'بانتظار الختم') + '</small></button>';
    });
    h += '</div>';
    if (d.conditional.length) {
      h += '<div class="m-cond"><p><b>الأختام حسب بلد الإصدار:</b> تختلف جهات التصديق حسب البلد الذي صدرت منه هذه الوثيقة، كما في النص أعلاه. <span class="m-flag">يؤكد المكتب الجهات بعد مراجعة الوثيقة</span></p>' +
        '<button type="button" class="m-have small" data-act="cond" aria-pressed="' + !!x.c + '"' + (have ? '' : ' disabled') + '><span class="m-box" aria-hidden="true">' + (x.c ? '✓' : '') + '</span>صُدّقت حسب تعليمات المكتب</button></div>';
    }
    if ((d.chain.length || d.conditional.length) && !have) h += '<p class="m-hint sd-noprint">الأختام تُفعَّل عندما تختار «' + esc(f.opts[0][1]) + '».</p>';
    return h + '</li>';
  }
  function tally() {
    var all = docs.length, ok = docs.filter(function (d, i) { return isDone(i); }).length;
    ['m-done', 'm-dock-done'].forEach(function (id) { $(id).textContent = ok; });
    ['m-all', 'm-dock-all'].forEach(function (id) { $(id).textContent = all; });
    $('m-bar').style.setProperty('--p', all ? (ok / all * 100) + '%' : '0%');
    $('m-bar').setAttribute('aria-valuenow', String(ok)); $('m-bar').setAttribute('aria-valuemax', String(all));
    var miss = docs.map(function (d, i) { if (isDone(i)) return null; var x = sx(i); return d.label + ' (' + statusText(d, x) + (x.s === FLOWS[d.flow].done && d.chain[x.n || 0] ? '، بانتظار ختم ' + d.chain[x.n || 0] : '') + ')'; }).filter(Boolean);
    $('m-missing').innerHTML = miss.length ? miss.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') : '<li class="m-allset">لا شيء. ملفك مكتمل حسب هذه القائمة.</li>';
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message(false));
    $('m-wa').href = url; $('m-dock-wa').href = url;
  }

  /* ── text outputs ── */
  function context() {
    var n = $('m-nat'); var t = n.options[n.selectedIndex].text;
    if (n.value === 'other' && $('m-other').value.trim()) t = $('m-other').value.trim();
    var femTxt = $('m-gender').value === 'female' && $('m-marital') ? (($('m-marital').value !== 'unknown' ? ' · ' + $('m-marital').options[$('m-marital').selectedIndex].text : '') + ($('m-consent').value !== 'unknown' ? ' · عدم الممانعة: ' + $('m-consent').options[$('m-consent').selectedIndex].text : '')) : '';
    return 'الجنسية: ' + t + ($('m-res').closest('.m-field').hidden ? '' : ' · ' + $('m-res').options[$('m-res').selectedIndex].text) + ' · ' + $('m-gender').options[$('m-gender').selectedIndex].text + femTxt +
      ($('m-degree') && !$('m-degree-wrap').hidden && $('m-degree').value !== 'auto' ? ' · بلد إصدار الشهادة: ' + $('m-degree').options[$('m-degree').selectedIndex].text : '');
  }
  function message(full) {
    var ok = [], miss = [];
    docs.forEach(function (d, i) { var x = sx(i), f = FLOWS[d.flow]; (isDone(i) ? ok : miss).push('- ' + d.label + (isDone(i) ? (f.req && x.s === f.skip ? ' (' + statusText(d, x) + ')' : '') : ' (' + statusText(d, x) + ')')); });
    if (full) {
      var notes = (window.computeRequirements(cur).note || '');
      return ['مسار أوراقي: ' + cur.name_ar + ' (' + (cur.isEstimate ? 'نتيجة تقديرية لفئة ' + cur.estimateLabel : cur.no_official_code ? (window.SD_NO_CODE || 'بدون رمز رسمي مؤكد') : 'رمز ' + cur.code) + ')', context(), ''].concat(docs.map(function (d, i) {
        var x = sx(i);
        return (i + 1) + '. ' + (isDone(i) ? '[✓] ' : '[ ] ') + d.text + '\n   الحالة: ' + statusText(d, x) +
          (d.chain.length ? '\n   الأختام بالترتيب: ' + d.chain.map(function (c, k) { return c + (x.s === FLOWS[d.flow].done && (x.n || 0) > k ? ' (تم)' : ''); }).join(' ← ') : '');
      })).concat(notes ? ['', 'ملاحظات: ' + notes] : []).concat(['', location.origin + location.pathname + (/^\d{6}$/.test(String(cur.code)) ? '?code=' + cur.code : '')]).join('\n');
    }
    return 'مرحبًا، أجهّز ملف تأشيرة عمل لمهنة ' + cur.name_ar + (cur.isEstimate ? ' (غير موجودة في القائمة: نتيجة تقديرية لفئة ' + cur.estimateLabel + ')' : cur.no_official_code ? ' (' + (window.SD_NO_CODE || 'بدون رمز رسمي مؤكد') + ')' : ' (رمز ' + cur.code + ')') + '.\n' + context() + '\n\nجاهز (' + ok.length + '):\n' + (ok.join('\n') || '- لا شيء بعد') + '\n\nناقص (' + miss.length + '):\n' + (miss.join('\n') || '- لا شيء') + '\n\nأرجو مراجعة الملف معي.';
  }
  function toast(t) { var el = $('m-toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('show'); }, 2200); }
  function copy(t, msg) {
    var done = function () { toast(msg); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fb); else fb();
    function fb() { var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('تعذّر النسخ، حدّد النص يدويًا'); } ta.remove(); }
  }

  /* ── events ── */
  function setStatus(i, v) {
    var d = docs[i], x = sx(i), f = FLOWS[d.flow];
    // leaving «have» clears the stamps (they can only be pressed for a document at hand)
    st[d.key] = { s: v, n: v === f.done && f.stamps ? (x.n || 0) : 0, c: v === f.done ? !!x.c : false, r: x.r || '' };
  }
  $('m-groups').addEventListener('change', function (e) {
    var sel = e.target.closest('select[data-act="status"]'); if (!sel) return;
    var i = +sel.closest('.m-slip').dataset.i; setStatus(i, sel.value);
    save(); var keep = window.scrollY; render(); window.scrollTo(0, keep);
    var again = $('m-st' + i); if (again) again.focus();
  });
  $('m-groups').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b || b.disabled) return;
    var i = +b.closest('.m-slip').dataset.i, d = docs[i], x = sx(i), key = d.key;
    if (b.dataset.act === 'status') setStatus(i, b.dataset.v);
    else if (b.dataset.act === 'req') st[key] = { s: x.s, n: x.n, c: x.c, r: b.dataset.v };
    else if (b.dataset.act === 'cond') st[key] = { s: x.s, n: x.n, c: !x.c, r: x.r || '' };
    else { var k = +b.dataset.k; if (x.n === k) { st[key] = { s: x.s, n: k + 1, c: x.c, r: x.r || '' }; fresh = i + ':' + k; } else if (x.n === k + 1) st[key] = { s: x.s, n: k, c: x.c, r: x.r || '' }; }
    save(); var keep = window.scrollY; render(); window.scrollTo(0, keep); fresh = null;
    var again = document.querySelector('.m-slip[data-i="' + i + '"] [data-act="' + b.dataset.act + '"]' + (b.dataset.k ? '[data-k="' + b.dataset.k + '"]' : '') + (b.dataset.v ? '[data-v="' + b.dataset.v + '"]' : ''));
    if (again && !again.disabled) again.focus();
  });
  $('m-print').addEventListener('click', function () { if (window.SD_print) window.SD_print($('m-sheet'), 'مسار أوراقي: ' + cur.name_ar, context()); else window.print(); });
  $('m-share').addEventListener('click', function () {
    var url = location.origin + location.pathname + (/^\d{6}$/.test(String(cur.code)) ? '?code=' + cur.code : '');
    if (navigator.share) navigator.share({ title: 'مسار أوراقي: ' + cur.name_ar, text: 'قائمة أوراق تأشيرة العمل لمهنة ' + cur.name_ar, url: url }).catch(function () {});
    else copy(url, 'نُسخ رابط المسار');
  });
  $('m-reset').addEventListener('click', function () { $('m-confirm').hidden = false; $('m-do-reset').focus(); });
  $('m-no-reset').addEventListener('click', function () { $('m-confirm').hidden = true; });
  $('m-do-reset').addEventListener('click', function () { st = {}; save(); $('m-confirm').hidden = true; render(); toast('مُسحت العلامات'); });

  function syncCtx() {
    var nat = $('m-nat').value;
    var isJo = nat === 'الأردن' || (nat === 'other' && /[اأإآ]ردن/.test($('m-other').value));
    $('m-res').closest('.m-field').hidden = isJo;
    if ($('m-dual-wrap')) $('m-dual-wrap').hidden = !isJo;
    if ($('dualPassport')) $('dualPassport').checked = isJo && $('m-dual') && $('m-dual').checked;
    $('m-other-wrap').hidden = nat !== 'other' || Boolean($('m-nat').dataset.sdn); // the typed field replaces it
    // computeRequirements reads these ids (same as the professions page)
    $('nationalityFilter').value = nat; $('otherNationality').value = $('m-other').value;
    $('residencyFilter').value = nat === 'الأردن' ? 'unknown' : $('m-res').value; $('genderFilter').value = $('m-gender').value;
    // owner 2026-10-29: the women's questions only for a woman; they drive the women's documents and their stamps
    var fem = $('m-gender').value === 'female';
    if ($('m-marital-wrap')) { $('m-marital-wrap').hidden = !fem; $('m-consent-wrap').hidden = !fem; }
    if ($('maritalFilter')) { $('maritalFilter').value = fem && $('m-marital') ? $('m-marital').value : 'unknown'; $('consentSourceFilter').value = fem && $('m-consent') ? $('m-consent').value : 'unknown'; }
    if ($('m-degree') && $('degreeCountryFilter')) $('degreeCountryFilter').value = $('m-degree').value;
    if (!cur) return;
    // owner 2026-10-27: a new nationality / residency / gender can change the list. Saved answers for THIS context are used;
    // if there are none, only the documents whose text did not change keep their status (changed ones start empty).
    var prev = {}; docs.forEach(function (d) { if (st[d.key] && st[d.key].s) prev[d.text] = st[d.key]; });
    st = load(); var empty = !Object.keys(st).length; render();
    if (empty && Object.keys(prev).length) {
      var kept = 0; docs.forEach(function (d) { if (prev[d.text]) { st[d.key] = prev[d.text]; kept++; } });
      if (kept) { save(); render(); toast('بقيت حالة ' + kept + ' من الأوراق التي لم تتغير، وبدأت الأوراق الجديدة من غير حالة'); }
    }
  }
  ['m-nat', 'm-res', 'm-gender', 'm-degree', 'm-dual', 'm-marital', 'm-consent'].forEach(function (id) { if ($(id)) $(id).addEventListener('change', syncCtx); });
  // owner 2026-10-27: one field to type or pick the nationality (js/sd-nationality.js, loaded with defer)
  var natUp = function () { if (window.SD_NAT) { window.SD_NAT.enhance($('m-nat'), $('m-other')); syncCtx(); } };
  if (window.SD_NAT) natUp(); else window.addEventListener('load', natUp);
  $('m-other').addEventListener('input', syncCtx);

  /* ── combobox search (name or code) ── */
  var q = $('m-q'), list = $('m-results'), hits = [], active = -1, IDX = [], resolved = null;
  document.addEventListener('sd-dict-ready', function () { if (cur) render(); if (q.value.trim() && document.activeElement === q) show(); });
  function search(v) {
    // the same ranked, hamza-tolerant search as the professions page (professions.js), Arabic + English + code
    if (typeof window.SD_searchProfessions === 'function') return window.SD_searchProfessions(DATA, v, 8);
    var n = norm(v); if (!n) return [];
    if (/^\d+$/.test(n)) return IDX.filter(function (x) { return String(x.p.code).indexOf(n) === 0; }).slice(0, 8).map(function (x) { return x.p; });
    var out = [];
    IDX.forEach(function (x) { var s = -1; if (x.n.indexOf(n) === 0) s = 0; else if ((' ' + x.n).indexOf(' ' + n) >= 0) s = 1; else if (x.n.indexOf(n) >= 0) s = 2; if (s >= 0) out.push([s, x.n.length, x.p]); });
    out.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    return out.slice(0, 8).map(function (x) { return x[2]; });
  }
  function show() {
    hits = search(q.value); active = hits.length ? 0 : -1;
    if (!q.value.trim()) { list.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    // stage 2 (owner 2026-10-26): a title that is not in the list → an estimate by category (same function as the
    // professions page), shown first and labelled; generic titles / senior management → a message only
    var estMsg = '';
    var res = typeof window.SD_resolveTitle === 'function' ? window.SD_resolveTitle(DATA, q.value) : null;
    resolved = res;
    if (res && res.kind === 'estimate') { res.record._id = 'est:' + norm(res.record.name_ar); hits = [res.record].concat(hits).slice(0, 8); active = 0; }
    else if (res && res.kind === 'synonym') { hits = [res.record].concat(hits.filter(function (p) { return p !== res.record; })).slice(0, 8); active = 0; }
    else if (res && res.kind === 'message') estMsg = res.message;
    else if (res && res.kind === 'choose') { hits = window.SD_choiceHits(res); active = 0; estMsg = res.question; }
    // owner 2026-10-27: official titles / codes from the internal dictionary that are not in the office list (labelled)
    if (typeof window.SD_dictSearch === 'function' && !(res && res.kind === 'choose') && (!res || res.kind === 'partial' || res.kind === 'message' || !hits.length)) {
      var shown = {}; hits.forEach(function (p) { shown[p.officialCode || p.code] = 1; });
      window.SD_dictSearch(q.value, Math.max(0, 8 - hits.length)).forEach(function (e) { if (!shown[e.code]) hits.push({ __dict: e, name_ar: e.name, code: e.code }); });
      if (hits.length && active < 0) active = 0;
    }
    var off = res && res.official;
    list.innerHTML = hits.length ? hits.map(function (p, k) {
      if (p.__query) return '<li id="m-opt' + k + '" role="option" aria-selected="' + (k === active) + '" data-k="' + k + '" class="m-est"><span>' + esc(p.name_ar) + ' <small>اعرض المهن المطابقة</small></span><span class="sd-num">←</span></li>';
      if (p.__dict) return '<li id="m-opt' + k + '" role="option" aria-selected="' + (k === active) + '" data-k="' + k + '" class="m-est m-off"><span>' + esc(p.name_ar) + ' <small>مسمى رسمي غير مدرج في قائمة المكتب · الأوراق تحتاج مراجعة</small></span><span class="sd-num">' + esc(p.code) + '</span></li>';
      if (p.isEstimate) return '<li id="m-opt' + k + '" role="option" aria-selected="' + (k === 0) + '" data-k="' + k + '" class="m-est"><span>' + esc(p.name_ar) + ' <small>' + (p.officialCode ? esc(window.SD_officialLabel(p)) + ' · ' : '') + 'نتيجة تقديرية · فئة ' + esc(p.estimateLabel) + '</small></span><span class="sd-num">' + esc(p.officialCode || '—') + '</span></li>';
      var sub = off && k === 0 && res.kind === 'synonym' ? ' <small>' + (res.needsReview ? 'المسمى الرسمي «' + esc(off.name) + '» برمز ' + esc(off.code) + ' · يراجعه المكتب' : 'المسمى الرسمي: ' + esc(off.name)) + '</small>' : '';
      return '<li id="m-opt' + k + '" role="option" aria-selected="' + (k === 0) + '" data-k="' + k + '"><span>' + esc(p.name_ar) + sub + '</span><span class="sd-num">' + esc(p.no_official_code ? '—' : p.code) + '</span></li>'; }).join('') +
        (estMsg ? '<li class="m-none m-msg" role="presentation">' + esc(estMsg) + '</li>' : '')
      : '<li class="m-none" role="option" aria-disabled="true">' + esc(estMsg || 'لم نعثر على مهنة مطابقة. جرّب كتابة اسم المهنة بطريقة أخرى أو تواصل مع المكتب للتأكد من المسمى الصحيح.') +
        (typeof window.SD_suggestProfessions === 'function' ? (function () { var s = window.SD_suggestProfessions(DATA, q.value, 3); return s.length ? '<br>هل تقصد: ' + s.map(function (p) { return '<button type="button" class="m-sug" data-sug="' + esc(p._id) + '">' + esc(p.name_ar) + '</button>'; }).join(' · ') : ''; })() : '') + '</li>';
    list.hidden = false; q.setAttribute('aria-expanded', 'true'); q.setAttribute('aria-activedescendant', active >= 0 ? 'm-opt0' : '');
  }
  function move(d) { if (!hits.length) return; active = (active + d + hits.length) % hits.length; [].forEach.call(list.children, function (li, k) { li.setAttribute('aria-selected', String(k === active)); }); q.setAttribute('aria-activedescendant', 'm-opt' + active); var el = $('m-opt' + active); if (el) el.scrollIntoView({ block: 'nearest' }); }
  function pick(p) {
    if (!p) return;
    if (p.__query) { q.value = p.__query; show(); q.focus(); return; } // a choice that means «search again with this word»
    if (p.__dict) { // an official title from the dictionary: resolve it the same way a typed title is resolved
      var r = window.SD_resolveTitle(DATA, p.__dict.name);
      if (!r || !r.official || r.official.code !== p.__dict.code) r = window.SD_resolveTitle(DATA, p.__dict.code);
      if (r && (r.kind === 'estimate' || r.kind === 'synonym')) { if (r.kind === 'estimate') r.record._id = 'est:' + norm(r.record.name_ar); p = r.record; }
      else { q.value = p.__dict.name; list.innerHTML = '<li class="m-none" role="option" aria-disabled="true">' + esc(r && r.message ? r.message : 'هذا المسمى غير مسجل في قائمة المكتب. تواصل مع المكتب لتحديد الأوراق.') + '</li>'; list.hidden = false; return; }
    }
    // owner 2026-10-29: another profession keeps ONLY the answers of documents that are the same in its list (same text,
    // e.g. the good-conduct certificate, the women's documents, the vaccine); its other documents start without a status
    var prev = {}; if (cur) docs.forEach(function (d) { if (st[d.key] && st[d.key].s) prev[d.text] = st[d.key]; });
    cur = p; q.value = p.name_ar; list.hidden = true; q.setAttribute('aria-expanded', 'false');
    st = load(); render();
    if (!Object.keys(st).length && Object.keys(prev).length) {
      var kept = 0; docs.forEach(function (d) { if (prev[d.text]) { st[d.key] = prev[d.text]; kept++; } });
      if (kept) { save(); render(); toast('بقيت حالة ' + kept + ' من الأوراق المشتركة مع المهنة السابقة، وبدأت أوراق المهنة الجديدة من غير حالة'); }
    }
    try { history.replaceState(null, '', /^\d{6}$/.test(String(p.code)) ? '?code=' + p.code : location.pathname); } catch (e) {}
    var top = $('m-sheet'); if (top) top.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  q.addEventListener('input', show);
  q.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); } else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(hits[active]); } else if (e.key === 'Escape') { list.hidden = true; q.setAttribute('aria-expanded', 'false'); }
  });
  list.addEventListener('mousedown', function (e) {
    var sg = e.target.closest('[data-sug]'); if (sg) { e.preventDefault(); pick(DATA.find(function (p) { return p._id === sg.dataset.sug; })); return; }
    var li = e.target.closest('li[data-k]'); if (li) { e.preventDefault(); pick(hits[+li.dataset.k]); }
  });
  q.addEventListener('blur', function () { setTimeout(function () { list.hidden = true; q.setAttribute('aria-expanded', 'false'); }, 150); });
  document.querySelectorAll('[data-m-code]').forEach(function (b) { b.addEventListener('click', function () { pick(DATA.find(function (p) { return p.code === b.dataset.mCode; })); }); });

  /* ── load ── */
  fetch('/professions.json').then(function (r) { return r.json(); }).then(function (d) {
    // every profession in the list, including the 4 records without a code («---»): keyed by code or position
    DATA = d.map(function (p, i) { p._id = /^\d{6}$/.test(String(p.code)) ? String(p.code) : 'n' + i; return p; });
    IDX = DATA.map(function (p) { return { p: p, n: norm(p.name_ar) }; });
    $('m-count').textContent = DATA.length;
    q.disabled = false; $('m-loading').hidden = true;
    syncCtx();
    var code = new URLSearchParams(location.search).get('code');
    // a link with a code the office used before the official one (2026-10-28, record.former_codes) still opens the profession
    if (code) pick(DATA.find(function (p) { return p.code === code; }) || DATA.find(function (p) { return (p.former_codes || []).indexOf(code) >= 0; }));
  }).catch(function () { $('m-loading').textContent = 'تعذّر تحميل قائمة المهن. حدّث الصفحة.'; });
})();
