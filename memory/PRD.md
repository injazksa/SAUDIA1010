# SAUDIA1010 — مكتب تأشيرات السعودية المعتمد في الأردن

## المشكلة الأصلية
موقع static ثابت (HTML/CSS/JS) على Netlify لمكتب معتمد رقم 22128 يقدم خدمات تأشيرات وتصديقات للسفارة السعودية. كان يعاني من:
- مشاكل في السرعة والتخزين المؤقت (Netlify ما يعرض التحديثات)
- Service Worker مكرّر ومتعارض
- 6+ ملفات JavaScript مكررة للأداء
- Schema Markup ناقص + AggregateRating وهمي يعرّض الموقع لعقوبات Google
- لا يوجد صفحة FAQ
- لا يوجد روابط تشعر Google بالثقة للـ AI crawlers
- لا يوجد صور أصلية للمدونات

## Architecture
- **Frontend:** Static HTML + Tailwind CSS (CDN) + Vanilla JS
- **Backend:** FastAPI (غير مستخدم فعلياً، الموقع static على Netlify)
- **Hosting:** Netlify (netlify.toml + _headers + _redirects)
- **Stack:** Alexandria/Tajawal fonts, Font Awesome 6.5.1, Leaflet (OpenStreetMap), Tailwind CDN
- **Design:** Navy (#1B2A41) + Gold (#C9A35E)
- **Language:** Arabic RTL

## User Personas
- **المتقدم للعمل السعودي:** يبحث عن معلومات التأشيرة، الأوراق، الرسوم
- **المعتمر:** يريد دليل واضح للحصول على تأشيرة العمرة
- **الشركة:** تبحث عن خدمات تأشيرات جماعية
- **الباحث عن تصديق:** يحتاج تصديق شهاداته

## Core Requirements (Static)
- جميع الصفحات RTL عربي
- تحميل سريع (LCP < 2.5s)
- Schema Markup حقيقي (بدون تقييمات وهمية)
- Google + AI crawlers مسموح لها
- Netlify-optimized
- Trust signals في كل مكان (ترخيص 22128)

## ما تم تنفيذه (2026-01-22) — النسخة v2.0.0

### ✅ الأداء والسرعة
- دمج 6 ملفات JS للأداء في ملف واحد `core.js` (من 60KB+ → 4KB)
- إصلاح Service Worker — نسخة موحّدة v2.0.0 مع strategies صحيحة:
  - Network-first للـ HTML
  - Stale-while-revalidate للـ JS/CSS
  - Cache-first للصور والخطوط
- حذف تسجيل SW المكرر (كان في index.html مرتين)
- `advanced-service-worker.js` صار kill-switch ينظف الكاش القديم تلقائياً
- إضافة `offline.html` احترافية
- Preconnect + preload للخطوط
- إضافة Leaflet CSS/JS مع defer

### ✅ Netlify + Cache
- `netlify.toml` جديد مع استراتيجية كاش متقدمة
- `_headers` محدّث (HTML: must-revalidate, JS/CSS: stale-while-revalidate, Images: 1 year immutable, SW: no-cache)
- `_redirects` نظيف مع clean URLs بدون `.html`
- حذف ملفات backup/duplicate

### ✅ SEO + Schema
- حذف `aggregateRating` الوهمي (كان 4.95/1250 — قد يسبب عقوبة)
- Schema جديد شامل: LocalBusiness + ProfessionalService + Organization + WebSite + BreadcrumbList + hasCredential (ترخيص 22128) + sameAs (Facebook + WhatsApp) + hasOfferCatalog
- BreadcrumbList يُولَّد تلقائياً لكل صفحة فرعية
- Article + HowTo + FAQPage schemas على الصفحات المناسبة
- `sitemap.xml` محدّث — كل الصفحات + المقالات الجديدة + legal pages + image sitemap
- `robots.txt` جديد — يسمح صراحةً لـ Googlebot + Bingbot + **GPTBot + ClaudeBot + PerplexityBot + Google-Extended** (AI SEO)
- حظر scrapers (MJ12bot, SemrushBot, AhrefsBot)

### ✅ Meta + Canonical
- titles فريدة لكل صفحة
- meta descriptions فريدة (حسب سياق كل صفحة)
- canonical URLs صحيحة
- Open Graph محدّث

### ✅ صفحة جديدة: faq.html
- 20 سؤال شائع مع إجابات مفصّلة
- FAQPage Schema markup كامل
- Trust Bar: ترخيص 22128 + 10 سنوات + آخر تحديث

### ✅ مقالات جديدة
1. **`blog/umrah-visa-guide-2026.html`** (العمرة)
   - من مصادر: nusuk.sa, visa.mofa.gov.sa, moh.gov.sa
   - Article + HowTo Schema
   - 6 خطوات تفصيلية + جدول رسوم + نصائح خبراء
2. **`blog/work-visa-comprehensive-2026.html`** (العمل الشامل)
   - من مصادر: qiwa.sa, enjazit.com.sa, musaned.com.sa, etec.gov.sa
   - Article + HowTo Schema
   - 10 أقسام + جدول رسوم لكل مهنة + المنصات السعودية

### ✅ Trust Signals
- Trust Badge في أول كل مقال: "محتوى موثوق من المكتب المعتمد — ترخيص 22128"
- "آخر تحديث" + اسم الكاتب (فريق إنجاز السعودية) + زمن القراءة
- مراجع رسمية (References) في نهاية كل مقال مع روابط لمنصات حكومية سعودية

### ✅ صور مخصصة — 8 صور WebP
تم توليد صور أصلية بـ GPT Image 1.5 (gpt-image-1.5) بمفتاح EMERGENT_LLM_KEY:
1. `blog-umrah-hero.webp` — الكعبة + طائرة + جواز
2. `blog-work-visa-hero.webp` — جواز سعودي + APPROVED + أعلام (سعودي/أردني) + 6 أيقونات خطوات + الرياض
3. `blog-tourist-visa-hero.webp` — العلا + الدرعية + جدة + طائرة
4. `blog-family-visa-hero.webp` — بيت عائلي + جوازات مرتبطة بشريط ذهبي
5. `blog-work-visa-2025.webp` — بوابة سفارة + VISA + حقيبة
6. `blog-certificates-hero.webp` — شهادات + ختم نحاسي + مكبرة
7. `blog-qvp-hero.webp` — لابتوب + نجوم + شهادة مهنية + أدوات مهن
8. `blog-top-professions-hero.webp` — أدوات مهن متنوعة + أفق الرياض

كلها بألوان Navy + Gold + بدون نصوص + بدون وجوه + بإطارات إسلامية ذهبية.

### ✅ blog.html محدّث
- Grid من 8 كارتات بصور حقيقية (بدل الأيقونات)
- شارة "جديد 2026" على المقالات الجديدة
- روابط مباشرة + زمن قراءة لكل مقال

### ✅ تكاملات
- Facebook: `https://www.facebook.com/Saudiavisajo` (في Schema + Footer)
- WhatsApp: `https://wa.me/962789881009` (عائم + Schema)
- الخريطة: Leaflet (OpenStreetMap) — بدون Google Maps
- بدون Google My Business (حسب طلب المستخدم)

### ✅ إصلاحات مهمة
- إصلاح CSS كان يخفي كل الصور (`img:not(.loaded) { opacity: 0 }`) → صار يعمل فقط على `img[data-fade]`
- إضافة رابط FAQ في nav + mobile menu + footer لكل الصفحات
- رفع `emergentintegrations` إلى 0.1.1

## Prioritized Backlog (P0/P1/P2)

### P1 — تحسينات مستقبلية
- [ ] تحسين الصور: إضافة srcset للـ responsive images
- [ ] إضافة فحص Core Web Vitals في Lighthouse
- [ ] Google Search Console setup (بعد النشر)
- [ ] تفعيل Bing Webmaster Tools

### P2 — ميزات مقترحة
- [ ] نظام Testimonials حقيقي (بعد جمع مراجعات حقيقية)
- [ ] نموذج احسب تكلفتك الشخصية بتوليد PDF
- [ ] Admin dashboard لإدارة المحتوى عبر Netlify CMS
- [ ] إضافة المزيد من المقالات (تأشيرة الحج، تأشيرة سياحية، مقالات سياحية عن معالم السعودية)

## File Structure (post-changes)
```
/app/
├── backend/           # FastAPI (غير مستخدم فعلياً)
├── frontend/public/   # Static site
│   ├── *.html         # 14 صفحة (+ faq.html جديد)
│   ├── blog/
│   │   ├── umrah-visa-guide-2026.html        # جديد
│   │   ├── work-visa-comprehensive-2026.html # جديد
│   │   ├── tourist-visa-guide.html           # محدّث (hero image)
│   │   └── family-sponsorship-guide.html     # محدّث (hero image)
│   ├── images/        # 8 صور WebP جديدة + صور قديمة
│   ├── core.js        # جديد - موحّد
│   ├── service-worker.js # مُصلح v2.0.0
│   ├── advanced-service-worker.js # kill-switch
│   ├── schema-markup.js # مُصلح (بدون rating وهمي)
│   ├── sitemap.xml    # محدّث
│   ├── robots.txt     # جديد (مع AI bots)
│   ├── offline.html   # جديد
│   ├── _headers + _redirects # محدّثة
│   └── styles.css + smooth-transitions.css # smooth-transitions مُصلح
├── scripts/
│   └── generate_blog_images.py # script توليد الصور
├── memory/PRD.md      # هذا الملف
└── netlify.toml       # محدّث
```

## Next Action Items
1. رفع الكود على GitHub من خلال زر "Save to Github" في Emergent
2. ربط Netlify بالمستودع
3. تأكد من DNS + domain configuration في Netlify
4. submit sitemap.xml في Google Search Console
5. submit في Bing Webmaster Tools
6. اختبار PageSpeed Insights + Lighthouse + GTmetrix
