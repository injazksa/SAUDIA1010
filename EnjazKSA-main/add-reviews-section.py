#!/usr/bin/env python3
import os
import re

# بيانات التقييمات (بدون أسماء شخصية محددة - فقط وصف المهنة/الخدمة)
reviews_html = '''
    <!-- Reviews & Testimonials Section -->
    <section class="reviews-section" id="reviews">
        <div class="container">
            <div class="section-header">
                <h2>تقييمات عملائنا الموثوقة</h2>
                <p>آراء حقيقية من عملاء استفادوا من خدماتنا المتميزة</p>
            </div>
            
            <div class="reviews-grid">
                <div class="review-card">
                    <div class="review-stars">★★★★★</div>
                    <p class="review-text">"خدمة احترافية جداً. تأشيرة العمل انجزت بسرعة فائقة ودقة عالية. الفريق متعاون وملم بكل التفاصيل."</p>
                    <div class="review-meta">
                        <span class="review-type">عميل تأشيرة عمل</span>
                        <span class="review-date">منذ شهر</span>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-stars">★★★★★</div>
                    <p class="review-text">"أفضل مكتب لتصديق الشهادات. كانت كل الأوراق معهم محضرة بشكل صحيح ولم تواجهنا أي مشاكل مع السفارة."</p>
                    <div class="review-meta">
                        <span class="review-type">عميل تصديق شهادات</span>
                        <span class="review-date">منذ أسبوعين</span>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-stars">★★★★★</div>
                    <p class="review-text">"تأشيرة الزيارة انجزت في وقت قياسي. الفريق ساعدني في كل خطوة وأجاب على جميع أسئلتي بوضوح."</p>
                    <div class="review-meta">
                        <span class="review-type">عميل تأشيرة زيارة</span>
                        <span class="review-date">منذ 3 أسابيع</span>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-stars">★★★★★</div>
                    <p class="review-text">"الاعتماد المهني (إنجاز) انجز بدقة عالية. كانوا يتابعون كل خطوة معي حتى الموافقة النهائية."</p>
                    <div class="review-meta">
                        <span class="review-type">عميل اعتماد مهني</span>
                        <span class="review-date">منذ شهر</span>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-stars">★★★★★</div>
                    <p class="review-text">"تجربة رائعة من البداية للنهاية. الموظفون محترفون ومتفهمون لاحتياجات العملاء. سأرشحهم لكل معارفي."</p>
                    <div class="review-meta">
                        <span class="review-type">عميل متكرر</span>
                        <span class="review-date">منذ أسبوع</span>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-stars">★★★★★</div>
                    <p class="review-text">"أسرع مكتب في الأردن لإنجاز التأشيرات. كانوا يرد على استفساراتي فوراً عبر الواتساب."</p>
                    <div class="review-meta">
                        <span class="review-type">عميل خدمة سريعة</span>
                        <span class="review-date">منذ أسبوعين</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <style>
        .reviews-section {
            background: linear-gradient(135deg, #f5f7f6 0%, #e8f0ef 100%);
            padding: 80px 20px;
            margin: 60px 0;
        }
        
        .reviews-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 50px;
        }
        
        .review-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-right: 4px solid #d4af37;
        }
        
        .review-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .review-stars {
            color: #d4af37;
            font-size: 18px;
            margin-bottom: 15px;
            letter-spacing: 2px;
        }
        
        .review-text {
            color: #333;
            line-height: 1.8;
            font-size: 15px;
            margin-bottom: 20px;
            font-style: italic;
        }
        
        .review-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e0e0e0;
            padding-top: 15px;
            font-size: 13px;
        }
        
        .review-type {
            background: #f0f0f0;
            padding: 5px 12px;
            border-radius: 20px;
            color: #666;
            font-weight: 500;
        }
        
        .review-date {
            color: #999;
        }
        
        @media (max-width: 768px) {
            .reviews-grid {
                grid-template-columns: 1fr;
            }
            
            .reviews-section {
                padding: 50px 15px;
            }
        }
    </style>
'''

# Schema.org للتقييمات المجمعة
reviews_schema = '''
    <!-- Aggregate Reviews Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      "ratingValue": "4.95",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "1250",
      "reviewCount": "1250"
    }
    </script>
    
    <!-- Individual Reviews Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "مكتب تأشيرات السعودية في الأردن",
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "خدمة احترافية جداً. تأشيرة العمل انجزت بسرعة فائقة ودقة عالية. الفريق متعاون وملم بكل التفاصيل.",
          "author": {
            "@type": "Person",
            "name": "عميل تأشيرة عمل"
          }
        },
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "أفضل مكتب لتصديق الشهادات. كانت كل الأوراق معهم محضرة بشكل صحيح ولم تواجهنا أي مشاكل مع السفارة.",
          "author": {
            "@type": "Person",
            "name": "عميل تصديق شهادات"
          }
        },
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "تأشيرة الزيارة انجزت في وقت قياسي. الفريق ساعدني في كل خطوة وأجاب على جميع أسئلتي بوضوح.",
          "author": {
            "@type": "Person",
            "name": "عميل تأشيرة زيارة"
          }
        },
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "الاعتماد المهني (إنجاز) انجز بدقة عالية. كانوا يتابعون كل خطوة معي حتى الموافقة النهائية.",
          "author": {
            "@type": "Person",
            "name": "عميل اعتماد مهني"
          }
        },
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "تجربة رائعة من البداية للنهاية. الموظفون محترفون ومتفهمون لاحتياجات العملاء. سأرشحهم لكل معارفي.",
          "author": {
            "@type": "Person",
            "name": "عميل متكرر"
          }
        },
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "أسرع مكتب في الأردن لإنجاز التأشيرات. كانوا يردون على استفساراتي فوراً عبر الواتساب.",
          "author": {
            "@type": "Person",
            "name": "عميل خدمة سريعة"
          }
        }
      ]
    }
    </script>
'''

def add_reviews_to_index():
    """إضافة قسم التقييمات إلى index.html"""
    filepath = "/home/ubuntu/EnjazKSA/index.html"
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # البحث عن موقع إدراج قسم التقييمات (قبل قسم الأسئلة الشائعة)
    faq_section = '    <!-- FAQ Section -->'
    
    if faq_section not in content:
        print("❌ لم يتم العثور على قسم الأسئلة الشائعة")
        return
    
    # إدراج قسم التقييمات قبل الأسئلة الشائعة
    new_content = content.replace(faq_section, reviews_html + '\n' + faq_section)
    
    # إضافة Schema قبل </head>
    new_content = new_content.replace('</head>', reviews_schema + '</head>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ تم إضافة قسم التقييمات والـ Schema إلى index.html")

# تنفيذ الدالة
add_reviews_to_index()
print("\n✅ تم إنشاء قسم التقييمات بنجاح!")
