# دليل ربط Netlify والنشر

## ١. الإعدادات

`netlify.toml` يحدد كل شيء، وإعداداته **تتقدّم** على ما في لوحة Netlify.

| الإعداد في لوحة Netlify | القيمة |
|---|---|
| Repository | مستودع GitHub نفسه (لا تغيير إن كان مربوطًا) |
| Production branch | `main` |
| Base directory | **فارغ** (جذر المستودع، حيث `netlify.toml`) |
| Build command | يُقرأ من `netlify.toml`: `node scripts/ai-files.mjs && node scripts/sitemap.mjs && node scripts/seo-check.mjs` |
| Publish directory | يُقرأ من `netlify.toml`: `frontend/public` |
| Node | 20 (مكتوب في `netlify.toml`) |
| Environment variables | **لا شيء مطلوب** |
| Functions | **لا توجد** |
| Netlify Identity | **مفعّل حاليًا على الموقع** (مع Git Gateway) للوحة إدارة قديمة. **أوصي بتعطيلهما**: docs/SECURITY-AUDIT.md عالي-١ |

**إن كان الموقع مربوطًا أصلًا بالمستودع،** فلا تغيّر شيئًا. فقط تأكد أن **Base directory** فارغ أو `/`.

**لموقع جديد:**
1. **Add new site ← Import an existing project ← GitHub**.
2. اختر المستودع.
3. اترك الحقول كما يملؤها Netlify من `netlify.toml`.
4. **Deploy**.
5. **Domain management:** أضف `saudia-visa.com`، واضبط HTTPS (تلقائي).

## ٢. ما يحدث في كل نشر

1. **`scripts/ai-files.mjs`** يولّد `llms.txt` و`llms-full.txt` و`llms-professions.txt` و`ai.txt` من الصفحات ومن `scripts/ai-facts.json`. **يفشل النشر** إن ذكرت هذه الملفات صفحة غير موجودة أو محوَّلة، أو احتوت رقم ترخيص أو تقييمًا.
2. **`scripts/sitemap.mjs`** يولّد `sitemap.xml` وخرائط الأقسام والصور من الصفحات الموجودة. الصفحة الجديدة تُضاف، والمحذوفة تُزال.
3. **`scripts/seo-check.mjs`** يفحص الصفحات. **عند خطأ جسيم يفشل النشر،** ويبقى الموقع على النسخة السابقة، والسبب يظهر في سجل النشر (Deploy log).
   - **أمثلة الأخطاء الجسيمة:** رابط داخلي لصفحة غير موجودة، صفحة بلا عنوان أو canonical، JSON-LD تالف.
   - **للنشر رغم ذلك في حالة طارئة:** أضف متغير البيئة `SEO_CHECK` بقيمة `warn`، ثم احذفه بعد الإصلاح.

## ٣. فحص النشر التجريبي (Deploy Preview) قبل الدمج

افتح رابط النشر التجريبي من صفحة Pull Request (Netlify يكتبه هناك)، ثم:

1. **الفحص الآلي** (يقرأ فقط ولا يغيّر شيئًا):

   ```bash
   node scripts/check-live.mjs https://deploy-preview-1--اسم-موقعك.netlify.app
   ```

   يفحص التخزين المؤقت ونوع كل ملف ورؤوس الأمان وخرائط الموقع وأمثلة التحويلات وصفحة 404.

2. **يدويًا:**
   - افتح الرئيسية وصفحة مهنة، واطبع مهنة من نافذتها.
   - افتح رابطًا قديمًا مثل `/p/مؤرخ-263301.html`، ويجب أن يتحول إلى `/p/مؤرخ-263302.html`.
   - افتح `/llms.txt`: يجب أن يظهر النص العربي سليمًا. و`/ai-instructions.txt` يجب أن يتحول إلى `/llms.txt`.
   - على Android: Chrome ← «تثبيت التطبيق». على iPhone: Safari ← مشاركة ← «إضافة إلى الشاشة الرئيسية».

## ٤. التخزين المؤقت (Cache)

### ما المكتوب في `_headers`

| الملفات | المدة |
|---|---|
| الصفحات | `max-age=0`، أي دائمًا النسخة الأحدث |
| JS وCSS | ساعة |
| الصور والأيقونات والخطوط و`/vendor` و`/fonts/google` و`/css/gf-*` | سنة |
| `service-worker.js` | بلا تخزين |

### ما يجب التأكد منه

القاعدة العامة `/*` فيها `Cache-Control: max-age=0`. قد يدمج Netlify قيمتها مع القاعدة الخاصة. إن حدث ذلك، يُظهر `check-live.mjs` السطر `TWO RULES MERGED`.

### الإصلاح إن ظهر الدمج

احذف هذا السطر وحده من كتلة `/*` في `frontend/public/_headers`:

```
  Cache-Control: public, max-age=0, must-revalidate
```

ثم أعد الفحص.

- **رؤوس الأمان** في الكتلة نفسها تبقى.
- **الصفحات تبقى `max-age=0`** بقاعدتها الخاصة `/*.html`.
- **افتراض Netlify** لأي ملف بلا قاعدة هو التحقق في كل زيارة، فلا يعلق أحد على نسخة قديمة.

## ٥. بعد النشر الحقيقي

- **Google Search Console:** `docs/SEARCH-CONSOLE.md`.
- **الرجوع عند أي مشكلة:** Netlify ← Deploys ← النشر السابق ← **Publish deploy**.
