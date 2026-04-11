#!/usr/bin/env python3
import os
import re

# قائمة الملفات والبيانات الخاصة بكل صفحة
pages_data = {
    "blog.html": {
        "title": "المدونة | مكتب تأشيرات السعودية في الأردن",
        "description": "تصفح كافة المقالات والأخبار المتعلقة بتأشيرات السعودية، الاعتماد المهني، وتصديق الشهادات من مكتبنا المعتمد في عمان.",
        "url": "https://saudia-visa.com/blog",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "work-visa.html": {
        "title": "تأشيرة العمل - مكتب تأشيرات السعودية في الأردن",
        "description": "نقدم خدمات متخصصة لتسهيل إجراءات تأشيرات العمل للسعودية مع ضمان قبول المعاملة من المرة الأولى.",
        "url": "https://saudia-visa.com/work-visa",
        "image": "https://saudia-visa.com/images/1000136638.webp"
    },
    "visit-visa.html": {
        "title": "تأشيرات الزيارة - مساعدة وحجز مواعيد - مكتب تأشيرات السعودية في الأردن",
        "description": "نقدم المساعدة الكاملة في تجهيز أوراق ومتطلبات تأشيرات الزيارة وحجز مواعيد البصمة.",
        "url": "https://saudia-visa.com/visit-visa",
        "image": "https://saudia-visa.com/images/1000136637.webp"
    },
    "certificates.html": {
        "title": "تصديق الشهادات - مكتب تأشيرات السعودية في الأردن",
        "description": "خدمات متخصصة لتصديق الشهادات الجامعية والوثائق الرسمية من السفارة السعودية.",
        "url": "https://saudia-visa.com/certificates",
        "image": "https://saudia-visa.com/images/1000136639.webp"
    },
    "professional.html": {
        "title": "الاعتماد المهني السعودي - مكتب تأشيرات السعودية في الأردن",
        "description": "خدمات الاعتماد المهني (إنجاز) المعتمدة من السفارة السعودية بأعلى معايير الدقة والسرعة.",
        "url": "https://saudia-visa.com/professional",
        "image": "https://saudia-visa.com/images/1000136635.webp"
    },
    "professions.html": {
        "title": "المهن والأوراق المطلوبة - مكتب تأشيرات السعودية",
        "description": "استعرض قائمة المهن المعتمدة والأوراق المطلوبة لكل مهنة مع خدمة الطباعة الرسمية.",
        "url": "https://saudia-visa.com/professions",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "saudi-visa-inquiry.html": {
        "title": "مركز طباعة التأشيرات | Saudia Visa",
        "description": "مركز متخصص لطباعة وتجهيز ملفات التأشيرات السعودية بسرعة واحترافية عالية.",
        "url": "https://saudia-visa.com/saudi-visa-inquiry",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "calculator.html": {
        "title": "حاسبة رسوم التأشيرات - مكتب تأشيرات السعودية",
        "description": "احسب رسوم التأشيرات السعودية بسهولة حسب نوع التأشيرة والجنسية.",
        "url": "https://saudia-visa.com/calculator",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "musadaqa.html": {
        "title": "موقع مصادقة السعودي - مكتب تأشيرات السعودية في الأردن",
        "description": "خدمات متخصصة لتصديق الشهادات الجامعية على موقع مصادقة السعودي.",
        "url": "https://saudia-visa.com/musadaqa",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "engineers.html": {
        "title": "هيئة المهندسين السعودية - مكتب تأشيرات السعودية في الأردن",
        "description": "خدمات الاعتماد المهني للمهندسين لدى هيئة المهندسين السعودية.",
        "url": "https://saudia-visa.com/engineers",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "wafid-booking.html": {
        "title": "بوابة الحجز الموحد (VIP) | مكتب تأشيرات السعودية",
        "description": "احجز موعدك في منصة وافد أو تسهيل بسهولة من خلال بوابتنا المتخصصة.",
        "url": "https://saudia-visa.com/wafid-booking",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "privacy.html": {
        "title": "سياسة الخصوصية | Saudia Visa",
        "description": "سياسة الخصوصية والحماية البيانات الخاصة بموقع مكتب تأشيرات السعودية.",
        "url": "https://saudia-visa.com/privacy",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "terms.html": {
        "title": "الشروط والأحكام | Saudia Visa",
        "description": "الشروط والأحكام العامة لاستخدام خدمات مكتب تأشيرات السعودية.",
        "url": "https://saudia-visa.com/terms",
        "image": "https://saudia-visa.com/assets/logo.png"
    },
    "disclaimer.html": {
        "title": "إخلاء المسؤولية | Saudia Visa",
        "description": "إخلاء المسؤولية والتنويهات القانونية لموقع مكتب تأشيرات السعودية.",
        "url": "https://saudia-visa.com/disclaimer",
        "image": "https://saudia-visa.com/assets/logo.png"
    }
}

def add_seo_tags(filename, data):
    """إضافة وسوم SEO والثقة إلى ملف HTML"""
    filepath = f"/home/ubuntu/EnjazKSA/{filename}"
    
    if not os.path.exists(filepath):
        print(f"❌ الملف {filename} غير موجود")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # إضافة وسوم الثقة والـ Facebook والـ Favicon
    trust_tags = f'''    <!-- Trust Signals & Verification -->
    <meta name="google-site-verification" content="mrj5IB4BmGWrzriBOnJuE9oMx02sWwvJtlwKRAez4r8" />
    <meta name="msvalidate.01" content="mrj5IB4BmGWrzriBOnJuE9oMx02sWwvJtlwKRAez4r8" />
    
    <!-- Meta Description -->
    <meta name="description" content="{data['description']}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{data['url']}">
    <meta property="og:title" content="{data['title']}">
    <meta property="og:description" content="{data['description']}">
    <meta property="og:image" content="{data['image']}">
    <meta property="og:site_name" content="مكتب تأشيرات السعودية في الأردن">
    <meta property="og:locale" content="ar_SA">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{data['title']}">
    <meta name="twitter:description" content="{data['description']}">
    <meta name="twitter:image" content="{data['image']}">
    
    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="favicon-32x32.png">
    <meta name="theme-color" content="#1a1a2e">
    
    <!-- Additional Trust Signals -->
    <meta name="author" content="مكتب تأشيرات السعودية">
    <meta name="copyright" content="© 2026 مكتب تأشيرات السعودية في الأردن">
    <meta property="business:contact_data:street_address" content="الدوار الأول - جبل عمان">
    <meta property="business:contact_data:locality" content="عمان">
    <meta property="business:contact_data:postal_code" content="11110">
    <meta property="business:contact_data:country_name" content="Jordan">
    <meta property="business:contact_data:phone_number" content="+962789881009">
'''
    
    # البحث عن موقع إدراج الوسوم (بعد viewport وقبل الروابط)
    insert_pattern = r'(<meta name="viewport"[^>]*>)'
    
    # التحقق من عدم تكرار الوسوم
    if 'og:url' in content:
        print(f"⚠️  الملف {filename} يحتوي بالفعل على وسوم OG")
        return
    
    # إدراج الوسوم
    new_content = re.sub(insert_pattern, r'\1\n' + trust_tags, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ تم تحديث {filename}")

# معالجة جميع الملفات
for filename, data in pages_data.items():
    add_seo_tags(filename, data)

print("\n✅ تم إضافة وسوم الثقة والـ Facebook والـ Favicon إلى جميع الصفحات!")
