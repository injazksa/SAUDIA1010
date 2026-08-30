(() => {
  'use strict';

  const form = document.getElementById('readinessForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const tr = (ar, en) => window.SV_TRANSLATE?.t(ar, en) || ar;
  const isEnglish = () => window.SV_TRANSLATE?.isEnglish?.() === true;
  const whatsappNumber = '962789881009';
  const professionRulesUrl = '/readiness-profession-rules.json?v=20260829-rules-2';
  let lastReview = null;
  let currentStep = 1;
  let professionRules = null;
  let professionRulesPromise = null;

  const fields = {
    nationality: $('readinessNationality'),
    residency: $('readinessResidency'),
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
    diploma: ['دبلوم', 'Diploma'],
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
  const educationRank = { none: 0, grade10: 1, school: 2, secondary: 2, diploma: 3, university: 4, postgraduate: 5, unknown: -1 };

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

  function fallbackProfile(name) {
    const normalized = normalizeTitle(name);
    const make = (nameAr, options = {}) => ({
      name_ar: nameAr,
      name_en: options.nameEn || '',
      category: options.category || '',
      gender: options.gender || 'ذكر',
      education: options.education || 'unknown',
      experience_years: Number.isFinite(options.experienceYears) ? options.experienceYears : null,
      professional: Boolean(options.professional),
      engineer: Boolean(options.engineer),
      doctor: Boolean(options.doctor),
      female_documents: Boolean(options.femaleDocuments),
      military_explanations: true,
      inferred: true
    });
    if (/مهندس/.test(normalized)) return make(name, { nameEn: 'Engineer', education: 'university', experienceYears: 2, professional: true, engineer: true });
    if (/طبيب|دكتور/.test(normalized)) return make(name, { nameEn: 'Doctor', education: 'university', experienceYears: 2, professional: true, doctor: true });
    if (/مشرف انتاج|اخصائي تسويق|محاسب|مدير مشروع|مدير مشاريع|مدير اقليمي|اخصائي مبيعات/.test(normalized)) return make(name, { education: 'university', experienceYears: 2, professional: true });
    if (/مراقب جوده|مساعد اداري|منسق|بائع/.test(normalized)) return make(name, { education: 'secondary', experienceYears: 1, professional: true });
    if (/مصفف شعر|مصففه شعر/.test(normalized)) return make(name, { nameEn: 'Hairdresser', education: 'grade10', experienceYears: 1, professional: true, female_documents: true, gender: 'أنثى' });
    if (/عامل/.test(normalized)) return make(name, { education: 'school', experienceYears: 0, professional: false });
    return null;
  }

  async function ensureProfessionRules() {
    if (Array.isArray(professionRules)) return professionRules;
    if (!professionRulesPromise) {
      professionRulesPromise = fetch(professionRulesUrl, { cache: 'force-cache' })
        .then((response) => {
          if (!response.ok) throw new Error('Profession rules unavailable');
          return response.json();
        })
        .then((data) => {
          professionRules = Array.isArray(data) ? data : [];
          return professionRules;
        })
        .catch(() => {
          professionRules = [];
          return professionRules;
        });
    }
    return professionRulesPromise;
  }

  function findProfessionProfile(name) {
    const typed = String(name || '').trim();
    if (!typed) return null;
    const normalized = normalizeTitle(typed);
    if (Array.isArray(professionRules) && professionRules.length) {
      const exact = professionRules.find((record) => titlesMatch(normalized, record.name_ar) || titlesMatch(normalized, record.name_en));
      if (exact) return exact;
    }
    return fallbackProfile(typed);
  }

  function currentProfile() {
    return findProfessionProfile(fields.professionName?.value || '');
  }

  function isEngineer(profile) {
    return fields.professionType.value === 'engineer' || Boolean(profile?.engineer);
  }

  function needsExperienceEvidence(profile) {
    if (profile && Number.isFinite(profile.experience_years)) return profile.experience_years > 0;
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
    show(panels.conduct, conductVisible);
    show(panels.accreditation, accreditationVisible);
    show(panels.engineering, engineeringVisible);
    show(panels.graduationYears, engineeringVisible);
    show(panels.saudiBorn, engineeringVisible);
    show(panels.femaleDocuments, femaleVisible);
    setRequired(fields.residency, residenceVisible);
    setRequired(fields.conduct, conductVisible);
    setRequired(fields.accreditation, accreditationVisible);
    setRequired(fields.graduationYears, engineeringVisible);
    setRequired(fields.saudiBorn, engineeringVisible);
    setRequired(fields.femaleDocuments, femaleVisible);

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
      const educationText = education ? educationLabel(education) : tr('يجب تأكيده من سجل المهنة', 'must be confirmed from the profession record');
      const experienceText = experience === null ? tr('يجب تأكيدها من سجل المهنة', 'must be confirmed from the profession record') : experience === 0 ? tr('لا يظهر شرط خبرة في السجل المختصر', 'no experience requirement appears in the compact record') : `${experience} ${tr('سنوات مكتملة على الأقل', 'completed years minimum')}`;
      const displayName = displayProfessionValue(profile.name_ar, profile);
      panels.professionMatchHint.textContent = tr(
        `تم العثور على «${profile.name_ar}» في قاعدة أوراق المهن. الحد الأدنى الظاهر للمؤهل: ${educationText}، والخبرة: ${experienceText}. ستراجع الأداة مطابقة المسمى والمدة، ثم افتح صفحة المهنة للتفاصيل والأختام.`,
        `“${displayName}” was found in the profession records. The visible minimum is ${educationText} for education and ${experienceText} for experience. The tool will check the title and duration; open the profession page for full documents and stamps.`
      );
      show(panels.professionMatchHint, true);
    } else if (fields.professionName.value.trim()) {
      panels.professionMatchHint.textContent = tr(
        'لم يُعثر على تطابق حرفي في السجل المختصر. لا تعتمد جوابًا آليًا؛ اكتب المسمى كما في التأشيرة وافتح صفحة المهن أو تواصل مع المكتب للتأكد من المؤهل والخبرة والاعتماد.',
        'No exact match was found in the compact record. Do not rely on an automated answer; use the title shown on the visa, open the professions page or contact the office to confirm education, experience and verification.'
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
      experienceYears: fields.experienceYears.value === '' ? null : Number(fields.experienceYears.value),
      accreditation: selectedValue(fields.accreditation),
      contract: selectedValue(fields.contract),
      qualificationSource: selectedValue(fields.qualificationSource),
      graduationYears: fields.graduationYears.value === '' ? null : Number(fields.graduationYears.value),
      saudiBorn: selectedValue(fields.saudiBorn),
      attestation: selectedValue(fields.attestation),
      wafid: selectedValue(fields.wafid),
      consistency: selectedValue(fields.consistency),
      conduct: selectedValue(fields.conduct)
    };
  }

  function requiredNames(keys) {
    return keys.map((key) => {
      const field = fields[key];
      return field?.closest('.sv-field')?.querySelector('span')?.textContent?.replace(/^\d+\.\s*/, '').trim() || key;
    });
  }

  function conditionalVisible(node) {
    if (!node) return false;
    let current = node;
    while (current && current !== form) {
      if (current.hidden && !current.hasAttribute('data-readiness-step-panel')) return false;
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
      if (conditionalVisible(fields.conduct) && fields.conduct.required) addIfEmpty('conduct');
    }
    if (step === 2) {
      addIfEmpty('professionType');
      addIfEmpty('professionName');
      if (conditionalVisible(fields.femaleDocuments) && fields.femaleDocuments.required) addIfEmpty('femaleDocuments');
    }
    if (step === 3) {
      addIfEmpty('qualificationLevel');
      addIfEmpty('qualification');
      addIfEmpty('experience');
      addIfEmpty('qualificationSource');
      if (experienceNeedsEvidenceNow()) {
        if (!data.experienceTitle) missing.push('experienceTitle');
        if (data.experienceYears === null || !Number.isFinite(data.experienceYears) || data.experienceYears < 0) missing.push('experienceYears');
      }
      if (conditionalVisible(fields.accreditation) && fields.accreditation.required) addIfEmpty('accreditation');
      if (isEngineer(currentProfile())) {
        if (data.graduationYears === null || !Number.isFinite(data.graduationYears) || data.graduationYears < 0) missing.push('graduationYears');
        if (!data.saudiBorn) missing.push('saudiBorn');
      }
    }
    if (step === 4) {
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

    const titleMatch = titlesMatch(data.professionName, profile.name_ar) || titlesMatch(data.professionName, profile.name_en);
    match.titleStatus = titleMatch ? 'ready' : 'missing';

    const requiredEducation = profileRequiredEducation(profile);
    const selectedEducationRank = educationRank[data.qualificationLevel] ?? -1;
    const requiredEducationRank = requiredEducation ? (educationRank[requiredEducation] ?? -1) : -1;
    if (requiredEducation && selectedEducationRank < requiredEducationRank) {
      match.qualificationStatus = 'missing';
    } else if (data.qualification === 'missing') {
      match.qualificationStatus = 'missing';
    } else if (data.qualification === 'review') {
      match.qualificationStatus = 'review';
    } else {
      match.qualificationStatus = 'ready';
    }

    const requiredExperience = Number.isFinite(profile.experience_years) ? profile.experience_years : null;
    if (requiredExperience === 0) {
      match.experienceStatus = data.experience === 'missing' ? 'missing' : data.experience === 'review' ? 'review' : 'ready';
    } else if (requiredExperience === null) {
      match.experienceStatus = data.experience === 'missing' ? 'missing' : 'review';
    } else {
      const yearsOk = Number.isFinite(data.experienceYears) && data.experienceYears >= requiredExperience;
      const titleOk = titlesMatch(data.experienceTitle, data.professionName) || titlesMatch(data.experienceTitle, profile.name_ar) || titlesMatch(data.experienceTitle, profile.name_en);
      if (!yearsOk || !titleOk || data.experience === 'missing') match.experienceStatus = 'missing';
      else if (data.experience === 'review') match.experienceStatus = 'review';
      else match.experienceStatus = 'ready';
    }

    if (isEngineer(profile)) {
      if (data.graduationYears === null || !Number.isFinite(data.graduationYears)) match.engineeringStatus = 'review';
      else if (data.graduationYears > 5) match.engineeringStatus = 'ready';
      else if (data.saudiBorn === 'yes') match.engineeringStatus = 'review';
      else if (data.saudiBorn === 'review') match.engineeringStatus = 'review';
      else match.engineeringStatus = 'missing';
    }

    const statuses = [match.titleStatus, match.qualificationStatus, match.experienceStatus, match.engineeringStatus].filter(Boolean);
    match.status = statuses.includes('missing') ? 'missing' : statuses.includes('review') ? 'review' : 'ready';
    const requiredEducationText = requiredEducation ? educationLabel(requiredEducation) : tr('المستوى الظاهر في السجل', 'the level shown in the record');
    const requiredExperienceText = requiredExperience === 0 ? tr('لا تظهر خبرة كشرط في السجل المختصر', 'no experience requirement appears in the compact record') : requiredExperience === null ? tr('تحتاج تأكيدًا من الموظف المسؤول', 'needs confirmation by the responsible staff member') : `${requiredExperience} ${tr('سنوات مكتملة على الأقل', 'completed years minimum')}`;
    const titleText = match.titleStatus === 'ready' ? tr('المسمى متطابق مع السجل.', 'The title matches the record.') : tr('المسمى لا يطابق السجل بما يكفي؛ لا تُعامل الخبرة المختلفة كخبرة للمهنة.', 'The title does not match the record closely enough; unrelated experience is not treated as experience for this profession.');
    const educationText = match.qualificationStatus === 'ready' ? tr(`مستوى المؤهل المختار مناسب مبدئيًا، وبلد الإصدار «${sourceLabel(data.qualificationSource)}» لا يرفض الشهادة تلقائيًا.`, `The selected education level is provisionally suitable, and the country of issue “${sourceLabel(data.qualificationSource)}” does not automatically reject the certificate.`) : match.qualificationStatus === 'missing' ? tr(`هذه المهنة يظهر لها حد أدنى هو ${requiredEducationText}. إذا لم تملك هذا المستوى فلن يظهر المسار كجاهز؛ راجع بدائل المهن الأدنى أو الموظف المسؤول.`, `This profession shows a minimum of ${requiredEducationText}. If you do not have that level, the route will not appear ready; review lower-requirement professions or the responsible staff member.`) : tr('يجب مراجعة مستوى المؤهل وأصله ونسخه والجهة التي ستتحقق منه.', 'Review the education level, original, copies and the authority that will verify it.');
    const experienceText = requiredExperience === 0
      ? match.experienceStatus === 'ready'
        ? tr('لا يظهر شرط خبرة لهذه المهنة في السجل المختصر.', 'No experience requirement appears for this profession in the compact record.')
        : match.experienceStatus === 'missing'
          ? tr('لا يظهر شرط خبرة في السجل المختصر، لكن حالة الخبرة المدخلة تحتاج استكمالًا.', 'No experience requirement appears in the compact record, but the entered experience status needs completion.')
          : tr('لا يظهر شرط خبرة في السجل المختصر؛ راجع الموظف المسؤول إذا كانت لديك خبرة أو مستند إضافي.', 'No experience requirement appears in the compact record; contact the responsible staff member if you have experience or an additional document.')
      : match.experienceStatus === 'ready' ? tr(`الخبرة المدخلة تحمل المسمى المناسب ومدتها لا تقل عن ${requiredExperienceText}.`, `The entered experience uses the appropriate title and is at least ${requiredExperienceText}.`) : match.experienceStatus === 'missing' ? tr(`يلزم ${requiredExperienceText}، وأن يكون المسمى في الخبرة مطابقًا أو مقبولًا للمسمى في التأشيرة. سنة و11 شهرًا لا تُحسب سنتين كاملتين.`, `${requiredExperienceText} is required, and the experience title must match or be accepted for the visa title. One year and 11 months does not count as two complete years.`) : tr(`راجع مدة الخبرة والمسمى مع الموظف المسؤول؛ الحد الظاهر هو ${requiredExperienceText}.`, `Review the duration and title with the responsible staff member; the visible minimum is ${requiredExperienceText}.`);
    const engineeringText = match.engineeringStatus === 'ready' ? tr('مدة التخرج المدخلة تتجاوز خمس سنوات وفق الفحص الإرشادي.', 'The entered time since graduation exceeds five years according to this guidance check.') : match.engineeringStatus === 'missing' ? tr('مسار المهندس يحتاج تخرجًا منذ أكثر من خمس سنوات، ما لم تنطبق حالة استثناء لمواليد السعودية وتؤكدها الجهة المختصة.', 'The engineer route requires graduation more than five years ago unless a Saudi-born exception applies and is confirmed by the competent authority.') : tr('حالة مدة التخرج أو استثناء مواليد السعودية تحتاج مراجعة من الجهة المختصة.', 'The time-since-graduation or Saudi-born exception status needs confirmation by the competent authority.');
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
      if (found && !candidates.some((item) => item.name_ar === found.name_ar)) candidates.push(found);
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
      addItem(items, 'residency', 'بطاقة الإقامة الأردنية', 'Jordanian residence card', residenceStatus === 'ready' ? 'بطاقة الإقامة الأردنية السارية متاحة للمراجعة.' : residenceStatus === 'missing' ? 'بطاقة الإقامة الأردنية غير متاحة أو منتهية، وتحتاج إلى استكمال أو تأكيد.' : 'صلاحية بطاقة الإقامة الأردنية غير محسومة وتحتاج مراجعة.', residenceStatus === 'ready' ? 'A valid Jordanian residence card is available for review.' : residenceStatus === 'missing' ? 'The Jordanian residence card is missing or expired and needs completion or confirmation.' : 'The validity of the Jordanian residence card is not confirmed and needs review.', residenceStatus, '/saudi-work-visa-eligibility.html#residencyField', 'فتح خانة الإقامة ←', 'Open residence field ←');
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

    const eligibilityStatus = data.eligibility === 'ready' ? 'ready' : 'review';
    addItem(items, 'eligibility', 'الأهلية والعمر', 'Eligibility and age', eligibilityStatus === 'ready' ? 'راجعت الأهلية والعمر والمسمى قبل مراجعة الملف.' : 'الأهلية أو العمر لم يُراجعا بعد بشكل تفصيلي. استخدم أداة الأهلية قبل اعتماد الملف.', eligibilityStatus === 'ready' ? 'You reviewed eligibility, age and the title before reviewing the file.' : 'Eligibility or age has not been checked in detail. Use the eligibility tool before relying on the file.', eligibilityStatus, '/saudi-work-visa-eligibility.html', 'فتح فحص الأهلية ←', 'Open eligibility check ←');

    const titleStatus = match.titleStatus;
    addItem(items, 'profession', 'مسمى المهنة في التأشيرة والخبرة', 'Visa and experience profession title', titleStatus === 'ready' ? 'المسمى في التأشيرة أو الطلب يطابق سجل المهنة، والخبرة ستُراجع بالاسم نفسه.' : 'المسمى يحتاج مراجعة ولا يجوز اعتبار خبرة مهنة مختلفة مطابقة تلقائيًا.', titleStatus === 'ready' ? 'The visa or application title matches the profession record, and experience will be checked under the same title.' : 'The title needs review; experience from a different profession is not automatically treated as a match.', titleStatus, '/professions.html', 'فتح أوراق المهنة ←', 'Open profession documents ←');

    const qualificationStatus = match.qualificationStatus;
    const profileEducation = profileRequiredEducation(profile);
    const qualificationMessageAr = qualificationStatus === 'missing' && profileEducation === 'university' ? 'المهنة المختارة تتطلب شهادة جامعية وفق سجلها المختصر، والمؤهل الذي أدخلته لا يحقق هذا المستوى. لا يظهر الملف جاهزًا لهذه المهنة؛ راجع بدائل المهن ذات المتطلبات الأقل.' : qualificationStatus === 'ready' ? `المؤهل بالمستوى المطلوب متوفر مبدئيًا. الشهادة الصادرة من ${sourceLabel(data.qualificationSource)} لا تُرفض تلقائيًا؛ تُصدق حسب بلد الإصدار وتُراجع للتحقق المهني عند انطباقه.` : qualificationStatus === 'missing' ? 'المؤهل غير متوفر أو غير مناسب للمهنة المختارة ويحتاج إلى اختيار مهنة أخرى أو استكمال المستوى المطلوب.' : 'المؤهل موجود لكن يحتاج مراجعة المستوى أو الأصل أو النسخ والجهة التي ستتحقق منه.';
    const qualificationMessageEn = qualificationStatus === 'missing' && profileEducation === 'university' ? 'The selected profession shows a university-degree requirement in its compact record, and the level entered does not meet it. The file does not appear ready for this profession; review lower-requirement professions.' : qualificationStatus === 'ready' ? `The required education level is provisionally available. A certificate issued in ${sourceLabel(data.qualificationSource)} is not automatically rejected; it should be attested according to its country of issue and reviewed for professional verification when applicable.` : qualificationStatus === 'missing' ? 'The education level is unavailable or unsuitable for the selected profession and needs completion or a different profession choice.' : 'The education is present but its level, original, copies and verifying authority need review.';
    addItem(items, 'qualification', 'المؤهل الدراسي وبلد الإصدار', 'Education and country of issue', qualificationMessageAr, qualificationMessageEn, qualificationStatus, '/professions.html', 'مراجعة المؤهل في صفحة المهن ←', 'Review qualification on professions page ←');

    const experienceStatus = match.experienceStatus;
    const requiredExperience = Number.isFinite(profile?.experience_years) ? profile.experience_years : null;
    const displayProfession = displayProfessionValue(data.professionName, profile);
    const experienceMessageAr = experienceStatus === 'ready' ? `الخبرة بالمسمى المناسب ومدتها ${data.experienceYears ?? 0} سنة مكتملة، وهي لا تقل عن الحد الظاهر للمهنة.` : experienceStatus === 'missing' ? `الخبرة لا تحقق الشرط الحالي. يلزم أن يطابق المسمى «${data.professionName}» أو يكون مقبولًا رسميًا، وأن تكون المدة ${requiredExperience === null ? 'حسب سجل المهنة' : `${requiredExperience} سنوات مكتملة على الأقل`}.` : 'راجع مدة الخبرة ومطابقة المسمى ومصدر الختم مع الموظف المسؤول قبل اعتمادها.';
    const experienceMessageEn = experienceStatus === 'ready' ? `The experience uses the appropriate title and ${data.experienceYears ?? 0} completed years, meeting the visible profession minimum.` : experienceStatus === 'missing' ? `The experience does not meet the current requirement. The title must match “${displayProfession}” or be officially accepted, and the duration must be ${requiredExperience === null ? 'confirmed from the profession record' : `${requiredExperience} completed years or more`}.` : 'Review the duration, matching title and stamp source with the responsible staff member before relying on it.';
    addItem(items, 'experience', 'الخبرة ومدى مطابقة المسمى', 'Experience and title match', experienceMessageAr, experienceMessageEn, experienceStatus, '/professions.html', 'مراجعة الخبرة في صفحة المهن ←', 'Review experience on professions page ←');

    if (profile?.professional || shownForAccreditation.has(data.professionType)) {
      const accreditationStatus = statusFor(data.accreditation);
      addItem(items, 'accreditation', 'الاعتماد أو الفحص المهني', 'Professional verification or test', accreditationStatus === 'ready' ? 'الاعتماد أو الفحص المهني جاهز أو تم التقديم عليه حسب اختيارك.' : accreditationStatus === 'missing' ? 'الاعتماد أو الفحص المهني لم يكتمل.' : 'حالة الاعتماد أو الفحص المهني غير محسومة، ويجب التأكد من المهنة والجهة المطلوبة.', accreditationStatus === 'ready' ? 'Professional verification or testing is ready or has been started according to your selection.' : accreditationStatus === 'missing' ? 'Professional verification or testing is not complete.' : 'The status of professional verification or testing is not settled; confirm the profession and required authority.', accreditationStatus, '/professions.html', 'فتح الاعتماد في صفحة المهن ←', 'Open verification on professions page ←');
    }

    if (isEngineer(profile)) {
      const engineeringStatus = match.engineeringStatus || 'review';
      const messageAr = engineeringStatus === 'ready' ? 'مدة التخرج المدخلة أكثر من خمس سنوات وفق الفحص الإرشادي.' : engineeringStatus === 'missing' ? 'المهندس يحتاج تخرجًا منذ أكثر من خمس سنوات، إلا إذا انطبقت حالة الاستثناء لمواليد السعودية وأكدتها الجهة المختصة.' : 'مدة التخرج أو استثناء مواليد السعودية يحتاج مراجعة من الجهة المختصة.';
      const messageEn = engineeringStatus === 'ready' ? 'The entered time since graduation is more than five years according to this guidance check.' : engineeringStatus === 'missing' ? 'An engineer needs to have graduated more than five years ago unless a Saudi-born exception applies and is confirmed by the competent authority.' : 'The time since graduation or Saudi-born exception needs confirmation by the competent authority.';
      addItem(items, 'graduation', 'مدة التخرج الهندسي والاستثناء', 'Engineering graduation period and exception', messageAr, messageEn, engineeringStatus, '/professions.html', 'فتح متطلبات المهنة ←', 'Open profession requirements ←');
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
        meta.textContent = `${educationLabel(alternative.education)} · ${alternative.experience_years > 0 ? `${alternative.experience_years} ${tr('سنة خبرة على الأقل', 'year(s) of experience minimum')}` : tr('لا يظهر شرط خبرة', 'no experience requirement shown')}`;
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
    if (keys.has('consistency') || review.match.status !== 'ready') add('contact', 'مراجعة الموظف المسؤول', 'Responsible staff review', 'انسخ النتيجة أو افتح WhatsApp برسالة مختصرة دون بيانات جواز أو معلومات طبية، ليؤكد الموظف الحالة والأوراق.', 'Copy the result or open WhatsApp with a short message without passport or medical data so the responsible staff member can confirm the case and documents.', '#contact-help');
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
    const summaryAr = `راجعنا اختياراتك لحالة «${routeLabel(review.data.nationality)}» وفئة المهنة «${professionLabel(review.data.professionType)}»${nameAr}. النتيجة إرشادية: ${review.counts.ready} جاهز، ${review.counts.review} يحتاج مراجعة، و${review.counts.missing} يحتاج استكمالًا.`;
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

  ['nationality', 'professionType', 'professionName', 'experienceTitle', 'gender', 'qualificationLevel', 'experienceYears'].forEach((key) => {
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
