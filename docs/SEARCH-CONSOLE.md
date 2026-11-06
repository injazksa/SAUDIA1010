# Google Search Console: خطوات ما بعد النشر

**«جاهز للفهرسة» لا يعني «مفهرس».** هذا الإصدار يجعل كل صفحة قابلة للفهرسة تقنيًا ومعروفة لـGoogle عبر خريطة الموقع. أما متى يفهرسها Google وكيف يرتبها، فقرار Google ويأخذ أيامًا إلى أسابيع.

**لم يُرسَل أي شيء إلى Google حتى الآن.**

## ١. التحقق من ملكية الموقع (مرة واحدة)

1. افتح https://search.google.com/search-console.
2. **Add property ← Domain** (`saudia-visa.com`). هذه الطريقة تغطي http وhttps وwww.
3. Google يعطيك سجل TXT. أضفه في إعدادات DNS لدى مزوّد النطاق (أو في Netlify DNS إن كان النطاق عليه).
4. اضغط **Verify**.

**ملاحظة:** في الموقع ملف `google-site-verification-REPLACE.html`، وهو نموذج غير معبّأ ولا يُستخدم. يمكن حذفه لاحقًا إن استُخدمت طريقة DNS.

## ٢. إرسال خريطة الموقع

1. **Sitemaps**.
2. اكتب `sitemap.xml`.
3. **Submit**.

يكفي إرسال الفهرس وحده، فهو يشير إلى:
- `sitemap-pages.xml`
- `sitemap-professions.xml`
- `sitemap-blog.xml`
- `sitemap-en.xml`
- `sitemap-images.xml`

**إن كانت `sitemap.xml` مرسلة سابقًا،** فلا حاجة لإعادة الإرسال. Google يقرأ الفهرس الجديد في الزيارة التالية.

## ٣. ما تراقبه في أول أسبوعين

| التقرير | المتوقع |
|---|---|
| **Sitemaps** | الحالة Success، و1,151 عنوانًا مكتشفًا تقريبًا |
| **Pages ← Why pages aren't indexed** | «Page with redirect» للروابط القديمة: **طبيعي**، لأنها تحوّل 301 |
| **Pages ← Why pages aren't indexed** | «Excluded by noindex» لصفحات مقصودة: الخصوصية، الشروط، إخلاء المسؤولية، مسار أوراقي، التفويض، قالب المقال |
| **Pages ← Why pages aren't indexed** | «Not found (404)»: يجب أن يكون قليلًا جدًا. أرسل لي أي عنوان يظهر |
| **Enhancements** | Breadcrumbs وFAQ بلا أخطاء |

## ٤. فحص صفحة بعينها

**URL Inspection:** الصق رابط الصفحة، ثم **Test live URL**. إن كانت جديدة، اضغط **Request indexing**. يُستخدم باعتدال، لصفحات مهمة فقط.

## ٥. Bing (اختياري)

- الملف `BingSiteAuth.xml` موجود في الموقع للتحقق في Bing Webmaster Tools.
- أرسل `https://saudia-visa.com/sitemap.xml` هناك أيضًا.
