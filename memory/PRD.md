# PRD - مشروع إنجاز لتأشيرات السعودية (EnjazKSA)

## المشكلة الأصلية
موقع مكتب تأشيرات السعودية في الأردن يحتاج تحسينات أمنية وتقنية بدون التأثير على الأداء أو كسر أي وظائف موجودة.

## هيكل المشروع
- **نوع الموقع**: Static HTML/CSS/JS مع Tailwind CSS
- **الاستضافة**: Netlify (publish من `frontend/public/`)
- **CMS**: Netlify CMS (admin panel)
- **الصفحات**: index, professions, blog, calculator, certificates, professional, work-visa, about, privacy, terms, disclaimer, post, 404
- **الميزات**: بحث 856+ مهنة، حاسبة رسوم، مدونة، طباعة أوراق المهن

## ما تم تنفيذه

### المرحلة 1 - إصلاحات أمنية (Apr 11, 2026)
1. **إصلاح 6 ثغرات XSS** - إضافة `sanitizeHTML()` و `sanitizeForHTML()` لتنقية كل البيانات قبل innerHTML
2. **إصلاح ReDoS** - إضافة `escapeRegExp()` لحماية من هجمات التعبيرات المنتظمة
3. **إزالة JSON.stringify من onclick** - استبدال بـ `showProfessionByIndex(index)` لمنع حقن الكود
4. **إضافة Security Headers** - CSP, HSTS, Permissions-Policy, X-Frame-Options, X-Content-Type-Options, X-DNS-Prefetch-Control
5. **حظر الوصول لملفات حساسة** - .env, .git, .gitignore, config, internal JSON via Netlify redirects
6. **إزالة console.log/error** من كل ملفات JavaScript الإنتاجية
7. **تنقية دوال الطباعة** - printProfessionDocument تستخدم بيانات منقاة

### المرحلة 2 - تحسينات SEO والأداء (Apr 11, 2026)
1. **Canonical Tags** - إضافة لـ 7 صفحات ناقصة (blog, certificates, disclaimer, professional, privacy, terms, post)
2. **إصلاح sitemap.xml** - كان فيه XML فاسد ومحتوى مكرر، تم إعادة كتابته بشكل نظيف
3. **تحديث robots.txt** - حظر /content/ والملفات الحساسة الإضافية
4. **إزالة صور غير مستخدمة** - حذف 5 ملفات PNG غير مرتبطة (وفرنا ~9MB من حجم النشر)
5. **lazy loading** - إضافة للصور المتبقية
6. **Canonical ديناميكي** - post.html يحدث الـ canonical تلقائياً حسب المقال

### الملفات المعدلة
- `/app/frontend/public/script.js` - إصلاح XSS + إزالة console
- `/app/frontend/public/professions.js` - إصلاح XSS + إزالة console
- `/app/frontend/public/service-worker.js` - إزالة console
- `/app/frontend/public/articles.js` - إضافة تحديث canonical
- `/app/netlify.toml` - Security headers + حظر ملفات + redirects
- `/app/frontend/public/_redirects` - تحديث قواعد الحظر والسماح
- `/app/frontend/public/sitemap.xml` - إعادة كتابة (كان فاسد)
- `/app/frontend/public/robots.txt` - إضافة حظر إضافي
- `/app/frontend/public/blog.html` - canonical tag
- `/app/frontend/public/certificates.html` - canonical tag
- `/app/frontend/public/disclaimer.html` - canonical tag
- `/app/frontend/public/professional.html` - canonical tag
- `/app/frontend/public/privacy.html` - canonical tag
- `/app/frontend/public/terms.html` - canonical tag
- `/app/frontend/public/post.html` - canonical tag ديناميكي
- `/app/frontend/public/index.html` - lazy loading

### الملفات المحذوفة (غير مستخدمة)
- `images/1000134703.png` (2.7MB)
- `images/1000136589.png` (1.5MB)
- `images/1000136632.png` (1.7MB)
- `images/1000136633.png` (276KB)
- `images/1000136635.png` (2.8MB)

## حالة الاختبار
- المرحلة 1: 100% نجاح (15/15 اختبار)
- المرحلة 2: 100% نجاح (12/12 اختبار)

## Backlog (أولويات متبقية)
### P0 (مكتمل)
- [x] إصلاح XSS في كل ملفات JS
- [x] إضافة Security Headers
- [x] حظر الوصول لملفات حساسة
- [x] إضافة Canonical Tags لكل الصفحات
- [x] إصلاح sitemap.xml
- [x] تنظيف الصور غير المستخدمة

### P1 (مقترح للمستقبل)
- [ ] إضافة Google reCAPTCHA لنماذج الاتصال (حالياً مافي forms - التواصل عبر واتساب)
- [ ] ضبط Netlify CMS بالكامل لإدارة المحتوى
- [ ] إضافة Subresource Integrity (SRI) للمكتبات الخارجية

### P2 (مستقبلي)
- [ ] إضافة نظام تتبع Google Analytics
- [ ] تحسين schema markup لكل الصفحات
- [ ] تحويل الموقع لـ PWA كاملة مع offline support
