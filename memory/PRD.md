# PRD - مشروع إنجاز لتأشيرات السعودية (EnjazKSA)

## المشكلة الأصلية
موقع مكتب تأشيرات السعودية في الأردن يحتاج تحسينات أمنية وسرعة وSEO بدون تغيير أي محتوى أو تصميم.

## هيكل المشروع
- **نوع الموقع**: Static HTML/CSS/JS مع Tailwind CSS
- **الاستضافة**: Netlify (publish من `frontend/public/`)
- **CMS**: Decap CMS (Netlify CMS v3) مع Netlify Identity
- **الصفحات**: 14 صفحة (index, about, professions, blog, calculator, certificates, professional, work-visa, privacy, terms, disclaimer, post, 404, admin)

## ما تم تنفيذه

### المرحلة 1 - أمان (Apr 11, 2026)
- إصلاح 6 ثغرات XSS (sanitizeHTML, sanitizeForHTML)
- إصلاح ReDoS (escapeRegExp)
- إزالة JSON.stringify من onclick
- Security Headers: CSP, HSTS, Permissions-Policy
- حظر ملفات حساسة (.env, .git, config)
- إزالة كل console.log/error

### المرحلة 2 - SEO (Apr 11, 2026)
- Canonical Tags لكل 12 صفحة
- إصلاح sitemap.xml (كان فاسد)
- تحديث robots.txt
- حذف 9MB صور PNG غير مستخدمة

### المرحلة 3 - سرعة + Schema + لوحة تحكم (Apr 11, 2026)
- **سرعة**: preconnect + dns-prefetch + prefetch لكل الصفحات
- **Schema**: FAQPage (5 أسئلة) + Service catalog (4 خدمات)
- **لوحة تحكم**: Decap CMS v3 + Netlify Identity widget على كل الصفحات
- **Admin config**: مدونة + إعدادات الموقع باللغة العربية

## حالة الاختبار
- المرحلة 1: 100% (15/15)
- المرحلة 2: 100% (12/12)
- المرحلة 3: 100% (جميع الفحوصات)

## Backlog
### P1
- [ ] تفعيل Netlify Identity من لوحة تحكم Netlify (يحتاج الدخول على netlify.com)
- [ ] إضافة Subresource Integrity (SRI) للمكتبات الخارجية

### P2
- [ ] تحسين schema markup لصفحات الخدمات الفرعية
- [ ] تحويل Tailwind من CDN لبناء محلي (يقلل حجم CSS بـ 95%)
