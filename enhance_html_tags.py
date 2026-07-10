import os
import re
from pathlib import Path

def enhance_html_file(file_path):
    """إضافة OG و Twitter tags إلى ملف HTML"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # استخراج العنوان والوصف من الملف
    title_match = re.search(r'<title>(.*?)</title>', content)
    description_match = re.search(r'<meta name="description" content="(.*?)"', content)
    
    if not title_match or not description_match:
        return False
    
    title = title_match.group(1)
    description = description_match.group(1)
    
    # استخراج الـ URL من الملف
    canonical_match = re.search(r'<link rel="canonical" href="(.*?)"', content)
    url = canonical_match.group(1) if canonical_match else ""
    
    # إنشاء OG و Twitter tags
    og_tags = f"""    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{url}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://saudia-visa.com/og-image.jpg">
    <meta property="og:site_name" content="مكتب تأشيرات السعودية">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="https://saudia-visa.com/og-image.jpg">
    <meta name="twitter:site" content="@saudia_visa">"""
    
    # التحقق من وجود OG tags
    if 'og:title' in content:
        return False  # Tags موجودة بالفعل
    
    # إضافة Tags قبل </head>
    new_content = content.replace('</head>', f"{og_tags}\n</head>")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True

def process_all_html_files():
    """معالجة جميع ملفات HTML في المشروع"""
    
    base_dir = "/home/ubuntu/project/N-main/frontend/public"
    
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                try:
                    if enhance_html_file(file_path):
                        count += 1
                        print(f"✓ Enhanced: {file_path}")
                except Exception as e:
                    print(f"✗ Error processing {file_path}: {e}")
    
    print(f"\nTotal files enhanced: {count}")

if __name__ == "__main__":
    process_all_html_files()
