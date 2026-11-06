# تطوير صفحة الشركات الإنجليزية (For Employers – English)

**التاريخ:** 6/11/2026.
**الرابط كما هو:** `/en/saudi-visa-processing-partner-jordan.html`. يرتبط بها 17 صفحة، وهي في `sitemap-en.xml`.

**ما لم يُفعل:**
- لا صفحة بديلة، ولا صفحة إنجليزية إضافية.
- لا تغيير في أي صفحة أخرى، ولا في صفحات المهن، ولا في أداة «مسار أوراقي».
- لم يُنشر شيء، ولم يُرفع شيء.

## ١. الهوية والتصميم

- **الاسم:**
  - «Saudia Visa» في الترويسة والتذييل والنص والبيانات المنظمة، والاسم الكامل «Saudia Visa Services Office – Jordan».
  - «Saudi Visa Services» تُستخدم فقط لوصف الخدمة، لا اسمًا للمكتب.
- **الخلفية:**
  - خلفية الواجهة الداكنة كما هي تمامًا: القسم نفسه بالفئات نفسها (`sd-dark sd-tool-hero sd-en-hero`).
  - لم يتغير أي ملف CSS مشترك.
  - **ملاحظة:** هذه الخلفية تدرّج لوني كحلي من نظام التصميم، وليست صورة ملف. صورة رمز واتساب (QR) باقية أيضًا.
- **التصميم:**
  - الترويسة والتذييل والقائمة الجانبية بالبنية نفسها، والألوان الكحلية والذهبية من رموز نظام التصميم.
  - الأنماط الجديدة في ملف خاص بالصفحة فقط (`css/en-employers.css`، فئات تبدأ بـ`ee-`)، ولا يعيد تعريف أي فئة مشتركة.
- **كل النص الظاهر إنجليزي:**
  - الروابط العربية السابقة («خدمات الشركات بالعربية») صارت «Arabic version»، وتشير إلى الصفحة العربية نفسها.
  - الفحص الآلي: 0 كلمة عربية ظاهرة. يشمل ذلك النصوص البديلة للصور والتسميات وتلميحات الحقول.

## ٢. الأقسام

| القسم | المحتوى |
|---|---|
| الواجهة | Saudi Work Visa Services for Employers، ووصف العمل، وزر واتساب، وزر «Find the right occupation»، ولوحة «At a glance» |
| Who we are (#about) | من هو Saudia Visa، و«What Saudia Visa handles» مقابل «What the Saudi authorities decide»، وأنه ليس جهة حكومية ولا يضمن التأشيرات |
| Services (#services) | 12 خدمة طلبتها. كل بطاقة: ماذا يفعل المكتب، و«Depends on» (ما يتوقف على الجهة المختصة). وبطاقتان: مسارات الزيارة والعبور، ووثائق الشركات للتوسع في السعودية، وكانتا في الصفحة السابقة |
| Occupation & Qualification Matching | المساعد التفاعلي (§٣) |
| Masar Awraqi (#masar) | شرح الأداة، ورابطها، ورابط دليل الأوراق حسب الفئة، وروابط الأهلية والجاهزية والحاسبة والاستعلام |
| Corporate (#corporate) | Employee Visa Processing، وCorporate Documentation، وBulk Employee Processing، وCorporate Service Packages (عرض خاص من 5 موظفين، **بلا أسعار ولا خصومات**)، وDedicated Case Coordination، وCandidate Nomination Support (خدمة مساندة عند الطلب، والمكتب **ليس وكالة توظيف**) |
| How our process works (#process) | الخطوات السبع كما طلبتها، و«What we need from you»، وتنبيها حماية البيانات |
| FAQ (#faq) | 12 سؤالًا بعد مرحلة التغطية (§٩)، وبياناتها المنظمة تُولَّد من النص الظاهر نفسه |
| Contact (#contact) | الهاتف وواتساب، والبريد، والموقع، والعنوان (First Circle, Jabal Amman — Amman, Jordan)، والدوام. كلها من `content/settings.json` وبيانات الموقع، بلا بيانات جديدة |

## ٣. مساعد اختيار المهنة

**المصدر:**
- `data/en-occupations.json`، تولده الأداة `tools/en-occupations-data-2026-11-06.mjs` من `professions.json` والمسميات الإنجليزية الرسمية.
- فيه **1,086 مهنة**: كل سجلات المكتب التي لها رمز رسمي ومسمى إنجليزي رسمي سليم.
- **خارجه 16 سجلًا:** 15 بلا رمز رسمي، و«مراجع خارجي» لأن مسماه مكتوب في الملف الرسمي بشرطة في أوله.

**المتطلبات:**
- كل سطر متطلبات في كل سجل له تسمية إنجليزية في الأداة، وإن وُجد سطر غير معروف تتوقف الأداة ولا تكتب شيئًا.
- **19 مجموعة أوراق في البيانات، تحولت إلى 17 مجموعة تسميات إنجليزية:** بعض المجموعات يختلف عن غيره في الصياغة فقط، مثل «جواز السفر» و«جواز السفر الجديد» في الفحص الطبي.

**الاختيارات:**
- **نشاط الشركة (20 نشاطًا):**
  - التقنية، والهندسة والإنشاءات، والصيانة، والصحة، والفنادق، والمطاعم، والتجزئة، والتجارة، والتصنيع، واللوجستيات، والنقل، والرياضة، والتعليم، والمالية، والإدارة والموارد البشرية، والطاقة، والأمن، والإعلام والتسويق، والقانون، والزراعة.
  - **التجميع إرشادي:** بالمجموعات الأولى من الرمز الرسمي (التصنيف السعودي يتبع بنية ISCO-08)، وبكلمات واضحة في المسمى الإنجليزي حيث تتوزع الرموز.
  - راجعت عينات كل نشاط وصححت الدخيل، مثل «Advertising Designer» في الهندسة و«Cinema Manager» في الرياضة.
  - «All activities» والبحث يظهران كل المهن.
- **مستوى الوظيفة:** حسب المجموعة الرئيسية في الرمز الرسمي.
- **مؤهل الموظف (5):** Bachelor's، وComprehensive diploma، وNon-comprehensive diploma، وHigh school، وBelow high school.
- **البحث:** بالمسمى أو الرمز.

**القواعد:** هي نفسها في أداة الجاهزية المعتمدة منك (27/10)، ولا قاعدة جديدة:

| المؤهل | المهنة تطلب شهادة جامعية مع QVP | تطلب شهادة مدرسية أو ثانوية | تطلب الصف العاشر |
|---|---|---|---|
| Bachelor's | يطابق | يطابق | يطابق |
| Comprehensive diploma | **مراجعة المكتب** (QVP يشمل الدبلوم الشامل مع 4 سنوات خبرة) | يطابق | يطابق |
| Non-comprehensive diploma | لا يطابق، ويظهر خلف زر | يطابق | يطابق |
| High school | لا يطابق | يطابق | يطابق |
| Below high school | لا يطابق | لا يطابق | **مراجعة المكتب** (يلزم نجاح الصف العاشر) |

**كل نتيجة تعرض:**
- المسمى الإنجليزي الرسمي، والرمز، والمستوى، وحالة المؤهل.
- شارات التحقق: QVP، وSVP، والهيئة السعودية للمهندسين، ومصادقة، والنقابة، والهيئة الصحية، وDataFlow، ورخصة المزاولة، والخبرة.
- كل أوراق السجل بالإنجليزية.
- روابط: مسار أوراقي على المهنة مباشرة (`?code=`)، وصفحة المهنة، وواتساب عن هذه المهنة.

**تنبيه ظاهر دائمًا:**
- الاقتراح لا يضمن التأشيرة ولا الاعتماد.
- الاختيار النهائي حسب العرض الوظيفي والمؤهل والخبرة الفعلية والأنظمة.

**الأداء:**
- البيانات (150 KB) تُحمَّل فقط عند الاقتراب من القسم أو عند استخدام الحقول.
- لا مكتبات خارجية.

## ٤. واتساب

**نص الرسالة في كل أزرار الصفحة:** الواجهة، والتواصل، والتذييل.

```
Hello, I visited the For Employers – English page on the Saudia Visa website. I would like to inquire about Saudi work visa processing and corporate services.
SOURCE: EMPLOYERS_ENGLISH_PAGE
المصدر: صفحة الشركات الإنجليزية
```

**أزرار المهن في المساعد:** تضيف اسم المهنة ورمزها، و`SECTION: OCCUPATION_MATCHING`.

**الرقم:**
- من `content/settings.json` (962789881009) عبر `js/config-loader.js`، ومكتوب أيضًا في الرابط نفسه، فيعمل حتى دون JavaScript.
- **لم يتغير الرقم.**
- السطر العربي داخل الرسالة فقط، ولا يظهر في الصفحة.

## ٥. SEO والفهرسة

| | القيمة |
|---|---|
| Title (59 حرفًا) | Saudi Work Visa Services for Employers \| Saudia Visa Jordan |
| Meta Description (163 حرفًا) | Saudia Visa Services Office – Jordan helps employers with Saudi work visa processing, authorization, QVP and SVP, attestation, medical checks and bulk employee files. |
| H1 | Saudi Work Visa Services for Employers |
| Canonical | `https://saudia-visa.com/en/saudi-visa-processing-partner-jordan.html` (كما كان) |
| hreflang | en (هذه الصفحة)، وar-JO وx-default ← `/corporate.html` (كما كان، تصحيح المرحلة أ محفوظ) |
| robots | index, follow |
| البيانات المنظمة | WebPage، وProfessionalService (Saudia Visa Services Office – Jordan، والعنوان والهاتف والبريد والدوام، و15 خدمة في OfferCatalog بعد التغطية)، وBreadcrumbList، وFAQPage (12 سؤالًا مطابقة للظاهر) |
| Sitemap | `sitemap-en.xml`، و`lastmod` = 2026-11-06 لأن المحتوى تغير فعلًا |
| Meta Keywords | **لا يوجد**، فـGoogle لا يستخدمه |
| ملفات الذكاء الاصطناعي | `llms.txt` و`llms-full.txt` حُدّثت تلقائيًا عند البناء بعنوان الصفحة الجديد وأسئلتها |

**لا تنافس:**
- **الصفحة العربية الرئيسية:** عبارتها «مكتب تأشيرات السعودية في الأردن».
- **الصفحة الإنجليزية الرئيسية:** «Saudi Visa Services in Jordan».
- **هذه الصفحة:** تستهدف أصحاب العمل والشركات.

**الروابط:**
- هذه الصفحة تربط بالإنجليزية الرئيسية، و«About»، والاعتماد المهني الإنجليزي.
- وبمسار أوراقي، ودليل الأوراق حسب الفئة، والأهلية، والجاهزية، والحاسبة، والاستعلام، والعربية.
- **دليل الأوراق** لم يعد صفحة بلا روابط، فاختفى تنبيه «orphan» من فحص SEO (18 تنبيهًا بدل 19).

## ٦. خريطة الكلمات الإنجليزية

**عن البحث:**
- لا توجد في المشروع بيانات حجم بحث، ولا أداة مدفوعة.
- **أساس الاختيار:**
  - أسماء الخدمات والمنصات الرسمية كما يكتبها الباحثون: QVP، وSVP، وMosadaqa، وSaudi Council of Engineers، وSCFHS، وDataFlow.
  - صيغ بحث أصحاب العمل الشائعة.
  - المسميات الرسمية للمهن.
- **التحقق بعد الإطلاق:** من Search Console ← Performance ← Queries.

| القسم | الكلمة الأساسية | الثانوية | عبارات طويلة (Long-tail) |
|---|---|---|---|
| Title وH1 والواجهة | Saudi Work Visa Services for Employers | Saudia Visa Services Office Jordan، وSaudi Work Visa Processing in Jordan | Saudi work visa processing for companies in Jordan |
| Who we are | Saudi Visa Office in Amman | Saudi visa services office Jordan، وSaudia Visa | private Saudi visa office in Amman for employers |
| Services | Saudi work visa services for companies | Saudi Visa Authorization Services، وSaudi Visa Delegation Services، وSaudi Employment Visa Processing، وSaudi Work Visa Documents | Saudi work visa authorization delegation to an office in Jordan · Saudi work visa document checklist for employees |
| Services (التحقق) | Saudi Professional Verification | QVP Verification Saudi Arabia، وSVP Professional Verification، وSaudi Professional Accreditation | which occupations need QVP or SVP for a Saudi work visa |
| Services (المهندسون) | Saudi Council of Engineers Registration | Mosadaqa degree verification، وJordan Engineers Association | Saudi Council of Engineers registration from Jordan |
| Services (التصديق) | Educational Certificate Attestation for Saudi Arabia | Saudi Degree Attestation، وcommercial document attestation | attest university degree for Saudi work visa in Jordan |
| Services (الفحص) | Medical examination for Saudi work visa | biometric appointment Saudi visa | medical and biometrics for Saudi work visa Jordan |
| Occupation Matching | Employee Qualification and Occupation Matching | Saudi Work Visa Occupation Requirements، وSaudi Occupation Classification | Saudi work visa occupation code and requirements · comprehensive diploma Saudi work visa |
| Masar Awraqi | Saudi Work Visa Requirements | Saudi work visa documents by occupation | documents required for Saudi work visa by profession |
| Corporate | Corporate Saudi Visa Processing | Bulk Saudi Work Visa Processing، وcorporate service packages | Saudi work visas for multiple employees at once |
| Nomination | Saudi Recruitment Visa Support | candidate nomination on request | — (خدمة مساندة، لم أجعلها كلمة أساسية) |
| FAQ | (أسئلة أصحاب العمل الفعلية) | what is Saudi work visa authorization · is a comprehensive diploma accepted | do you guarantee Saudi visa approval |

**لم أدخل «Saudi Visa Office in Jordan» في عنوان هذه الصفحة:** هي العبارة الأساسية للصفحة الإنجليزية الرئيسية، فتبقى لها. تظهر هنا بصيغة طبيعية قريبة في عنوان «Who we are»: «a Saudi visa services office in Amman, Jordan».

## ٧. الملفات

| الملف | الحالة |
|---|---|
| `frontend/public/en/saudi-visa-processing-partner-jordan.html` | **معدّل** (الصفحة نفسها) |
| `frontend/public/css/en-employers.css` | جديد |
| `frontend/public/js/en-employers.js` | جديد |
| `frontend/public/data/en-occupations.json` | جديد (مولَّد من البيانات) |
| `frontend/public/sitemap.xml` و`sitemap-en.xml` | تاريخ هذه الصفحة فقط |
| `frontend/public/llms.txt` و`llms-full.txt` | مولدان تلقائيًا: مدخل هذه الصفحة فقط |

**في التطوير:**
- **جديد:**
  - `design/heads/saudi-visa-processing-partner-jordan.html`: رأس الصفحة، فيه canonical وhreflang المنشوران نفسهما.
  - `tools/en-occupations-data-2026-11-06.mjs`.
  - `tools/approve-en-employers-2026-11-06.mjs`.
  - `tests/en-employers-check.mjs`.
  - `tests/approved-rewrites/en_saudi-visa-processing-partner-jordan.html.txt`: الكتل الـ122 التي حلّ محلها المحتوى الجديد، كلمة بكلمة.
- **معدّل:**
  - `design/pages/en-partner.html`.
  - `tools/build-pages.js`: إعدادان اختياريان للغة الصفحة وفئة body، ورسالة واتساب، وتوليد FAQ من النص. السلوك الافتراضي لباقي الصفحات لم يتغير.
  - `tests/approved-changes.json` و`tests/approved-text-changes.json`: الموافقة على تطوير هذه الصفحة فقط.
  - `tests/tools-print.mjs` و`tests/watermark-check.js`: سيناريو طباعة الصفحة.
- **النسخة الاحتياطية:** `checkpoints/2026-11-06-before-en-employers`.

## ٨. ملاحظات

- **العنوان الرئيسي (H1) لا يُطبع:** نظام الطباعة يخفي قسم الواجهة الداكن عند الطباعة، كما كان في الصفحة السابقة. لم أغيّر نظام الطباعة.
- **أدوات المكتب عربية:** الروابط إلى مسار أوراقي والأهلية وصفحات المهن تذكر أنها «Arabic interface»، ولم أترجم أي أداة.
- **صياغة الاعتماد (حُدّثت في مرحلة التغطية):** الصفحة تقول الآن «a private office in Amman, accredited by the Saudi Embassy in Jordan for work visa authorization and processing for all occupations»، وهي مقابل عبارة الموقع العربي «معتمد ومرخص من السفارة السعودية». معها دائمًا: «not a government body» و«the final decision… belongs to the competent authority». تبقى خاضعة لما تقرره في `OFFICIAL-CLAIMS-REVIEW-AR.md`.

## ٩. مرحلة التغطية الشاملة (6/11/2026)

**الهدف:** أن تكون الصفحة مرجعًا إنجليزيًا لكل ما في الموقع العربي يخص أصحاب العمل، بإضافة الناقص فقط، دون إعادة بناء، وبالاسم والخلفية والرابط أنفسها.

**النتيجة:** 14 قسمًا، و16 عنوان H2، ونحو 5,220 كلمة ظاهرة، و0 كلمة عربية ظاهرة.

### ما غطّته الصفحة (مقابل الموقع العربي)

| الموضوع في الموقع العربي | أين في الصفحة | الحالة |
|---|---|---|
| من نحن، والاعتماد، ولمن الخدمة | About + 4 بطاقات جمهور + 3 تنبيهات حقائق | أُضيف |
| أنواع التأشيرات: عمل، مستثمرون وتنفيذيون، عمالة منزلية (مساند)، عائلية، زيارة وسياحة (visa.mofa.gov.sa)، عمرة (نسك)، عبور | #visa-types | أُضيف |
| تفويض تأشيرة العمل وخطواته الثماني | #procedure + تنبيه عقد العمل | أُضيف |
| QVP، وSVP (نظري، 25–30 سؤال، ناجح/راسب، AMIDEAST)، ومصادقة، والهيئة السعودية للمهندسين (قاعدة 5 سنوات، بكالوريوس 4 سنوات)، والهيئة الصحية (Mumaris+ وDataFlow)، ومن لا يحتاج شيئًا | #verification | أُضيف |
| شروط تتعلق بالموظف: المستوى، الخبرة، العمر، الشهادات الأجنبية، الجنسية والإقامة، المتقدمات | #qualifications (6 بطاقات) | أُضيف |
| تصديق الشهادات حسب بلد الإصدار (الأردن، السعودية، دول أخرى)، وأنواع الوثائق، وسفارة الإمارات، والاستلام والتسليم وأرامكس | #attestation | أُضيف |
| أدوات الموقع (مسار أوراقي، الأهلية، الجاهزية، الحاسبة، الاستعلام، دليل الأوراق…) | Masar + شبكة 9 أدوات | وُسّع |
| خدمات الشركات | Corporate + «Ways to work with us» (3 نماذج) | وُسّع |
| مصطلحات ومنصات | #glossary (15 مدخلًا بروابط رسمية) | أُضيف |
| الأسئلة الشائعة | 4 أسئلة جديدة: الاعتماد، غير الأردنيين، العائلية والزيارة والعمرة، المهن الصحية | وُسّع |
| مساعد اختيار المهنة | كما هو، مع تصحيح كلمات 6 أنشطة | صُحّح |

**الروابط الخارجية:** نطاقات رسمية فقط.

### ما لم يُغطَّ عمدًا، ولماذا

- **أرقام المدونة:** الرسوم، ومدد الإنجاز، وقوائم جنسيات التأشيرة السياحية، وتفاصيل التأشيرة العائلية (مثل مكتب تسهيل و3–5 أيام). غير متحقق منها أو قد تكون قديمة.
- **رسوم المكتب:** لا أرقام، والإحالة إلى الحاسبة.
- **التقييمات والشهادات:** لا تُستخدم (قرارك في 25/10).
- **«5–7 أيام» و«دقة 100%» في صفحة تأشيرة العمل العربية:** وعود لم أنقلها.

### المساعد يغطي كل المهن

- **1,086 مهنة من 1,102 سجلًا.** الـ16 الباقية: 15 بلا رمز رسمي، و«مراجع خارجي» (241105) لأن مسماه الرسمي مكتوب بشرطة في أوله.
- **214 مهنة** لا تقع في أي من الأنشطة الـ20، لكنها تظهر في «All activities» وفي البحث بالاسم أو الرمز.

### الكلمات الإنجليزية الجديدة (مقترحة من طبيعة المحتوى، بلا بيانات حجم بحث)

- Saudi visa types from Jordan، وSaudi family visit visa documents، وSaudi tourist visa eVisa، وUmrah visa Nusuk.
- Saudi work visa procedure Jordan، وSaudi work visa authorization steps.
- QVP vs SVP، وSVP theory test AMIDEAST، وMosadaqa degree verification، وSaudi Council of Engineers 5 years rule، وSCFHS Mumaris Plus DataFlow.
- Saudi employment visa requirements qualification age experience.
- Certificate attestation for Saudi Arabia Jordan، وUAE embassy attestation Amman، وdocument pick-up and delivery Aramex.
- Saudi Qiwa، وMusaned، وEnjaz، وWafid (في المسرد).

### إصلاح الطباعة (بعد التغطية)

- **المشكلة:** Ctrl+P طبع 33 صفحة، والصفحة 32 فارغة. وصفحة واحدة (12) عليها علامة مائية واحدة.
- **السبب:**
  - غلاف فارغ من قسم التواصل (حشوته 112px) بقي أسفل صفحة الأسئلة وتجاوز الورقة.
  - تنبيه عقد العمل لم يتسع تحت الخطوات الثماني، فقصرت الصفحة 12.
- **الإصلاح:** في `css/en-employers.css` فقط، بقواعد طباعة:
  - حشوة قسم التواصل على الورق: 0 أعلاه، و16px أسفله؛
  - تقليص المسافة حول التنبيه إلى 8px؛
  - **بلا تصغير خط، وبلا أي تغيير في نظام الطباعة أو العلامة المائية.**
- **النتيجة في Chrome وEdge:** 32 صفحة، بلا صفحة فارغة. العلامات المائية 2–5 في كل صفحة، و0 فوق النص.
- **ما بقي كما هو:** فشلا QVP (صفحتان فارغتان) والصفحة الإنجليزية الرئيسية (صفحة 7 بلا علامة)، لأنك طلبت عدم إصلاحهما.
- **النسخة الاحتياطية:** `checkpoints/2026-11-06-before-en-print-fix`.

### الملفات في مرحلة التغطية

- **في الإصدار:** الصفحة نفسها، و`css/en-employers.css` (إصدار `?v=20261106b`)، و`data/en-occupations.json`، و`llms-full.txt`.
- **النسخة الاحتياطية قبل التغطية:** `checkpoints/2026-11-06-before-en-employers-coverage`.
