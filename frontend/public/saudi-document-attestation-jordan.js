(() => {
  'use strict';

  const form = document.querySelector('#attestationChecker');
  if (!form) return;
  const tr = (ar, en) => window.SV_TRANSLATE?.t(ar, en) || ar;
  const isEnglish = () => window.SV_TRANSLATE?.isEnglish?.() === true;
  const translate = (value) => window.SV_TRANSLATE?.translateString?.(value) || value;
  const text = (ar, en) => isEnglish() ? en : ar;

  const docType = document.querySelector('#attestationDocumentType');
  const sourceCountry = document.querySelector('#attestationSourceCountry');
  const purpose = document.querySelector('#attestationPurpose');
  const profession = document.querySelector('#attestationProfession');
  const copyCount = document.querySelector('#universityCopyCount');
  const saudiStatus = document.querySelector('#saudiResidenceStatus');
  const verifyStatus = document.querySelector('#universityVerification');
  const companyStatus = document.querySelector('#companySaudiStatus');
  const companyYear = document.querySelector('#companyDocumentYear');
  const submit = document.querySelector('#buildAttestationPath');
  const result = document.querySelector('#attestationResult');
  const resultTitle = document.querySelector('#attestationResultTitle');
  const resultSummary = document.querySelector('#attestationResultSummary');
  const resultList = document.querySelector('#attestationResultList');
  const printSheet = document.querySelector('#attestationPrintSheet');
  const printTitle = document.querySelector('#attestationPrintTitle');
  const printSubtitle = document.querySelector('#attestationPrintSubtitle');
  const printContent = document.querySelector('#attestationPrintContent');
  const printDisclaimer = document.querySelector('#attestationPrintDisclaimer');
  const originalWarning = document.querySelector('#originalDocumentWarning');
  const contextHint = document.querySelector('#attestationContextHint');
  const copyButton = document.querySelector('#copyAttestationResult');
  const printButton = document.querySelector('#printAttestationResult');
  const whatsapp = document.querySelector('#attestationWhatsapp');
  const dynamicFields = {
    university: document.querySelector('#universityFields'),
    company: document.querySelector('#companyFields'),
    profession: document.querySelector('#attestationProfessionField'),
  };
  let currentResultData = null;

  const countryLabels = {
    jordan: ['الأردن', 'Jordan'],
    saudi: ['السعودية', 'Saudi Arabia'],
    syria: ['سوريا', 'Syria'],
    uae: ['الإمارات العربية المتحدة', 'United Arab Emirates'],
    turkey: ['تركيا', 'Türkiye'],
    usa: ['الولايات المتحدة الأمريكية', 'United States'],
    other: ['دولة أخرى', 'Another country'],
  };
  const documentLabels = {
    experience: ['شهادة خبرة', 'Experience letter'],
    university: ['شهادة جامعية', 'University certificate'],
    school: ['شهادة مدرسية أو ثانوية', 'School or secondary certificate'],
    civil: ['وثيقة مدنية: ميلاد أو زواج أو طلاق أو وفاة', 'Civil document: birth, marriage, divorce or death certificate'],
    agency: ['وكالة خاصة أو وكالة عامة', 'Special or general power of attorney'],
    commercial: ['سجل تجاري ووثائق شركة', 'Commercial registration and company documents'],
    contract: ['عقد أو اتفاقية', 'Contract or agreement'],
    financial: ['ميزانية أو تقرير مالي', 'Financial statement or report'],
    medical: ['تقرير طبي أو إجازة مرضية', 'Medical report or sick-leave certificate'],
    other: ['وثيقة أخرى', 'Other document'],
  };
  const labelFor = (map, key) => text(map[key]?.[0] || 'غير محددة', map[key]?.[1] || 'Not specified');

  const professionRules = {
    'مساعد إداري': { group: ['إداري', 'Administrative'], years: 1 },
    'بائع': { group: ['مهن خدمية', 'Service professions'], years: 1 },
    'بائع مباشر': { group: ['مهن خدمية', 'Service professions'], years: 1 },
    'بائع هاتفي': { group: ['مهن خدمية', 'Service professions'], years: 1 },
    'مراقب جودة': { group: ['إداري/جودة', 'Administration/quality'], years: 1 },
    'منسق زهور': { group: ['تنسيق وخدمات', 'Coordination and services'], years: 1 },
    'منسق منتجات': { group: ['إداري/جودة', 'Administration/quality'], years: 1 },
    'مشرف': { group: ['إشراف', 'Supervision'], years: 2 },
    'محاسب': { group: ['محاسبة', 'Accounting'], years: 2 },
    'أخصائي': { group: ['اختصاصي', 'Specialist'], years: 2 },
    'مهندس': { group: ['هندسي', 'Engineering'], years: 2 },
    'مدير': { group: ['إداري قيادي', 'Management'], years: 2 },
    'عامل': { group: ['عمالة', 'General labour'], years: 0 },
  };

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const normalize = (value) => String(value || '').trim().toLowerCase();

  function ruleForProfession(value) {
    const input = String(value || '').trim();
    const name = normalize(input);
    const englishAliases = {
      'administrative assistant': 'مساعد إداري',
      'quality controller': 'مراقب جودة',
      'seller': 'بائع',
      'direct seller': 'بائع مباشر',
      'florist': 'منسق زهور',
      'product coordinator': 'منسق منتجات',
      'supervisor': 'مشرف',
      'accountant': 'محاسب',
      'marketing specialist': 'أخصائي',
      'specialist': 'أخصائي',
      'engineer': 'مهندس',
      'manager': 'مدير',
      'worker': 'عامل',
      'general labour': 'عامل',
    };
    const canonical = englishAliases[name] || input;
    const canonicalName = normalize(canonical);
    const direct = Object.keys(professionRules).find((key) => canonicalName === normalize(key));
    if (direct) return { name: direct, displayName: input || (isEnglish() ? translate(direct) : direct), ...professionRules[direct] };
    const pattern = Object.keys(professionRules).find((key) => canonicalName.includes(normalize(key)));
    if (pattern) return { name: pattern, displayName: input || (isEnglish() ? `${translate(pattern)} pathway` : pattern), ...professionRules[pattern] };
    return { name: input || 'غير محددة', displayName: isEnglish() ? (input || 'Not specified') : (input || 'غير محددة'), group: ['تحتاج مراجعة', 'Needs review'], years: null };
  }

  function updateVisibility() {
    const university = docType.value === 'university';
    const company = docType.value === 'commercial' || docType.value === 'financial';
    const experience = docType.value === 'experience';
    dynamicFields.university.hidden = !university;
    dynamicFields.company.hidden = !company;
    dynamicFields.profession.hidden = !experience;
    copyCount.required = university;
    verifyStatus.required = university;
    saudiStatus.required = university;
    document.querySelector('#attestationProfession').required = experience;
    companyStatus.required = company;
    companyYear.required = company;
    originalWarning.hidden = !(experience || university || company || docType.value === 'civil' || docType.value === 'medical' || docType.value === 'agency');
    if (experience) contextHint.textContent = tr('لشهادة الخبرة، اختر المهنة حتى تظهر مدة الخبرة الأولية ومسار تصديقها.', 'For an experience letter, choose the profession so the expected experience period and attestation route can be shown.');
    else if (university) contextHint.textContent = tr('للشهادة الجامعية، يجب وجود الأصل والتحقق من الشهادة والغرض السعودي قبل التصديق النهائي.', 'For a university certificate, the original, certificate verification and Saudi purpose should be confirmed before final attestation.');
    else if (company) contextHint.textContent = tr('للوثائق التجارية والمالية، اختر غرض التوسع من الأردن إلى السعودية حتى تظهر القائمة المناسبة.', 'For commercial and financial documents, choose the Jordan-to-Saudi expansion purpose to display the relevant list.');
    else contextHint.textContent = tr('اختر نوع الورقة وبلد الإصدار والغرض، ثم اضغط بناء مسار التصديق.', 'Choose the document type, country of issue and purpose, then select Build attestation route.');
  }

  function sourcePath(country, type) {
    if (country === 'jordan') {
      if (type === 'university' || type === 'school') return [
        text('الجهة التعليمية أو الجامعة في الأردن', 'Educational authority or university in Jordan'),
        text('وزارة التعليم العالي أو الجهة التعليمية المختصة عند انطباقها', 'Ministry of Higher Education or the competent educational authority when applicable'),
        text('وزارة الخارجية الأردنية', 'Jordanian Ministry of Foreign Affairs'),
      ];
      if (type === 'civil') return [
        text('دائرة الأحوال المدنية والجهة الرسمية الأردنية المصدرة', 'Civil Status Department and the official Jordanian issuing authority'),
        text('نسخة رسمية أو صورة طبق الأصل من سند عند قبولها', 'An official certified copy issued through Sanad, when accepted'),
        text('الختم الأصلي وQR Code الخاص بالأحوال المدنية', 'The original Civil Status stamp and QR code'),
        text('وزارة الخارجية الأردنية', 'Jordanian Ministry of Foreign Affairs'),
      ];
      if (type === 'medical') return [
        text('الطبيب أو المستشفى والجهة الطبية المصدرة', 'The doctor, hospital or issuing medical authority'),
        text('نقابة الأطباء عند انطباقها', 'The Jordan Medical Association when applicable'),
        text('وزارة الصحة الأردنية', 'Jordanian Ministry of Health'),
        text('وزارة الخارجية الأردنية', 'Jordanian Ministry of Foreign Affairs'),
      ];
      if (type === 'experience') return [
        text('الشركة الأردنية المصدرة والتحقق من وجودها الفعلي', 'The Jordanian issuing company and verification that it operates in reality'),
        text('مكتب العمل في الأردن عند اشتراطه للمهنة', 'The Jordanian labour office when required for the profession'),
        text('وزارة الخارجية الأردنية', 'Jordanian Ministry of Foreign Affairs'),
      ];
      if (type === 'commercial' || type === 'financial') return [
        text('دائرة مراقبة الشركات في الأردن', 'Jordan Companies Control Department'),
        text('إيداع الميزانية للسنة الجديدة المعنية', 'Filing the financial statement for the relevant new year'),
        text('وزارة الخارجية الأردنية، مع إبراز ختم صفحة المركز المالي في الميزانية', 'Jordanian Ministry of Foreign Affairs, with the stamp shown on the statement of financial position page'),
      ];
      return [text('الجهة الأردنية المصدرة للوثيقة', 'The Jordanian authority that issued the document'), text('الجهة التنظيمية المختصة عند انطباقها', 'The competent regulatory authority when applicable'), text('وزارة الخارجية الأردنية', 'Jordanian Ministry of Foreign Affairs')];
    }
    if (country === 'saudi') {
      if (type === 'experience') return [text('الشركة السعودية المصدرة والتحقق من وجودها ونشاطها', 'The Saudi issuing company and verification that it operates in reality'), text('الغرفة التجارية السعودية عند اشتراطها', 'The Saudi Chamber of Commerce when required'), text('وزارة الخارجية السعودية', 'Saudi Ministry of Foreign Affairs'), text('المسار الدبلوماسي أو الأردني المطلوب عند استخدام الوثيقة في الأردن', 'The diplomatic or Jordanian step required when the document is used in Jordan')];
      if (type === 'civil' || type === 'university' || type === 'school') return [text('الجهة السعودية الرسمية المصدرة', 'The official Saudi issuing authority'), text('وزارة الخارجية السعودية', 'Saudi Ministry of Foreign Affairs'), text('السفارة السعودية في عمّان عند انطباق المسار', 'The Saudi Embassy in Amman when applicable'), text('وزارة الخارجية الأردنية عند استخدام الوثيقة في الأردن', 'Jordanian Ministry of Foreign Affairs when the document is used in Jordan')];
      if (type === 'commercial' || type === 'financial') return [text('الجهة السعودية المصدرة أو الجهة التجارية المختصة', 'The Saudi issuing or competent commercial authority'), text('الغرفة التجارية السعودية عند انطباقها', 'The Saudi Chamber of Commerce when applicable'), text('وزارة الخارجية السعودية', 'Saudi Ministry of Foreign Affairs'), text('الجهة الأردنية المستفيدة عند طلبها', 'The receiving Jordanian authority when requested')];
      return [text('الجهة السعودية المصدرة', 'The Saudi issuing authority'), text('وزارة الخارجية السعودية', 'Saudi Ministry of Foreign Affairs'), text('السفارة أو الجهة الأردنية المطلوبة عند الاستخدام في الأردن', 'The embassy or Jordanian authority required for use in Jordan')];
    }
    if (country === 'syria') return [text('الجهة السورية المصدرة', 'The Syrian issuing authority'), text('وزارة الخارجية السورية', 'Syrian Ministry of Foreign Affairs'), text('السفارة أو البعثة الأردنية في سوريا عند انطباقها', 'The Jordanian Embassy or mission in Syria when applicable'), text('وزارة الخارجية الأردنية في عمّان عند استخدام الوثيقة من الأردن', 'Jordanian Ministry of Foreign Affairs in Amman when the document is used from Jordan')];
    if (country === 'uae') return [text('الجهة الإماراتية المصدرة', 'The UAE issuing authority'), text('وزارة الخارجية الإماراتية', 'UAE Ministry of Foreign Affairs'), text('السفارة أو البعثة الإماراتية في عمّان عند انطباقها', 'The UAE Embassy or mission in Amman when applicable'), text('وزارة الخارجية الأردنية عند استخدام الوثيقة في الأردن', 'Jordanian Ministry of Foreign Affairs when the document is used in Jordan')];
    if (country === 'usa') return [text('الجهة المصدرة في الولايات المتحدة', 'The issuing authority in the United States'), text('وزارة الخارجية أو الجهة الاتحادية/الولائية المختصة', 'The Department of State or competent federal/state authority'), text('السفارة الأمريكية في عمّان عند انطباقها', 'The U.S. Embassy in Amman when applicable'), text('وزارة الخارجية الأردنية عند استخدام الوثيقة في الأردن', 'Jordanian Ministry of Foreign Affairs when the document is used in Jordan')];
    if (country === 'turkey') return [text('الجامعة أو الجهة التركية المصدرة', 'The Turkish university or issuing authority'), text('وزارة الخارجية التركية أو Apostille إذا كان متاحًا ومقبولًا لدى الجهة المستفيدة', 'The Turkish Ministry of Foreign Affairs or an Apostille if available and accepted for the route'), text('السفارة التركية في عمّان عند انطباقها', 'The Turkish Embassy in Amman when applicable'), text('وزارة الخارجية الأردنية عند استخدام الوثيقة في الأردن', 'Jordanian Ministry of Foreign Affairs when the document is used in Jordan')];
    const countryName = labelFor(countryLabels, country);
    return [text(`الجهة الرسمية المصدرة في ${countryName}`, `The official issuing authority in ${countryName}`), text('وزارة خارجية بلد الإصدار أو جهة التصديق المختصة', 'The foreign ministry of the country of issue or competent attestation authority'), text('السفارة أو البعثة في عمّان عند انطباقها', 'The embassy or mission in Amman when applicable'), text('وزارة الخارجية الأردنية عند استخدام الوثيقة في الأردن إذا كانت الجهة المستفيدة تطلب ذلك', 'The Jordanian Ministry of Foreign Affairs when the receiving authority requires it')];
  }

  function authenticityRules(type, country) {
    if (type === 'experience') return [
      tr('أصل شهادة الخبرة إلزامي؛ لا تُقبل صورة الشهادة بدل الأصل في التصديق النهائي.', 'The original experience letter is required; a copy does not replace the original for final attestation.'),
      tr('الأختام المطلوبة يجب أن تكون أختامًا أصلية حيّة، وليست صور أختام أو نسخًا ممسوحة ضوئيًا.', 'Required stamps must be live original stamps, not pictures of stamps or scanned copies.'),
      tr('يجب أن تكون الشركة حقيقية وقابلة للتحقق: عنوان أو موقع على Google Maps، Website فعال، وبريد إلكتروني مهني باسم الشركة.', 'The company must be real and verifiable: an address or listing on Google Maps, an active website and a professional company email address.'),
      country === 'jordan' ? tr('للخبرة الأردنية: راجع الشركة ومكتب العمل في الأردن والخارجية الأردنية حسب المهنة والغرض.', 'For Jordanian experience: review the company, the Jordanian labour office and the Jordanian Foreign Ministry according to the profession and purpose.') : tr('للخبرة غير الأردنية: أضف تصديقات بلد الإصدار والجهة الدبلوماسية في عمّان والخارجية الأردنية عند استخدام الوثيقة من الأردن.', 'For experience issued outside Jordan: complete the country-of-issue attestations, the relevant diplomatic step in Amman and the Jordanian Foreign Ministry when the document is used from Jordan.'),
    ];
    if (type === 'university') return [
      tr('يجب وجود أصل الشهادة الجامعية مختومًا حسب الأصول؛ الصورة العادية لا تكفي للأصل.', 'The properly stamped original university certificate must be available; an ordinary copy is not a substitute for the original.'),
      tr('عند طلب نسخ إضافية، تُجهّز نسخ طبق الأصل ويُحدد عددها، ثم تُراجع أختام التعليم العالي والخارجية حسب الأصول.', 'For additional copies, prepare certified copies and specify the number, then review the Higher Education and Foreign Ministry stamps required for the route.'),
      tr('يجب التحقق من الشهادة عبر خدمة المصادقة أو التحقق المطلوبة قبل التصديق النهائي.', 'The certificate must be verified through the required verification or authentication service before final attestation.'),
      tr('إذا كان الاستخدام للسعودية، جهّز ما يثبت الغرض مثل الإقامة السعودية أو عقد العمل والتأشيرة بحسب متطلبات الجهة المستفيدة.', 'For use in Saudi Arabia, prepare proof of purpose such as Saudi residence or an employment contract and visa, according to the receiving authority’s requirements.'),
    ];
    if (type === 'civil' && country === 'jordan') return [tr('تُقبل النسخة الرسمية أو الصورة طبق الأصل الصادرة من سند عند قبولها، مع QR Code وختم الأحوال المدنية الأصلي وختم الخارجية الأردنية الأصلي.', 'An official copy or certified copy issued through Sanad may be accepted, with the Civil Status QR code, original Civil Status stamp and original Jordanian Foreign Ministry stamp.'), tr('الصورة العادية أو صورة الختم لا تُعامل كوثيقة رسمية.', 'An ordinary picture or a picture of a stamp is not treated as an official document.')];
    if (type === 'commercial' || type === 'financial') return [tr('الأصل أو النسخة الرسمية التي تقبلها الجهة المستفيدة مطلوبة، ولا تعتمد على صورة غير مصدقة.', 'The original or an official copy accepted by the receiving authority is required; do not rely on an uncertified image.'), tr('في الميزانية، يجب إبراز ختم الخارجية الأردنية على صفحة المركز المالي عند انطباق مسار الشركة الأردنية.', 'For a financial statement, the Jordanian Foreign Ministry stamp should be visible on the statement of financial position page when the Jordanian-company route applies.')];
    return [tr('قد تطلب الجهة المستفيدة الأصل أو نسخة رسمية مصدقة؛ لا تسلّم أصلًا قبل مراجعة المسار النهائي.', 'The receiving authority may require an original or an officially certified copy; do not hand over an original before confirming the final route.'), tr('الأختام يجب أن تكون أصلية وقابلة للتحقق، وليست صورًا أو نسخًا غير معتمدة.', 'Stamps must be original and verifiable, not pictures or uncertified copies.')];
  }

  function buildResult() {
    const type = docType.value;
    const country = sourceCountry.value;
    const professionRule = ruleForProfession(profession.value);
    const steps = sourcePath(country, type);
    const rules = authenticityRules(type, country);
    const items = [];
    const year = companyYear.value || new Date().getFullYear();
    if ((type === 'commercial' || type === 'financial') && country !== 'jordan') items.push({ title: tr('تنبيه نطاق المسار التجاري', 'Commercial-route scope notice'), note: tr('مسار السجلات التجارية والميزانيات الموصوف هنا مخصص أساسًا لوثائق شركة قائمة في الأردن تريد التوسع أو فتح شركة في السعودية. إذا كان بلد الإصدار مختلفًا، تواصل مع المكتب لتحديد المسار الصحيح.', 'The commercial-registration and financial-statement route described here is mainly for an existing Jordanian company seeking to expand or open a company in Saudi Arabia. If the country of issue is different, contact the office to identify the correct route.') });
    items.push({ title: tr('الوثيقة والغرض', 'Document and purpose'), note: `${labelFor(documentLabels, type)} — ${tr('بلد الإصدار', 'Country of issue')}: ${labelFor(countryLabels, country)} — ${tr('الغرض', 'Purpose')}: ${purpose.options[purpose.selectedIndex]?.text || tr('غير محدد', 'Not specified')}.` });
    if (type === 'experience' && !profession.value.trim()) items.push({ title: tr('المهنة المطلوبة', 'Required profession'), note: tr('اكتب المهنة المرتبطة بشهادة الخبرة حتى نحدد مدة الخبرة الأولية ومسار مراجعة الشركة.', 'Enter the profession linked to the experience letter so we can show the expected experience period and company-review route.') });
    if (type === 'experience') {
      const years = professionRule.years === null ? tr('تحدد بعد مراجعة سجل المهنة', 'To be determined after reviewing the profession record') : professionRule.years === 0 ? tr('لا تظهر خبرة إلزامية في هذا المسار العام', 'No mandatory experience is shown for this general pathway') : (isEnglish() ? `${professionRule.years} year${professionRule.years === 1 ? '' : 's'} according to the profession record` : `${professionRule.years} سنة/سنوات بحسب سجل المهنة`);
      items.push({ title: tr('المهنة ومدة الخبرة الأولية', 'Profession and expected experience period'), note: `${tr('المسمى المختار', 'Selected title')}: ${professionRule.displayName || translate(professionRule.name)}. ${tr('المجموعة', 'Group')}: ${professionRule.group[isEnglish() ? 1 : 0]}. ${tr('الخبرة المطلوبة', 'Required experience')}: ${years}. ${tr('يجب أن تكون الخبرة بنفس مسمى التأشيرة أو المسار المطلوب', 'Experience should match the visa or requested pathway')}.` });
    }
    if (type === 'university') {
      const copies = Math.max(1, Number(copyCount.value || 1));
      items.push({ title: tr('الأصل وعدد النسخ', 'Original and number of copies'), note: isEnglish() ? `The stamped university original is available, and the requested number of copies is ${copies}. Additional copies are prepared as certified copies and follow the required Higher Education and Foreign Ministry stamps.` : `الأصل الجامعي المختوم موجود، وعدد النسخ المطلوب تصديقها: ${copies}. النسخ الإضافية تُجهز طبق الأصل وتخضع لأختام التعليم العالي والخارجية حسب الأصول.` });
      items.push({ title: tr('التحقق والغرض السعودي', 'Verification and Saudi purpose'), note: `${tr('حالة التحقق', 'Verification status')}: ${verifyStatus.options[verifyStatus.selectedIndex]?.text || tr('غير محددة', 'Not specified')}. ${tr('حالة الإقامة/العقد والتأشيرة', 'Residence/contract and visa status')}: ${saudiStatus.options[saudiStatus.selectedIndex]?.text || tr('غير محددة', 'Not specified')}.` });
    }
    if (type === 'commercial' || type === 'financial') {
      items.push({ title: tr('مسار الشركة الأردنية', 'Jordanian company pathway'), note: tr('هذا المسار مخصص لشركة قائمة في عمّان تريد فتح شركة أو نشاط في السعودية، وليس لتصديق أي سجل تجاري بلا غرض محدد.', 'This route is for an existing company in Amman that wants to open a company or business activity in Saudi Arabia, not for attesting a commercial registration without a defined purpose.') });
      items.push({ title: tr('السنة المالية', 'Financial year'), note: isEnglish() ? `The financial statement should be filed for the relevant new year (${escapeHtml(year)} or the actual year of the transaction), with the Foreign Ministry stamp visible on the statement of financial position page.` : `يجب أن تكون الميزانية مودعة للسنة الجديدة المعنية (${escapeHtml(year)} أو السنة الفعلية وقت المعاملة)، مع إبراز ختم صفحة المركز المالي.` });
      items.push({ title: tr('الإقامة أو الوكالة', 'Residence or power of attorney'), note: companyStatus.value === 'resident' ? tr('أرفق صورة إقامة سعودية سارية لصاحب الشركة عند انطباقها.', 'Provide a copy of the owner’s valid Saudi residence when applicable.') : tr('إذا لم يكن صاحب الشركة مقيمًا في السعودية، جهّز وكالة لشخص مقيم في السعودية بحسب ما تطلبه الجهة المستفيدة.', 'If the owner is not resident in Saudi Arabia, prepare a power of attorney for a person resident in Saudi Arabia as required by the receiving authority.') });
      items.push({ title: tr('الوثائق الأساسية', 'Core documents'), note: tr('عقد التأسيس، السجل التجاري، والميزانية السنوية الجديدة، مع أختام دائرة مراقبة الشركات والخارجية الأردنية حسب الوثيقة.', 'Articles of incorporation, commercial registration and the new annual financial statement, with the Companies Control Department and Jordanian Foreign Ministry stamps required for the document.') });
    }
    steps.forEach((step, index) => items.push({ title: `${tr('خطوة التصديق', 'Attestation step')} ${index + 1}`, note: step }));
    rules.forEach((rule, index) => items.push({ title: index === 0 ? tr('قاعدة أصالة الوثيقة', 'Document authenticity rule') : tr('تنبيه مهم', 'Important notice'), note: rule }));
    return { type, country, items };
  }

  function preparePrint(data) {
    if (!printSheet || !printTitle || !printSubtitle || !printContent || !printDisclaimer) return;
    const title = `${tr('مسار تصديق', 'Attestation route')}: ${labelFor(documentLabels, data.type)}`;
    const purposeText = purpose.options[purpose.selectedIndex]?.text || tr('غير محدد', 'Not specified');
    const countryText = labelFor(countryLabels, data.country);
    const professionText = data.type === 'experience' && profession.value.trim()
      ? ` ${tr('المهنة المرتبطة', 'Related profession')}: ${escapeHtml(profession.value.trim())}.`
      : '';
    printTitle.textContent = title;
    printSubtitle.textContent = tr('مكتب تأشيرات السعودية في الأردن — ملخص إرشادي', 'Saudi Visa Office in Jordan — Guidance summary');
    printContent.innerHTML = `<p><strong>${escapeHtml(labelFor(documentLabels, data.type))}</strong> — ${tr('بلد الإصدار', 'Country of issue')}: ${escapeHtml(countryText)} — ${tr('الغرض', 'Purpose')}: ${escapeHtml(purposeText)}.${professionText}</p><ol>${data.items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.note)}</span></li>`).join('')}</ol>`;
    printDisclaimer.textContent = tr('هذه ورقة إرشادية مبنية على الاختيارات المدخلة. يجب مراجعة المكتب والجهة المستفيدة قبل تسليم الأصل أو دفع الرسوم.', 'This is a guidance sheet based on the selected options. Confirm the route with the office and receiving authority before handing over an original document or paying fees.');
  }

  function render() {
    const data = buildResult();
    currentResultData = data;
    resultTitle.textContent = `${tr('مسار تصديق', 'Attestation route')}: ${labelFor(documentLabels, data.type)}`;
    resultSummary.textContent = tr('هذه نتيجة إرشادية مبنية على اختياراتك. راجع المكتب والجهة المستفيدة قبل دفع رسوم أو تسليم أصل الوثيقة.', 'This is guidance based on your selections. Contact the office and receiving authority before paying fees or handing over an original document.');
    resultList.innerHTML = data.items.map((item) => `<div class="sv-result-item"><strong>${escapeHtml(item.title)}</strong><span>${item.note}</span></div>`).join('');
    preparePrint(data);
    result.hidden = false;
    result.classList.add('is-visible');
    result.focus({ preventScroll: false });
    const professionPart = profession.value ? `, ${tr('المهنة', 'Profession')}: ${profession.value}` : '';
    const message = isEnglish() ? `Hello, I would like a review of my document-attestation route. Document: ${labelFor(documentLabels, data.type)}. Country of issue: ${labelFor(countryLabels, data.country)}. Purpose: ${purpose.options[purpose.selectedIndex]?.text || 'Not specified'}${professionPart}.` : `مرحباً، أريد مراجعة مسار تصديق. الوثيقة: ${labelFor(documentLabels, data.type)}، بلد الإصدار: ${labelFor(countryLabels, data.country)}، الغرض: ${purpose.options[purpose.selectedIndex]?.text || ''}${professionPart}.`;
    whatsapp.href = `https://wa.me/962789881009?text=${encodeURIComponent(message)}`;
    copyButton.dataset.copyText = [tr('مكتب تأشيرات السعودية في الأردن', 'Saudi Visa Office in Jordan'), resultTitle.textContent, resultSummary.textContent, ...data.items.map((item, index) => `${index + 1}. ${item.title}: ${item.note}`)].join('\n');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  docType.addEventListener('change', updateVisibility);
  form.addEventListener('submit', (event) => { event.preventDefault(); render(); });
  copyButton.addEventListener('click', async () => {
    const value = copyButton.dataset.copyText || '';
    if (!value) return;
    try { await navigator.clipboard.writeText(value); copyButton.textContent = tr('تم نسخ المسار', 'Route copied'); }
    catch (_) { copyButton.textContent = tr('حدد النص وانسخه يدويًا', 'Select and copy the text manually'); }
    window.setTimeout(() => { copyButton.textContent = tr('نسخ مسار التصديق', 'Copy attestation route'); }, 1800);
  });
  printButton.addEventListener('click', () => {
    if (result.hidden || !currentResultData) return;
    preparePrint(currentResultData);
    document.body.classList.add('sv-attestation-printing');
    window.print();
    window.setTimeout(() => document.body.classList.remove('sv-attestation-printing'), 800);
  });
  document.addEventListener('sv:languagechange', () => { updateVisibility(); if (!result.hidden) render(); });
  updateVisibility();
})();
