(() => {
  'use strict';

  const form = document.getElementById('readinessForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const tr = (ar, en) => window.SV_TRANSLATE?.t(ar, en) || ar;
  const isEnglish = () => window.SV_TRANSLATE?.isEnglish?.() === true;
  const whatsappNumber = '962789881009';
  let lastReview = null;
  let currentStep = 1;
  let professionRules = null;
  let professionRulesPromise = null;

  const fields = {
    nationality: $('readinessNationality'),
    residency: $('readinessResidency'),
    dual: $('readinessDual'),
    passportName: $('readinessPassportName'),
    eligibility: $('readinessEligibility'),
    professionType: $('readinessProfessionType'),
    professionName: $('readinessProfessionName'),
    experienceTitle: $('readinessExperienceTitle'),
    gender: $('readinessGender'),
    femaleDocuments: $('readinessFemaleDocuments'),
    qualificationLevel: $('readinessQualificationLevel'),
    qualification: $('readinessQualification'),
    experience: $('readinessExperience'),
    experienceYears: $('readinessExperienceYears'),
    accreditation: $('readinessAccreditation'),
    contract: $('readinessContract'),
    qualificationSource: $('readinessQualificationSource'),
    graduationYears: $('readinessGraduationYears'),
    saudiBorn: $('readinessSaudiBorn'),
    attestation: $('readinessAttestation'),
    wafid: $('readinessWafid'),
    consistency: $('readinessConsistency'),
    conduct: $('readinessConduct')
  };

  const panels = {
    residency: $('readinessResidencyField'),
    conduct: $('readinessConductField'),
    accreditation: $('readinessAccreditationField'),
    femaleDocuments: $('readinessFemaleDocumentsField'),
    professionHint: $('readinessProfessionHint'),
    professionMatchHint: $('readinessProfessionMatchHint'),
    professionSpecificHint: $('readinessProfessionSpecificHint'),
    conductHint: $('readinessConductHint'),
    engineering: $('readinessEngineeringField'),
    graduationYears: $('readinessGraduationYearsField'),
    saudiBorn: $('readinessSaudiBornField')
  };

  const result = {
    panel: $('readinessResult'),
    title: $('readinessResultTitle'),
    summary: $('readinessResultSummary'),
    list: $('readinessResultList'),
    professionMatch: $('readinessProfessionMatch'),
    professionMatchTitle: $('readinessProfessionMatchTitle'),
    professionMatchSummary: $('readinessProfessionMatchSummary'),
    alternatives: $('readinessAlternativePanel'),
    alternativeTitle: $('readinessAlternativeTitle'),
    alternativeIntro: $('readinessAlternativeIntro'),
    alternativeList: $('readinessAlternativeList'),
    next: $('readinessNextSteps'),
    whatsapp: $('readinessWhatsapp'),
    contactWhatsapp: $('readinessContactWhatsapp'),
    copy: $('copyReadinessResult'),
    print: $('printReadinessResult'),
    copyStatus: $('readinessCopyStatus'),
    printSheet: $('readinessPrintSheet'),
    printTitle: $('readinessPrintTitle'),
    printSubtitle: $('readinessPrintSubtitle'),
    printContent: $('readinessPrintContent')
  };

  const stepStatus = {
    1: ['المرحلة 1 من 4: اختر الحالة', 'Stage 1 of 4: choose your status'],
    2: ['المرحلة 2 من 4: حدّد المهنة والمسمى', 'Stage 2 of 4: identify the profession and title'],
    3: ['المرحلة 3 من 4: راجع المؤهل والخبرة', 'Stage 3 of 4: review qualification and experience'],
    4: ['المرحلة 4 من 4: راجع الملف النهائي', 'Stage 4 of 4: review the final file']
  };

  const routeLabels = {
    jordan: ['أردني وأجهز الملف من الأردن', 'Jordanian applicant preparing the file from Jordan'],
    'foreign-resident': ['غير أردني ولدي إقامة أردنية سارية', 'Non-Jordanian resident with a valid Jordanian residence'],
    'foreign-no-residency': ['غير أردني ولا أملك إقامة أردنية سارية', 'Non-Jordanian without a valid Jordanian residence'],
    'syrian-resident': ['سوري مقيم في الأردن بإقامة سارية', 'Syrian resident in Jordan with a valid residence'],
    'syrian-nonresident': ['سوري غير مقيم في الأردن حاليًا', 'Syrian applicant currently not resident in Jordan'],
    unsure: ['لست متأكدًا من الحالة المناسبة', 'I am not sure which status applies']
  };

  const professionLabels = {
    ordinary: ['مهنة عادية أو إدارية', 'Ordinary or administrative profession'],
    experience: ['مهنة تشترط خبرة محددة', 'Profession with a specific experience requirement'],
    accreditation: ['مهنة تحتاج اعتمادًا مهنيًا أو فحصًا مهنيًا', 'Profession requiring professional verification or testing'],
    engineer: ['مهندس أو مهنة هندسية', 'Engineer or engineering profession'],
    doctor: ['طبيب أو مهنة طبية', 'Doctor or medical profession'],
    hairdresser: ['مصفف شعر أو مصففة شعر', 'Hairdresser'],
    unknown: ['لا أعرف فئة المهنة بعد', 'I do not know the profession category yet']
  };

  const statusLabels = {
    ready: ['جاهز', 'Ready'],
    missing: ['يحتاج استكمالًا', 'Needs completion'],
    review: ['يحتاج مراجعة', 'Needs review']
  };

  const educationLabels = {
    none: ['لا توجد ثانوية مكتملة', 'No completed secondary certificate'],
    grade10: ['الصف العاشر', 'Grade 10'],
    school: ['شهادة مدرسية', 'School certificate'],
    secondary: ['ثانوية عامة', 'Secondary school'],
    diploma: ['دبلوم متوسط أو مهني', 'Intermediate or vocational diploma'],
    'diploma-full': ['دبلوم شامل', 'Comprehensive diploma'],
    university: ['شهادة جامعية', 'University degree'],
    postgraduate: ['دراسات عليا', 'Postgraduate degree'],
    unknown: ['غير محدد', 'Not identified']
  };

  const sourceLabels = {
    jordan: ['الأردن', 'Jordan'],
    saudi: ['السعودية', 'Saudi Arabia'],
    other: ['دولة أخرى', 'another country']
  };

  const statusClass = { ready: 'is-success', missing: 'is-danger', review: 'is-warning' };
  const shownForResidency = new Set(['foreign-resident', 'syrian-resident']);
  const shownForConduct = new Set(['jordan', 'foreign-resident', 'syrian-resident', 'syrian-nonresident']);
  const shownForAccreditation = new Set(['accreditation', 'engineer', 'doctor']);
  const educationRank = { none: 0, grade10: 1, school: 2, secondary: 2, diploma: 3, 'diploma-full': 3, university: 4, postgraduate: 5, unknown: -1 };

  // owner 2026-10-27: numbers are read in Western digits; Arabic-Indic / Persian digits and the Arabic decimal sign are accepted
  function toNumber(value) {
    const s = String(value || '').trim().replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6F0)).replace(/[٫,]/g, '.');
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  // «سنتين» «ثلاث سنوات» «3 سنوات» «سنة» → a number (null when the text gives none)
  function yearsFromText(s) {
    const t = String(s || '').replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));
    const d = t.match(/(\d+)\s*(?:سنوات|سنة|سنين|عام|أعوام)/); if (d) return Number(d[1]);
    if (/سنتين|سنتان|عامين|عامان/.test(t)) return 2;
    const W = [[/ثلاث/, 3], [/أربع|اربع/, 4], [/خمس/, 5], [/ست(?:ة)?\s/, 6], [/سبع/, 7], [/ثمان/, 8], [/تسع/, 9], [/عشر/, 10]];
    for (const [re, n] of W) if (re.test(t)) return n;
    if (/سنة واحدة|سنة|عام/.test(t)) return 1;
    return null;
  }
  const yearsAr = (n) => (n === 1 ? 'سنة واحدة مكتملة على الأقل' : n === 2 ? 'سنتان مكتملتان على الأقل' : n + ' سنوات مكتملة على الأقل');

  function setRequired(node, required) {
    if (node) node.required = Boolean(required);
  }

  function show(node, visible) {
    if (!node) return;
    node.hidden = !visible;
  }

  function normalizeTitle(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[ـ]/g, '')
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.replace(/^ال/, ''))
      .join(' ');
  }

  function titlesMatch(first, second) {
    const a = normalizeTitle(first);
    const b = normalizeTitle(second);
    return Boolean(a && b && a === b);
  }

  function educationLabel(value) {
    const pair = educationLabels[value] || educationLabels.unknown;
    return tr(pair[0], pair[1]);
  }
  // the level a PROFESSION requires (owner 2026-10-28): a pass is stated where the office asks for it
  const requiredEducationLabels = { grade10: ['الصف العاشر ناجح على الأقل', 'Grade 10 passed at least'], secondary: ['ثانوية عامة ناجح', 'General secondary (pass)'] };
  function requiredEducationLabel(value) {
    const pair = requiredEducationLabels[value];
    return pair ? tr(pair[0], pair[1]) : educationLabel(value);
  }

  function sourceLabel(value) {
    const pair = sourceLabels[value] || ['', ''];
    return tr(pair[0], pair[1]);
  }

  function routeLabel(value) {
    const pair = routeLabels[value] || ['', ''];
    return tr(pair[0], pair[1]);
  }

  function professionLabel(value) {
    const pair = professionLabels[value] || ['', ''];
    return tr(pair[0], pair[1]);
  }

  function displayProfessionValue(value, profile) {
    const raw = String(value || '').trim();
    if (!isEnglish()) return raw;
    if (!raw || !/[\u0600-\u06FF]/.test(raw)) return raw;
    if (profile?.name_en && String(profile.name_en).trim()) return String(profile.name_en).trim();
    return 'the selected profession';
  }

  function displayUserValue(value, fallback) {
    const raw = String(value || '').trim();
    return isEnglish() && /[\u0600-\u06FF]/.test(raw) ? fallback : raw;
  }

  function statusFor(value) {
    if (value === 'ready' || value === 'not-required') return 'ready';
    if (value === 'missing') return 'missing';
    return 'review';
  }

  function addItem(items, key, labelAr, labelEn, messageAr, messageEn, status, href, hrefLabelAr, hrefLabelEn) {
    items.push({
      key,
      label: tr(labelAr, labelEn),
      message: tr(messageAr, messageEn),
      status,
      href,
      hrefLabel: tr(hrefLabelAr || 'فتح الصفحة المرتبطة ←', hrefLabelEn || 'Open related page ←')
    });
  }

  /* owner 2026-10-27: ONE data source. The profession and its requirements come from /professions.json through the same
   * computeRequirements() as «المهن والأوراق» and «مسار أوراقي» (the old readiness-profession-rules.json copy is no longer
   * read). The profile below is read from the profession's own documents, never guessed from its name. */
  let professionList = null;
  let pickedRecord = null; // the record chosen in the search list (or resolved from the typed title)
  function profileFromRecord(rec) {
    if (!rec) return null;
    let reqs = [];
    try { reqs = (window.computeRequirements ? window.computeRequirements(rec).requirements : rec.requirements) || []; } catch (e) { reqs = rec.requirements || []; }
    const all = reqs.join('\n');
    const prof = typeof window.professionProfile === 'function' ? window.professionProfile(rec) : {};
    const education = /الشهادة الجامعية|شهادة جامعية/.test(all) ? 'university' : /الثانوية العامة|التوجيهي|الثانوية/.test(all) ? 'secondary' : /الصف العاشر/.test(all) ? 'grade10' : /الشهادة المدرسية|شهادة مدرسية/.test(all) ? 'school' : 'unknown';
    const expLine = reqs.find((t) => /^خبرة|خبرة لا تقل|خبرة لمدة|^الخبرة/.test(t)) || '';
    const experienceYears = !expLine ? 0 : yearsFromText(expLine);
    return {
      name_ar: rec.name_ar, name_en: rec.name_en || '', code: rec.code, category: rec.category || '', gender: rec.gender || 'ذكر',
      education, experience_years: experienceYears, hasExperience: Boolean(expLine),
      musadaqa: /مصادقة/.test(all), // the degree's Musadaqa is in THIS profession's requirements
      qvp: /\(QVP\)/.test(all), svp: /\(SVP\)/.test(all), professional: /\(QVP\)|\(SVP\)/.test(all),
      engineer: Boolean(prof.engineering) || (rec.isEstimate && /المهندسون/.test(rec.estimateLabel || '')),
      doctor: Boolean(prof.doctor), female_documents: /عدم ممانعة|عقد الزواج/.test(all) || rec.gender === 'أنثى',
      isEstimate: Boolean(rec.isEstimate), estimateLabel: rec.estimateLabel || '', officialCode: rec.officialCode || '', note: rec.note || '', record: rec,
    };
  }
  async function ensureProfessionRules() {
    if (Array.isArray(professionList)) return professionList;
    if (!professionRulesPromise) {
      professionRulesPromise = fetch('/professions.json').then((r) => r.json()).then((d) => { professionList = Array.isArray(d) ? d : []; professionRules = professionList; return professionList; })
        .catch(() => { professionList = []; professionRules = []; return professionList; });
    }
    return professionRulesPromise;
  }

  function findProfessionProfile(name) {
    const typed = String(name || '').trim();
    if (!typed) return null;
    if (pickedRecord && (pickedRecord.name_ar === typed || String(pickedRecord.code) === typed)) return profileFromRecord(pickedRecord);
    if (Array.isArray(professionList) && professionList.length && typeof window.SD_resolveTitle === 'function') {
      const r = window.SD_resolveTitle(professionList, typed);
      if (r && r.record && (r.kind === 'exact' || r.kind === 'synonym' || r.kind === 'estimate')) return profileFromRecord(r.record);
      const hit = window.SD_searchProfessions(professionList, typed, 1)[0];
      if (hit && normalizeTitle(hit.name_ar) === normalizeTitle(typed)) return profileFromRecord(hit);
    }
    return null; // not recognised: no guessed profile (the visitor picks the closest category instead)
  }

  function currentProfile() {
    return findProfessionProfile(fields.professionName?.value || '');
  }

  function isEngineer(profile) {
    return fields.professionType.value === 'engineer' || Boolean(profile?.engineer);
  }

  function needsExperienceEvidence(profile) {
    // review 2026-10-27: a profession whose data asks for experience asks for the years too, even when the number is written in words
    if (profile) return Boolean(profile.hasExperience) || (Number.isFinite(profile.experience_years) && profile.experience_years > 0);
    return ['experience', 'engineer', 'doctor'].includes(fields.professionType.value);
  }

  function profileRequiredEducation(profile) {
    if (profile?.education && profile.education !== 'unknown') return profile.education;
    if (['engineer', 'doctor'].includes(fields.professionType.value)) return 'university';
    return null;
  }

  function updateVisibility() {
    const route = fields.nationality.value;
    const professionType = fields.professionType.value;
    const profile = currentProfile();
    const residenceVisible = shownForResidency.has(route);
    const conductVisible = shownForConduct.has(route);
    const accreditationVisible = Boolean(profile?.professional) || shownForAccreditation.has(professionType);
    const engineeringVisible = isEngineer(profile);
    const femaleVisible = fields.gender.value === 'female' && (Boolean(profile?.female_documents) || professionType === 'hairdresser');

    show(panels.residency, residenceVisible);
    // owner 2026-10-27: a Jordanian who also holds a foreign passport stays on the Jordanian route; the full name must match
    const dualVisible = route === 'jordan', nameVisible = dualVisible && fields.dual && fields.dual.value === 'yes';
    show($('readinessDualField'), dualVisible); show($('readinessPassportNameField'), nameVisible); setRequired(fields.passportName, nameVisible);
    show(panels.conduct, conductVisible);
    show(panels.accreditation, accreditationVisible);
    show(panels.engineering, engineeringVisible);
    show(panels.graduationYears, engineeringVisible);
    const gy = toNumber(fields.graduationYears.value);
    show(panels.saudiBorn, engineeringVisible && gy !== null && gy <= 5);
    show(panels.femaleDocuments, femaleVisible);
    setRequired(fields.residency, residenceVisible);
    setRequired(fields.conduct, conductVisible);
    setRequired(fields.accreditation, accreditationVisible);
    setRequired(fields.graduationYears, engineeringVisible);
    setRequired(fields.saudiBorn, false);
    setRequired(fields.femaleDocuments, femaleVisible);
    // owner 2026-10-27: the category question appears only when the typed profession was not recognised
    const typeField = $('readinessProfessionTypeField');
    const unknownProfession = !profile && Boolean(fields.professionName.value.trim()) && Array.isArray(professionList);
    show(typeField, unknownProfession);
    setRequired(fields.professionType, unknownProfession);
    // the years of experience are asked when the profession asks for experience
    const yearsNeeded = needsExperienceEvidence(profile);
    show($('readinessExperienceYearsField'), yearsNeeded);
    setRequired(fields.experienceYears, yearsNeeded);
    // owner 2026-10-27: the conduct document is named by the case — «حسن السيرة والسلوك» for a Jordanian and for a
    // non-Jordanian (or Syrian) RESIDENT in Jordan; «لا حكم عليه» only for a Syrian who is not resident
    const conductLabel = $('readinessConductLabel');
    if (conductLabel) conductLabel.textContent = route === 'syrian-nonresident' ? tr('لا حكم عليه (عدم محكومية) من سوريا', 'Syrian no-criminal-record certificate') : tr('حسن السيرة والسلوك', 'Good-conduct certificate');
    // QVP and SVP are different procedures: the label says which one this profession has
    // owner 2026-10-27: «شاهد نموذج الشهادة» beside the question; the visitor's choice fills the answer (not a verification)
    const accField = $('readinessAccreditationField'), certKind = profile?.svp ? 'svp' : profile?.qvp ? 'qvp' : null;
    if (accField && window.SD_CERT) {
      const old = accField.querySelector('.sdc-trigger, .sdc-note'); if (old && old.dataset.kind !== certKind) old.remove();
      if (certKind && !accField.querySelector('.sdc-trigger, .sdc-note')) {
        const fit = window.SD_CERT.fits(certKind, profile.education === 'university' ? true : profile.education === 'unknown' ? undefined : false);
        const el = fit ? window.SD_CERT.button(certKind, { profession: profile.name_ar, onChoice: (c) => { fields.accreditation.value = c === 'have' ? 'ready' : c === 'no' ? 'missing' : 'review'; fields.accreditation.dispatchEvent(new Event('change', { bubbles: true })); } }) : window.SD_CERT.note(certKind);
        el.dataset.kind = certKind; accField.appendChild(el);
      }
    }
    const accLabel = $('readinessAccreditationLabel'), accHint = $('readinessAccreditationHint');
    if (accLabel) {
      accLabel.textContent = profile?.qvp ? tr('التحقق المهني (QVP)', 'Professional verification (QVP)') : profile?.svp ? tr('الفحص المهني (SVP)', 'Professional examination (SVP)') : tr('التحقق المهني (QVP) أو الفحص المهني (SVP)', 'Professional verification (QVP) or examination (SVP)');
      if (accHint) accHint.textContent = profile?.qvp ? tr('للمهن التي تتطلب دبلومًا شاملًا فما فوق: يُتحقق من المؤهل والخبرة (سنتان للبكالوريوس، وأربع سنوات للدبلوم الشامل).', 'Comprehensive diploma and above: qualification and experience are verified (2 years for a bachelor, 4 for a comprehensive diploma).') : profile?.svp ? tr('حجز موعد الفحص ثم أداؤه واجتيازه. حجز الموعد لا يعني اكتمال الفحص.', 'Book, sit and pass the examination. A booking alone is not a completed examination.') : '';
    }

    if (route === 'syrian-nonresident') {
      panels.conductHint.textContent = tr(
        'للسوري غير المقيم: لا حكم عليه صادر من سوريا، مصدق من الخارجية السورية، ثم السفارة الأردنية في سوريا، ثم الخارجية الأردنية في عمّان. لا نضيف بطاقة إقامة أردنية في هذا الخيار.',
        'For a Syrian applicant who is not resident in Jordan: a Syrian no-criminal-record certificate, attested by the Syrian Foreign Ministry, then the Jordanian Embassy in Syria, then the Jordanian Foreign Ministry in Amman. A Jordanian residence card is not added in this option.'
      );
    } else if (route === 'foreign-resident' || route === 'syrian-resident') {
      panels.conductHint.textContent = tr(
        'لغير الأردني المقيم في الأردن: حسن السيرة والسلوك من المخابرات الأردنية بالحضور الشخصي، مع إبراز إقامة أردنية سارية. للسوري المقيم، يبقى هذا هو الاختيار المقيم مع حذف مشروحات الجيش.',
        'For a non-Jordanian resident in Jordan: obtain the Jordanian good-conduct document through personal attendance and show a valid Jordanian residence card. For a Syrian resident, this is the resident option without Jordanian military-status explanations.'
      );
    } else if (route === 'jordan') {
      panels.conductHint.textContent = tr(
        'راجع ورقة السلوك أو المستند المقابل كما تظهر في قائمة أوراق المهنة الأردنية الأصلية، ولا تعتمد هذه الأداة بدل القائمة التفصيلية.',
        'Review the conduct document or corresponding item shown in the original Jordanian profession-document list. This tool does not replace the detailed list.'
      );
    } else if (route === 'foreign-no-residency') {
      panels.conductHint.textContent = tr(
        'بحسب الفحص الأولي، يحتاج غير الأردني الذي يجهز من الأردن إلى إقامة أردنية سارية. راجع الأهلية والمكتب قبل اختيار جهة التقديم.',
        'In this initial check, a non-Jordanian preparing the file from Jordan needs a valid Jordanian residence. Review eligibility and contact the office before choosing the place of application.'
      );
    } else {
      panels.conductHint.textContent = tr(
        'اختر الجنسية وحالة الإقامة أولًا لتظهر صيغة ورقة السلوك أو عدم المحكومية الأقرب إلى حالتك.',
        'Choose the nationality and residence status first to display the conduct or no-criminal-record guidance closest to your case.'
      );
    }

    if (profile) {
      const education = profileRequiredEducation(profile);
      const experience = Number.isFinite(profile.experience_years) ? profile.experience_years : null;
      const educationText = education ? requiredEducationLabel(education) : tr('يجب تأكيده من سجل المهنة', 'must be confirmed from the profession record');
      const experienceText = experience === null ? tr('يجب تأكيدها من سجل المهنة', 'must be confirmed from the profession record') : experience === 0 ? tr('لا يظهر شرط خبرة في السجل المختصر', 'no experience requirement appears in the compact record') : `${yearsAr(experience)}`;
      const displayName = displayProfessionValue(profile.name_ar, profile);
      panels.professionMatchHint.textContent = profile.isEstimate
        ? tr(`«${profile.name_ar}» غير موجودة في قائمة مهن المكتب${profile.officialCode ? ` (رمزها الرسمي ${profile.officialCode})` : ''}، فاعتمدنا أوراق فئة «${profile.estimateLabel}» تقديريًا: المؤهل ${educationText}، والخبرة ${experienceText}. يؤكدها المكتب قبل التقديم.`,
          `“${displayName}” is not in the office list; we used the “${profile.estimateLabel}” category as an estimate (education: ${educationText}; experience: ${experienceText}). The office confirms it before applying.`)
        : tr(`«${profile.name_ar}»${/^\d{6}$/.test(String(profile.code)) ? ` (${profile.code})` : ''} من قائمة مهن المكتب. الحد الأدنى للمؤهل: ${educationText}، والخبرة: ${experienceText}.`,
          `“${displayName}” is in the office list. Minimum education: ${educationText}; experience: ${experienceText}.`);
      show(panels.professionMatchHint, true);
    } else if (fields.professionName.value.trim() && Array.isArray(professionList)) {
      panels.professionMatchHint.textContent = tr(
        'لم نتعرف على هذا المسمى في قائمة المهن. اختر المهنة من القائمة أثناء الكتابة، أو اختر أقرب فئة لها، ويؤكد المكتب المسمى الصحيح.',
        'This title was not recognised. Pick the profession from the list while typing, or choose the closest category; the office confirms the exact title.'
      );
      show(panels.professionMatchHint, true);
    } else {
      show(panels.professionMatchHint, false);
    }

    if (professionType === 'engineer' || profile?.engineer) {
      panels.professionSpecificHint.textContent = tr(
        'للمهندس: يجب مراجعة المؤهل الأصلي ونسخه، مدة التخرج، الخبرة بنفس المسمى، التسجيل أو الاعتماد المهني، وأي عضوية أو مزاولة تطلبها الجهة المختصة.',
        'For an engineer: review the original qualification and copies, time since graduation, experience under the same title, professional registration or verification, and any membership or practice document requested by the competent authority.'
      );
      show(panels.professionSpecificHint, true);
    } else if (professionType === 'doctor' || profile?.doctor) {
      panels.professionSpecificHint.textContent = tr(
        'للطبيب: راجع المؤهل الأصلي ونسخه، الخبرة المطلوبة، التصنيف أو الترخيص والاعتماد المهني، وأي board أو وثيقة نقابية تطلبها الجهة المختصة.',
        'For a doctor: review the original qualification and copies, required experience, classification or licence and professional verification, together with any board or professional-body document requested by the competent authority.'
      );
      show(panels.professionSpecificHint, true);
    } else if (professionType === 'hairdresser') {
      panels.professionSpecificHint.textContent = tr(
        'مصفف شعر أو مصففة شعر يعرض هنا كفئة أنثوية تلقائيًا. راجع قائمة المهنة والتصديقات، ولا تغيّر بند الحلاق في صفحة المهن.',
        'Hairdresser is treated here as the female track automatically. Review the profession list and attestations; this does not change the separate barber entry on the professions page.'
      );
      show(panels.professionSpecificHint, true);
    } else if (profile?.professional || professionType === 'accreditation') {
      panels.professionSpecificHint.textContent = tr(
        'هذه المهنة يظهر لها اعتماد مهني أو فحص مهني في سجل المهن. اختر حالته بدقة وافتح صفحة المهن لمعرفة الجهة والخطوة المطلوبة.',
        'This profession shows professional verification or testing in the profession record. Select its status carefully and open the professions page for the required authority and step.'
      );
      show(panels.professionSpecificHint, true);
    } else if (professionType === 'unknown') {
      panels.professionSpecificHint.textContent = tr(
        'لا تعتمد اسمًا عامًا. ابحث عن المسمى الأقرب في صفحة المهن والأوراق أو استخدم فحص الأهلية قبل اعتماد القائمة.',
        'Do not rely on a generic title. Search for the closest title on the professions page or use the eligibility check before relying on a document list.'
      );
      show(panels.professionSpecificHint, true);
    } else {
      show(panels.professionSpecificHint, false);
    }
  }

  function selectedValue(node) {
    return node?.value || '';
  }

  function readData() {
    return {
      nationality: selectedValue(fields.nationality),
      residency: selectedValue(fields.residency),
      eligibility: selectedValue(fields.eligibility),
      professionType: selectedValue(fields.professionType),
      professionName: fields.professionName.value.trim().slice(0, 80),
      experienceTitle: fields.experienceTitle.value.trim().slice(0, 80),
      gender: selectedValue(fields.gender),
      femaleDocuments: selectedValue(fields.femaleDocuments),
      qualificationLevel: selectedValue(fields.qualificationLevel),
      qualification: selectedValue(fields.qualification),
      experience: selectedValue(fields.experience),
      // digits («2», «٢») or words («سنتين», «ثلاث سنوات») — owner 2026-10-27
      experienceYears: toNumber(fields.experienceYears.value) ?? yearsFromText(fields.experienceYears.value),
      accreditation: selectedValue(fields.accreditation),
      contract: selectedValue(fields.contract),
      qualificationSource: selectedValue(fields.qualificationSource),
      graduationYears: toNumber(fields.graduationYears.value),
      saudiBorn: selectedValue(fields.saudiBorn),
      attestation: selectedValue(fields.attestation),
      wafid: selectedValue(fields.wafid),
      consistency: selectedValue(fields.consistency),
      conduct: selectedValue(fields.conduct),
      dualPassport: fields.nationality.value === 'jordan' && fields.dual && fields.dual.value === 'yes',
      passportName: selectedValue(fields.passportName)
    };
  }

  function requiredNames(keys) {
    return keys.map((key) => {
      const field = fields[key];
      const lab = field && field.id ? document.querySelector('label[for="' + field.id + '"]') : null; return (lab ? lab.textContent : key).replace(/^\d+\.\s*/, '').replace(/اختياري/, '').trim();
    });
  }

  function conditionalVisible(node) {
    if (!node) return false;
    let current = node;
    while (current && current !== form) {
      if (current.hidden && !current.hasAttribute('data-readiness-step-panel') && !current.classList.contains('sd-step')) return false;
      current = current.parentElement;
    }
    return true;
  }

  function experienceNeedsEvidenceNow() {
    const profile = currentProfile();
    return needsExperienceEvidence(profile);
  }

  function missingForStep(step) {
    const data = readData();
    const missing = [];
    const addIfEmpty = (key) => { if (!selectedValue(fields[key]) && !fields[key]?.value?.trim()) missing.push(key); };
    if (step === 1) {
      addIfEmpty('nationality');
      addIfEmpty('eligibility');
      if (conditionalVisible(fields.residency) && fields.residency.required) addIfEmpty('residency');
      if (fields.passportName && conditionalVisible(fields.passportName) && fields.passportName.required) addIfEmpty('passportName');
      if (conditionalVisible(fields.conduct) && fields.conduct.required) addIfEmpty('conduct');
    }
    if (step === 2) {
      if (fields.professionType.required) addIfEmpty('professionType');
      addIfEmpty('professionName');
      if (conditionalVisible(fields.femaleDocuments) && fields.femaleDocuments.required) addIfEmpty('femaleDocuments');
    }
    if (step === 3) {
      addIfEmpty('qualificationLevel');
      addIfEmpty('qualification');
      addIfEmpty('experience');
      addIfEmpty('qualificationSource');
      if (experienceNeedsEvidenceNow()) {
        if (data.experienceYears === null || !Number.isFinite(data.experienceYears) || data.experienceYears < 0) missing.push('experienceYears');
      }
      if (conditionalVisible(fields.accreditation) && fields.accreditation.required) addIfEmpty('accreditation');
      if (isEngineer(currentProfile())) {
        if (data.graduationYears === null || !Number.isFinite(data.graduationYears) || data.graduationYears < 0) missing.push('graduationYears');
      }
    }
    if (step === 4) {
      addIfEmpty('contract');
      addIfEmpty('attestation');
      addIfEmpty('wafid');
      addIfEmpty('consistency');
    }
    return [...new Set(missing)];
  }

  function requiredMissingAll() {
    return [...new Set([1, 2, 3, 4].flatMap((step) => missingForStep(step)))];
  }

  function showStepError(keys) {
    const node = $('readinessStepError');
    if (!node) return;
    if (!keys.length) {
      node.hidden = true;
      node.textContent = '';
      return;
    }
    node.textContent = tr(
      `أكمل الخانات التالية قبل الانتقال: ${requiredNames(keys).join('، ')}.`,
      `Complete these fields before continuing: ${requiredNames(keys).join(', ')}.`
    );
    node.hidden = false;
  }

  function updateStepUI() {
    document.querySelectorAll('[data-readiness-step], [data-readiness-step-panel]').forEach((node) => {
      const step = Number(node.dataset.readinessStep || node.dataset.readinessStepPanel);
      if (step) node.hidden = step !== currentStep;
    });
    document.querySelectorAll('[data-readiness-step-target]').forEach((button) => {
      const target = Number(button.dataset.readinessStepTarget);
      button.classList.toggle('is-active', target === currentStep);
      button.classList.toggle('is-complete', target < currentStep);
      if (target === currentStep) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    const status = $('readinessStepStatus');
    if (status) {
      const pair = stepStatus[currentStep] || stepStatus[1];
      status.textContent = tr(pair[0], pair[1]);
    }
    const prev = $('readinessPrev');
    const next = $('readinessNext');
    const submit = $('readinessSubmit');
    if (prev) prev.hidden = currentStep === 1;
    if (next) next.hidden = currentStep === 4;
    if (submit) submit.hidden = currentStep !== 4;
  }

  function setStep(step) {
    currentStep = Math.max(1, Math.min(4, Number(step) || 1));
    showStepError([]);
    updateVisibility();
    updateStepUI();
  }

  async function moveNext() {
    showStepError([]);
    if (currentStep === 2) {
      await ensureProfessionRules();
      updateVisibility();
    }
    const missing = missingForStep(currentStep);
    if (missing.length) {
      showStepError(missing);
      const first = fields[missing[0]];
      first?.focus();
      return;
    }
    if (currentStep < 4) {
      setStep(currentStep + 1);
      document.getElementById('readiness-checker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function buildProfessionMatch(data, profile) {
    const match = { status: 'review', profileFound: Boolean(profile), titleStatus: 'review', experienceStatus: 'review', qualificationStatus: 'review', engineeringStatus: null, summaryAr: '', summaryEn: '' };
    if (!profile) {
      match.summaryAr = 'لم يظهر تطابق حرفي في السجل المختصر. هذه ليست موافقة؛ يجب فتح صفحة المهن أو مراجعة الموظف المسؤول لتأكيد المسمى والمؤهل والخبرة.';
      match.summaryEn = 'No exact record match appeared in the compact index. This is not approval; open the professions page or contact the responsible office staff member to confirm the title, education and experience.';
      return match;
    }

    // the profession was recognised in the list (directly, by a synonym or an official title); an estimate needs review
    match.titleStatus = profile.isEstimate ? 'review' : 'ready';

    const requiredEducation = profileRequiredEducation(profile);
    const selectedEducationRank = educationRank[data.qualificationLevel] ?? -1;
    const requiredEducationRank = requiredEducation ? (educationRank[requiredEducation] ?? -1) : -1;
    // owner 2026-10-27: QVP covers a comprehensive diploma and above; for such a profession the office reviews the diploma
    const diplomaFull = data.qualificationLevel === 'diploma-full' && profile.qvp;
    if (diplomaFull && data.qualification !== 'missing') {
      match.qualificationStatus = 'review';
    } else if (requiredEducation && selectedEducationRank < requiredEducationRank) {
      match.qualificationStatus = 'missing';
    } else if (data.qualification === 'missing') {
      match.qualificationStatus = 'missing';
    } else if (data.qualification === 'review') {
      match.qualificationStatus = 'review';
    } else {
      match.qualificationStatus = 'ready';
    }

    // owner 2026-10-27: bachelor = at least 2 years; comprehensive diploma = at least 4 years (QVP professions)
    const requiredExperience = diplomaFull ? Math.max(Number.isFinite(profile.experience_years) ? profile.experience_years : 0, 4) : (Number.isFinite(profile.experience_years) ? profile.experience_years : null);
    match.requiredExperience = requiredExperience;
    if (requiredExperience === 0) {
      match.experienceStatus = data.experience === 'missing' ? 'missing' : data.experience === 'review' ? 'review' : 'ready';
    } else if (requiredExperience === null) {
      match.experienceStatus = data.experience === 'missing' ? 'missing' : 'review';
    } else {
      const yearsOk = Number.isFinite(data.experienceYears) && data.experienceYears >= requiredExperience;
      // owner 2026-10-27: the experience-certificate title is optional; when it is given it must match the profession
      const titleGiven = Boolean(data.experienceTitle);
      const titleOk = titleGiven && (titlesMatch(data.experienceTitle, data.professionName) || titlesMatch(data.experienceTitle, profile.name_ar) || titlesMatch(data.experienceTitle, profile.name_en));
      if (!yearsOk || (titleGiven && !titleOk) || data.experience === 'missing') match.experienceStatus = 'missing';
      else if (data.experience === 'review' || !titleGiven) match.experienceStatus = 'review';
      else match.experienceStatus = 'ready';
    }

    // engineers: the graduation period is the office's rule and its exception is not settled → never «ready» by itself;
    // a short period is a caution for the office, not a rejection (same wording as the eligibility tool)
    if (isEngineer(profile)) {
      if (data.graduationYears === null || !Number.isFinite(data.graduationYears)) match.engineeringStatus = 'review';
      else if (data.graduationYears > 5) match.engineeringStatus = 'ready';
      else match.engineeringStatus = 'review';
    }

    const statuses = [match.titleStatus, match.qualificationStatus, match.experienceStatus, match.engineeringStatus].filter(Boolean);
    match.status = statuses.includes('missing') ? 'missing' : statuses.includes('review') ? 'review' : 'ready';
    const requiredEducationText = requiredEducation ? requiredEducationLabel(requiredEducation) : tr('المستوى الظاهر في السجل', 'the level shown in the record');
    const requiredExperienceText = requiredExperience === 0 ? tr('لا تظهر خبرة كشرط في السجل المختصر', 'no experience requirement appears in the compact record') : requiredExperience === null ? tr('تحتاج تأكيدًا من الموظف المسؤول', 'needs confirmation by the responsible staff member') : `${yearsAr(requiredExperience)}`;
    const titleText = match.titleStatus === 'ready' ? tr('المهنة موجودة في قائمة مهن المكتب.', 'The profession is in the office list.') : tr('المهنة غير موجودة في قائمة المكتب، والأوراق المعروضة لها تقديرية حتى يؤكدها المكتب.', 'The profession is not in the office list; its documents are an estimate until the office confirms them.');
    const educationText = match.qualificationStatus === 'ready' ? tr(`مستوى المؤهل المختار مناسب مبدئيًا، وبلد الإصدار «${sourceLabel(data.qualificationSource)}» لا يرفض الشهادة تلقائيًا.`, `The selected education level is provisionally suitable, and the country of issue “${sourceLabel(data.qualificationSource)}” does not automatically reject the certificate.`) : match.qualificationStatus === 'missing' ? tr(`هذه المهنة يظهر لها حد أدنى هو ${requiredEducationText}. إذا لم تملك هذا المستوى فلن يظهر المسار كجاهز؛ راجع بدائل المهن الأدنى أو الموظف المسؤول.`, `This profession shows a minimum of ${requiredEducationText}. If you do not have that level, the route will not appear ready; review lower-requirement professions or the responsible staff member.`) : tr('يجب مراجعة مستوى المؤهل وأصله ونسخه والجهة التي ستتحقق منه.', 'Review the education level, original, copies and the authority that will verify it.');
    const experienceText = requiredExperience === 0
      ? match.experienceStatus === 'ready'
        ? tr('لا يظهر شرط خبرة لهذه المهنة في السجل المختصر.', 'No experience requirement appears for this profession in the compact record.')
        : match.experienceStatus === 'missing'
          ? tr('لا يظهر شرط خبرة في السجل المختصر، لكن حالة الخبرة المدخلة تحتاج استكمالًا.', 'No experience requirement appears in the compact record, but the entered experience status needs completion.')
          : tr('لا يظهر شرط خبرة في السجل المختصر؛ راجع الموظف المسؤول إذا كانت لديك خبرة أو مستند إضافي.', 'No experience requirement appears in the compact record; contact the responsible staff member if you have experience or an additional document.')
      : match.experienceStatus === 'ready' ? tr(`الخبرة المدخلة تحمل المسمى المناسب ومدتها لا تقل عن ${requiredExperienceText}.`, `The entered experience uses the appropriate title and is at least ${requiredExperienceText}.`) : match.experienceStatus === 'missing' ? tr(`يلزم ${requiredExperienceText}، وأن يكون المسمى في الخبرة مطابقًا أو مقبولًا للمسمى في التأشيرة. سنة و11 شهرًا لا تُحسب سنتين كاملتين.`, `${requiredExperienceText} is required, and the experience title must match or be accepted for the visa title. One year and 11 months does not count as two complete years.`) : tr(`راجع مدة الخبرة والمسمى مع الموظف المسؤول؛ الحد الظاهر هو ${requiredExperienceText}.`, `Review the duration and title with the responsible staff member; the visible minimum is ${requiredExperienceText}.`);
    const engineeringText = match.engineeringStatus === 'ready'
      ? tr('مضى على التخرج أكثر من خمس سنوات حسب قاعدة المكتب. يبقى قرار التسجيل للهيئة السعودية للمهندسين، ولا تغني مدة التخرج عن شهادة خبرة لا تقل عن سنتين.', 'More than five years since graduation under the office rule. Registration is decided by the Saudi Council of Engineers, and the graduation period does not replace an experience certificate of at least two years.')
      : tr('مدة التخرج خمس سنوات أو أقل، أو لم تُحدد. يراجع المكتب شرط المدة والاستثناء مع الهيئة السعودية للمهندسين؛ نص الاستثناء الرسمي لم يُحسم بعد.', 'Five years or less since graduation, or not stated. The office reviews the period and any exception with the Saudi Council of Engineers; the official exception wording is not settled yet.');
    match.summaryAr = `${titleText} ${educationText} ${experienceText}${isEngineer(profile) ? ` ${engineeringText}` : ''}`;
    match.summaryEn = `${titleText} ${educationText} ${experienceText}${isEngineer(profile) ? ` ${engineeringText}` : ''}`;
    return match;
  }

  function alternativeCandidates(review) {
    const data = review.data;
    const profile = review.profile;
    const requiredEducation = profileRequiredEducation(profile);
    if (!profile || requiredEducation !== 'university' || (educationRank[data.qualificationLevel] ?? -1) >= educationRank.university) return [];
    const preferred = data.qualificationLevel === 'none'
      ? ['عامل إنتاج ومصنع', 'عامل تعبئة رفوف', 'بائع', 'مساعد إداري']
      : ['مساعد إداري', 'مراقب الجودة', 'بائع', 'عامل إنتاج ومصنع'];
    const candidates = [];
    preferred.forEach((name) => {
      const found = professionRules?.find((record) => titlesMatch(record.name_ar, name));
      if (found && !candidates.some((item) => item.name_ar === found.name_ar)) candidates.push(profileFromRecord(found));
    });
    return candidates.slice(0, 4);
  }

  function buildReview() {
    const data = readData();
    const profile = findProfessionProfile(data.professionName);
    const match = buildProfessionMatch(data, profile);
    const items = [];

    if (data.nationality === 'foreign-no-residency') {
      addItem(items, 'residency', 'جهة التقديم والإقامة', 'Place of application and residence', 'غير الأردني بلا إقامة أردنية سارية يحتاج مراجعة قبل تجهيز الملف من الأردن. افتح الأهلية وتواصل مع المكتب لتأكيد جهة التقديم.', 'A non-Jordanian without a valid Jordanian residence needs review before preparing the file from Jordan. Open eligibility and contact the office to confirm the place of application.', 'review', '/saudi-work-visa-eligibility.html?audience=foreign#residencyField', 'فتح فحص الأهلية ←', 'Open eligibility check ←');
    } else if (data.nationality === 'unsure') {
      addItem(items, 'residency', 'الجنسية والإقامة', 'Nationality and residence', 'لم تُحسم الحالة. اختر الجنسية والإقامة المناسبة قبل اعتماد قائمة الأوراق.', 'The status is not settled. Choose the applicable nationality and residence before relying on a document list.', 'review', '/saudi-work-visa-eligibility.html', 'فتح فحص الأهلية ←', 'Open eligibility check ←');
    } else if (shownForResidency.has(data.nationality)) {
      const residenceStatus = statusFor(data.residency);
      // owner 2026-10-28: on the foreign-national route the visa's place of arrival must be Amman (a short reminder, no new question)
      const arrival = data.nationality === 'foreign-resident' ? ' جهة القدوم في التأشيرة يجب أن تكون عمّان.' : '';
      addItem(items, 'residency', 'بطاقة الإقامة الأردنية', 'Jordanian residence card', (residenceStatus === 'ready' ? 'بطاقة الإقامة الأردنية السارية متاحة للمراجعة.' : residenceStatus === 'missing' ? 'بطاقة الإقامة الأردنية غير متاحة أو منتهية، وتحتاج إلى استكمال أو تأكيد.' : 'صلاحية بطاقة الإقامة الأردنية غير محسومة وتحتاج مراجعة.') + arrival, residenceStatus === 'ready' ? 'A valid Jordanian residence card is available for review.' : residenceStatus === 'missing' ? 'The Jordanian residence card is missing or expired and needs completion or confirmation.' : 'The validity of the Jordanian residence card is not confirmed and needs review.', residenceStatus, '/saudi-work-visa-eligibility.html#residencyField', 'فتح خانة الإقامة ←', 'Open residence field ←');
    }

    if (shownForConduct.has(data.nationality)) {
      const conductStatus = statusFor(data.conduct);
      let messageAr = 'ورقة السلوك أو عدم المحكومية متوفرة بالأصل والأختام التي وصفتها الأداة.';
      let messageEn = 'The conduct or no-criminal-record document is available with the original and the stamps described in the tool.';
      if (data.nationality === 'syrian-nonresident') {
        messageAr = conductStatus === 'ready' ? 'لا حكم عليه من سوريا متوفر، مع تسلسل تصديق الخارجية السورية ثم السفارة الأردنية في سوريا ثم الخارجية الأردنية في عمّان.' : conductStatus === 'missing' ? 'يلزم استكمال لا حكم عليه من سوريا وتسلسل تصديقه: الخارجية السورية، السفارة الأردنية في سوريا، ثم الخارجية الأردنية في عمّان.' : 'راجع مصدر لا حكم عليه وتسلسل أختامه قبل اعتماد الملف.';
        messageEn = conductStatus === 'ready' ? 'The Syrian no-criminal-record certificate is available with the Syrian Foreign Ministry, Jordanian Embassy in Syria and Jordanian Foreign Ministry in Amman sequence.' : conductStatus === 'missing' ? 'Complete the Syrian no-criminal-record certificate and its sequence: Syrian Foreign Ministry, Jordanian Embassy in Syria, then Jordanian Foreign Ministry in Amman.' : 'Review the source and stamp sequence for the no-criminal-record certificate before relying on the file.';
      } else if (data.nationality === 'foreign-resident' || data.nationality === 'syrian-resident') {
        messageAr = conductStatus === 'ready' ? 'حسن السيرة والسلوك من المخابرات الأردنية بالحضور الشخصي، مع بقاء باقي أوراق المهنة والإقامة مطلوبة.' : conductStatus === 'missing' ? 'يلزم استكمال حسن السيرة والسلوك من المخابرات الأردنية بالحضور الشخصي، مع بقاء باقي أوراق المهنة والإقامة مطلوبة.' : 'تحتاج طريقة الحصول على حسن السيرة والسلوك بالحضور الشخصي إلى مراجعة.';
        messageEn = conductStatus === 'ready' ? 'The Jordanian good-conduct document is available through personal attendance at General Intelligence; the remaining profession documents and residence still apply.' : conductStatus === 'missing' ? 'Complete the Jordanian good-conduct document through personal attendance at General Intelligence; the remaining profession documents and residence still apply.' : 'The personal-attendance process for the Jordanian good-conduct document needs review.';
      }
      addItem(items, 'conduct', data.nationality === 'syrian-nonresident' ? 'لا حكم عليه' : 'حسن السيرة والسلوك', data.nationality === 'syrian-nonresident' ? 'No-criminal-record certificate' : 'Good-conduct document', messageAr, messageEn, conductStatus, '/saudi-document-attestation-jordan.html', 'فتح دليل التصديق ←', 'Open attestation guide ←');
    }

    if (data.dualPassport) {
      // a different name is sent to the office for review — the tool never declares the case refused
      const nameStatus = data.passportName === 'ready' ? 'ready' : 'review';
      addItem(items, 'passports', 'الجواز الأردني والجواز الأجنبي', 'Jordanian and foreign passports',
        data.passportName === 'ready' ? 'تبقى أوراقك أوراق المواطن الأردني. أرفق صورة عن الجوازين؛ الاسم الكامل متطابق فيهما كما ذكرت.' : data.passportName === 'missing' ? 'اختلاف الاسم بين الجوازين يحتاج مراجعة المكتب قبل استكمال الإجراءات. أوراقك تبقى أوراق المواطن الأردني.' : 'تأكد أن الاسم الكامل متطابق تمامًا في الجوازين؛ يراجع المكتب ذلك قبل استكمال الإجراءات.',
        data.passportName === 'ready' ? 'Your documents stay those of a Jordanian citizen. Attach copies of both passports; the full name matches in both.' : 'A name that differs between the two passports needs the office to review it before the procedure continues.',
        nameStatus, '#contact-help', 'تواصل مع المكتب ←', 'Contact the office ←');
    }
    const eligibilityStatus = data.eligibility === 'ready' ? 'ready' : 'review';
    addItem(items, 'eligibility', 'الأهلية والعمر', 'Eligibility and age', eligibilityStatus === 'ready' ? 'راجعت الأهلية والعمر والمسمى قبل مراجعة الملف.' : 'الأهلية أو العمر لم يُراجعا بعد بشكل تفصيلي. استخدم أداة الأهلية قبل اعتماد الملف.', eligibilityStatus === 'ready' ? 'You reviewed eligibility, age and the title before reviewing the file.' : 'Eligibility or age has not been checked in detail. Use the eligibility tool before relying on the file.', eligibilityStatus, '/saudi-work-visa-eligibility.html', 'فتح فحص الأهلية ←', 'Open eligibility check ←');

    const titleStatus = match.titleStatus;
    addItem(items, 'profession', 'المهنة', 'Profession', titleStatus === 'ready' ? 'المهنة موجودة في قائمة مهن المكتب، وتُراجع الخبرة بالمسمى نفسه.' : 'المهنة غير موجودة في قائمة المكتب؛ أوراقها تقديرية حتى يؤكدها المكتب. لا تُعد خبرة مهنة مختلفة مطابقة تلقائيًا.', titleStatus === 'ready' ? 'The visa or application title matches the profession record, and experience will be checked under the same title.' : 'The title needs review; experience from a different profession is not automatically treated as a match.', titleStatus, '/professions.html', 'فتح أوراق المهنة ←', 'Open profession documents ←');

    const qualificationStatus = match.qualificationStatus;
    const profileEducation = profileRequiredEducation(profile);
    const qualificationMessageAr = qualificationStatus === 'missing' && profileEducation === 'university' ? 'المهنة المختارة تتطلب شهادة جامعية وفق سجلها المختصر، والمؤهل الذي أدخلته لا يحقق هذا المستوى. لا يظهر الملف جاهزًا لهذه المهنة؛ راجع بدائل المهن ذات المتطلبات الأقل.' : qualificationStatus === 'ready' ? `المؤهل بالمستوى المطلوب متوفر مبدئيًا. الشهادة الصادرة من ${sourceLabel(data.qualificationSource)} لا تُرفض تلقائيًا؛ تُصدق حسب بلد الإصدار وتُراجع للتحقق المهني عند انطباقه.` : qualificationStatus === 'missing' ? 'المؤهل غير متوفر أو غير مناسب للمهنة المختارة ويحتاج إلى اختيار مهنة أخرى أو استكمال المستوى المطلوب.' : 'المؤهل موجود لكن يحتاج مراجعة المستوى أو الأصل أو النسخ والجهة التي ستتحقق منه.';
    const qualificationMessageEn = qualificationStatus === 'missing' && profileEducation === 'university' ? 'The selected profession shows a university-degree requirement in its compact record, and the level entered does not meet it. The file does not appear ready for this profession; review lower-requirement professions.' : qualificationStatus === 'ready' ? `The required education level is provisionally available. A certificate issued in ${sourceLabel(data.qualificationSource)} is not automatically rejected; it should be attested according to its country of issue and reviewed for professional verification when applicable.` : qualificationStatus === 'missing' ? 'The education level is unavailable or unsuitable for the selected profession and needs completion or a different profession choice.' : 'The education is present but its level, original, copies and verifying authority need review.';
    addItem(items, 'qualification', 'المؤهل الدراسي وبلد الإصدار', 'Education and country of issue', qualificationMessageAr, qualificationMessageEn, qualificationStatus, '/professions.html', 'مراجعة المؤهل في صفحة المهن ←', 'Review qualification on professions page ←');

    const experienceStatus = match.experienceStatus;
    const requiredExperience = match.requiredExperience !== undefined ? match.requiredExperience : (Number.isFinite(profile?.experience_years) ? profile.experience_years : null);
    const displayProfession = displayProfessionValue(data.professionName, profile);
    const experienceMessageAr = experienceStatus === 'ready' ? `الخبرة بالمسمى المناسب ومدتها ${((n) => n === 1 ? 'سنة واحدة مكتملة' : n === 2 ? 'سنتان مكتملتان' : n >= 3 && n <= 10 ? n + ' سنوات مكتملة' : n + ' سنة مكتملة')(data.experienceYears ?? 0)}، وهي لا تقل عن الحد الظاهر للمهنة.` : experienceStatus === 'missing' ? `الخبرة لا تحقق الشرط الحالي. يلزم أن يطابق المسمى «${data.professionName}» أو يكون مقبولًا رسميًا، وأن تكون المدة ${requiredExperience === null ? 'حسب سجل المهنة' : yearsAr(requiredExperience)}.` : 'راجع مدة الخبرة ومطابقة المسمى ومصدر الختم مع الموظف المسؤول قبل اعتمادها.';
    const experienceMessageEn = experienceStatus === 'ready' ? `The experience uses the appropriate title and ${data.experienceYears ?? 0} completed years, meeting the visible profession minimum.` : experienceStatus === 'missing' ? `The experience does not meet the current requirement. The title must match “${displayProfession}” or be officially accepted, and the duration must be ${requiredExperience === null ? 'confirmed from the profession record' : `${requiredExperience} completed years or more`}.` : 'Review the duration, matching title and stamp source with the responsible staff member before relying on it.';
    addItem(items, 'experience', 'الخبرة ومدى مطابقة المسمى', 'Experience and title match', experienceMessageAr, experienceMessageEn, experienceStatus, '/professions.html', 'مراجعة الخبرة في صفحة المهن ←', 'Review experience on professions page ←');

    if (profile?.professional || shownForAccreditation.has(data.professionType)) {
      const accreditationStatus = statusFor(data.accreditation);
      addItem(items, 'accreditation', profile?.qvp ? 'التحقق المهني (QVP)' : profile?.svp ? 'الفحص المهني (SVP)' : 'التحقق المهني أو الفحص المهني', profile?.qvp ? 'Professional verification (QVP)' : 'Professional examination (SVP)', accreditationStatus === 'ready' ? (profile?.svp ? 'الفحص المهني مكتمل أو قدّمت عليه حسب اختيارك. حجز الموعد وحده لا يكفي؛ يكتمل الإجراء باجتياز الفحص.' : 'التحقق المهني مكتمل أو قدّمت عليه حسب اختيارك.') : accreditationStatus === 'missing' ? (profile?.svp ? 'الفحص المهني (SVP) لم يبدأ بعد.' : 'التحقق المهني (QVP) لم يبدأ بعد.') : 'حالة الإجراء المهني غير محسومة؛ يراجعها المكتب.', accreditationStatus === 'ready' ? 'Professional verification or testing is ready or has been started according to your selection.' : accreditationStatus === 'missing' ? 'Professional verification or testing is not complete.' : 'The status of professional verification or testing is not settled; confirm the profession and required authority.', accreditationStatus, '/professions.html', 'فتح الاعتماد في صفحة المهن ←', 'Open verification on professions page ←');
    }

    if (isEngineer(profile)) {
      const engineeringStatus = match.engineeringStatus || 'review';
      const messageAr = engineeringStatus === 'ready' ? 'مضى على التخرج أكثر من خمس سنوات حسب قاعدة المكتب. قرار التسجيل للهيئة السعودية للمهندسين.' : 'مدة التخرج خمس سنوات أو أقل أو غير محددة. يراجع المكتب الشرط والاستثناء مع الهيئة السعودية للمهندسين.';
      const messageEn = engineeringStatus === 'ready' ? 'More than five years since graduation under the office rule. Registration is decided by the Saudi Council of Engineers.' : 'Five years or less since graduation, or not stated. The office reviews the rule and any exception with the Saudi Council of Engineers.';
      addItem(items, 'graduation', 'مدة التخرج (مهندس)', 'Graduation period (engineer)', messageAr, messageEn, engineeringStatus, '/saudi-council-of-engineers-registration.html', 'شروط التسجيل في الهيئة ←', 'Council registration ←');
    }

    if (data.gender === 'female' && (profile?.female_documents || data.professionType === 'hairdresser')) {
      const femaleStatus = statusFor(data.femaleDocuments);
      addItem(items, 'female-documents', 'المستندات الخاصة بالإناث', 'Female-specific documents', femaleStatus === 'ready' ? 'راجعت عقد الزواج أو عدم الممانعة والتصديق المطلوب من الخارجية الأردنية عند انطباق المستند.' : femaleStatus === 'missing' ? 'المستند الخاص بالإناث غير مكتمل ويحتاج إلى مراجعة وتصديق حسب الأصول.' : 'تأكد من الحاجة إلى عقد الزواج أو عدم الممانعة وتسلسل التصديق قبل التسليم.', femaleStatus === 'ready' ? 'You reviewed the marriage contract or no-objection document and the required Jordanian Foreign Ministry attestation when applicable.' : femaleStatus === 'missing' ? 'The female-specific document is incomplete and needs review and proper attestation.' : 'Confirm whether a marriage contract or no-objection document is required and review its attestation sequence before delivery.', femaleStatus, '/professions.html', 'فتح أوراق المهنة ←', 'Open profession documents ←');
    }

    const contractStatus = statusFor(data.contract);
    addItem(items, 'contract', 'عقد العمل وخطاب الاطلاع', 'Employment contract and acknowledgement letter', contractStatus === 'ready' ? 'العقد وخطاب الاطلاع متوفران أو تم تأكيد المطلوب منهما. عند انطباقهما تُراجع صور المستندات السعودية والأختام المطلوبة.' : contractStatus === 'missing' ? 'عقد العمل أو خطاب الاطلاع غير مكتمل.' : 'راجع صيغة العقد وخطاب الاطلاع وختم الغرفة التجارية ووزارة الخارجية السعودية عند انطباقها.', contractStatus === 'ready' ? 'The contract and acknowledgement letter are available or their requirements have been confirmed. When applicable, review copies of the Saudi documents and required stamps.' : contractStatus === 'missing' ? 'The employment contract or acknowledgement letter is incomplete.' : 'Review the contract and acknowledgement-letter format and the Saudi Chamber of Commerce and Foreign Ministry stamps when applicable.', contractStatus, '/work-visa.html', 'فتح دليل تأشيرة العمل ←', 'Open work visa guide ←');

    const attestationStatus = statusFor(data.attestation);
    addItem(items, 'attestation', 'التصديقات والأصول والنسخ', 'Attestations, originals and copies', attestationStatus === 'ready' ? `راجعت بلد الإصدار (${sourceLabel(data.qualificationSource)}) وتسلسل الأختام والأصل أو النسخة المطلوبة.` : attestationStatus === 'missing' ? 'التصديق المطلوب لم يكتمل.' : 'يجب تحديد بلد الإصدار وتسلسل الأختام وهل المطلوب أصل أم صورة قبل التسليم.', attestationStatus === 'ready' ? `You reviewed the country of issue (${sourceLabel(data.qualificationSource)}), stamp sequence and required original or copy.` : attestationStatus === 'missing' ? 'The required attestation is incomplete.' : 'Confirm the country of issue, stamp sequence and whether an original or copy is required before delivery.', attestationStatus, '/saudi-document-attestation-jordan.html', 'فتح أداة التصديق ←', 'Open attestation tool ←');

    const wafidStatus = statusFor(data.wafid);
    addItem(items, 'wafid', 'فحص وافد الطبي', 'Wafid medical examination', wafidStatus === 'ready' ? 'حالة فحص وافد جاهزة أو صالحة وفق اختيارك.' : wafidStatus === 'missing' ? 'لم يبدأ حجز فحص وافد أو لم يكتمل بعد.' : 'حالة فحص وافد تحتاج متابعة من المنصة الرسمية أو مراجعة المكتب.', wafidStatus === 'ready' ? 'The Wafid examination status is ready or valid according to your selection.' : wafidStatus === 'missing' ? 'The Wafid booking or examination has not started or is not complete.' : 'The Wafid status needs follow-up through the official platform or office review.', wafidStatus, '/saudi-medical-exam-jordan.html', 'فتح دليل وافد ←', 'Open Wafid guide ←');

    const consistencyStatus = statusFor(data.consistency);
    addItem(items, 'consistency', 'تطابق البيانات', 'Data consistency', consistencyStatus === 'ready' ? 'الاسم والمهنة والبيانات متطابقة وفق اختيارك.' : consistencyStatus === 'missing' ? 'يوجد اختلاف واضح يحتاج تصحيحًا قبل تقديم الملف.' : 'لم يُحسم تطابق الاسم والمهنة والبيانات في جميع الأوراق.', consistencyStatus === 'ready' ? 'The name, profession and other details match according to your selection.' : consistencyStatus === 'missing' ? 'A clear mismatch needs correction before submitting the file.' : 'The match between the name, profession and details across all documents is not confirmed.', consistencyStatus, '/saudi-work-visa-eligibility.html', 'مراجعة البيانات والأهلية ←', 'Review details and eligibility ←');

    const counts = items.reduce((acc, item) => { acc[item.status] += 1; return acc; }, { ready: 0, review: 0, missing: 0 });
    const overall = counts.missing > 0 ? 'missing' : counts.review > 0 ? 'review' : 'ready';
    const review = { data, profile, match, alternatives: [], items, counts, overall };
    review.alternatives = alternativeCandidates(review);
    return review;
  }

  function renderItem(item) {
    const wrapper = document.createElement('div');
    wrapper.className = `sv-result-item ${statusClass[item.status] || ''}`;
    wrapper.dataset.key = item.key;
    const heading = document.createElement('strong');
    heading.textContent = item.label;
    const badge = document.createElement('span');
    badge.className = 'sv-readiness-status';
    badge.textContent = statusLabels[item.status]?.[isEnglish() ? 1 : 0] || item.status;
    const text = document.createElement('span');
    text.textContent = item.message;
    const top = document.createElement('div');
    top.className = 'sv-readiness-result-head';
    top.append(heading, badge);
    wrapper.append(top, text);
    if (item.href) {
      const link = document.createElement('a');
      link.className = 'sv-text-link';
      link.href = item.href;
      link.textContent = item.hrefLabel;
      wrapper.append(link);
    }
    return wrapper;
  }

  function renderProfessionMatch(review) {
    if (!result.professionMatch) return;
    show(result.professionMatch, true);
    result.professionMatch.dataset.state = review.match.status;
    result.professionMatchTitle.textContent = tr('مطابقة المهنة والخبرة والمؤهل', 'Profession, experience and education match');
    result.professionMatchSummary.textContent = tr(review.match.summaryAr, review.match.summaryEn);
    show(result.alternatives, Boolean(review.alternatives.length));
    if (review.alternatives.length) {
      result.alternativeTitle.textContent = tr('بدائل تحتاج مراجعة', 'Alternatives to review');
      result.alternativeIntro.textContent = tr('لأن المؤهل المختار أقل من المستوى الظاهر للمهنة الحالية، هذه أمثلة من سجل المهن قد تكون أقرب للمؤهل. ليست موافقة أو توصية نهائية؛ افتح كل مهنة وتأكد من الخبرة وبقية الأوراق مع المكتب.', 'Because the selected education level is below the visible requirement for the current profession, these are examples from the profession record that may be closer to the education level. They are not approval or a final recommendation; open each profession and confirm experience and remaining documents with the office.');
      result.alternativeList.innerHTML = '';
      review.alternatives.forEach((alternative) => {
        const link = document.createElement('a');
        link.className = 'sv-alternative-item';
        link.href = `/professions.html?search=${encodeURIComponent(alternative.name_ar)}`;
        const name = document.createElement('strong');
        name.textContent = alternative.name_ar;
        const meta = document.createElement('span');
        meta.textContent = `${requiredEducationLabel(alternative.education)} · ${alternative.experience_years > 0 ? `${alternative.experience_years} ${tr('سنة خبرة على الأقل', 'year(s) of experience minimum')}` : tr('لا يظهر شرط خبرة', 'no experience requirement shown')}`;
        link.append(name, meta);
        result.alternativeList.appendChild(link);
      });
    }
  }

  function nextSteps(review) {
    const keys = new Set(review.items.filter((item) => item.status !== 'ready').map((item) => item.key));
    const steps = [];
    const add = (key, titleAr, titleEn, textAr, textEn, href) => {
      if (steps.some((step) => step.key === key)) return;
      steps.push({ key, title: tr(titleAr, titleEn), text: tr(textAr, textEn), href });
    };
    if (keys.has('eligibility') || keys.has('residency')) add('eligibility', 'الأهلية أولًا', 'Eligibility first', 'استخدم الفحص التفصيلي للجنسية والإقامة والعمر والمهنة.', 'Use the detailed check for nationality, residence, age and profession.', '/saudi-work-visa-eligibility.html');
    if (keys.has('profession') || keys.has('qualification') || keys.has('experience') || keys.has('accreditation') || keys.has('graduation') || keys.has('female-documents')) add('professions', 'الأوراق حسب المهنة', 'Profession documents', 'افتح صفحة المهن لتأكيد المسمى والمؤهل والخبرة والاعتماد والأوراق الخاصة بالإناث عند انطباقها.', 'Open the professions page to confirm the title, education, experience, verification and female-specific documents when applicable.', '/professions.html');
    if (keys.has('attestation') || keys.has('conduct')) add('attestation', 'التصديق والأصول', 'Attestation and originals', 'راجع بلد الإصدار وتسلسل الأختام والأصل أو النسخة المطلوبة.', 'Review the country of issue, stamp sequence and required original or copy.', '/saudi-document-attestation-jordan.html');
    if (keys.has('wafid')) add('wafid', 'فحص وافد', 'Wafid examination', 'انتقل إلى الحجز أو البحث عن حالة الفحص في منصة وافد الرسمية.', 'Go to official Wafid booking or medical-status search.', '/saudi-medical-exam-jordan.html');
    if (keys.has('contract')) add('work-visa', 'دليل تأشيرة العمل', 'Work visa guide', 'راجع عقد العمل وخطاب الاطلاع والخطوات العامة للملف.', 'Review the employment contract, acknowledgement letter and general file steps.', '/work-visa.html');
    if (keys.has('consistency') || review.match.status !== 'ready') add('contact', 'مراجعة الموظف المسؤول', 'Responsible staff review', 'اطبع النتيجة أو احفظها PDF، أو افتح WhatsApp برسالة مختصرة دون بيانات جواز أو معلومات طبية، ليؤكد الموظف الحالة والأوراق.', 'Print or save the result or open WhatsApp with a short message without passport or medical data so the responsible staff member can confirm the case and documents.', '#contact-help');
    if (!steps.length) add('review', 'مراجعة نهائية', 'Final review', 'الملف يبدو مرتبًا وفق اختياراتك. راجع التفاصيل مع الموظف المسؤول والجهة المختصة قبل تسليم الأصل.', 'The file appears organized according to your selections. Review the details with the responsible staff member and competent authority before handing over originals.', '#contact-help');
    return steps;
  }

  function renderNextSteps(review) {
    result.next.innerHTML = '';
    const title = document.createElement('h3');
    title.textContent = tr('ماذا تفتح بعد النتيجة؟', 'What should you open next?');
    result.next.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'sv-readiness-next-grid';
    nextSteps(review).forEach((step) => {
      const card = document.createElement('a');
      card.className = 'sv-readiness-next-item';
      card.href = step.href;
      const strong = document.createElement('strong');
      strong.textContent = step.title;
      const text = document.createElement('span');
      text.textContent = step.text;
      const arrow = document.createElement('em');
      arrow.textContent = tr('فتح الصفحة ←', 'Open page ←');
      card.append(strong, text, arrow);
      grid.appendChild(card);
    });
    result.next.appendChild(grid);
  }

  function resultTitle(review) {
    if (review.overall === 'missing') return tr('الملف يحتاج استكمال عناصر ظاهرة', 'The file needs visible items completed');
    if (review.overall === 'review') return tr('الملف يحتاج مراجعة قبل اعتماده', 'The file needs review before relying on it');
    return tr('الملف يبدو جاهزًا للمراجعة', 'The file appears ready for review');
  }

  function resultSummary(review) {
    const nameAr = review.data.professionName ? ` — ${review.data.professionName}` : '';
    const nameEn = review.data.professionName ? ` — ${displayProfessionValue(review.data.professionName, review.profile)}` : '';
    const summaryAr = `راجعنا اختياراتك لحالة «${routeLabel(review.data.nationality)}» ومهنة «${review.profile ? review.profile.name_ar : (review.data.professionName || professionLabel(review.data.professionType))}». النتيجة إرشادية: ${review.counts.ready} جاهز، ${review.counts.review} يحتاج مراجعة، و${review.counts.missing} يحتاج استكمالًا.`;
    const summaryEn = `We reviewed your selections for “${routeLabel(review.data.nationality)}” and “${professionLabel(review.data.professionType)}”${nameEn}. This is guidance only: ${review.counts.ready} ready, ${review.counts.review} needing review and ${review.counts.missing} needing completion.`;
    return tr(summaryAr, summaryEn);
  }

  function whatsappMessage(review) {
    const notReady = review.items.filter((item) => item.status !== 'ready').map((item) => item.label);
    if (isEnglish()) {
      return `Hello, I need guidance about my Saudi work visa file from Jordan. Selected status: ${routeLabel(review.data.nationality)}. Visa profession: ${review.data.professionName ? displayProfessionValue(review.data.professionName, review.profile) : professionLabel(review.data.professionType)}. Experience title: ${review.data.experienceTitle ? displayUserValue(review.data.experienceTitle, 'the entered experience title') : 'not provided'}. Items needing review: ${notReady.length ? notReady.join(', ') : 'none shown by this tool'}. Please confirm the profession, education, experience duration and document stamps. I am not sending passport, medical or payment data through the website.`;
    }
    return `مرحباً، أحتاج إرشاداً حول ملف تأشيرة العمل السعودية من الأردن. الحالة المختارة: ${routeLabel(review.data.nationality)}. مهنة التأشيرة: ${review.data.professionName || professionLabel(review.data.professionType)}. مسمى الخبرة: ${review.data.experienceTitle || 'لم أدخله'}. الفئات التي تحتاج مراجعة: ${notReady.length ? notReady.join('، ') : 'لا توجد فئات ناقصة ظاهرة في الأداة'}. أرجو تأكيد المسمى والمؤهل ومدة الخبرة والأختام. لا أرسل بيانات جواز أو معلومات طبية أو دفع داخل الموقع.`;
  }

  function updateWhatsapp(review) {
    if (result.contactWhatsapp && !review) {
      const message = isEnglish() ? 'Hello, I need guidance about preparing a Saudi work visa file from Jordan.' : 'مرحباً، أحتاج إرشاداً حول تجهيز ملف تأشيرة العمل السعودية من الأردن.';
      result.contactWhatsapp.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    }
    if (!review) return;
    const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage(review))}`;
    if (result.whatsapp) result.whatsapp.href = href;
    if (result.contactWhatsapp) result.contactWhatsapp.href = href;
  }

  function renderPrint(review) {
    if (!result.printContent) return;
    result.printTitle.textContent = tr('مراجعة جاهزية ملف تأشيرة العمل', 'Saudi Work Visa File Readiness Review');
    result.printSubtitle.textContent = tr('مكتب تأشيرات السعودية في الأردن', 'Saudi Visa Office in Jordan');
    result.printContent.innerHTML = '';
    const context = document.createElement('p');
    context.textContent = resultSummary(review);
    result.printContent.appendChild(context);
    const match = document.createElement('p');
    match.textContent = tr(review.match.summaryAr, review.match.summaryEn);
    result.printContent.appendChild(match);
    const list = document.createElement('ul');
    review.items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.label}: ${statusLabels[item.status]?.[isEnglish() ? 1 : 0] || item.status} — ${item.message}`;
      list.appendChild(li);
    });
    result.printContent.appendChild(list);
    if (review.alternatives.length) {
      const alt = document.createElement('p');
      alt.textContent = `${tr('بدائل للمراجعة: ', 'Alternatives to review: ')}${review.alternatives.map((item) => item.name_ar).join('، ')}`;
      result.printContent.appendChild(alt);
    }
  }

  function render(review) {
    lastReview = review;
    result.panel.hidden = false;
    result.panel.dataset.state = review.overall === 'ready' ? 'success' : review.overall === 'missing' ? 'danger' : 'warning';
    result.panel.classList.add('is-visible');
    result.title.textContent = resultTitle(review);
    result.summary.textContent = resultSummary(review);
    result.list.innerHTML = '';
    review.items.forEach((item) => result.list.appendChild(renderItem(item)));
    // owner 2026-10-27: the sample certificate next to the professional procedure in the result (SVP or QVP, from the profession's rules)
    const certKind = review.profile?.svp ? 'svp' : review.profile?.qvp ? 'qvp' : null;
    const accItem = result.list.querySelector('[data-key="accreditation"]');
    if (certKind && accItem && window.SD_CERT) accItem.appendChild(window.SD_CERT.fits(certKind, review.profile.education === 'university' ? true : review.profile.education === 'unknown' ? undefined : false) ? window.SD_CERT.button(certKind, { profession: review.profile.name_ar }) : window.SD_CERT.note(certKind));
    // owner 2026-10-27: the Musadaqa sample only when THIS profession's requirements include the Musadaqa of the degree
    const attItem = result.list.querySelector('[data-key="attestation"]');
    const needsMusadaqa = Boolean(review.profile?.musadaqa);
    if (needsMusadaqa && attItem && window.SD_CERT) attItem.appendChild(window.SD_CERT.button('musadaqa', { profession: review.profile.name_ar }));
    renderProfessionMatch(review);
    renderNextSteps(review);
    renderPrint(review);
    updateWhatsapp(review);
    if (result.copyStatus) result.copyStatus.hidden = true;
  }

  function renderValidation(keys) {
    const review = {
      data: readData(),
      profile: currentProfile(),
      match: { status: 'review', summaryAr: '', summaryEn: '' },
      alternatives: [],
      items: [],
      counts: { ready: 0, review: keys.length, missing: 0 },
      overall: 'review'
    };
    addItem(review.items, 'validation', 'خيارات ناقصة', 'Incomplete choices', `أكمل الخانات التالية قبل عرض النتيجة: ${requiredNames(keys).join('، ')}.`, `Complete these fields before viewing the result: ${requiredNames(keys).join(', ')}.`, 'review', '#readiness-checker', 'العودة إلى الخانات ←', 'Return to the fields ←');
    render(review);
    result.title.textContent = tr('أكمل الخانات المطلوبة أولًا', 'Complete the required fields first');
    result.summary.textContent = tr('لم تُنشأ مراجعة نهائية بعد. أكمل الخيارات الظاهرة ثم اعرض النتيجة مرة أخرى.', 'A final review has not been created. Complete the visible fields and show the result again.');
    show(result.professionMatch, false);
  }

  function copyText(review) {
    const lines = [
      tr('مراجعة جاهزية ملف تأشيرة العمل السعودية من الأردن', 'Saudi Work Visa File Readiness Review from Jordan'),
      resultSummary(review),
      tr('مطابقة المهنة والخبرة والمؤهل:', 'Profession, experience and education match:'),
      tr(review.match.summaryAr, review.match.summaryEn),
      '',
      ...review.items.map((item) => `- ${item.label}: ${statusLabels[item.status]?.[isEnglish() ? 1 : 0] || item.status}. ${item.message}`),
      review.alternatives.length ? `${tr('بدائل للمراجعة:', 'Alternatives to review:')} ${review.alternatives.map((item) => item.name_ar).join('، ')}` : '',
      '',
      tr('هذه نتيجة إرشادية محلية وليست موافقة على التأشيرة. القرار النهائي يعود للموظف المسؤول والجهة المختصة.', 'This is local guidance, not visa approval. The final confirmation belongs to the responsible office staff member and competent authority.')
    ];
    return lines.join('\n');
  }

  async function copyResult() {
    if (!lastReview) return;
    const text = copyText(lastReview);
    try {
      await navigator.clipboard.writeText(text);
      result.copyStatus.textContent = tr('تم نسخ النتيجة. يمكنك لصقها في رسالة المكتب إذا احتجت.', 'The result was copied. You can paste it into a message to the office if needed.');
    } catch (_) {
      result.copyStatus.textContent = tr('حدد النص وانسخه يدويًا من النتيجة.', 'Select and copy the result manually.');
    }
    result.copyStatus.hidden = false;
  }

  function printResult() {
    if (!lastReview) return;
    if (window.SD_print) { window.SD_print(result.panel, tr('مراجعة جاهزية ملف تأشيرة العمل', 'Work visa file readiness'), resultSummary(lastReview)); return; }
    document.body.classList.add('sv-printing');
    window.print();
    window.setTimeout(() => document.body.classList.remove('sv-printing'), 800);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateVisibility();
    const incomplete = requiredMissingAll();
    if (incomplete.length) {
      renderValidation(incomplete);
      result.panel.focus();
      return;
    }
    const submit = $('readinessSubmit');
    if (submit) { submit.disabled = true; submit.textContent = tr('جارٍ تجهيز المراجعة…', 'Preparing the review…'); }
    await ensureProfessionRules();
    render(buildReview());
    if (submit) { submit.disabled = false; submit.textContent = tr('اعرض نتيجة جاهزية الملف', 'Show file-readiness result'); }
    result.panel.focus();
  });

  $('readinessNext')?.addEventListener('click', moveNext);
  $('readinessPrev')?.addEventListener('click', () => setStep(currentStep - 1));
  document.querySelectorAll('[data-readiness-step-target]').forEach((button) => button.addEventListener('click', () => setStep(Number(button.dataset.readinessStepTarget))));
  result.copy?.addEventListener('click', copyResult);
  result.print?.addEventListener('click', printResult);

  /* ── profession search (owner 2026-10-27): the same smart search as «مسار أوراقي» — list names, synonyms, official
   *    codes / titles (internal dictionary), and a labelled estimate when the title is not in the list ── */
  (function professionCombo() {
    const input = fields.professionName, list = $('readinessProfessionList'), picked = $('readinessProfessionPicked');
    if (!input || !list) return;
    let hits = [], active = -1;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); };
    function showList() {
      const v = input.value.trim();
      if (!v || !Array.isArray(professionList) || typeof window.SD_searchProfessions !== 'function') { close(); return; }
      hits = window.SD_searchProfessions(professionList, v, 6);
      const r = window.SD_resolveTitle(professionList, v);
      if (r && r.record && (r.kind === 'estimate' || r.kind === 'synonym')) hits = [r.record].concat(hits.filter((p) => p !== r.record)).slice(0, 6);
      if (r && r.kind === 'choose') hits = window.SD_choiceHits(r);
      if (typeof window.SD_dictSearch === 'function' && hits.length < 6 && !(r && (r.kind === 'estimate' || r.kind === 'choose'))) {
        const seen = new Set(hits.map((p) => String(p.officialCode || p.code)));
        window.SD_dictSearch(v, 6 - hits.length).forEach((e) => { if (!seen.has(e.code)) hits.push({ __dict: e, name_ar: e.name, code: e.code }); });
      }
      active = hits.length ? 0 : -1;
      list.innerHTML = hits.length ? hits.map((p, k) => {
        const sub = p.__query ? 'اعرض المهن المطابقة' : p.__dict ? 'مسمى رسمي غير مدرج في قائمة المكتب' : p.isEstimate ? 'نتيجة تقديرية · فئة ' + esc(p.estimateLabel) : esc(p.category || '');
        return `<li id="rd-opt${k}" role="option" aria-selected="${k === 0}" data-k="${k}"${p.__dict || p.isEstimate ? ' class="m-est"' : ''}><span>${esc(p.name_ar)} <small>${sub}</small></span><span class="sd-num">${esc(p.officialCode || (!p.no_official_code && /^\d{6}$/.test(String(p.code)) ? p.code : '—'))}</span></li>`;
      }).join('') + (r && r.kind === 'choose' ? `<li class="m-none m-msg" role="presentation">${esc(r.question)}</li>` : '') : `<li class="m-none" role="option" aria-disabled="true">${esc(r && r.message ? r.message : 'لم نجد هذا المسمى. اختر أقرب فئة في السؤال التالي، ويؤكد المكتب المسمى الصحيح.')}</li>`;
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    function pick(p) {
      if (!p) return;
      if (p.__query) { input.value = p.__query; showList(); return; }
      if (p.__dict) {
        let r = window.SD_resolveTitle(professionList, p.__dict.name);
        if (!r || !r.record) r = window.SD_resolveTitle(professionList, p.__dict.code);
        if (r && r.record) p = r.record; else { input.value = p.__dict.name; pickedRecord = null; picked.textContent = r && r.message ? r.message : ''; close(); updateVisibility(); return; }
      }
      pickedRecord = p; input.value = p.name_ar; close();
      picked.textContent = p.isEstimate ? `نتيجة تقديرية لفئة «${p.estimateLabel}»${p.officialCode ? ` · الرمز الرسمي ${p.officialCode}` : ''}. يؤكدها المكتب.` : `اخترت: ${p.name_ar}${!p.no_official_code && /^\d{6}$/.test(String(p.code)) ? ` (${p.code})` : p.no_official_code ? ' (بدون رمز رسمي مؤكد)' : ''}.`;
      updateVisibility();
    }
    input.addEventListener('input', () => { pickedRecord = null; picked.textContent = ''; showList(); });
    input.addEventListener('keydown', (e) => {
      if (list.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!hits.length) return; active = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length; [...list.children].forEach((li, k) => li.setAttribute('aria-selected', String(k === active))); input.setAttribute('aria-activedescendant', 'rd-opt' + active); }
      else if (e.key === 'Enter') { e.preventDefault(); pick(hits[active]); }
      else if (e.key === 'Escape') close();
    });
    list.addEventListener('mousedown', (e) => { const li = e.target.closest('li[data-k]'); if (li) { e.preventDefault(); pick(hits[+li.dataset.k]); } });
    input.addEventListener('blur', () => setTimeout(close, 150));
    document.addEventListener('sd-dict-ready', () => { if (document.activeElement === input && input.value.trim()) showList(); updateVisibility(); });
  })();
  // the profession list (1.9 MB) loads when the visitor reaches the profession field, not with the page (speed)
  let listAsked = false;
  const askList = () => { if (listAsked) return; listAsked = true; ensureProfessionRules().then(() => { updateVisibility(); if (fields.professionName.value.trim()) fields.professionName.dispatchEvent(new Event('input')); }); if (window.SD_loadDictionary) window.SD_loadDictionary(); };
  ['focus', 'pointerdown', 'input'].forEach((ev) => fields.professionName.addEventListener(ev, askList));
  form.addEventListener('submit', () => ensureProfessionRules(), true);

  ['nationality', 'dual', 'professionType', 'professionName', 'experienceTitle', 'gender', 'qualificationLevel', 'experienceYears', 'graduationYears'].forEach((key) => {
    const node = fields[key];
    node?.addEventListener('input', updateVisibility);
    node?.addEventListener('change', updateVisibility);
  });
  document.addEventListener('sv:languagechange', () => {
    updateVisibility();
    updateStepUI();
    if (lastReview) render(buildReview()); else updateWhatsapp();
  });

  updateVisibility();
  setStep(1);
  updateWhatsapp();
})();
