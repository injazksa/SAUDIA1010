#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Process professions data with specific filtering and document requirements mapping
"""

import json

def get_document_requirements(title, code, category):
    """
    Map profession to required documents based on user's specific rules
    All professions include "شهادة مطعوم السحايا"
    """
    title_lower = title.lower()
    
    # Base documents for ALL professions
    base_docs = []
    
    # Common documents for most professions
    common_docs = [
        "جواز سفر ساري المفعول (صلاحية 6 أشهر على الأقل)",
        "صور شخصية حديثة (6 صور مقاس 4×6، خلفية بيضاء)",
        "الفحص الطبي المعتمد من المراكز المعتمدة",
        "شهادة مطعوم السحايا (إلزامية لجميع المهن)",
    ]
    
    # CEO / General Manager / Commercial Manager - Special documents
    if any(keyword in title_lower for keyword in ['رئيس تنفيذي', 'مدير تنفيذي', 'مدير عام', 'مدير تجاري', 'مدير إقليمي', 'مدير عمليات']):
        return common_docs + [
            "الشهادات الأكاديمية (البكالوريوس أو ماجستير)",
            "شهادات الخبرة العملية (خبرة لا تقل عن 5 سنوات في المجال الإداري)",
            "السيرة الذاتية (CV) المحدثة",
            "تصديق الشهادات من وزارة التعليم العالي الأردنية",
            "تصديق الشهادات من وزارة الخارجية الأردنية",
            "تصديق الشهادات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
            "عقد العمل موثق ومصدق",
        ]
    
    # Private Driver - Special requirements
    if 'سائق خاص' in title_lower or code == 'DRV001':
        return common_docs + [
            "رخصة قيادة سارية المفعول (خاصة أو عمومية)",
            "مستخرج رخصة قيادة من إدارة السير الأردنية",
            "شهادة حسن سيرة وسلوك من الأمن العام",
            "تصديق المستندات من وزارة الخارجية الأردنية",
            "تصديق المستندات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
            "عقد العمل موثق ومصدق",
        ]
    
    # Engineers - Special requirements
    if any(keyword in title_lower for keyword in ['مهندس', 'هندسة']):
        return common_docs + [
            "شهادة البكالوريوس في الهندسة (تخصص محدد)",
            "شهادات الخبرة العملية في مجال الهندسة",
            "عضوية نقابة المهندسين الأردنيين (إن وجدت)",
            "السيرة الذاتية (CV) المحدثة",
            "تصديق الشهادات من وزارة التعليم العالي الأردنية",
            "تصديق الشهادات من وزارة الخارجية الأردنية",
            "تصديق الشهادات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
            "عقد العمل موثق ومصدق",
        ]
    
    # Family Sponsorship (Male)
    if category == 'استقدام' or 'استقدام' in title_lower:
        return common_docs + [
            "شهادة ميلاد مصدقة",
            "دفتر العائلة (للمتزوجين)",
            "شهادة حسن سيرة وسلوك من الأمن العام",
            "عدم ممانعة من الكفيل (إن وجد كفيل سابق)",
            "تصديق المستندات من وزارة الخارجية الأردنية",
            "تصديق المستندات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
        ]
    
    # Domestic Workers (Male & Female)
    if category == 'عمالة منزلية' or any(keyword in title_lower for keyword in ['عامل منزلي', 'عاملة منزلية', 'خادمة']):
        return common_docs + [
            "شهادة حسن سيرة وسلوك من الأمن العام",
            "عدم ممانعة من الكفيل السابق (إن وجد)",
            "تصديق المستندات من وزارة الخارجية الأردنية",
            "تصديق المستندات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
            "عقد العمل موثق ومصدق",
            "ملاحظة: لا يشترط خبرة سابقة",
        ]
    
    # Workers WITHOUT experience required (Loading, Packing, General Labor)
    if any(keyword in title_lower for keyword in ['عامل تحميل', 'عامل تنزيل', 'عامل تعبئة', 'عامل تغليف', 'عامل نظافة', 'عامل عام']):
        return common_docs + [
            "شهادة حسن سيرة وسلوك من الأمن العام",
            "تصديق المستندات من وزارة الخارجية الأردنية",
            "تصديق المستندات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
            "عقد العمل موثق ومصدق",
            "ملاحظة: لا يشترط خبرة سابقة أو شهادات أكاديمية",
        ]
    
    # Professions requiring experience (Quality Controller, Admin Assistant, Florist)
    if any(keyword in title_lower for keyword in ['منسق زهور', 'مراقب جودة', 'مساعد إداري', 'مراقب', 'منسق', 'مشرف']):
        return common_docs + [
            "الشهادات الأكاديمية (ثانوية عامة أو دبلوم حسب المهنة)",
            "شهادات الخبرة العملية (خبرة لا تقل عن سنتين في نفس المجال)",
            "السيرة الذاتية (CV) المحدثة",
            "تصديق الشهادات من وزارة التعليم العالي الأردنية",
            "تصديق الشهادات من وزارة الخارجية الأردنية",
            "تصديق الشهادات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
            "عقد العمل موثق ومصدق",
        ]
    
    # Personal Guard / Security
    if 'حارس' in title_lower or 'أمن' in title_lower:
        return common_docs + [
            "شهادة حسن سيرة وسلوك من الأمن العام",
            "شهادات خبرة في مجال الأمن أو الحراسة (إن وجدت)",
            "اللياقة البدنية (شهادة طبية تثبت اللياقة)",
            "تصديق المستندات من وزارة الخارجية الأردنية",
            "تصديق المستندات من السفارة السعودية",
            "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
            "عقد العمل موثق ومصدق",
        ]
    
    # Default for other professions
    return common_docs + [
        "الشهادات الأكاديمية (حسب المهنة: ثانوية عامة، دبلوم، أو بكالوريوس)",
        "شهادات الخبرة العملية (إن وجدت)",
        "تصديق الشهادات من وزارة التعليم العالي الأردنية",
        "تصديق الشهادات من وزارة الخارجية الأردنية",
        "تصديق الشهادات من السفارة السعودية",
        "تفويض إلكتروني (إنجاز) من الكفيل في السعودية",
        "عقد العمل موثق ومصدق",
    ]


def get_female_requirements(title, code, category):
    """
    Get requirements for FEMALE workers - WITHOUT driving license extracts
    But need "عدم ممانعة"
    """
    # Get male requirements first
    male_reqs = get_document_requirements(title, code, category)
    
    # Filter out driving-related documents and add "عدم ممانعة"
    female_reqs = []
    for req in male_reqs:
        if 'قيادة' not in req and 'سائق' not in req:
            female_reqs.append(req)
    
    # Add specific female requirement
    if "عدم ممانعة" not in str(female_reqs):
        female_reqs.insert(4, "عدم ممانعة من الكفيل السابق (إن وجد)")
    
    return female_reqs


def should_exclude_profession(title, code, category):
    """
    Check if profession should be excluded
    Exclude: Government, Royal, Lawyers, Doctors
    """
    exclude_keywords = [
        'طبيب', 'دكتور',  # Doctors
        'محامي', 'قاضي',  # Lawyers
        'وزير', 'حكومة', 'حكومي',  # Government
        'شيخ', 'أمير', 'ملك',  # Royal
    ]
    
    title_lower = title.lower()
    
    for keyword in exclude_keywords:
        if keyword in title_lower:
            return True
    
    return False


def add_missing_professions():
    """
    Add professions that are NOT in the original PDF
    """
    missing_professions = [
        {
            "code": "DRV001",
            "title": "سائق خاص",
            "category": "عمالة وسائقين",
            "type": "skilled",
            "gender": "ذكور",
            "experience_required": True,
        },
        {
            "code": "DMW001",
            "title": "عامل منزلي (ذكور)",
            "category": "عمالة منزلية",
            "type": "domestic",
            "gender": "ذكور",
            "experience_required": False,
        },
        {
            "code": "DMW002",
            "title": "عاملة منزلية (إناث)",
            "category": "عمالة منزلية",
            "type": "domestic",
            "gender": "إناث",
            "experience_required": False,
        },
        {
            "code": "SEC001",
            "title": "حارس شخصي",
            "category": "أمن وحراسة",
            "type": "security",
            "gender": "ذكور",
            "experience_required": True,
        },
        {
            "code": "SEC002",
            "title": "حارس أمن",
            "category": "أمن وحراسة",
            "type": "security",
            "gender": "ذكور",
            "experience_required": False,
        },
    ]
    
    return missing_professions


def process_professions():
    """
    Main processing function
    """
    # Load existing data
    with open('/app/frontend/public/professions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Original professions count: {len(data)}")
    
    # Filter out excluded professions
    filtered_data = []
    excluded_count = 0
    
    for item in data:
        title = item.get('title', '')
        code = item.get('code', '')
        category = item.get('category', '')
        
        if should_exclude_profession(title, code, category):
            excluded_count += 1
            print(f"Excluded: {code} - {title}")
            continue
        
        # Add requirements
        item['requirements'] = get_document_requirements(title, code, category)
        item['profession_name_ar'] = title
        item['profession_code'] = code
        
        # Add gender info if applicable
        if 'عاملة' in title or 'نساء' in title or category == 'عمالة منزلية':
            item['gender'] = 'إناث'
            item['requirements'] = get_female_requirements(title, code, category)
        else:
            item['gender'] = 'ذكور'
        
        filtered_data.append(item)
    
    print(f"Excluded professions: {excluded_count}")
    print(f"Remaining after filtering: {len(filtered_data)}")
    
    # Add missing professions
    missing = add_missing_professions()
    for prof in missing:
        # Add requirements based on gender
        if prof.get('gender') == 'إناث':
            prof['requirements'] = get_female_requirements(
                prof['title'], prof['code'], prof['category']
            )
        else:
            prof['requirements'] = get_document_requirements(
                prof['title'], prof['code'], prof['category']
            )
        
        prof['profession_name_ar'] = prof['title']
        prof['profession_code'] = prof['code']
        
        filtered_data.append(prof)
    
    print(f"Added missing professions: {len(missing)}")
    print(f"Final total: {len(filtered_data)}")
    
    # Sort by category and then by title
    filtered_data.sort(key=lambda x: (x.get('category', ''), x.get('title', '')))
    
    # Save to new file
    with open('/app/frontend/public/professions_processed.json', 'w', encoding='utf-8') as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=2)
    
    print("\n✅ Processing complete!")
    print(f"Output file: /app/frontend/public/professions_processed.json")
    
    # Show sample
    print("\n=== Sample processed professions ===")
    for i in range(min(3, len(filtered_data))):
        prof = filtered_data[i]
        print(f"\n{prof['code']} - {prof['title']} [{prof['category']}]")
        print(f"Requirements: {len(prof['requirements'])} items")
        print(f"Gender: {prof.get('gender', 'غير محدد')}")


if __name__ == '__main__':
    process_professions()
