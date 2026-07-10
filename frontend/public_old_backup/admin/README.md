# نظام إدارة المحتوى - Netlify CMS

## 📋 نظرة عامة

تم إعداد Netlify CMS لإدارة محتوى المدونة بشكل احترافي وسهل.

## 🚀 الوصول إلى لوحة التحكم

للوصول إلى نظام إدارة المحتوى، افتح:
```
https://saudia-visa.com/admin
```
أو محلياً:
```
http://localhost:3000/admin
```

## 📁 الملفات الرئيسية

- `admin/index.html` - واجهة Netlify CMS
- `admin/config.yml` - إعدادات CMS والحقول المخصصة
- `blog/*.md` - ملفات المقالات بصيغة Markdown

## ⚙️ الإعداد الأولي

### 1. دمج Netlify CMS مع Git

لتفعيل النظام على موقعك المباشر:

1. **ادفع الكود إلى GitHub:**
   ```bash
   git add .
   git commit -m "Add Netlify CMS"
   git push origin main
   ```

2. **قم بنشر الموقع على Netlify:**
   - اذهب إلى [Netlify](https://app.netlify.com)
   - اربط repository الخاص بك
   - انشر الموقع

3. **فعّل Git Gateway:**
   - في لوحة Netlify، اذهب إلى `Settings` > `Identity`
   - اضغط `Enable Identity`
   - في `Registration preferences`، اختر `Invite only`
   - اذهب إلى `Services` > `Git Gateway` > `Enable Git Gateway`

4. **أنشئ مستخدم للوصول:**
   - في `Identity`، اضغط `Invite users`
   - أدخل بريدك الإلكتروني
   - ستصلك رسالة تفعيل لإنشاء كلمة المرور

### 2. الاستخدام المحلي (Local Development)

للعمل محلياً بدون Git:

1. استخدم وضع Test Backend:
   - عدّل `config.yml` مؤقتاً:
     ```yaml
     backend:
       name: test-repo
     ```

2. أو استخدم Netlify CLI:
   ```bash
   npx netlify-cms-proxy-server
   ```

## 📝 كيفية إنشاء مقال جديد

1. افتح `/admin`
2. سجّل دخولك
3. اضغط `New مقال`
4. املأ الحقول:
   - **العنوان**: عنوان المقال
   - **المعرّف (ID)**: معرّف فريد بالإنجليزية (مثل: `new-visa-updates-2025`)
   - **التصنيف**: اختر من القائمة
   - **التاريخ**: تاريخ النشر
   - **وقت القراءة**: بالدقائق
   - **المقدمة**: ملخص قصير
   - **المحتوى**: المحتوى الكامل بصيغة Markdown

5. اضغط `Publish` لنشر المقال

## 🔄 التكامل مع articles.js (حالياً)

**ملاحظة مهمة:** حالياً، نظام المدونة يستخدم `articles.js` لتخزين المقالات.

لتحويل Netlify CMS للعمل مع النظام الحالي:

### الخيار 1: استخدام Build Hook (موصى به)

أنشئ سكريبت Build يقوم بتحويل ملفات `.md` إلى `articles.js`:

```javascript
// scripts/build-articles.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(__dirname, '../public/blog');
const outputFile = path.join(__dirname, '../public/articles.js');

// قراءة جميع ملفات .md
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

const articles = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
  const { data, content: body } = matter(content);
  
  articles[data.id] = {
    title: data.title,
    category: data.category,
    date: data.date,
    readingTime: data.readingTime,
    excerpt: data.excerpt,
    content: body,
    keywords: data.keywords || [],
    published: data.published !== false
  };
});

// كتابة إلى articles.js
const output = `const articles = ${JSON.stringify(articles, null, 2)};\n\nexport default articles;`;
fs.writeFileSync(outputFile, output);

console.log('✅ تم تحويل المقالات بنجاح!');
```

### الخيار 2: التحديث اليدوي

انسخ محتوى Markdown والصقه في `articles.js` مع تنسيق HTML.

## 🎨 التخصيص

لتعديل إعدادات CMS، عدّل `admin/config.yml`:

### إضافة تصنيف جديد:
```yaml
- {label: "التصنيف", name: "category", widget: "select", 
   options: ["تأشيرات", "تصديقات", "إنجاز", "نصائح", "أخبار", "تصنيف جديد"]}
```

### إضافة حقل جديد:
```yaml
- {label: "المؤلف", name: "author", widget: "string", default: "فريق إنجاز"}
```

## 📊 الميزات الحالية

✅ واجهة عربية كاملة
✅ محرر Markdown قوي
✅ رفع الصور
✅ معاينة مباشرة
✅ حقول SEO
✅ نشر/إيقاف النشر
✅ التصنيفات

## 🔮 التطويرات المستقبلية

- [ ] إضافة دعم للمؤلفين المتعددين
- [ ] نظام التعليقات
- [ ] جدولة النشر
- [ ] تكامل تلقائي مع `articles.js`
- [ ] نظام الوسوم (Tags)

## 🆘 المساعدة

للمزيد من المعلومات عن Netlify CMS:
- [التوثيق الرسمي](https://www.netlifycms.org/docs/)
- [أمثلة الإعداد](https://www.netlifycms.org/docs/examples/)

---

**آخر تحديث:** ديسمبر 2025
**الإصدار:** 1.0
