/* Document attestation guide — rebuilt 2026-10-27 from the office's rules (owner message 2026-10-27).
 * Flow: document type → country of issue → only the questions that change this document's route.
 * The purpose question appears only where it matters (university degree, company documents).
 * Result order: document · purpose · eligibility · documents to bring · attestations in order · next steps · notice.
 * Nothing is sent anywhere; answers stay in the page. The previous version is kept in checkpoints/2026-10-27-before-platform-upgrade. */
(() => {
  'use strict';
  const form = document.getElementById('attestationChecker');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const val = (id) => ($(id) ? $(id).value : '');
  const txt = (id) => { const s = $(id); return s && s.selectedIndex > 0 ? s.options[s.selectedIndex].text : ''; };
  const WA = '962789881009';

  const DOCS = {
    university: 'شهادة جامعية', school: 'شهادة مدرسية أو ثانوية', experience: 'شهادة خبرة',
    civil: 'شهادة ميلاد أو زواج أو طلاق أو وفاة', medical: 'تقرير طبي أو إجازة مرضية', agency: 'وكالة',
    commercial: 'سجل تجاري ووثائق شركة', other: 'وثيقة أخرى',
  };
  const COUNTRY = { jordan: 'الأردن', saudi: 'السعودية', other: 'دولة أخرى' };

  // which questions each document shows (data-q on each question block in the page)
  function visibleQuestions(type, country) {
    const q = new Set();
    if (type === 'university') { q.add('uni-status'); q.add('uni-purpose'); if (val('uniStatus') && val('uniStatus') !== 'neither') { if (country !== 'saudi') q.add('uni-musadaqa'); q.add('uni-what'); } if (val('uniWhat') === 'copies' || val('uniWhat') === 'both') q.add('uni-copies'); }
    if (type === 'agency') { q.add('agency-kind'); if (val('agencyKind') === 'general') q.add('agency-inheritance'); if (country === 'saudi') q.add('agency-esaudi'); }
    if (type === 'commercial') { q.add('company-purpose'); q.add('company-resident'); }
    if (type === 'civil') q.add('civil-kind');
    return q;
  }
  function sync() {
    const type = val('attestationDocumentType'), country = val('attestationSourceCountry');
    const show = visibleQuestions(type, country);
    form.querySelectorAll('[data-q]').forEach((el) => {
      const on = show.has(el.dataset.q); el.hidden = !on;
      el.querySelectorAll('select,input').forEach((f) => { f.required = on && !f.hasAttribute('data-optional'); });
    });
    // owner 2026-10-27: the Musadaqa sample (only this one) beside the university-degree verification question
    const mq = form.querySelector('[data-q="uni-musadaqa"]');
    if (mq && window.SD_CERT && !mq.querySelector('.sdc-trigger')) mq.appendChild(window.SD_CERT.button('musadaqa', { onChoice: (c) => { $('uniMusadaqa').value = c === 'have' ? 'have' : 'office'; sync(); } }));
    // owner 2026-10-27: one short line under the purpose when a university degree is attested for work in Saudi Arabia
    const pq = form.querySelector('[data-q="uni-purpose"]');
    if (pq) {
      let pn = pq.querySelector('.at-purpose-note');
      const showNote = type === 'university' && country !== 'saudi' && val('uniPurpose') === 'work';
      if (showNote && !pn) { pn = document.createElement('small'); pn.className = 'at-purpose-note sv-field-help'; pn.style.display = 'block'; pn.style.marginTop = '6px'; pq.appendChild(pn); }
      if (pn) { pn.hidden = !showNote; pn.textContent = showNote ? 'للعمل في السعودية: قد تحتاج إلى نتيجة «مصادقة» لشهادتك، مع صورة الإقامة أو مستندات عقد العمل والتأشيرة حسب حالتك. تُرفق كلها في ملف التصديق لدى السفارة.' : ''; }
    }
    const hint = $('attestationContextHint');
    if (hint) hint.textContent = !type ? 'اختر نوع الوثيقة وبلد إصدارها، ثم أجب عن الأسئلة التي تظهر لها فقط.'
      : type === 'experience' ? 'تصديق شهادة الخبرة لا يحتاج سؤالًا عن الغرض.'
      : type === 'university' ? 'نسأل عن وضعك في السعودية لأن تصديق الشهادة الجامعية مرتبط به حسب سياسة المكتب.'
      : type === 'agency' ? 'نوع الوكالة وبلد إصدارها يحددان الأوراق والأختام.'
      : type === 'commercial' ? 'نسأل عن الغرض وعن إقامتك في السعودية لأنهما يغيّران الأوراق المطلوبة.'
      : 'لا نحتاج أسئلة إضافية لهذه الوثيقة.';
  }

  // the attestation chain for the country of issue (office rules; where the office has not given a rule, the office confirms)
  function otherCountryChain(docName) {
    return [`أصل ${docName} مختومًا من وزارة خارجية الدولة التي صدر منها`, 'إحضار الأصل إلى عمّان لاستكمال المعاملة، ويحدد المكتب بقية التصديقات حسب نوع الوثيقة'];
  }

  function build() {
    const type = val('attestationDocumentType'), country = val('attestationSourceCountry');
    const r = { title: DOCS[type] || 'وثيقة', country: COUNTRY[country] || '', purpose: '', conditions: [], docs: [], chain: [], next: [], notice: '', stop: false };
    const officeNext = 'سلّم الأوراق للمكتب ليتابع التصديق لدى السفارة أو القنصلية السعودية في عمّان.';

    if (type === 'experience') {
      if (country === 'jordan') {
        r.docs = ['شهادة الخبرة الأصلية مختومة من وزارة الخارجية الأردنية', 'صورة عن إقامة المستفيد في السعودية'];
        r.chain = ['وزارة الخارجية الأردنية (قبل التسليم)', 'تصديق القنصلية السعودية عبر المكتب'];
        r.notice = 'هذا مسار تصديق شهادة الخبرة فقط. ملف تأشيرة العمل والتحقق المهني (QVP) لهما متطلبات أخرى تظهر في صفحة المهنة.';
      } else if (country === 'saudi') {
        r.docs = ['أصل شهادة الخبرة الصادرة من السعودية', 'صورة عن إقامة المستفيد في السعودية'];
        r.chain = ['الجهات السعودية المختصة حسب نوع الشهادة — يحددها المكتب بعد مراجعة الوثيقة'];
        r.notice = 'لم يحدد المكتب بعد تسلسلًا ثابتًا لشهادات الخبرة الصادرة من السعودية؛ يراجعها معك قبل التسليم.';
      } else {
        r.docs = ['أصل شهادة الخبرة', 'صورة عن إقامة المستفيد في السعودية'];
        r.chain = otherCountryChain('شهادة الخبرة');
      }
      r.next = [officeNext];
    }

    if (type === 'university') {
      r.purpose = txt('uniPurpose');
      const st = val('uniStatus');
      // owner 2026-10-27: TWO linked elements, neither replaces the other — (1) the Musadaqa result for the degree and
      // (2) a link to Saudi Arabia (Saudi residency, or a work contract and visa). Same rule for work, family or personal use.
      const BOTH = 'يلزم عنصران معًا قبل تصديق السفارة السعودية في عمّان: (1) نتيجة مصادقة الشهادة الجامعية عبر منصة «مصادقة» السعودية، و(2) إثبات الارتباط بالسعودية: إقامة سعودية، أو عقد عمل وتأشيرة. لا يغني أحدهما عن الآخر.';
      if (st === 'neither') {
        r.stop = true;
        r.conditions = [BOTH, 'حسب سياسة المكتب، يُصدَّق هذا المسار لمن لديه إقامة سعودية أو عقد عمل وتأشيرة، أيًّا كان الغرض (عمل أو استقدام عائلي أو استخدام شخصي).'];
        r.notice = 'لا تستوفي حاليًا شروط هذا المسار، حتى لو كانت لديك نتيجة مصادقة لشهادتك؛ نتيجة المصادقة وحدها لا تكفي. إذا حصلت لاحقًا على عقد عمل وتأشيرة أو إقامة سعودية، عد إلى هذه الصفحة أو تواصل مع المكتب.';
      } else if (country === 'saudi') {
        // owner 2026-10-27: a degree issued IN Saudi Arabia follows the Saudi-documents route (below); no automatic request
        // for the Musadaqa platform. The office's own condition (residency, or contract and visa) is kept as it was.
        r.conditions = [st === 'resident' ? 'إثبات الارتباط: ذكرت أن لديك إقامة سعودية، وتُرفق صورة عنها.' : 'إثبات الارتباط: ذكرت أن لديك عقد عمل وتأشيرة، وتُرفق صورة عنهما.',
          'الشهادة صادرة من السعودية: تتبع مسار الوثائق السعودية الموضح أدناه، ولا يُطلب لها تلقائيًا توثيق عبر منصة «مصادقة». يؤكد المكتب ذلك عند مراجعة الشهادة.'];
        r.docs.push('أصل الشهادة الجامعية الصادرة من السعودية');
        const what = val('uniWhat'); if (what === 'copies' || what === 'both') r.docs.push('نسخ مصدقة من الشهادة (العدد حسب حاجتك)');
        r.docs.push(st === 'resident' ? 'صورة عن الإقامة السعودية' : 'صورة عن عقد العمل والتأشيرة');
        r.chain = ['الجهات السعودية المختصة — يحددها المكتب بعد مراجعة الشهادة']; r.next = [officeNext];
      } else {
        const hasMus = val('uniMusadaqa') === 'have';
        // owner 2026-10-27: short, tailored to the visitor's own answers — the Musadaqa notice and the Saudi-link papers go
        // TOGETHER into the embassy file; a resident attaches the residency, a first-time worker the contract and visa
        // papers they have so far (the visa only once it is issued)
        const LINK = st === 'resident' ? 'صورة الإقامة السعودية' : 'مستندات عقد العمل والتأشيرة المتوفرة لديك';
        r.conditions = ['يُرفق في ملف التصديق لدى السفارة السعودية أمران معًا: إشعار نتيجة «مصادقة» للشهادة، و' + LINK + '. لا يغني أحدهما عن الآخر.',
          st === 'resident' ? 'أنت مقيم في السعودية: أرفق صورة الإقامة.' : 'لديك عقد عمل: أرفق العقد، وصورة التأشيرة إن صدرت. لا يُطلب منك ما لم يصدر بعد.',
          hasMus ? 'المصادقة: لديك إشعار نتيجة «مصادقة».' : 'المصادقة: لم تصدر بعد، ويمكن أن يقدّم المكتب طلبها عنك.'];
        if (hasMus) r.notice = 'حسب ما أدخلته، المستندات المطلوبة متوفرة. يبقى التحقق النهائي منها على المكتب والجهة المختصة.';
        else { r.incomplete = true; r.notice = 'لا يكتمل ملف التصديق قبل صدور نتيجة «مصادقة» للشهادة؛ ' + (st === 'resident' ? 'الإقامة وحدها لا تكفي.' : 'عقد العمل والتأشيرة وحدهما لا يكفيان.'); }
        r.docs.push(country === 'jordan' ? 'أصل الشهادة الجامعية مختومًا من وزارة التعليم العالي ووزارة الخارجية الأردنية' : country === 'saudi' ? 'أصل الشهادة الجامعية الصادرة من السعودية' : 'أصل الشهادة الجامعية مختومًا من وزارة خارجية بلد الإصدار');
        const what = val('uniWhat'), n = String(val('uniCopies') || '').replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x660);
        if (what === 'copies' || what === 'both') r.docs.push(`نسخ مصدقة من الشهادة${/^\d+$/.test(n) && +n > 0 ? `: ${n}` : ' (العدد حسب حاجتك)'}`);
        r.docs.push(st === 'resident' ? 'صورة عن الإقامة السعودية' : 'صورة عن عقد العمل، وصورة التأشيرة إن صدرت');
        r.docs.push(val('uniMusadaqa') === 'have' ? 'إشعار بنتيجة طلب توثيق الشهادة (المصادقة) من منصة «مصادقة» السعودية' : 'طلب مصادقة الشهادة الجامعية عبر منصة «مصادقة»: يقدّمه المكتب عنك');
        r.chain = country === 'jordan' ? ['الجامعة', 'وزارة التعليم العالي', 'وزارة الخارجية الأردنية', 'تصديق السفارة السعودية عبر المكتب']
          : country === 'saudi' ? ['الجهات السعودية المختصة — يحددها المكتب بعد مراجعة الشهادة']
          : otherCountryChain('الشهادة الجامعية');
        // review 2026-10-27: copies are not a step AFTER the embassy — they go through the same stamps as the original
        if (what === 'copies' || what === 'both') r.docs.push('النسخ المصدقة تمر بالأختام نفسها التي يمر بها الأصل، قبل تصديق السفارة');
        r.next = [val('uniMusadaqa') === 'have' ? 'أحضر «إشعار بنتيجة طلب توثيق الشهادة (المصادقة)» مع الشهادة.' : 'أرسل للمكتب بيانات الشهادة ليقدّم طلب المصادقة عبر منصة «مصادقة».', officeNext];
      }
    }

    if (type === 'school') {
      r.docs = [country === 'jordan' ? 'أصل الشهادة المدرسية مختومًا من الجهة التعليمية المختصة ووزارة الخارجية الأردنية' : country === 'saudi' ? 'أصل الشهادة المدرسية الصادرة من السعودية' : 'أصل الشهادة المدرسية مختومًا من وزارة خارجية بلد الإصدار'];
      r.chain = country === 'jordan' ? ['الجهة التعليمية المختصة', 'وزارة الخارجية الأردنية', 'تصديق السفارة السعودية عبر المكتب'] : country === 'saudi' ? ['الجهات السعودية المختصة — يحددها المكتب'] : otherCountryChain('الشهادة المدرسية');
      r.next = [officeNext];
    }

    if (type === 'civil') {
      const kind = txt('civilKind') || 'الوثيقة';
      r.title = kind;
      if (country === 'jordan') {
        r.docs = [`صورة طبق الأصل عن ${kind} مختومة من وزارة الخارجية الأردنية (مثل النسخة الرسمية الصادرة عبر «سند»)`];
        r.chain = ['وزارة الخارجية الأردنية', 'تصديق السفارة السعودية عبر المكتب'];
        r.notice = 'للوثائق المدنية الأردنية تكفي الصورة طبق الأصل المختومة من الخارجية الأردنية، ولا يلزم الأصل.';
      } else if (country === 'saudi') {
        r.docs = [`أصل ${kind} بالختم الفعلي لوزارة الخارجية السعودية`];
        r.chain = ['وزارة الخارجية السعودية (الختم الفعلي على الأصل)', 'القنصلية السعودية في الأردن: يقدّمها المكتب', 'التصديقات الأردنية اللاحقة حسب نوع الوثيقة: يستكملها العميل'];
        r.notice = 'للوثائق المدنية الصادرة من السعودية يلزم الأصل، ولا تُقبل الصورة بدلًا منه.';
      } else {
        r.docs = [`أصل ${kind}`]; r.chain = otherCountryChain(kind);
      }
      r.next = [officeNext];
    }

    if (type === 'medical') {
      r.docs = ['أصل التقرير الطبي أو الإجازة المرضية'];
      r.chain = country === 'jordan' ? ['الطبيب أو المستشفى المصدر', 'نقابة الأطباء عند انطباقها', 'وزارة الصحة الأردنية', 'وزارة الخارجية الأردنية', 'تصديق السفارة السعودية عبر المكتب'] : country === 'saudi' ? ['الجهات السعودية المختصة — يحددها المكتب'] : otherCountryChain('التقرير الطبي');
      r.notice = 'يجب ألا يذكر التقرير الطبي أي نوع دواء.';
      r.next = [officeNext];
    }

    if (type === 'agency') {
      const kind = val('agencyKind');
      if (kind === 'general' && val('agencyInheritance') === 'no') {
        r.stop = true;
        r.conditions = ['حسب سياسة المكتب، الوكالة العامة لحالات الإرث المرتبطة بالوفاة أو التركة فقط.'];
        r.notice = 'لغير الإرث يجب أن تكون الوكالة خاصة بالسعودية، ويُكتب فيها الغرض بالتفصيل. أعد إصدارها وكالة خاصة ثم عد إلى هذه الصفحة.';
      } else {
        r.title = kind === 'general' ? 'وكالة عامة (إرث أو تركة)' : 'وكالة خاصة بالسعودية';
        r.conditions = [kind === 'general' ? 'الوكالة العامة مقبولة لحالات الإرث المرتبطة بالوفاة أو التركة.' : 'الوكالة خاصة بالسعودية، والغرض منها مكتوب بالتفصيل.'];
        if (country === 'saudi') {
          const e = val('agencyESaudi');
          r.docs = [e === 'yes' ? 'نسخة عن الوكالة المصدقة إلكترونيًا من وزارة الخارجية السعودية' : 'أصل الوكالة بالختم السعودي الفعلي'];
          r.chain = e === 'yes' ? ['التصديق الإلكتروني من وزارة الخارجية السعودية (موجود)', 'يتابع المكتب بقية الإجراء'] : ['الختم الفعلي لوزارة الخارجية السعودية على الأصل', 'يتابع المكتب بقية الإجراء'];
          r.notice = 'قبول النسخة خاص بالوكالة السعودية المصدقة إلكترونيًا، ولا ينطبق على بقية الوثائق السعودية.';
        } else if (country === 'jordan') {
          r.docs = ['أصل الوكالة'];
          r.chain = ['المحكمة أو كاتب العدل حسب الجهة التي نظّمت الوكالة', 'وزارة الخارجية الأردنية', 'تصديق السفارة السعودية عبر المكتب'];
        } else {
          r.docs = ['أصل الوكالة']; r.chain = otherCountryChain('الوكالة');
        }
        r.next = [officeNext];
      }
    }

    if (type === 'commercial') {
      r.purpose = txt('companyPurpose');
      r.docs = ['عقد تأسيس الشركة', 'السجل التجاري', 'الميزانية المودعة لأحدث سنة، مع ختم وزارة الخارجية الأردنية ظاهرًا على صفحة المركز المالي'];
      if (val('companyResident') === 'yes') r.docs.push('صورة عن إقامة صاحب الشركة في السعودية');
      else r.docs.push('وكالة لشخص مقيم في السعودية', 'الوثائق المالية التي يحددها المكتب للمعاملة');
      r.chain = country === 'jordan' ? ['دائرة مراقبة الشركات', 'وزارة الخارجية الأردنية', 'تصديق السفارة السعودية عبر المكتب'] : ['يحدد المكتب المسار: هذا المسار مخصص لشركة قائمة في الأردن'];
      r.next = ['أرسل للمكتب صور الوثائق أولًا ليؤكد المطلوب قبل التصديق.', officeNext];
    }

    if (type === 'other') {
      r.docs = ['الوثيقة كما صدرت؛ يحدد المكتب إن كان المطلوب الأصل أو نسخة رسمية'];
      r.chain = country === 'jordan' ? ['الجهة الأردنية المصدرة', 'وزارة الخارجية الأردنية', 'تصديق السفارة السعودية عبر المكتب'] : country === 'saudi' ? ['يحدده المكتب بعد مراجعة الوثيقة'] : otherCountryChain('الوثيقة');
      r.next = ['أرسل صورة واضحة للمكتب ليؤكد المسار قبل التسليم.'];
    }
    // owner 2026-10-27: EVERY document issued in Saudi Arabia — the original, already stamped by the Saudi Ministry of Foreign
    // Affairs; the office completes the attestation at the Saudi Embassy in Amman; then the Jordanian stamps for THIS document type.
    // Kept: the project's own exception for a Saudi power of attorney attested electronically (a copy is accepted).
    if (country === 'saudi' && !r.stop) {
      const NAME = { experience: 'شهادة الخبرة', university: 'الشهادة الجامعية', school: 'الشهادة المدرسية', civil: r.title, medical: 'التقرير الطبي أو الإجازة المرضية', agency: 'الوكالة', commercial: 'السجل التجاري ووثائق الشركة', other: 'الوثيقة' };
      const FOLLOW = { agency: ['كاتب العدل ووزارة الخارجية الأردنية، حسب الحالة'], school: ['وزارة التربية والتعليم، وجهات أخرى حسب الحالة'] };
      const jordan = FOLLOW[type] || ['الأختام الأردنية المطلوبة لهذا النوع من الوثائق؛ يحددها المكتب'];
      const eCopy = type === 'agency' && val('agencyESaudi') === 'yes';
      const doc = eCopy ? 'نسخة عن الوكالة المصدقة إلكترونيًا من وزارة الخارجية السعودية' : 'أصل ' + NAME[type] + ' الصادر من السعودية، مختومًا مسبقًا من وزارة الخارجية السعودية';
      if (type === 'commercial') r.docs = [doc]; else r.docs[0] = doc;
      r.chain = [eCopy ? 'التصديق الإلكتروني من وزارة الخارجية السعودية (موجود)' : 'وزارة الخارجية السعودية: ختم الأصل قبل التسليم', 'تصديق السفارة السعودية في عمّان: يستكمله المكتب'].concat(jordan);
      // a university degree keeps its own Musadaqa + Saudi-link status in front of the Saudi-document rule
      r.notice = (type === 'university' && r.notice ? r.notice + ' ' : '') + (eCopy ? 'قبول النسخة خاص بالوكالة السعودية المصدقة إلكترونيًا، ولا ينطبق على بقية الوثائق السعودية. ' : '') + 'هذه القاعدة للوثائق الصادرة من السعودية فقط؛ لا تنطبق على وثائق الدول الأخرى.';
      r.next = (type === 'university' && r.incomplete ? [r.next[0]] : []).concat(['سلّم الأصل المختوم من الخارجية السعودية للمكتب ليستكمل تصديق السفارة السعودية في عمّان.']);
    }
    return r;
  }

  const ICO = { doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>', stamp: '<path d="M9 3h6l-1 7h-4z"/><path d="M5 14h14v4H5z"/><path d="M4 21h16"/>' };
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${p}</svg>`;
  let last = null;
  function render() {
    const r = build(); last = r;
    const box = $('attestationResult');
    $('attestationResultTitle').textContent = r.title + (r.country ? ` — صادرة من ${r.country}` : '');
    const parts = [];
    if (r.purpose) parts.push(`<section class="at-block"><h3>الغرض</h3><p>${esc(r.purpose)}</p></section>`);
    if (r.conditions.length) parts.push(`<section class="at-block"><h3>${r.stop ? 'شرط هذا المسار' : 'الأهلية'}</h3>${r.conditions.map((c) => `<p>${esc(c)}</p>`).join('')}</section>`);
    if (!r.stop) {
      parts.push(`<section class="at-block"><h3>${svg(ICO.doc)}الوثائق المطلوبة</h3><ul class="at-docs">${r.docs.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></section>`);
      parts.push(`<section class="at-block"><h3>${svg(ICO.stamp)}التصديقات بالترتيب</h3><ol class="at-chain">${r.chain.map((c) => `<li><span>${esc(c)}</span></li>`).join('')}</ol></section>`);
      if (r.next.length) parts.push(`<section class="at-block"><h3>الخطوة التالية</h3>${r.next.map((n) => `<p>${esc(n)}</p>`).join('')}</section>`);
    }
    if (r.notice) parts.push(`<p class="sd-notice ${r.stop ? '' : 'info'}">${svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>')}<span>${esc(r.notice)}</span></p>`);
    $('attestationResultList').innerHTML = parts.join('');
    if (window.SD_CERT) [].forEach.call($('attestationResultList').querySelectorAll('.at-docs li'), (li) => { if (/المصادقة|مصادقة/.test(li.textContent)) li.appendChild(window.SD_CERT.button('musadaqa')); });
    $('attestationResultSummary').textContent = r.stop ? 'هذه الحالة لا تستوفي شروط المسار حاليًا وفق سياسة المكتب.' : r.incomplete ? 'ينقص عنصر مطلوب قبل تصديق السفارة؛ التفاصيل أدناه.' : 'نتيجة إرشادية مبنية على إجاباتك. يراجع المكتب الوثيقة قبل التسليم.';
    const msg = `مرحبًا، أريد تصديق وثيقة: ${r.title}، صادرة من ${r.country}${r.purpose ? '، الغرض: ' + r.purpose : ''}. أرجو تأكيد المطلوب.`;
    $('attestationWhatsapp').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    $('attestationWhatsapp').setAttribute('data-keep-msg', '');
    $('attestationPrintTitle').textContent = 'مسار تصديق: ' + $('attestationResultTitle').textContent;
    $('attestationPrintContent').innerHTML = $('attestationResultList').innerHTML;
    box.hidden = false;
    box.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  function asText(r) {
    return ['مكتب تأشيرات السعودية في الأردن — مسار تصديق', `${r.title}${r.country ? ' — صادرة من ' + r.country : ''}`, r.purpose ? 'الغرض: ' + r.purpose : '', ...r.conditions,
      ...(r.stop ? [] : ['', 'الوثائق المطلوبة:', ...r.docs.map((d) => '- ' + d), '', 'التصديقات بالترتيب:', ...r.chain.map((c, i) => `${i + 1}. ${c}`), '', ...r.next]), r.notice, '', 'saudia-visa.com'].filter((x) => x !== undefined).join('\n');
  }

  form.addEventListener('change', sync);
  form.addEventListener('submit', (e) => {
    e.preventDefault(); sync();
    const bad = [...form.querySelectorAll('select[required],input[required]')].find((f) => !f.closest('[hidden]') && !String(f.value).trim());
    if (bad) { bad.focus(); bad.setAttribute('aria-invalid', 'true'); const lab = form.querySelector(`label[for="${bad.id}"]`); $('attestationContextHint').textContent = 'أجب عن هذا السؤال أولًا: ' + (lab ? lab.textContent : ''); return; }
    form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
    render();
  });
  $('printAttestationResult').addEventListener('click', () => { if (!last) return; if (window.SD_print) window.SD_print($('attestationResult'), 'مسار تصديق: ' + last.title, last.country ? 'بلد الإصدار: ' + last.country : ''); else window.print(); });
  sync();
})();
