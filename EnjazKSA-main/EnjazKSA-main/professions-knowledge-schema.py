#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Professions Knowledge Schema
قاعدة بيانات شاملة عن المهن والأوراق المطلوبة لكل مهنة
"""

professions_schema = '''
    <!-- Comprehensive Professions & Requirements Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "DataCatalog",
      "name": "قاعدة بيانات المهن والأوراق المطلوبة - مكتب تأشيرات السعودية",
      "description": "قاعدة بيانات شاملة تحتوي على جميع المهن المدعومة والأوراق المطلوبة لكل مهنة للحصول على تأشيرة العمل السعودية",
      "url": "https://saudia-visa.com/professions",
      "dataset": [
        {
          "@type": "Dataset",
          "name": "تأشيرات العمل لجميع المهن",
          "description": "قائمة شاملة بجميع المهن المدعومة والأوراق المطلوبة لكل مهنة",
          "keywords": "تأشيرات العمل، المهن، الأوراق المطلوبة، السعودية",
          "distribution": [
            {
              "@type": "DataDownload",
              "encodingFormat": "HTML",
              "url": "https://saudia-visa.com/professions"
            }
          ]
        }
      ]
    }
    </script>

    <!-- Service Offering for Each Profession Type -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "خدمات تأشيرات العمل لجميع المهن",
      "provider": {
        "@type": "LocalBusiness",
        "name": "مكتب تأشيرات السعودية المعتمد"
      },
      "serviceType": [
        "تأشيرات العمل للمهندسين",
        "تأشيرات العمل للأطباء",
        "تأشيرات العمل للممرضات",
        "تأشيرات العمل للمعلمين",
        "تأشيرات العمل للعمال",
        "تأشيرات العمل للموظفين الإداريين",
        "تأشيرات العمل للفنيين",
        "تأشيرات العمل للحرفيين",
        "تأشيرات العمل للعاملين في الخدمات",
        "تأشيرات العمل لجميع التخصصات الأخرى"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "Jordan"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "JOD",
        "price": "من 50 إلى 200"
      }
    }
    </script>

    <!-- How-To Guide for Visa Application -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "كيفية الحصول على تأشيرة عمل سعودية",
      "description": "دليل شامل خطوة بخطوة للحصول على تأشيرة عمل سعودية من خلال مكتب تأشيرات السعودية المعتمد",
      "step": [
        {
          "@type": "HowToStep",
          "name": "اختيار المهنة والتحقق من الأوراق",
          "text": "اختر مهنتك من القائمة الشاملة وتحقق من الأوراق المطلوبة لمهنتك"
        },
        {
          "@type": "HowToStep",
          "name": "تجهيز الملفات",
          "text": "جهز جميع الأوراق المطلوبة وفقاً للمتطلبات المحددة لمهنتك"
        },
        {
          "@type": "HowToStep",
          "name": "التواصل مع المكتب",
          "text": "تواصل مع فريقنا عبر الواتساب أو الهاتف لتقديم ملفك"
        },
        {
          "@type": "HowToStep",
          "name": "المراجعة والتصحيح",
          "text": "يقوم فريقنا بمراجعة الملف وتصحيح أي أخطاء"
        },
        {
          "@type": "HowToStep",
          "name": "التقديم للسفارة",
          "text": "نقوم بتقديم ملفك الكامل للسفارة السعودية"
        },
        {
          "@type": "HowToStep",
          "name": "التعقيب والمتابعة",
          "text": "نتابع معك حتى الحصول على الموافقة النهائية"
        }
      ]
    }
    </script>

    <!-- Breadcrumb Schema for Better Navigation -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://saudia-visa.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "الخدمات",
          "item": "https://saudia-visa.com/#services"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "المهن والأوراق",
          "item": "https://saudia-visa.com/professions"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "تأشيرات العمل",
          "item": "https://saudia-visa.com/work-visa"
        }
      ]
    }
    </script>
'''

def add_professions_schema():
    """إضافة Schema الخاص بالمهن والأوراق"""
    filepath = "/home/ubuntu/EnjazKSA/index.html"
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # إضافة Professions Schema قبل </head>
    content = content.replace('</head>', professions_schema + '</head>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ تم إضافة Schema الخاص بالمهن والأوراق بنجاح!")

# تنفيذ الدالة
add_professions_schema()
print("\n✅ تم بناء قاعدة بيانات المهن بنجاح!")
