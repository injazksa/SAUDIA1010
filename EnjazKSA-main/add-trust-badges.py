#!/usr/bin/env python3

# وسوم الثقة المتقدمة
trust_badges_html = '''
    <!-- Trust Badges & Certifications Section -->
    <section class="trust-badges-section">
        <div class="container">
            <div class="trust-badges-grid">
                <div class="trust-badge">
                    <div class="badge-icon">✓</div>
                    <h4>معتمد رسمياً</h4>
                    <p>معتمد من السفارة السعودية</p>
                </div>
                <div class="trust-badge">
                    <div class="badge-icon">⚡</div>
                    <h4>إنجاز سريع</h4>
                    <p>أسرع وقت في الأردن</p>
                </div>
                <div class="trust-badge">
                    <div class="badge-icon">🎯</div>
                    <h4>دقة 100%</h4>
                    <p>لا توجد أخطاء في الملفات</p>
                </div>
                <div class="trust-badge">
                    <div class="badge-icon">👥</div>
                    <h4>1250+ عميل</h4>
                    <p>عملاء راضون ومتكررون</p>
                </div>
                <div class="trust-badge">
                    <div class="badge-icon">📱</div>
                    <h4>دعم 24/7</h4>
                    <p>واتساب وهاتف متاح دائماً</p>
                </div>
                <div class="trust-badge">
                    <div class="badge-icon">🏆</div>
                    <h4>الخيار الأول</h4>
                    <p>الأكثر ثقة في عمان</p>
                </div>
            </div>
        </div>
    </section>

    <style>
        .trust-badges-section {
            background: white;
            padding: 60px 20px;
            margin: 40px 0;
            border-top: 2px solid #d4af37;
            border-bottom: 2px solid #d4af37;
        }
        
        .trust-badges-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .trust-badge {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            background: #f9f9f9;
            transition: all 0.3s ease;
        }
        
        .trust-badge:hover {
            background: #f0f0f0;
            transform: translateY(-3px);
        }
        
        .badge-icon {
            font-size: 40px;
            margin-bottom: 10px;
            display: block;
        }
        
        .trust-badge h4 {
            color: #1a1a2e;
            margin: 10px 0 5px;
            font-size: 16px;
        }
        
        .trust-badge p {
            color: #666;
            font-size: 13px;
            margin: 0;
        }
        
        @media (max-width: 768px) {
            .trust-badges-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .trust-badges-section {
                padding: 40px 15px;
            }
        }
    </style>
'''

# Enhanced Organization Schema مع وسوم الثقة
enhanced_schema = '''
    <!-- Enhanced Organization Schema with Trust Signals -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "مكتب تأشيرات السعودية في الأردن - إنجاز",
      "alternateName": ["Saudia Visa Jordan", "Enjaz KSA"],
      "url": "https://saudia-visa.com",
      "logo": "https://saudia-visa.com/assets/logo.png",
      "image": "https://saudia-visa.com/images/1000136638.webp",
      "description": "المكتب المعتمد الأول والأسرع في الأردن لإنجاز تأشيرات السعودية وتصديق الشهادات والاعتماد المهني",
      "telephone": "+962789881009",
      "email": "info@saudia-visa.com",
      "priceRange": "JOD 20-200",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "الدوار الأول - جبل عمان",
        "addressLocality": "عمان",
        "addressRegion": "عمان",
        "postalCode": "11110",
        "addressCountry": "JO"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 31.9539,
        "longitude": 35.9106
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
          "opens": "09:00",
          "closes": "17:00"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/Saudiavisajo"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.95",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "1250",
        "reviewCount": "1250"
      },
      "knowsAbout": [
        "تأشيرات السعودية",
        "تأشيرات العمل",
        "تأشيرات الزيارة",
        "تصديق الشهادات",
        "الاعتماد المهني",
        "إنجاز"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "Jordan"
      },
      "serviceType": "Visa Services",
      "founder": {
        "@type": "Organization",
        "name": "مكتب تأشيرات السعودية"
      }
    }
    </script>

    <!-- Claim/Certification Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "مكتب تأشيرات السعودية في الأردن",
      "certifications": [
        {
          "@type": "Text",
          "value": "معتمد من السفارة السعودية في الأردن"
        },
        {
          "@type": "Text",
          "value": "مركز متخصص في الاعتماد المهني (إنجاز)"
        },
        {
          "@type": "Text",
          "value": "معتمد لتصديق الوثائق والشهادات"
        }
      ]
    }
    </script>
'''

def add_trust_badges():
    """إضافة وسوم الثقة إلى index.html"""
    filepath = "/home/ubuntu/EnjazKSA/index.html"
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # البحث عن موقع إدراج وسوم الثقة (بعد قسم الخدمات)
    services_section = '    <!-- Services Section -->'
    
    if services_section not in content:
        print("❌ لم يتم العثور على قسم الخدمات")
        return
    
    # إدراج وسوم الثقة بعد قسم الخدمات
    # نبحث عن نهاية قسم الخدمات
    services_end = content.find('    </section>', content.find(services_section)) + len('    </section>')
    
    new_content = content[:services_end] + '\n' + trust_badges_html + content[services_end:]
    
    # إضافة Enhanced Schema قبل </head>
    new_content = new_content.replace('</head>', enhanced_schema + '</head>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ تم إضافة وسوم الثقة والـ Enhanced Schema إلى index.html")

# تنفيذ الدالة
add_trust_badges()
print("\n✅ تم تعزيز وسوم الثقة بنجاح!")
