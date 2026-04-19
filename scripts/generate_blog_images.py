"""
سكربت توليد صور المدونات كاملة بجودة عالية + prompts مُصمَّمة بعناية لتحكي قصة كل مقال.
كل صورة:
- 16:9 professional banner
- Navy (#1B2A41) + Gold (#C9A35E) color palette
- ترتبط مباشرة بمحتوى المقال وعناصره المحورية
- بدون نصوص ولا وجوه بشرية
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

load_dotenv('/app/backend/.env')

OUTPUT_DIR = Path('/app/frontend/public/images')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# base style string used for every prompt for consistency
BRAND_STYLE = (
    "Ultra-luxurious cinematic banner illustration, 16:9 aspect ratio, "
    "dominant color palette: deep navy blue (#1B2A41) and rich gold (#C9A35E), "
    "subtle Islamic geometric pattern border on top and bottom edges, "
    "premium magazine editorial quality, sophisticated lighting, "
    "photorealistic render with dramatic depth, "
    "NO text, NO writing, NO letters, NO faces, NO people, "
    "elegant composition with clear focal point, "
    "professional corporate aesthetic, 4k ultra detailed."
)

IMAGES = [
    # ═══════════════════════════════════════════════════
    # 1. تأشيرة العمرة — الكعبة + الطيران + تأشيرة رسمية
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-umrah-hero',
        'prompt': (
            "Majestic luxurious banner: the Holy Kaaba at Masjid al-Haram in Mecca at golden sunset, "
            "dramatically illuminated with warm golden light, tall white minarets rising with green lights, "
            "a commercial airplane elegantly flying in the background sky leaving a soft light trail, "
            "an official open passport document placed elegantly in the bottom corner showing a visa stamp "
            "with gold wax seal (no readable text), "
            "deep navy blue starry night sky transitioning to warm amber-gold horizon, "
            "atmospheric particles and light rays, reverent and spiritual atmosphere, "
            "gold Islamic arabesque patterns framing the corners. " + BRAND_STYLE
        )
    },

    # ═══════════════════════════════════════════════════
    # 2. تأشيرة العمل الشاملة 2026 — خطوات + أختام + أعلام
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-work-visa-hero',
        'prompt': (
            "Premium corporate banner showing the Saudi work visa process: "
            "a luxurious dark wooden desk scene with an open Saudi Arabian passport showing an approved visa stamp "
            "with golden 'APPROVED' embossed seal, next to it an official employment contract document with gold wax seal, "
            "in the top-right a small elegant Saudi Arabia flag (green with white text area - no text) and a small Jordan flag "
            "(black, white, green horizontal with red triangle) standing on small gold bases, "
            "a vintage golden fountain pen placed across the documents, "
            "six small glowing step-icons arranged in a subtle horizontal row at the bottom "
            "(document, stamp, medical cross, verification checkmark, embassy building, approved checkmark) - all gold, "
            "deep navy blue background with soft Riyadh business skyline silhouette in far background showing Kingdom Tower, "
            "dramatic professional lighting with gold accents. " + BRAND_STYLE
        )
    },

    # ═══════════════════════════════════════════════════
    # 3. التأشيرة السياحية — معالم سعودية + جوازات
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-tourist-visa-hero',
        'prompt': (
            "Elegant travel banner featuring Saudi Arabia's iconic tourist landmarks in a layered composition: "
            "the rock-carved tombs of AlUla (Hegra / Madain Saleh) silhouetted on the left, "
            "the historic mud-brick architecture of Diriyah (At-Turaif) in warm desert tones in center, "
            "the modern Jeddah corniche with white arches on the right, "
            "a commercial airplane taking off in the warm golden sky, "
            "in the foreground an open passport with a pristine tourist visa page and a gold entry stamp, "
            "a small vintage suitcase with travel tags, palm trees silhouettes, desert sand in lower corners, "
            "navy-to-amber-to-gold sunset gradient sky, cinematic cinematic travel magazine style. " + BRAND_STYLE
        )
    },

    # ═══════════════════════════════════════════════════
    # 4. الاستقدام العائلي — رموز عائلية بدون وجوه
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-family-visa-hero',
        'prompt': (
            "Warm elegant banner about family reunification visa: "
            "a beautiful family home silhouette with warm gold-lit windows at evening, "
            "in the foreground three linked passport documents arranged like a fan with gold ribbon tying them together, "
            "an official marriage certificate with gold seal on top, children's birth certificates below, "
            "three small stylized gold house icons with hearts, connected by flowing golden ribbon, "
            "Saudi Arabia skyline faded in the distance, palm trees silhouettes, "
            "deep navy blue sky with soft stars, warm gold light rays emerging from the home, "
            "atmosphere of warmth, unity and reunion. " + BRAND_STYLE
        )
    },

    # ═══════════════════════════════════════════════════
    # 5. تأشيرة العمل 2025 (المقال القديم) — بوابة رسمية + عقد
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-work-visa-2025',
        'prompt': (
            "Professional banner for Saudi work visa guide: "
            "a grand ornate embassy gateway with gold lamps on either side, open double doors revealing warm light inside, "
            "in the foreground an elegantly arranged official Saudi employment package: "
            "employment contract folded with gold ribbon, work visa document with 'VISA' embossed gold seal "
            "(no readable text), key with gold tassel, "
            "a briefcase in rich navy leather with gold clasps to the right, "
            "Saudi Arabia map silhouette faintly visible on the wall behind, "
            "soft warm gold lighting creating depth, marble floor with gold inlay patterns, "
            "sophisticated executive atmosphere. " + BRAND_STYLE
        )
    },

    # ═══════════════════════════════════════════════════
    # 6. تصديق الشهادات — شهادات + أختام رسمية
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-certificates-hero',
        'prompt': (
            "Refined banner about document attestation: "
            "multiple official university degree certificates elegantly fanned out on a dark wooden desk, "
            "each certificate displayed with an ornate gold wax seal and gold ribbon, "
            "a large magnifying glass with gold frame resting on one certificate inspecting a gold embossed stamp "
            "(no readable text), "
            "classical fountain pen with gold nib, an antique brass embassy stamp press in the background casting a shadow, "
            "navy blue backdrop with soft gold light rays from above, "
            "Islamic arabesque patterns subtly woven into the background, "
            "authenticity and officialdom atmosphere, premium editorial lighting. " + BRAND_STYLE
        )
    },

    # ═══════════════════════════════════════════════════
    # 7. الاعتماد المهني (QVP / إنجاز) — شهادة + اختبار + تقنية
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-qvp-hero',
        'prompt': (
            "Modern banner about professional accreditation (Saudi QVP program): "
            "a premium navy blue laptop computer with a glowing gold verified checkmark badge floating above its screen, "
            "next to it an elegant professional certificate with gold border and gold embossed seal, "
            "a small abstract golden brain/gear icon representing knowledge verification, "
            "gold star-rating symbols floating softly (5 stars), "
            "a vintage professional stethoscope, architect's compass, and engineer's ruler arranged around the laptop "
            "representing multiple professions, "
            "deep navy blue background with subtle circuit-board-meets-islamic-pattern design, "
            "soft gold particles and light streams, professional high-tech aesthetic. " + BRAND_STYLE
        )
    },

    # ═══════════════════════════════════════════════════
    # 8. أفضل المهن 2025 — ظلال مهن متنوعة
    # ═══════════════════════════════════════════════════
    {
        'name': 'blog-top-professions-hero',
        'prompt': (
            "Stylish banner about top professions in Saudi Arabia: "
            "a panoramic composition showing silhouettes of professional tools representing various in-demand careers: "
            "hard hat with engineer's compass, medical stethoscope, architect's drafting set, "
            "laptop with code symbols, a ledger with calculator, teacher's chalkboard, wrench and hammer for technicians, "
            "all arranged in an elegant symmetric composition on a dark navy marble surface with gold inlay, "
            "a subtle Riyadh corporate skyline silhouette in the background, "
            "warm gold spotlights illuminating each tool from above, "
            "atmosphere of opportunity and professional growth, magazine cover aesthetic. " + BRAND_STYLE
        )
    },
]


async def generate_image(item):
    api_key = os.getenv('EMERGENT_LLM_KEY')
    if not api_key:
        print(f"❌ EMERGENT_LLM_KEY not found")
        return False

    print(f"🎨 Generating: {item['name']}...")
    img_gen = OpenAIImageGeneration(api_key=api_key)

    try:
        images = await img_gen.generate_images(
            prompt=item['prompt'],
            model='gpt-image-1.5',
            number_of_images=1,
            quality='high'
        )

        if not images:
            print(f"   ⚠️  No image returned for {item['name']}")
            return False

        image_bytes = images[0]
        png_path = OUTPUT_DIR / f"{item['name']}.png"
        webp_path = OUTPUT_DIR / f"{item['name']}.webp"
        png_path.write_bytes(image_bytes)

        from PIL import Image
        img = Image.open(png_path).convert('RGB')
        if img.width > 1600:
            ratio = 1600 / img.width
            img = img.resize((1600, int(img.height * ratio)), Image.LANCZOS)
        img.save(webp_path, 'WEBP', quality=85, method=6)
        size_kb = webp_path.stat().st_size // 1024
        print(f"   ✓ {webp_path.name} ({size_kb} KB)")
        png_path.unlink()
        return True
    except Exception as e:
        print(f"   ❌ Error: {type(e).__name__}: {str(e)[:200]}")
        return False


async def main():
    import sys
    # اختر الصور المراد توليدها عبر command-line arg
    names_filter = sys.argv[1:] if len(sys.argv) > 1 else None
    items_to_generate = [i for i in IMAGES if not names_filter or i['name'] in names_filter]

    print(f"🎨 Generating {len(items_to_generate)} images...\n")

    results = []
    for item in items_to_generate:
        ok = await generate_image(item)
        results.append((item['name'], ok))
        await asyncio.sleep(3)

    print(f"\n{'='*60}\n📊 RESULTS:")
    for name, ok in results:
        print(f"  {'✓' if ok else '✗'} {name}")
    print(f"{'='*60}")


if __name__ == '__main__':
    asyncio.run(main())
