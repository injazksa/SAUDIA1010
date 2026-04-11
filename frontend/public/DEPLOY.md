# 🚀 دليل النشر على Netlify

## ⚠️ مهم جداً: الملفات الصحيحة فقط!

هذا المشروع هو **موقع static HTML/CSS/JS** فقط.
**لا تحتاج** React، Node.js، أو أي build process.

---

## 📋 خطوات النشر:

### 1️⃣ رفع على GitHub

```bash
# في مجلد المشروع
git add .
git commit -m "Complete static website - all updates"
git push origin main
```

### 2️⃣ ربط Netlify

1. سجل دخول على [netlify.com](https://netlify.com)
2. اضغط **"Add new site"**
3. اختر **"Import an existing project"**
4. اختر **"Deploy with GitHub"**
5. اختر repository: `injazksa/SAUDIVISAjo`

### 3️⃣ إعدادات النشر المهمة ⚠️

**في صفحة "Site settings":**

- **Branch to deploy:** `main`
- **Base directory:** (اتركه فاضي)
- **Build command:** (اتركه فاضي - لا يوجد build!)
- **Publish directory:** `.` (نقطة فقط!)

### 4️⃣ اضغط "Deploy site"

---

## ✅ بعد النشر:

كل الصفحات رح تشتغل:
- ✅ الصفحة الرئيسية
- ✅ 587 مهنة
- ✅ المدونة
- ✅ الحاسبة
- ✅ التصديقات
- ✅ الاعتماد المهني
- ✅ الصفحات القانونية

---

## 🔧 إذا ظهرت مشكلة:

### المشكلة: بعض الصفحات لا تعمل

**الحل:**
1. تأكد من وجود ملف `_redirects` في root
2. تأكد من وجود ملف `netlify.toml` في root
3. في Netlify Dashboard → Site settings → Build & deploy → Post processing
   - فعّل "Asset optimization"

### المشكلة: الصفحة الرئيسية فقط تعمل

**الحل:**
- تأكد من **Publish directory** = `.` (نقطة فقط!)
- **ليس** `public/` أو أي شيء آخر

---

## 📞 الدعم الفني

إذا واجهت مشكلة:
- اتصل بنا: +962 78 988 1009
- إيميل: Info@saudia-visa.com
