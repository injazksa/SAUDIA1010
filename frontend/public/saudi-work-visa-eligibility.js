(() => {
  'use strict';

  const form = document.getElementById('eligibilityForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const checkModeEl = $('checkMode');
  const modeHelp = $('modeHelp');
  const nationalityEl = $('nationality');
  const residencyField = $('residencyField');
  const residencyEl = $('jordanResidency');
  const residencyLabelEl = residencyField.querySelector('label');
  const residencyHintEl = residencyField.querySelector('small');
  const employmentDocumentsField = $('employmentDocumentsField');
  const employmentDocumentsEl = $('employmentDocuments');
  const syrianExceptionField = $('syrianExceptionField');
  const syrianExceptionEl = $('syrianException');
  const professionField = $('specificProfessionField');
  const professionEl = $('profession');
  const professionOptions = $('professionOptions');
  const experienceTitleField = $('experienceTitleField');
  const experienceTitleEl = $('experienceTitle');
  const engineeringFields = $('engineeringFields');
  const graduationYearsEl = $('graduationYears');
  const saudiBornEl = $('saudiBorn');
  const professionHint = $('professionHint');
  const investorField = $('investorField');
  const investorDocumentsEl = $('investorDocuments');
  const educationField = $('educationField');
  const educationEl = $('education');
  const experienceField = $('experienceField');
  const experienceEl = $('experience');
  const accreditationField = $('accreditationField');
  const accreditationEl = $('accreditation');
  const birthDateEl = $('birthDate');
  const ageAsOfEl = $('ageAsOf');
  const ageOutput = $('ageOutput');
  const result = $('eligibilityResult');
  const resultTitle = $('resultTitle');
  const resultSummary = $('resultSummary');
  const resultList = $('resultList');
  const recommendationsPanel = $('recommendationsPanel');
  const recommendationGrid = $('recommendationGrid');
  const documentsPanel = $('documentsPanel');
  const documentsTitle = $('documentsTitle');
  const documentsIntro = $('documentsIntro');
  const documentsList = $('documentsList');
  const documentsSourceNote = $('documentsSourceNote');
  const documentSourceFields = $('documentSourceFields');
  const qualificationSourceEl = $('qualificationSource');
  const experienceSourceEl = $('experienceSource');
  const professionLink = $('professionLink');
  const calculateAgeBtn = $('calculateAgeBtn');
  const printDocumentsBtn = $('printDocumentsBtn');
  const copyDocumentsBtn = $('copyDocumentsBtn');
  const printSheet = $('printSheet');
  const printTitle = $('printTitle');
  const printSubtitle = $('printSubtitle');
  const printContent = $('printContent');
  const tr = (ar, en) => window.SV_TRANSLATE?.t(ar, en) || ar;
  const english = () => window.SV_TRANSLATE?.isEnglish?.() === true;

  const NATIONALITIES = [
    'الأردن','السعودية','الإمارات العربية المتحدة','قطر','الكويت','البحرين','عُمان','اليمن','العراق','سوريا','لبنان','فلسطين','مصر','السودان','ليبيا','تونس','الجزائر','المغرب','موريتانيا','الصومال','جيبوتي','جزر القمر','إريتريا','إثيوبيا','جنوب السودان',
    'أفغانستان','ألبانيا','ألمانيا','أندورا','أنغولا','أنتيغوا وبربودا','أرمينيا','أستراليا','النمسا','أذربيجان','الباهاما','بنغلاديش','بربادوس','بيلاروسيا','بلجيكا','بليز','بنين','بوتان','بوليفيا','البوسنة والهرسك','بوتسوانا','البرازيل','بروناي','بلغاريا','بوركينا فاسو','بوروندي','كمبوديا','الكاميرون','كندا','الرأس الأخضر','جمهورية أفريقيا الوسطى','تشاد','تشيلي','الصين','كولومبيا','جمهورية الكونغو','جمهورية الكونغو الديمقراطية','كوستاريكا','ساحل العاج','كرواتيا','كوبا','قبرص','التشيك','الدنمارك','دومينيكا','جمهورية الدومينيكان','الإكوادور','السلفادور','غينيا الاستوائية','إستونيا','إسواتيني','فيجي','فنلندا','فرنسا','الغابون','غامبيا','جورجيا','غانا','اليونان','غرينادا','غواتيمالا','غينيا','غينيا بيساو','غيانا','هايتي','هندوراس','المجر','آيسلندا','الهند','إندونيسيا','إيران','أيرلندا','إيطاليا','جامايكا','اليابان','كازاخستان','كينيا','كيريباتي','كوريا الشمالية','كوريا الجنوبية','كوسوفو','قيرغيزستان','لاوس','لاتفيا','ليسوتو','ليبيريا','ليختنشتاين','ليتوانيا','لوكسمبورغ','مدغشقر','مالاوي','ماليزيا','جزر المالديف','مالي','مالطا','جزر مارشال','موريشيوس','المكسيك','ميكرونيزيا','مولدوفا','موناكو','منغوليا','الجبل الأسود','موزمبيق','ميانمار','ناميبيا','ناورو','نيبال','هولندا','نيوزيلندا','نيكاراغوا','النيجر','نيجيريا','مقدونيا الشمالية','النرويج','باكستان','بالاو','بنما','بابوا غينيا الجديدة','باراغواي','بيرو','الفلبين','بولندا','البرتغال','رومانيا','روسيا','رواندا','سانت كيتس ونيفيس','سانت لوسيا','سانت فنسنت والغرينادين','ساموا','سان مارينو','ساو تومي وبرينسيب','السنغال','صربيا','سيشل','سيراليون','سنغافورة','سلوفاكيا','سلوفينيا','جزر سليمان','جنوب أفريقيا','إسبانيا','سريلانكا','سورينام','السويد','سويسرا','طاجيكستان','تنزانيا','تايلاند','تيمور الشرقية','توجو','تونغا','ترينيداد وتوباغو','تركيا','تركمانستان','توفالو','أوغندا','أوكرانيا','المملكة المتحدة','الولايات المتحدة الأمريكية','أوروغواي','أوزبكستان','فانواتو','الفاتيكان','فنزويلا','فيتنام','ساموا الأمريكية','زامبيا','زيمبابوي'
  ];

  const educationRank = { none: 0, school: 1, secondary: 2, diploma: 2, bachelor: 3, higher: 4 };
  let professions = [];
  let selectedRecord = null;
  let previousNationality = '';
  let currentDocuments = [];
  let currentDocumentContext = {};

  function normalize(text) {
    return String(text || '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ةه]/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[ـ]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function recordName(record) {
    return record?.name_ar || record?.profession_name_ar || '';
  }

  function displayName(record) {
    const ar = typeof record === 'string' ? record : recordName(record);
    if (!english()) return ar;
    return (typeof record === 'object' && record?.name_en) || window.SV_TRANSLATE?.translateString?.(ar) || ar;
  }

  function requirementsText(record) {
    return (record?.requirements || []).join(' ');
  }

  function todayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
  }

  function daysInMonth(year, monthIndex) {
    return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  }

  function exactAge(birthValue, asOfValue) {
    const birth = parseDate(birthValue);
    const asOf = parseDate(asOfValue);
    const today = parseDate(todayISO());
    if (!birth || !asOf || !today || birth > asOf || asOf > today) return null;
    let years = asOf.getUTCFullYear() - birth.getUTCFullYear();
    let months = asOf.getUTCMonth() - birth.getUTCMonth();
    let days = asOf.getUTCDate() - birth.getUTCDate();
    if (days < 0) {
      months -= 1;
      const previousMonth = asOf.getUTCMonth() - 1;
      const previousYear = previousMonth < 0 ? asOf.getUTCFullYear() - 1 : asOf.getUTCFullYear();
      days += daysInMonth(previousYear, previousMonth < 0 ? 11 : previousMonth);
    }
    if (months < 0) { years -= 1; months += 12; }
    return { years, months, days, totalDays: Math.floor((asOf.getTime() - birth.getTime()) / 86400000) };
  }

  function ageText(age) {
    if (!age) return '';
    return english()
      ? `Your age is ${age.years} years, ${age.months} months and ${age.days} days (approximately ${age.totalDays.toLocaleString('en-US')} days).`
      : `عمرك ${age.years} سنة و${age.months} شهر و${age.days} يوم (نحو ${age.totalDays.toLocaleString('ar-JO')} يوم).`;
  }

  function isJordanian() { return normalize(nationalityEl.value).includes('اردن'); }
  function isSyrian() { return normalize(nationalityEl.value).includes('سوريا'); }
  function isOrdinarySchoolRole(record) { return ['العمال','الحرفيون'].includes(record?.category); }
  function isInvestorName(name) { return ['مدير عام','رئيس تنفيذي','رئيس مجلس إدارة'].some((item) => normalize(name) === normalize(item)); }
  function isInvestorProfession(name) { return isInvestorName(name); }
  function isEngineeringProfessionName(name) { return /مهندس|هندسه|هندسي/.test(normalize(name)); }
  function isMedicalProfessionName(name) { return /طبيب|دكتور|طبيبه|صيدلي|صيدله|ممرض|ممرضه|تمريض|مختبر طبي/.test(normalize(name)); }
  function titleMatches(record, value) {
    const entered = normalize(value);
    if (!entered || !record) return false;
    return [recordName(record), record?.name_en].some((name) => normalize(name) === entered);
  }

  function getProfile(record) {
    const name = recordName(record);
    const text = requirementsText(record);
    const normName = normalize(name);
    const investorRole = isInvestorName(name);
    const isGeneralManager = investorRole;
    const explicitEducation = /الشهادة الجامعية|جامعية|بكالوريوس|كشف العلامات/.test(text)
      ? 'university'
      : (/الثانوية|ثانوية/.test(text) ? 'secondary' : (/الصف العاشر|الشهادة المدرسية|شهادة الصف/.test(text) ? 'school' : null));
    const education = investorRole ? null : (explicitEducation || (['الاختصاصيون', 'المدراء'].includes(record?.category) ? 'university' : (record?.category === 'الفنيون' ? 'secondary' : (['العمال', 'الحرفيون'].includes(record?.category) ? 'school' : null))));
    const experience = investorRole ? 0 : (/خبرة[^.،]*سنتين|خبرة[^.،]*2/.test(text) ? 2 : (/خبرة/.test(text) ? 1 : 0));
    const accreditation = investorRole ? false : /الاعتماد المهني|فحص مهني|QVP/.test(text);
    const executiveDocuments = investorRole || /رخصة الاستثمار|السجل التجاري السعودي/.test(text);
    return {
      name,
      category: record?.category || 'غير مصنف',
      gender: record?.gender || '',
      isGeneralManager,
      education,
      experience,
      accreditation,
      executiveDocuments,
      minAge: 21,
      maxAge: isGeneralManager ? null : 60
    };
  }

  function hairStylistName(value) {
    const query = normalize(value);
    return /مصفف\s*شعر|مصففه\s*شعر/.test(query);
  }

  function findProfession(value) {
    const query = normalize(value);
    if (!query) return null;
    if (hairStylistName(value)) {
      const barber = professions.find((record) => normalize(recordName(record)) === normalize('حلاق')) || professions.find((record) => record?.gender === 'أنثى');
      if (barber) return { ...barber, name_ar: value, profession_name_ar: value, gender: 'أنثى', code: '---', profession_code: '---', slug: 'مصفف-شعر' };
    }
    const exact = professions.find((record) => [recordName(record), record?.name_en].some((value) => normalize(value) === query));
    if (exact) return exact;
    if (query === normalize('منسق منتجات')) {
      const quality = professions.find((record) => normalize(recordName(record)).includes(normalize('مراقب جودة')))
        || professions.find((record) => normalize(recordName(record)).includes(normalize('مساعد إداري')));
      if (quality) return { ...quality, name_ar: 'منسق منتجات', profession_name_ar: 'منسق منتجات', slug: 'منسق-منتجات' };
    }
    return null;
  }

  function populateNationalities() {
    [...new Set(NATIONALITIES)].sort((a, b) => a.localeCompare(b, 'ar')).forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = english() ? (window.SV_TRANSLATE?.translateString?.(name) || name) : name;
      nationalityEl.appendChild(option);
    });
  }

  function populateProfessions() {
    const names = [...new Set(professions.map(recordName).filter(Boolean))];
    if (!names.some((name) => normalize(name) === normalize('منسق منتجات'))) names.push('منسق منتجات');
    ['مصفف شعر', 'مصففة شعر'].forEach((name) => { if (!names.some((item) => normalize(item) === normalize(name))) names.push(name); });
    names.sort((a, b) => a.localeCompare(b, 'ar')).forEach((name) => {
      const option = document.createElement('option');
      const record = professions.find((item) => recordName(item) === name);
      option.value = name;
      option.textContent = displayName(record || name);
      professionOptions.appendChild(option);
    });
  }

  function syncResidencyFields() {
    const shouldAsk = Boolean(nationalityEl.value && !isJordanian());
    const syrian = shouldAsk && isSyrian();
    residencyField.hidden = !shouldAsk;
    employmentDocumentsField.hidden = !shouldAsk;
    if (syrian) {
      residencyLabelEl.textContent = tr('3. اختر حالة تقديمك كسوري في الأردن', '3. Choose your Syrian application status in Jordan');
      residencyHintEl.textContent = tr('اختر مقيمًا بإقامة سارية أو غير مقيم لتظهر لك خانة الاستثناء الخاصة بالسوري فقط.', 'Choose resident with valid residence or non-resident to show the Syrian-specific exception field.');
      residencyEl.options[1].textContent = tr('مقيم في الأردن بإقامة سارية', 'Resident in Jordan with valid residence');
      residencyEl.options[2].textContent = tr('غير مقيم في الأردن — أحتاج مسار الاستثناء', 'Not resident in Jordan — I need the exception route');
    } else {
      residencyLabelEl.textContent = tr('3. هل لديك إقامة سارية في الأردن؟', '3. Do you have valid residence in Jordan?');
      residencyHintEl.textContent = tr('هذا السؤال يظهر لغير الأردني عند اختيار الأردن/عمّان كجهة للتقديم.', 'This question appears for non-Jordanian applicants applying from Amman, Jordan.');
      residencyEl.options[0].textContent = tr('اختر الإجابة', 'Choose an answer');
      residencyEl.options[1].textContent = tr('نعم، لدي إقامة سارية', 'Yes, I have valid residence');
      residencyEl.options[2].textContent = tr('لا، لا توجد إقامة سارية', 'No, I do not have valid residence');
    }
    residencyEl.required = shouldAsk;
    employmentDocumentsEl.required = shouldAsk;
    if (!shouldAsk) {
      residencyEl.value = '';
      employmentDocumentsEl.value = '';
      syrianExceptionEl.value = '';
      syrianExceptionField.hidden = true;
      return;
    }
    const showException = isSyrian() && residencyEl.value === 'no';
    syrianExceptionField.hidden = !showException;
    if (!showException) syrianExceptionEl.value = '';
  }

  function syncModeFields() {
    const recommendationMode = checkModeEl.value === 'recommend';
    documentsPanel.hidden = true;
    recommendationsPanel.hidden = true;
    recommendationGrid.innerHTML = '';
    professionField.hidden = recommendationMode;
    experienceTitleField.hidden = true;
    experienceTitleEl.required = false;
    engineeringFields.hidden = true;
    graduationYearsEl.required = false;
    saudiBornEl.required = false;
    if (recommendationMode) {
      experienceTitleEl.value = '';
      graduationYearsEl.value = '';
      saudiBornEl.value = '';
    }
    professionEl.required = !recommendationMode;
    educationEl.required = recommendationMode;
    if (recommendationMode) {
      modeHelp.textContent = tr('اختر مؤهلك وخبرتك، وسنعرض لك المهن التي تطابق البيانات الموجودة في سجلات الموقع.', 'Choose your education and experience and we will show professions that match the site records.');
      educationField.hidden = false;
      experienceField.hidden = false;
      accreditationField.hidden = false;
      investorField.hidden = true;
      investorDocumentsEl.required = false;
    } else {
      modeHelp.textContent = tr('اختر المهنة من بيانات الموقع، ثم نعرض لك المؤهل والخبرة والاعتماد والأوراق المرتبطة بها.', 'Choose a profession from the site data and we will show its education, experience, verification and document requirements.');
      investorField.hidden = true;
      investorDocumentsEl.required = false;
      updateProfessionFields();
    }
  }

  function updateProfessionFields() {
    selectedRecord = findProfession(professionEl.value);
    if (checkModeEl.value === 'recommend') return;
    if (!selectedRecord) {
      educationField.hidden = false;
      experienceField.hidden = false;
      accreditationField.hidden = false;
      investorField.hidden = true;
      investorDocumentsEl.required = false;
      experienceTitleField.hidden = true;
      experienceTitleEl.required = false;
      experienceTitleEl.value = '';
      engineeringFields.hidden = true;
      graduationYearsEl.required = false;
      saudiBornEl.required = false;
      graduationYearsEl.value = '';
      saudiBornEl.value = '';
      professionHint.textContent = tr('اكتب المسمى الأقرب لما هو مكتوب في عقد العمل أو التأشيرة، ثم اختره من الاقتراحات.', 'Type the title closest to the wording on your employment document or visa, then choose a suggestion.');
      return;
    }
    const profile = getProfile(selectedRecord);
    const executive = profile.executiveDocuments;
    investorField.hidden = !executive;
    investorDocumentsEl.required = executive;
    if (!executive) investorDocumentsEl.value = '';
    educationField.hidden = executive || !profile.education;
    experienceField.hidden = executive || !profile.experience;
    accreditationField.hidden = executive || !profile.accreditation;
    experienceTitleField.hidden = executive || !profile.experience;
    experienceTitleEl.required = !executive && Boolean(profile.experience);
    if (executive || !profile.experience) experienceTitleEl.value = '';
    const engineering = !executive && isEngineeringProfessionName(profile.name);
    engineeringFields.hidden = !engineering;
    graduationYearsEl.required = engineering;
    saudiBornEl.required = engineering;
    if (!engineering) {
      graduationYearsEl.value = '';
      saudiBornEl.value = '';
    }
    if (executive) {
      educationEl.value = '';
      experienceEl.value = '';
      accreditationEl.value = '';
      experienceTitleEl.value = '';
      graduationYearsEl.value = '';
      saudiBornEl.value = '';
      educationEl.required = false;
      experienceEl.required = false;
      accreditationEl.required = false;
    }
    professionHint.textContent = profile.executiveDocuments
      ? tr('هذه المهنة لها مستندات إدارية خاصة؛ ستظهر في نتيجة الفحص.', 'This profession has special administrative documents, which will appear in the result.')
      : tr('تم العثور على المسمى في بيانات المهن، وسيُقارن الفحص بمتطلباته.', 'This title was found in the profession data and will be checked against its requirements.');
  }

  function showAgeCalculation() {
    const age = exactAge(birthDateEl.value, ageAsOfEl.value || todayISO());
    if (!birthDateEl.value) { ageOutput.textContent = tr('أدخل تاريخ الميلاد فقط إذا أردت حساب العمر بدقة.', 'Enter your date of birth only if you want to calculate your exact age.'); return null; }
    if (!age) { ageOutput.textContent = tr('يرجى اختيار تاريخ صحيح لا يقع بعد تاريخ الحساب أو تاريخ اليوم.', 'Choose a valid date that is not after the calculation date or today.'); return null; }
    ageOutput.textContent = english() ? `${ageText(age)} Calculation date: ${ageAsOfEl.value || todayISO()}.` : `${ageText(age)} تاريخ الحساب: ${ageAsOfEl.value || todayISO()}.`;
    return age;
  }

  function addIssue(list, text) { if (!list.includes(text)) list.push(text); }
  function compareEducation(required, selected) { return !required || ((educationRank[selected] || 0) >= (educationRank[required] || 0)); }
  function professionQuery(name) {
    const target = normalize(name) === normalize('منسق منتجات') ? 'مراقب جودة' : name;
    return `/professions.html?search=${encodeURIComponent(target)}`;
  }

  function sourceLabel(source) {
    const ar = ({ jordan: 'الأردن', syria: 'سوريا', saudi: 'السعودية', other: 'دولة أخرى' })[source] || 'المصدر المحدد';
    return tr(ar, ({ jordan: 'Jordan', syria: 'Syria', saudi: 'Saudi Arabia', other: 'Another country' })[source] || 'Selected source');
  }

  function educationDocument(profile, source, syrian) {
    const university = profile.education === 'university';
    const specialist = university && (isEngineeringProfessionName(profile.name) || isMedicalProfessionName(profile.name));
    const arLabel = university ? (specialist ? 'أصل الشهادة الجامعية مع صور عنها وكشف العلامات' : 'صورة عن الشهادة الجامعية وكشف العلامات') : profile.education === 'secondary' ? 'شهادة الثانوية العامة الناجحة' : 'الشهادة المدرسية المطلوبة للمهنة';
    const enLabel = university ? (specialist ? 'Original university certificate with copies and transcript' : 'Copy of university certificate and transcript') : profile.education === 'secondary' ? 'Pass certificate for general secondary education' : 'School certificate required for the profession';
    const label = tr(arLabel, enLabel);
    const formNote = university
      ? (specialist ? tr('للمهن الهندسية والطبية: يجب إحضار أصل الشهادة الجامعية مع صور عنها، مهما كان بلد الإصدار.', 'For engineering and medical professions: bring the original university certificate with copies, regardless of the country of issue.') : tr('للمهن غير الهندسية والطبية: تُطلب صورة عن المؤهل الجامعي، مهما كان بلد الإصدار.', 'For non-engineering and non-medical professions: a copy of the university qualification is required, regardless of the country of issue.'))
      : '';
    let stampNote;
    if (source === 'jordan') stampNote = tr('صادرة عن الجهة التعليمية المختصة في الأردن، وتُجهز أختامها حسب الأصول من الجهات الأردنية المطلوبة.', 'Issued by the competent educational authority in Jordan, with the stamps required by the relevant Jordanian authorities.');
    else if (source === 'syria') stampNote = tr('تُختم حسب الأصول من الجهة المصدرة، ثم الخارجية السورية، ثم الجهات الأردنية المطلوبة عند استخدامها في عمّان.', 'Properly stamped by the issuing authority, followed by the Syrian Ministry of Foreign Affairs and the Jordanian authorities required for use in Amman.');
    else if (source === 'saudi') stampNote = tr('تُختم حسب الأصول من الجهة التعليمية المختصة ووزارة الخارجية السعودية عند طلب التصديق.', 'Properly stamped by the competent educational authority and the Saudi Ministry of Foreign Affairs when attestation is required.');
    else stampNote = tr('تُصدق من الجهة المصدرة وخارجية بلد الإصدار وسفارة الدولة في الأردن والخارجية الأردنية حسب نوع المستند.', 'Attested by the issuing authority, the foreign ministry of the country of issue, the country’s embassy in Jordan and the Jordanian Ministry of Foreign Affairs, according to the document type.');
    return { title: label, note: [formNote, stampNote].filter(Boolean).join(' ') };
  }

  function experienceDocument(profile, source) {
    if (!profile.experience) return null;
    const arDuration = profile.experience === 2 ? 'خبرة لمدة سنتين بنفس مسمى التأشيرة' : 'خبرة لمدة سنة واحدة بنفس مسمى التأشيرة';
    const enDuration = profile.experience === 2 ? 'At least two years of experience in the same visa title' : 'One year of experience in the same visa title';
    const duration = tr(arDuration, enDuration);
    const notes = english() ? {
      jordan: `${duration}. The original experience letter should be stamped by the Jordanian labour office and the Jordanian Ministry of Foreign Affairs.`,
      syria: `${duration}. The original experience letter should be properly stamped by the Syrian Ministry of Foreign Affairs, the Jordanian Embassy in Syria and the Jordanian Ministry of Foreign Affairs in Amman.`,
      saudi: `${duration}. A copy of the Saudi experience letter is accepted when it carries the required Saudi stamps from the issuing authority, the Saudi Chamber of Commerce and the Saudi Ministry of Foreign Affairs.`,
      other: `${duration}. The original experience letter should be attested by the issuing authority, the foreign ministry of the country of issue, the country’s embassy in Jordan and the Jordanian Ministry of Foreign Affairs as required.`
    } : {
      jordan: `${duration}، أصل الخبرة مختوم من مكتب العمل في الأردن ووزارة الخارجية الأردنية.`,
      syria: `${duration}، أصل الخبرة مختوم حسب الأصول من الخارجية السورية، ثم سفارة الأردن في سوريا، ثم وزارة الخارجية الأردنية في عمّان.`,
      saudi: `${duration}، تُقبل صورة عن الخبرة السعودية إذا كانت مختومة حسب الأصول من الجهة المصدرة والغرفة التجارية السعودية ووزارة الخارجية السعودية.`,
      other: `${duration}، أصل الخبرة مصدق من الجهة المصدرة وخارجية بلد الإصدار وسفارة الدولة في الأردن والخارجية الأردنية حسب المطلوب.`
    };
    return { title: duration, note: notes[source] || notes.other };
  }

  function buildDocuments(record, nationality, qualificationSource, experienceSource) {
    const profile = getProfile(record);
    const raw = requirementsText(record);
    const syrian = normalize(nationality).includes('سوريا');
    const isJordanianApplicant = normalize(nationality).includes('اردن');
    const residency = residencyEl.value || '';
    const nonResident = residency === 'no';
    const female = profile.gender === 'أنثى' || hairStylistName(profile.name);
    const documents = [];
    const add = (title, note) => documents.push({ title, note });

    if (syrian && nonResident) {
      add(tr('لا حكم عليه من سوريا', 'No-criminal-record certificate from Syria'), tr('وثيقة أصلية صادرة من سوريا ومختومة حسب الأصول من الخارجية السورية، ثم سفارة الأردن في سوريا، ثم وزارة الخارجية الأردنية في عمّان.', 'Original document issued in Syria and properly stamped by the Syrian Ministry of Foreign Affairs, followed by the Jordanian Embassy in Syria and the Jordanian Ministry of Foreign Affairs in Amman.'));
    } else if (!isJordanianApplicant && nonResident) {
      add(tr('حسن السيرة والسلوك من بلد الإصدار', 'Good-conduct certificate from the country of issue'), tr('تُجهز حسب جهة الإصدار، مع العلم أن الإقامة الأردنية السارية شرط إجباري للتقديم من الأردن.', 'Prepare it according to the issuing authority; valid Jordanian residence is mandatory when applying from Jordan.'));
    } else {
      add(tr('حسن السيرة والسلوك', 'Good-conduct certificate'), isJordanianApplicant
        ? tr('أصل المستند مختوم حسب الأصول من الجهة المختصة، مع ختم وزارة الخارجية الأردنية عند التقديم من الأردن.', 'The original document should be properly stamped by the competent authority, with the Jordanian Ministry of Foreign Affairs stamp when applying from Jordan.')
        : tr('لغير الأردني المقيم في الأردن: أصل حسن السيرة والسلوك من المخابرات العامة الأردنية بالحضور الشخصي أمام الجهة المختصة، وليس من خلال تطبيق سند، مع الإقامة الأردنية السارية.', 'For a non-Jordanian resident in Jordan: bring the original good-conduct certificate in person from the Jordanian General Intelligence Department, not through the Sanad app, together with valid Jordanian residence.'));
    }

    // المسار النسائي يستبدل مشروحات الجيش، ولا يتطلب من الزائرة اختيار الجنس يدويًا إذا كان المسمى نسائيًا.
    if (female) {
      add(tr('عدم ممانعة من ولي الأمر أو الزوج حسب الحالة', 'No-objection document from the guardian or husband, as applicable'), tr('للمتزوجة: شهادة زواج وعدم ممانعة الزوج وصورة جوازه. للعزباء: عدم ممانعة ولي الأمر وقيد فردي وصورة جوازه.', 'For a married applicant: marriage certificate, the husband’s no-objection document and a copy of his passport. For an unmarried applicant: the guardian’s no-objection document, an individual civil record and a copy of the guardian’s passport.'));
    } else if (isJordanianApplicant && /الوثائق العسكرية|مشروحات/.test(raw)) {
      add(tr('مشروحات الجيش والوثائق العسكرية', 'Military-status and military documents'), tr('أصل المشروحات والوثائق المطلوبة، مختومة حسب الأصول من الجهات المختصة ثم وزارة الخارجية الأردنية.', 'Original military-status documents, properly stamped by the relevant authorities and then by the Jordanian Ministry of Foreign Affairs.'));
    }

    if (profile.education) {
      const item = educationDocument(profile, qualificationSource, syrian);
      add(item.title, item.note);
    }

    if (/الفحص الطبي|الفحص الطبي والبصمة/.test(raw) || profile.education || profile.experience) add(tr('الفحص الطبي والبصمة', 'Medical examination and biometrics'), tr('يُحددان من خلال مكتبنا في عمّان لدى المراكز المعتمدة، ويُحضر المتقدم جواز السفر والصور المطلوبة حسب نوع المعاملة.', 'These are arranged through our office in Amman at approved centres. The applicant should bring the passport and photographs required for the transaction.'));

    const experience = experienceDocument(profile, experienceSource);
    if (experience) add(experience.title, experience.note);

    if (profile.accreditation) add(tr('الاعتماد أو التحقق المهني QVP', 'QVP professional verification or assessment'), tr('الحصول على الاعتماد أو اجتياز التحقق المهني QVP إذا كان مطلوباً للمسمى المختار.', 'Obtain the required professional verification or pass the QVP assessment if it applies to the selected title.'));
    if (/عقد عمل|خطاب إطلاع/.test(raw) || profile.experience || profile.education) {
      add(tr('عقد العمل', 'Employment contract'), tr('صورة عن عقد العمل الصادر من الشركة السعودية، مختومة من الغرفة التجارية السعودية ووزارة الخارجية السعودية.', 'A copy of the employment contract issued by the Saudi company, stamped by the Saudi Chamber of Commerce and the Saudi Ministry of Foreign Affairs.'));
      add(tr('خطاب الاطلاع', 'Authorization letter'), tr('صورة عن خطاب الاطلاع الصادر من الشركة السعودية، مختومة من الغرفة التجارية السعودية ووزارة الخارجية السعودية.', 'A copy of the authorization letter issued by the Saudi company, stamped by the Saudi Chamber of Commerce and the Saudi Ministry of Foreign Affairs.'));
    }
    add(tr('التفويض الإلكتروني', 'Electronic authorization'), tr('عمل تفويض إلكتروني إلى مكتب تأشيرات السعودية في الأردن لإنجاز المعاملة.', 'Issue an electronic authorization to the Saudi visa office in Jordan to process the transaction.'));
    add(tr('شرط العمر', 'Age requirement'), profile.isGeneralManager ? tr('إتمام 21 سنة أو أكثر للمدير العام، ولا يوجد حد أعلى للعمر ضمن هذا الفحص الأولي.', 'The General Manager must be at least 21 years old; no upper age limit is applied in this check.') : tr('إتمام 21 سنة أو أكثر، وأن يكون العمر أقل من 60 سنة للمهن العادية.', 'The applicant must be at least 21 and under 60 for ordinary professions.'));
    if (/مطعوم السحايا/.test(raw) || profile.education || profile.experience) add(tr('شهادة مطعوم السحايا', 'Meningitis vaccination certificate'), tr('إحضار شهادة مطعوم السحايا حسب متطلبات المعاملة.', 'Provide a meningitis vaccination certificate if required for the transaction.'));

    if (profile.executiveDocuments) add(tr('مستندات المستثمر أو المنشأة السعودية', 'Saudi investor or establishment documents'), tr('رخصة الاستثمار السعودية والسجل التجاري السعودي، مع إثبات أن اسم المتقدم مثبت في السجل التجاري، وتكون الأختام أصلية حسب الجهة المصدرة.', 'Saudi investment licence and Saudi commercial registration, with proof that the applicant’s name is listed in the commercial registration. Stamps must be original and issued by the relevant authority.'));

    // الإضافات الوطنية تأتي في نهاية قائمة أوراق المهنة، ولا تعيد ترتيب أي بند سابق.
    if (!isJordanianApplicant) {
      if (syrian) {
        add(tr('قيد عائلي أو بيان فردي سوري', 'Syrian family record or individual civil record'), tr('مصدق حسب الأصول من الجهات المختصة.', 'Properly attested by the competent authorities.'));
        if (isEngineeringProfessionName(profile.name)) add(tr('عضوية وتسجيل مهني من النقابة الهندسية السورية', 'Membership and professional registration with the Syrian engineering syndicate'), tr('إثبات العضوية أو التسجيل المهني من بلد الإصدار، بالإضافة إلى متطلبات الهيئة السعودية للمهندسين عند انطباقها.', 'Provide proof of membership or professional registration from the country of issue, in addition to Saudi Council of Engineers requirements when applicable.'));
        if (isMedicalProfessionName(profile.name)) add(tr('ترخيص من سوريا ووثيقة من نقابة الأطباء وSyrian Board', 'Syrian licence, medical syndicate document and Syrian Board'), tr('تُراجع وتُصدق حسب الأصول، وتبقى فوق متطلبات الطبيب الأساسية.', 'These should be reviewed and attested as required, in addition to the core requirements for the medical profession.'));
      }
      if (residency === 'yes') add(tr('بطاقة الإقامة الأردنية', 'Jordanian residence card'), tr(`إحضار بطاقة إقامة أردنية سارية المفعول للجنسية ${nationality}.`, `Provide a valid Jordanian residence card for the ${nationality} applicant.`));
    }
    return documents;
  }

  function sourceNote(nationality, qualificationSource, experienceSource) {
    const normalizedNationality = normalize(nationality);
    const nonResident = residencyEl.value === 'no';
    if (!normalizedNationality.includes('سوريا') && !normalizedNationality.includes('اردن') && nonResident) {
      return tr(`لغير الأردني غير المقيم: الإقامة الأردنية السارية شرط إجباري للتقديم من الأردن للجنسية ${nationality}. لا تُعامل هذه الملاحظة كوثيقة منفصلة؛ يجب تأكيد جهة التقديم قبل تجهيز الأوراق.`, `For a non-Jordanian applicant who is not resident in Jordan: valid Jordanian residence is mandatory when applying from Jordan for ${nationality}. This is a route warning, not a separate document; confirm the application route before preparing documents.`);
    }
    if (normalizedNationality.includes('سوريا')) {
      const nonResident = residencyEl.value === 'no';
      return nonResident
        ? tr('للمتقدم السوري غير المقيم في الأردن: يظهر «لا حكم عليه» من سوريا مع التصديقات المحددة. يجب تأكيد المتطلبات الحالية مع المكتب قبل التقديم.', 'For a Syrian applicant who is not resident in Jordan: a Syrian no-criminal-record certificate appears with the specified attestations. Confirm the current requirements with the office before applying.')
        : tr('للمتقدم السوري المقيم في الأردن: يظهر حسن السيرة والسلوك من الأردن، وتبقى بقية أوراق المهنة كما هي. يجب تأكيد القائمة النهائية مع المكتب.', 'For a Syrian applicant resident in Jordan: the Jordanian good-conduct certificate appears, while the profession documents remain unchanged. Confirm the final list with the office.');
    }
    return english() ? `Education source: ${sourceLabel(qualificationSource)}. Experience source: ${sourceLabel(experienceSource)}. Documents requiring attestation should carry original stamps; an ordinary copy is not enough for final attestation.` : `مصدر المؤهل المختار: ${sourceLabel(qualificationSource)}. مصدر الخبرة المختار: ${sourceLabel(experienceSource)}. المستندات التي تحتاج تصديقاً تُجهز بأصل الختم، ولا تكفي الصورة للتصديق النهائي.`;
  }

  function renderDocuments(record) {
    if (!record) return;
    selectedRecord = record;
    const nationality = nationalityEl.value;
    const qualificationSource = qualificationSourceEl.value || (isSyrian() ? 'syria' : 'jordan');
    const experienceSource = experienceSourceEl.value || (isSyrian() ? 'syria' : 'jordan');
    qualificationSourceEl.value = qualificationSource;
    experienceSourceEl.value = experienceSource;
    currentDocuments = buildDocuments(record, nationality, qualificationSource, experienceSource);
    currentDocumentContext = { record, nationality, qualificationSource, experienceSource };
    documentsTitle.textContent = english() ? `Required documents for ${displayName(record)}` : `الأوراق المطلوبة لمهنة ${recordName(record)}`;
    documentsIntro.textContent = isSyrian()
      ? tr('هذه قائمة إرشادية للمهنة في الحالة السورية. تواصل مع المكتب لتأكيد القائمة النهائية قبل تجهيز الأصول.', 'This is a guidance list for the profession in the Syrian case. Contact the office to confirm the final list before preparing originals.')
      : tr('هذه قائمة أولية مرتبطة بسجل المهنة المختار. راجع مصدر كل مستند قبل التصديق أو التقديم.', 'This guidance list is linked to the selected profession record. Review the source of each document before attestation or submission.');
    documentsList.innerHTML = '';
    currentDocuments.forEach((doc) => {
      const item = document.createElement('div');
      item.className = 'sv-doc-item';
      item.innerHTML = `<div><strong>${doc.title}</strong><span>${doc.note}</span></div>`;
      documentsList.appendChild(item);
    });
    documentsSourceNote.textContent = sourceNote(nationality, qualificationSource, experienceSource);
    documentSourceFields.hidden = !(getProfile(record).education || getProfile(record).experience);
    professionLink.href = professionQuery(recordName(record));
    documentsPanel.hidden = false;
  }

  function renderResult(state, title, summary, issues = [], completed = [], review = [], nextSteps = [], optionalAgeText = '') {
    result.dataset.state = state;
    result.hidden = false;
    resultTitle.textContent = title;
    resultSummary.textContent = summary;
    resultList.innerHTML = '';
    resultList.hidden = true;

    const requiredGroup = $('requiredGroup');
    const reviewGroup = $('reviewGroup');
    const completeGroup = $('completeGroup');
    const guide = $('resultGuide');
    const fillTextList = (list, values) => {
      list.replaceChildren();
      values.forEach((value) => {
        const li = document.createElement('li');
        li.textContent = value;
        list.appendChild(li);
      });
    };
    fillTextList($('requiredList'), issues);
    fillTextList($('reviewList'), review);
    fillTextList($('completeList'), completed);
    requiredGroup.hidden = issues.length === 0;
    reviewGroup.hidden = review.length === 0;
    completeGroup.hidden = completed.length === 0;
    guide.hidden = !(issues.length || review.length || completed.length);
    requiredGroup.querySelector('h4').textContent = tr('يجب استكماله قبل المتابعة', 'Complete before continuing');
    reviewGroup.querySelector('h4').textContent = tr('يحتاج مراجعة أو تأكيدًا', 'Needs review or confirmation');
    completeGroup.querySelector('h4').textContent = tr('تم اجتيازه في هذا الفحص', 'Passed in this check');

    const optionalAgeNote = $('optionalAgeNote');
    optionalAgeNote.textContent = optionalAgeText;
    optionalAgeNote.hidden = !optionalAgeText;
    const nextStepsBox = $('resultNextSteps');
    const nextStepsList = $('nextStepsList');
    nextStepsList.replaceChildren();
    nextSteps.forEach((step) => {
      const li = document.createElement('li');
      if (typeof step === 'string') li.textContent = step;
      else {
        const link = document.createElement('a');
        link.href = step.href;
        link.textContent = step.label;
        li.appendChild(link);
      }
      nextStepsList.appendChild(li);
    });
    nextStepsBox.querySelector('h4').textContent = tr('ماذا تفعل الآن؟', 'What to do next');
    nextStepsBox.hidden = nextSteps.length === 0;

    result.classList.add('is-visible');
    result.focus({ preventScroll: false });
  }

  function ageEligible(profile, age) {
    if (!age) return true;
    if (age.years < profile.minAge) return false;
    return profile.maxAge === null || age.years < profile.maxAge;
  }

  function residencyIssues(issues) {
    if (!nationalityEl.value) { addIssue(issues, tr('اختر الجنسية أولاً.', 'Choose your nationality first.')); return; }
    if (!isJordanian()) {
      if (residencyEl.value === 'no' && isSyrian()) {
        if (syrianExceptionEl.value !== 'yes') addIssue(issues, tr('للاستثناء السوري من شرط الإقامة، يلزم تأكيد المستند أو خطاب الاطلاع المطلوب ومراجعته مع المكتب.', 'For the Syrian residence exception, the required document or authorization letter must be confirmed and reviewed with the office.'));
      } else if (residencyEl.value !== 'yes') {
        addIssue(issues, tr('عند التقديم من الأردن، يحتاج غير الأردني إلى إقامة أردنية سارية في الفحص الأولي.', 'When applying from Jordan, a non-Jordanian applicant generally needs valid Jordanian residence for this check.'));
      }
      if (employmentDocumentsEl.value !== 'yes') addIssue(issues, tr('لغير الأردني: يجب تأكيد توفر عقد العمل وخطاب الاطلاع قبل متابعة الفحص.', 'For non-Jordanian applicants: confirm that the employment contract and authorization letter are available before continuing the check.'));
    }
  }

  function recommendationMatches(record, selectedEducation, selectedExperience, age, accreditationAnswer, nationality) {
    const profile = getProfile(record);
    if (normalize(nationality).includes('سوريا') && record.category === 'العمال') return false;
    if (normalize(recordName(record)) === normalize('مستثمر')) return false;
    if (profile.executiveDocuments) return false;
    if (!profile.education || !compareEducation(profile.education, selectedEducation)) return false;
    if (age && !ageEligible(profile, age)) return false;
    if (profile.experience === 2 && !['2', 'more2'].includes(selectedExperience)) return false;
    if (profile.experience === 1 && !['1', '2', 'more2'].includes(selectedExperience)) return false;
    if (profile.accreditation && accreditationAnswer === 'no') return false;
    return true;
  }

  function renderRecommendations(records) {
    recommendationGrid.innerHTML = '';
    records.slice(0, 18).forEach((record) => {
      const profile = getProfile(record);
      const card = document.createElement('article');
      card.className = 'sv-recommendation-card';
        const educationText = english() ? (profile.education === 'university' ? 'University certificate' : profile.education === 'secondary' ? 'General secondary certificate' : 'School certificate') : (profile.education === 'university' ? 'شهادة جامعية' : profile.education === 'secondary' ? 'ثانوية عامة' : 'شهادة مدرسية');
      const expText = english() ? (profile.experience === 2 ? 'Two years’ experience' : profile.experience === 1 ? 'One year’s experience' : 'According to the record') : (profile.experience === 2 ? 'خبرة سنتين' : profile.experience === 1 ? 'خبرة سنة' : 'حسب السجل');
      const qvp = profile.accreditation ? (english() ? ' · QVP' : ' · QVP') : '';
      card.innerHTML = `<h4>${displayName(record)}</h4><p>${educationText} · ${expText}${qvp}</p><button class="sv-btn sv-btn-secondary" type="button">${english() ? 'View documents and print' : 'عرض الأوراق والطباعة'}</button>`;
      card.querySelector('button').addEventListener('click', () => {
        checkModeEl.value = 'profession';
        syncModeFields();
        professionEl.value = recordName(record);
        updateProfessionFields();
        renderDocuments(record);
        documentsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      recommendationGrid.appendChild(card);
    });
    recommendationsPanel.hidden = records.length === 0;
    if (!records.length) {
      const empty = document.createElement('p');
      empty.textContent = tr('لم نجد مهنة تطابق كل البيانات المدخلة. جرّب مؤهلاً أعلى أو راجع المكتب لاختيار مسار مناسب.', 'No profession matched all of the details entered. Try a higher qualification or contact the office to review another pathway.');
      recommendationGrid.appendChild(empty);
    }
  }

  function runRecommendation(age, cautions) {
    const selectedEducation = educationEl.value;
    const selectedExperience = experienceEl.value;
    const accreditationAnswer = accreditationEl.value;
    const noUniversity = ['none', 'school', 'secondary', 'diploma'].includes(selectedEducation);
    const investorReady = noUniversity && investorDocumentsEl.value === 'yes';
    let records = professions.filter((record) => recommendationMatches(record, selectedEducation, selectedExperience, age, accreditationAnswer, nationalityEl.value));
    if (investorReady) {
      const investorRecords = professions.filter((record) => {
        if (!isInvestorProfession(recordName(record)) || (normalize(nationalityEl.value).includes('سوريا') && record.category === 'العمال')) return false;
        return !age || ageEligible(getProfile(record), age);
      });
      records = investorRecords;
      addIssue(cautions, tr('لديك مسار إضافي للمستثمر؛ يجب أن يكون اسمك مثبتاً في السجل التجاري السعودي وأن تتوفر رخصة الاستثمار السعودية.', 'An additional investor pathway may apply. Your name must be listed in the Saudi commercial registration and a Saudi investment licence must be available.'));
    }
    if (!investorReady && !['bachelor', 'higher'].includes(selectedEducation)) {
      records = records.filter((record) => getProfile(record).education !== 'university');
    }
    const unique = [];
    const seen = new Set();
    records.forEach((record) => {
      const key = normalize(recordName(record));
      if (!seen.has(key)) { seen.add(key); unique.push(record); }
    });
    renderRecommendations(unique);
    return unique;
  }

  function validateEligibility(event) {
    if (event) event.preventDefault();
    syncResidencyFields();
    syncModeFields();
    selectedRecord = findProfession(professionEl.value);
    const issues = [];
    const cautions = [];
    const completed = [];
    const ageOptionalText = birthDateEl.value ? '' : tr('حساب العمر اختياري؛ ترك تاريخ الميلاد فارغًا لا يُعد نقصًا في هذا الفحص.', 'The age check is optional; leaving the date of birth blank is not treated as a missing requirement.');
    residencyIssues(issues);
    const age = birthDateEl.value ? showAgeCalculation() : null;
    if (birthDateEl.value && !age) addIssue(issues, tr('تحقق من تاريخ الميلاد وتاريخ الحساب قبل متابعة الفحص.', 'Check the date of birth and calculation date before continuing.'));

    if (nationalityEl.value) {
      if (isJordanian()) completed.push(tr('الجنسية الأردنية: لا يظهر سؤال الإقامة الأردنية ولا استثناء غير المقيم.', 'Jordanian nationality: the Jordan residence and non-resident exception questions do not apply.'));
      else if (residencyEl.value === 'yes') completed.push(tr('الإقامة الأردنية السارية لغير الأردني', 'Valid Jordanian residence for a non-Jordanian applicant'));
      if (!isJordanian() && employmentDocumentsEl.value === 'yes') completed.push(tr('تأكيد عقد العمل وخطاب الاطلاع', 'Employment contract and authorization letter confirmed'));
      if (isSyrian() && residencyEl.value === 'no' && syrianExceptionEl.value === 'yes') completed.push(tr('تأكيد مستند أو خطاب اطلاع الاستثناء السوري غير المقيم', 'Syrian non-resident exception document or authorization letter confirmed'));
    }

    if (checkModeEl.value === 'recommend') {
      if (!educationEl.value) addIssue(issues, tr('اختر أعلى مؤهل دراسي حتى نعرض المهن التي تناسبك.', 'Choose your highest education level so we can show matching professions.'));
      else completed.push(tr('تم تحديد أعلى مؤهل دراسي لمسار الاقتراح.', 'Highest education level selected for recommendation mode.'));
      if (age && age.years < 21) addIssue(issues, tr('لم يتم إتمام 21 سنة بعد، وهذا شرط أساسي لهذه المعاملة.', 'You have not reached 21 yet, which is a required condition for this application.'));
      else if (age) completed.push(tr('العمر يحقق الحد الأدنى الظاهر في هذا الفحص.', 'The age meets the minimum shown in this check.'));
      const matches = issues.length ? [] : runRecommendation(age, cautions);
      const nextSteps = [{ href: '/professions.html', label: tr('فتح صفحة المهن والأوراق', 'Open professions and documents') }, { href: '/saudi-work-visa-file-readiness.html', label: tr('فتح مراجعة جاهزية ملف العمل', 'Open work-file readiness review') }];
      if (issues.length) renderResult('danger', tr('أكمل البيانات الأساسية أولاً', 'Complete the required details first'), tr('نحتاج إلى بعض البيانات قبل اقتراح المهن المناسبة.', 'We need a few details before suggesting suitable professions.'), issues, completed, cautions, nextSteps, ageOptionalText);
      else if (matches.length) renderResult(cautions.length ? 'warning' : 'success', tr('المهن الأقرب إلى بياناتك', 'Professions closest to your details'), tr('هذه اقتراحات أولية حسب الجنسية والعمر والمؤهل والخبرة والاعتماد. افتح أي بطاقة لمعرفة الأوراق وطباعة القائمة.', 'These suggestions are based on nationality, age, education, experience and professional verification. Open a card to view and print its documents.'), [], [...completed, tr('تمت مطابقة بياناتك الأولية مع سجلات المهن.', 'Your initial details were matched against the profession records.')], cautions, nextSteps, ageOptionalText);
      else renderResult('warning', tr('لم نجد مطابقة كاملة حالياً', 'No complete match found at this time'), tr('لم نجد مهنة تطابق كل البيانات المدخلة؛ يمكنك مراجعة المكتب لاختيار مسار آخر.', 'No profession matched all of the details entered. Contact the office to review another pathway.'), [], completed, cautions, nextSteps, ageOptionalText);
      return;
    }

    const nextSteps = [{ href: '/professions.html', label: tr('فتح صفحة المهن والأوراق', 'Open professions and documents') }, { href: '/saudi-document-attestation-jordan.html', label: tr('قراءة دليل تصديق الوثائق', 'Read the document-attestation guide') }, { href: '/saudi-work-visa-file-readiness.html', label: tr('فتح مراجعة جاهزية ملف العمل', 'Open work-file readiness review') }];
    if (!professionEl.value || !selectedRecord) addIssue(issues, tr('اكتب مهنة موجودة في القائمة حتى تتم مقارنة متطلباتها بدقة.', 'Enter a profession from the list so its requirements can be checked accurately.'));
    if (selectedRecord) {
      const profile = getProfile(selectedRecord);
      completed.push(tr(`تم العثور على المهنة: ${displayName(selectedRecord)}.`, `Profession found: ${displayName(selectedRecord)}.`));
      if (age && ageEligible(profile, age)) completed.push(tr('العمر يحقق حدود الفحص للمهنة المختارة.', 'The age meets the check limits for the selected profession.'));
      if (profile.education && compareEducation(profile.education, educationEl.value)) completed.push(tr('المؤهل المختار يوافق الحد الظاهر للمهنة.', 'The selected education meets the level shown for the profession.'));
      else if (!profile.education) completed.push(tr('لا يظهر للمهنة شرط مؤهل محدد في السجل.', 'The record does not show a specific education requirement for this profession.'));
      if (profile.experience === 0) completed.push(tr('لا تظهر خبرة إلزامية للمهنة في السجل.', 'The record does not show mandatory experience for this profession.'));
      else {
        if (!experienceTitleEl.value.trim()) addIssue(issues, tr('اكتب المسمى الوظيفي كما يظهر في شهادة الخبرة حتى نتحقق من مطابقته لمهنة التأشيرة.', 'Enter the job title shown on the experience letter so it can be compared with the visa profession.'));
        else if (!titleMatches(selectedRecord, experienceTitleEl.value)) addIssue(issues, tr(`مسمى الخبرة «${experienceTitleEl.value.trim()}» لا يطابق مهنة التأشيرة «${recordName(selectedRecord)}».`, `The experience title “${experienceTitleEl.value.trim()}” does not match the visa profession “${displayName(selectedRecord)}”.`));
        else completed.push(tr('مسمى الخبرة يطابق مسمى مهنة التأشيرة.', 'The experience title matches the visa profession title.'));
        if ((profile.experience === 1 && ['1', '2', 'more2'].includes(experienceEl.value)) || (profile.experience === 2 && ['2', 'more2'].includes(experienceEl.value))) completed.push(tr('مدة الخبرة المدخلة توافق الحد المطلوب.', 'The entered experience period meets the required minimum.'));
      }
      if (!profile.accreditation) completed.push(tr('لا يظهر شرط اعتماد مهني محدد لهذه المهنة في السجل الحالي.', 'No specific professional-verification requirement appears for this profession in the current record.'));
      else if (accreditationEl.value === 'yes') completed.push(tr('تم تأكيد الاعتماد أو الفحص المهني المطلوب.', 'The required professional verification or assessment was confirmed.'));
      if (profile.executiveDocuments && investorDocumentsEl.value === 'yes') completed.push(tr('تم تأكيد مستندات المسار الاستثماري ووجود الاسم في السجل التجاري السعودي.', 'Saudi investor documents and the applicant’s name in the commercial registration were confirmed.'));

      if (isEngineeringProfessionName(profile.name)) {
        const graduationYears = graduationYearsEl.value === '' ? null : Number(graduationYearsEl.value);
        if (graduationYears === null || !Number.isFinite(graduationYears)) addIssue(issues, tr('أدخل عدد السنوات المكتملة منذ التخرج للمهنة الهندسية.', 'Enter the completed years since graduation for the engineering profession.'));
        else if (graduationYears > 5) completed.push(tr('مدة التخرج الهندسية تتجاوز خمس سنوات.', 'The engineering graduation period is more than five years.'));
        else if (saudiBornEl.value === 'yes') cautions.push(tr('مدة التخرج أقل من أو تساوي خمس سنوات؛ لا يعتمد الاستثناء لمواليد السعودية إلا بعد تأكيد الجهة المختصة.', 'The graduation period is five years or less; the Saudi-born exception must be confirmed by the competent authority.'));
        else addIssue(issues, tr('المهنة الهندسية تحتاج إلى تخرج منذ أكثر من خمس سنوات، ما لم يثبت استثناء مواليد السعودية.', 'The engineering profession requires graduation more than five years ago unless the Saudi-born exception is confirmed.'));
      }
      if (age && !ageEligible(profile, age)) {
        addIssue(issues, profile.isGeneralManager ? tr('لم يتم إتمام 21 سنة بعد، والمدير العام يجب أن يكون قد أتم 21 سنة.', 'You have not reached 21 yet; a General Manager must be at least 21.') : (age.years < 21 ? tr('لم يتم إتمام 21 سنة بعد، وهذا شرط أساسي.', 'You have not reached 21 yet, which is required.') : tr('العمر 60 سنة أو أكثر، وهذه المهنة العادية تشترط أن يكون العمر أقل من 60 سنة.', 'The age is 60 or above; ordinary professions require an age under 60.')));
      }
      if (profile.education && !compareEducation(profile.education, educationEl.value)) { const requiredAr = profile.education === 'university' ? 'شهادة جامعية' : profile.education === 'secondary' ? 'الثانوية العامة الناجحة' : 'شهادة مدرسية'; const requiredEn = profile.education === 'university' ? 'a university certificate' : profile.education === 'secondary' ? 'a passing general secondary certificate' : 'a school certificate'; addIssue(issues, tr(`المهنة المختارة تحتاج إلى ${requiredAr} على الأقل حسب سجل المهنة.`, `The selected profession requires at least ${requiredEn} according to its record.`)); }
      if (profile.experience === 2 && !['2', 'more2'].includes(experienceEl.value)) addIssue(issues, tr('المهنة المختارة تحتاج إلى خبرة سنتين في نفس المسمى.', 'The selected profession requires two years of experience in the same title.'));
      if (profile.experience === 1 && !['1', '2', 'more2'].includes(experienceEl.value)) addIssue(issues, tr('المهنة المختارة تحتاج إلى خبرة سنة واحدة في نفس المسمى.', 'The selected profession requires one year of experience in the same title.'));
      if (profile.accreditation && accreditationEl.value !== 'yes') addIssue(issues, tr('المهنة المختارة يظهر في سجلها شرط الاعتماد أو التحقق المهني QVP.', 'The selected profession record shows a QVP professional-verification requirement.'));
      if (profile.executiveDocuments && investorDocumentsEl.value !== 'yes') addIssue(issues, tr('هذه المهنة لا تُفحص كمناسبة إلا مع رخصة الاستثمار السعودية وإثبات اسمك في السجل التجاري السعودي.', 'This profession is assessed for the investor pathway only when a Saudi investment licence and proof of your name in the Saudi commercial registration are available.'));
      renderDocuments(selectedRecord);
    }

    const review = [...cautions, tr('هذه نتيجة إرشادية؛ القرار النهائي يعود للجهات الرسمية وصاحب العمل وصحة الوثائق.', 'This is guidance only; the final decision depends on official authorities, the employer and valid documents.')];
    if (issues.length) renderResult('danger', tr('توجد شروط تحتاج إلى استكمال أو مراجعة', 'Some requirements need completion or review'), tr('تظهر الأسباب أسفل النتيجة، ويمكنك تعديل البيانات ثم إعادة الفحص.', 'The reasons appear below. You can update your details and run the check again.'), issues, completed, review, nextSteps, ageOptionalText);
    else renderResult('success', tr('متوافق مع متطلبات الفحص', 'Matches the check requirements'), tr('لم تظهر مشكلة واضحة في البيانات المدخلة. افتح قائمة الأوراق وراجع مصدر كل مستند قبل التقديم.', 'No clear issue appeared in the details entered. Open the document list and review each document source before applying.'), [], completed, review, nextSteps, ageOptionalText);
  }

  function documentText() {
    if (!selectedRecord || !currentDocuments.length) return '';
    const nationalityLine = isJordanian() ? [] : [english() ? `Nationality: ${window.SV_TRANSLATE?.translateString?.(nationalityEl.value) || nationalityEl.value}` : `الجنسية: ${nationalityEl.value}`];
    return english() ? [`Saudi Visa Office in Jordan`, `Required documents for ${displayName(selectedRecord)}`, ...nationalityLine, '', ...currentDocuments.map((doc, i) => `${i + 1}. ${doc.title}: ${doc.note}`), '', documentsSourceNote.textContent].join('\n') : [`مكتب تأشيرات السعودية في الأردن`, `الأوراق المطلوبة لمهنة ${recordName(selectedRecord)}`, ...nationalityLine, '', ...currentDocuments.map((doc, i) => `${i + 1}. ${doc.title}: ${doc.note}`), '', documentsSourceNote.textContent].join('\n');
  }

  function printDocuments() {
    if (!currentDocuments.length) return;
    printTitle.textContent = english() ? `Required documents for ${displayName(selectedRecord)}` : `الأوراق المطلوبة لمهنة ${recordName(selectedRecord)}`;
    printSubtitle.textContent = isJordanian() ? (english() ? 'Saudi Visa Office in Jordan' : 'مكتب تأشيرات السعودية في الأردن') : (english() ? `Saudi Visa Office in Jordan — Nationality: ${window.SV_TRANSLATE?.translateString?.(nationalityEl.value) || nationalityEl.value || 'Not specified'}` : `مكتب تأشيرات السعودية في الأردن — الجنسية: ${nationalityEl.value || 'غير محددة'}`);
    printContent.innerHTML = `<ol>${currentDocuments.map((doc) => `<li><strong>${doc.title}</strong><br>${doc.note}</li>`).join('')}</ol><p>${documentsSourceNote.textContent}</p>`;
    document.body.classList.add('sv-printing');
    window.setTimeout(() => window.print(), 40);
    window.setTimeout(() => document.body.classList.remove('sv-printing'), 800);
  }

  async function copyDocuments() {
    const text = documentText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyDocumentsBtn.textContent = english() ? 'List copied' : 'تم نسخ القائمة';
      window.setTimeout(() => { copyDocumentsBtn.textContent = english() ? 'Copy document list' : 'نسخ قائمة الأوراق'; }, 1600);
    } catch (_) {
      copyDocumentsBtn.textContent = english() ? 'Select and copy the text manually' : 'حدد النص وانسخه يدوياً';
    }
  }

  checkModeEl.addEventListener('change', syncModeFields);
  nationalityEl.addEventListener('change', () => {
    const wasSyrian = normalize(previousNationality).includes('سوريا');
    syncResidencyFields();
    if (isSyrian()) {
      qualificationSourceEl.value = 'syria';
      experienceSourceEl.value = 'syria';
    } else if (wasSyrian) {
      qualificationSourceEl.value = 'jordan';
      experienceSourceEl.value = 'jordan';
    }
    previousNationality = nationalityEl.value;
  });
  residencyEl.addEventListener('change', syncResidencyFields);
  educationEl.addEventListener('change', syncModeFields);
  professionEl.addEventListener('input', updateProfessionFields);
  professionEl.addEventListener('change', updateProfessionFields);
  calculateAgeBtn.addEventListener('click', showAgeCalculation);
  birthDateEl.addEventListener('change', () => { if (birthDateEl.value) showAgeCalculation(); });
  ageAsOfEl.addEventListener('change', () => { if (birthDateEl.value) showAgeCalculation(); });
  qualificationSourceEl.addEventListener('change', () => { if (selectedRecord) renderDocuments(selectedRecord); });
  experienceSourceEl.addEventListener('change', () => { if (selectedRecord) renderDocuments(selectedRecord); });
  form.addEventListener('submit', validateEligibility);
  document.addEventListener('sv:languagechange', () => {
    syncModeFields();
    syncResidencyFields();
    updateProfessionFields();
    if (selectedRecord) renderDocuments(selectedRecord);
    if (!result.hidden) validateEligibility();
  });
  printDocumentsBtn.addEventListener('click', printDocuments);
  copyDocumentsBtn.addEventListener('click', copyDocuments);

  const today = todayISO();
  birthDateEl.max = today;
  ageAsOfEl.value = today;
  ageAsOfEl.max = today;
  populateNationalities();
  syncModeFields();
  syncResidencyFields();

  fetch('/professions.json', { cache: 'no-store' })
    .then((response) => { if (!response.ok) throw new Error('profession data unavailable'); return response.json(); })
    .then((data) => {       professions = Array.isArray(data) ? data : [];
      const qualityRecord = professions.find((record) => normalize(recordName(record)).includes(normalize('مراقب جودة')))
        || professions.find((record) => normalize(recordName(record)).includes(normalize('مساعد إداري')));
      if (qualityRecord && !professions.some((record) => normalize(recordName(record)) === normalize('منسق منتجات'))) {
        professions.push({ ...qualityRecord, name_ar: 'منسق منتجات', profession_name_ar: 'منسق منتجات', slug: 'منسق-منتجات' });
      }
      populateProfessions(); professionEl.placeholder = tr('اكتب أو اختر المسمى الوظيفي', 'Type or choose the profession title'); })
    .catch(() => { professionHint.textContent = tr('تعذر تحميل قائمة المهن حالياً. تواصل مع المكتب لمراجعة المسمى.', 'The profession list could not be loaded. Contact the office to review the title.'); professionEl.placeholder = tr('اكتب المسمى للتواصل مع المكتب', 'Type the title to contact the office'); });
})();
