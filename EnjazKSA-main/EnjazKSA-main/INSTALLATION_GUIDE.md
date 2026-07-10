# دليل التثبيت والنشر - مكتب تأشيرات السعودية

## 📋 متطلبات التثبيت

- حساب Netlify (مجاني)
- Git مثبت على جهازك
- محرر نصوص (VS Code أو أي محرر آخر)

## 🚀 خطوات النشر على Netlify

### الطريقة 1: النشر عبر Drag & Drop (الأسهل)

1. اذهب إلى [Netlify.com](https://netlify.com)
2. سجل دخول أو أنشئ حساب جديد
3. اسحب ملف المشروع المضغوط إلى منطقة الـ Drop
4. انتظر حتى ينتهي التحميل
5. سيتم إعطاؤك رابط مؤقت للموقع

### الطريقة 2: النشر عبر GitHub (الأفضل)

1. **رفع المشروع إلى GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Performance & Security Optimized"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/saudia-visa.git
   git push -u origin main
   ```

2. **ربط GitHub مع Netlify:**
   - اذهب إلى Netlify وسجل دخول
   - اختر "New site from Git"
   - اختر GitHub
   - اختر المستودع الخاص بك
   - اضغط "Deploy"

3. **إعدادات البناء:**
   - Build command: `python3 update_sitemap.py`
   - Publish directory: `.`

### الطريقة 3: النشر عبر Netlify CLI

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# نشر المشروع
netlify deploy --prod
```

## 🔧 التكوينات المهمة

### 1. ربط النطاق الخاص بك
1. اذهب إلى إعدادات الموقع في Netlify
2. اختر "Domain settings"
3. أضف نطاقك الخاص (مثل saudia-visa.com)
4. اتبع التعليمات لتحديث DNS

### 2. تفعيل HTTPS
- Netlify يفعل HTTPS تلقائياً عبر Let's Encrypt
- تأكد من تفعيل "Force HTTPS" في الإعدادات

### 3. إعدادات الأداء
```toml
# في netlify.toml - مفعل بالفعل
[build]
  command = "python3 update_sitemap.py && echo 'Sitemap updated'"
  publish = "."
```

## 📊 التحقق من الأداء

### 1. اختبار السرعة
- استخدم [Google PageSpeed Insights](https://pagespeed.web.dev)
- استخدم [GTmetrix](https://gtmetrix.com)
- استخدم [WebPageTest](https://webpagetest.org)

### 2. اختبار الأمان
- استخدم [SSL Labs](https://www.ssllabs.com/ssltest)
- استخدم [Security Headers](https://securityheaders.com)
- استخدم [Mozilla Observatory](https://observatory.mozilla.org)

### 3. اختبار التوافقية
- اختبر على متصفحات مختلفة
- اختبر على أجهزة مختلفة (هواتف، تابلت، ديسكتوب)

## 🔐 إعدادات الأمان الموصى بها

### 1. تفعيل Two-Factor Authentication
- في Netlify: اذهب إلى الحساب → الأمان
- فعّل 2FA لحماية حسابك

### 2. إعدادات الوصول
- أضف فريقك كمتعاونين
- حدد صلاحيات كل عضو

### 3. النسخ الاحتياطية
- قم بعمل نسخة احتياطية من الملفات بانتظام
- استخدم Git للتحكم بالإصدارات

## 🐛 استكشاف الأخطاء

### المشكلة: الصور لا تظهر
**الحل:**
- تأكد من أن ملفات الصور موجودة في مجلد `images/`
- تأكد من أن أسماء الملفات صحيحة (حساسة لحالة الأحرف)
- تحقق من مسار الملفات في `settings.json`

### المشكلة: الموقع بطيء
**الحل:**
- تأكد من استخدام صور WebP بدلاً من PNG
- تحقق من حجم الملفات
- استخدم Google PageSpeed Insights لمعرفة المشاكل

### المشكلة: أخطاء في الكونسول
**الحل:**
- افتح أدوات المطورين (F12)
- انظر إلى علامة Console
- تحقق من الأخطاء وحاول حلها

## 📝 ملفات مهمة

| الملف | الوصف |
|------|--------|
| `index.html` | الصفحة الرئيسية |
| `settings.json` | إعدادات الموقع والصور |
| `netlify.toml` | إعدادات النشر والأمان |
| `style.css` | أنماط الموقع |
| `script.js` | سكريبتات الموقع |
| `_headers` | رؤوس HTTP المخصصة |
| `_redirects` | إعادة التوجيه |

## 🎯 نصائح للحفاظ على الأداء

1. **استخدم صور محسنة:**
   - استخدم WebP بدلاً من PNG/JPG
   - حجم الصور الكبيرة بحد أقصى 1920px

2. **قلل حجم الملفات:**
   - استخدم Minification للـ CSS و JS
   - استخدم Gzip Compression

3. **استخدم Caching:**
   - فعّل Browser Caching
   - استخدم CDN للملفات الثابتة

4. **راقب الأداء:**
   - استخدم Google Analytics
   - راقب سرعة الموقع بانتظام

## 📞 الدعم والمساعدة

- **Netlify Support:** https://support.netlify.com
- **GitHub Issues:** https://github.com/issues
- **Stack Overflow:** https://stackoverflow.com

---

**آخر تحديث:** 12 مارس 2026
**الإصدار:** 2.0
