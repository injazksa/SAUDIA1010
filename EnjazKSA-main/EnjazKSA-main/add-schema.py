#!/usr/bin/env python3
import os
import re

# بيانات Schema.org لكل صفحة خدمة
schema_data = {
    "work-visa.html": {
        "name": "تأشيرة العمل السعودية",
        "description": "خدمات متخصصة لتسهيل إجراءات تأشيرات العمل للسعودية",
        "price": "50-200",
        "currency": "JOD"
    },
    "visit-visa.html": {
        "name": "تأشيرات الزيارة",
        "description": "خدمات متخصصة لتأشيرات الزيارة العائلية والشخصية",
        "price": "30-150",
        "currency": "JOD"
    },
    "certificates.html": {
        "name": "تصديق الشهادات",
        "description": "خدمات تصديق الشهادات الجامعية والوثائق الرسمية",
        "price": "20-100",
        "currency": "JOD"
    },
    "professional.html": {
        "name": "الاعتماد المهني",
        "description": "خدمات الاعتماد المهني (إنجاز) المعتمدة من السفارة",
        "price": "40-180",
        "currency": "JOD"
    }
}

def add_schema(filename, data):
    """إضافة Schema.org إلى ملف HTML"""
    filepath = f"/home/ubuntu/EnjazKSA/{filename}"
    
    if not os.path.exists(filepath):
        print(f"❌ الملف {filename} غير موجود")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Schema.org للخدمات
    schema = f'''    <!-- Service Schema Markup -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "{data['name']}",
      "description": "{data['description']}",
      "provider": {{
        "@type": "LocalBusiness",
        "name": "مكتب تأشيرات السعودية في الأردن",
        "url": "https://saudia-visa.com",
        "telephone": "+962789881009",
        "address": {{
          "@type": "PostalAddress",
          "streetAddress": "الدوار الأول - جبل عمان",
          "addressLocality": "عمان",
          "postalCode": "11110",
          "addressCountry": "JO"
        }},
        "sameAs": [
          "https://www.facebook.com/Saudiavisajo"
        ]
      }},
      "areaServed": {{
        "@type": "Country",
        "name": "Jordan"
      }},
      "priceRange": "{data['price']}",
      "priceCurrency": "{data['currency']}",
      "aggregateRating": {{
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1250"
      }}
    }}
    </script>
    
    <!-- Organization Schema -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "مكتب تأشيرات السعودية في الأردن",
      "alternateName": "Saudia Visa Jordan",
      "url": "https://saudia-visa.com",
      "logo": "https://saudia-visa.com/assets/logo.png",
      "description": "المكتب المعتمد لدى السفارة السعودية في الأردن لتسهيل إجراءات التأشيرات وتصديق الشهادات",
      "sameAs": [
        "https://www.facebook.com/Saudiavisajo"
      ],
      "contactPoint": {{
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "telephone": "+962789881009",
        "email": "info@saudia-visa.com"
      }},
      "address": {{
        "@type": "PostalAddress",
        "streetAddress": "الدوار الأول - جبل عمان",
        "addressLocality": "عمان",
        "postalCode": "11110",
        "addressCountry": "JO"
      }}
    }}
    </script>
'''
    
    # البحث عن موقع إدراج Schema (قبل إغلاق </head>)
    if '</head>' not in content:
        print(f"❌ الملف {filename} لا يحتوي على </head>")
        return
    
    # التحقق من عدم تكرار Schema
    if 'Service Schema Markup' in content:
        print(f"⚠️  الملف {filename} يحتوي بالفعل على Schema")
        return
    
    # إدراج Schema قبل </head>
    new_content = content.replace('</head>', schema + '</head>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ تم إضافة Schema إلى {filename}")

# معالجة الملفات
for filename, data in schema_data.items():
    add_schema(filename, data)

print("\n✅ تم إضافة Schema.org إلى جميع صفحات الخدمات!")
