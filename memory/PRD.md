# PRD - مشروع إنجاز لتأشيرات السعودية (EnjazKSA)

## المشكلة الأصلية
موقع مكتب تأشيرات السعودية في الأردن يحتاج تحسينات أمنية وتقنية بدون التأثير على الأداء أو كسر أي وظائف موجودة.

## هيكل المشروع
- **نوع الموقع**: Static HTML/CSS/JS مع Tailwind CSS
- **الاستضافة**: Netlify (publish من `frontend/public/`)
- **CMS**: Netlify CMS (admin panel)
- **الصفحات**: index, professions, blog, calculator, certificates, professional, work-visa, visit-visa, privacy, terms, disclaimer, about
- **الميزات**: بحث 856+ مهنة، حاسبة رسوم، مدونة، طباعة أوراق المهن

## ما تم تنفيذه (Apr 11, 2026)

### إصلاحات أمنية
1. **إصلاح ثغرات XSS** - إضافة `sanitizeHTML()` و `sanitizeForHTML()` لتنقية كل البيانات قبل إدراجها بـ innerHTML
2. **إصلاح ReDoS** - إضافة `escapeRegExp()` لتنقية المدخلات قبل استخدامها في RegExp
3. **إزالة JSON.stringify من onclick** - استبدال بـ `showProfessionByIndex(index)` لمنع حقن الكود
4. **إضافة Security Headers** - CSP, HSTS, Permissions-Policy, X-Frame-Options, X-Content-Type-Options
5. **حظر الوصول لملفات حساسة** - .env, .git, .gitignore, config files, internal JSON
6. **إزالة console.log/error** من ملفات الإنتاج
7. **تنقية دوال الطباعة** - printProfessionDocument تستخدم بيانات منقاة

### الملفات المعدلة
- `/app/frontend/public/script.js` - إصلاح XSS في createBlogCard, showError, showSuccess, highlightText, showToast, printProfessionDocument
- `/app/frontend/public/professions.js` - إصلاح XSS في createProfessionCard, showProfessionDetails, printProfessionDocument
- `/app/frontend/public/service-worker.js` - إزالة console.log
- `/app/netlify.toml` - إضافة security headers + حظر ملفات حساسة
- `/app/frontend/public/_redirects` - تحديث قواعد الحظر والسماح

## الشخصيات المستهدفة
- أردنيون يبحثون عن خدمات تأشيرات السعودية
- كفلاء سعوديون يبحثون عن مكاتب معتمدة

## المتطلبات الأساسية (ثابتة)
- الموقع يعمل على Netlify بدون أخطاء
- بحث المهن يعمل بشكل صحيح
- حاسبة الرسوم تعمل
- المدونة تحمل المقالات
- نظام الطباعة يعمل

## Backlog (أولويات متبقية)
### P0 (مكتمل)
- [x] إصلاح XSS في كل ملفات JS
- [x] إضافة Security Headers
- [x] حظر الوصول لملفات حساسة

### P1 (مقترح)
- [ ] إضافة Google reCAPTCHA لنماذج الاتصال
- [ ] إضافة Canonical Tags فريدة لكل صفحة
- [ ] ضبط Netlify CMS بالكامل لإدارة المحتوى

### P2 (مستقبلي)
- [ ] تحسين SEO: schema markup، open graph tags
- [ ] إضافة نظام تتبع Google Analytics
- [ ] تحويل الموقع لـ PWA كاملة
