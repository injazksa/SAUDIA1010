"""
إعادة تصميم صور المدونات بأسلوب الـ Hero:
- خلفية navy موحّدة (#1B2A41) مع watermark خفيف جداً
- عناصر flat 2D clean (بدون 3D photorealism)
- إطار هندسي ذهبي minimalist
- أسلوب مجلة عربية فاخرة
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

load_dotenv('/app/backend/.env')

OUTPUT_DIR = Path('/app/frontend/public/images')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# أسلوب موحّد لكل الصور (يطابق الهيدر)
BRAND_STYLE = (
    "\n\nSTYLE REQUIREMENTS (strict): "
    "flat 2D editorial illustration style (NOT 3D, NOT photorealistic render), "
    "solid deep navy blue background (#1B2A41) dominant and clean, "
    "gold (#C9A35E) as the only accent color, "
    "very subtle faded watermark element in background (barely visible, 8% opacity), "
    "minimal composition with a clear single focal element, "
    "thin gold geometric line frame on top-right corner and bottom-left corner, "
    "premium Arabic editorial magazine cover aesthetic, "
    "NO text, NO letters, NO writing, NO faces, NO people, "
    "clean, sophisticated, luxurious, minimalist, "
    "wide banner aspect ratio 16:9, high resolution."
)

IMAGES = [
    {
        'name': 'blog-umrah-hero',
        'prompt': (
            "Editorial banner for Umrah pilgrimage blog article. "
            "Centered composition: a clean flat gold line-art illustration of the Kaaba (simple cubic silhouette with vertical door accent), "
            "surrounded by two tall minaret silhouettes in gold outline on left and right, "
            "a subtle curved gold line arcing over representing a path/pilgrimage journey, "
            "a small gold airplane icon flying gracefully across the top-left corner, "
            "in the faint background a very subtle arabesque islamic geometric pattern watermark (8% opacity, deep navy tone), "
            "thin gold decorative border line on the top edge, "
            "no people, no worshippers, only clean architectural silhouettes."
            + BRAND_STYLE
        )
    },
    {
        'name': 'blog-work-visa-hero',
        'prompt': (
            "Editorial banner for Saudi work visa blog article. "
            "Centered flat 2D composition: a clean gold line-art illustration of an open passport "
            "(simple geometric shape, no details, just the outline and the national emblem as minimal gold icon), "
            "next to it a flat gold document icon with a small gold circular stamp overlay, "
            "two small flat flag shapes on gold poles: one Saudi (green rectangle with small white area) "
            "and one Jordanian (four simple stripes: black, white, green, and a red triangle), "
            "in the faint background a very subtle world map outline watermark or Riyadh skyline silhouette (8% opacity), "
            "thin horizontal gold line at the bottom connecting six tiny gold dots representing steps, "
            "everything flat, geometric, minimal, editorial."
            + BRAND_STYLE
        )
    },
    {
        'name': 'blog-tourist-visa-hero',
        'prompt': (
            "Editorial banner for Saudi tourist visa blog article. "
            "Centered flat 2D composition showing Saudi iconic landmarks as clean gold silhouette outlines arranged horizontally: "
            "a stylized AlUla rock formation on the left (simple geometric tomb-door shape), "
            "a flat gold Kingdom Tower silhouette in the center-back (simple triangular shape with opening), "
            "a minimal palm tree icon on the right, "
            "a small gold airplane icon tracing a dashed gold line arc across the sky from right to left, "
            "a flat gold passport icon in the bottom-center with a small circular entry stamp, "
            "subtle sand dune wavy line at the very bottom in gold, "
            "very faint compass rose watermark in background (8% opacity). "
            + BRAND_STYLE
        )
    },
    {
        'name': 'blog-family-visa-hero',
        'prompt': (
            "Editorial banner for family sponsorship visa blog article. "
            "Centered flat 2D minimalist composition: a simple gold line-art house silhouette with a heart shape inside its roof, "
            "three clean flat gold passport icons stacked elegantly beside the house connected by a flowing gold ribbon, "
            "a small gold wedding-rings icon (two interlocking circles) above, "
            "a subtle gold certificate icon with ribbon in the bottom-right corner, "
            "in the faint background a very subtle family-tree or heart pattern watermark (8% opacity), "
            "warm and welcoming composition but still minimal and editorial, "
            "no human figures, no faces, only abstract gold iconography."
            + BRAND_STYLE
        )
    },
    {
        'name': 'blog-work-visa-2025',
        'prompt': (
            "Editorial banner for Saudi work visa 2025 guide blog article. "
            "Centered flat 2D composition: a clean gold line-art illustration of a briefcase standing, "
            "behind it a simple gold key with tassel rising vertically, "
            "an open gold document icon with folded corner and a circular gold seal, "
            "a small arabesque gate silhouette in gold on the far background (simple arch shape), "
            "subtle Saudi map outline watermark in background (8% opacity), "
            "two thin gold corner decorations forming L-shapes in top-right and bottom-left corners, "
            "everything perfectly balanced and minimal."
            + BRAND_STYLE
        )
    },
    {
        'name': 'blog-certificates-hero',
        'prompt': (
            "Editorial banner for certificate attestation blog article. "
            "Centered flat 2D composition: three stacked simple gold certificate icons fanned out elegantly "
            "(each shown as a clean rectangle with a ribbon bow and a circular seal), "
            "a simple gold magnifying glass icon hovering over them in a minimal outline style, "
            "a small golden wax seal icon with ribbon below, "
            "a thin gold checkmark accent in the top corner, "
            "subtle diploma scroll pattern watermark in background (8% opacity), "
            "geometric and refined."
            + BRAND_STYLE
        )
    },
    {
        'name': 'blog-qvp-hero',
        'prompt': (
            "Editorial banner for professional accreditation (QVP / إنجاز) blog article. "
            "Centered flat 2D composition: a clean gold line-art illustration of a shield with a large checkmark inside, "
            "representing verification and professional accreditation, "
            "around it four small flat gold icons arranged evenly: a graduation cap, a gear, a computer screen, and a star, "
            "a thin gold progress bar/line beneath showing verification stages, "
            "subtle abstract verified-circle pattern watermark in background (8% opacity), "
            "tech-meets-prestige aesthetic, modern and trustworthy."
            + BRAND_STYLE
        )
    },
    {
        'name': 'blog-top-professions-hero',
        'prompt': (
            "Editorial banner for top in-demand professions in Saudi Arabia blog article. "
            "Centered flat 2D composition: six minimal gold icons arranged in a horizontal grid representing different professions: "
            "a hard hat (construction), a stethoscope (medical), an architect's compass-and-ruler, a laptop (tech), "
            "a calculator (accounting), a wrench (technical), "
            "above them a thin gold arrow line rising upward showing growth/demand, "
            "subtle Saudi skyline silhouette watermark in far background (8% opacity), "
            "organized and professional editorial style."
            + BRAND_STYLE
        )
    },
]


async def generate_image(item):
    api_key = os.getenv('EMERGENT_LLM_KEY')
    img_gen = OpenAIImageGeneration(api_key=api_key)
    print(f"🎨 {item['name']}...")
    try:
        images = await img_gen.generate_images(
            prompt=item['prompt'],
            model='gpt-image-1.5',
            number_of_images=1,
            quality='high'
        )
        if not images:
            print(f"   ✗ No image")
            return False
        png_path = OUTPUT_DIR / f"{item['name']}.png"
        webp_path = OUTPUT_DIR / f"{item['name']}.webp"
        png_path.write_bytes(images[0])
        from PIL import Image
        img = Image.open(png_path).convert('RGB')
        if img.width > 1600:
            ratio = 1600 / img.width
            img = img.resize((1600, int(img.height * ratio)), Image.LANCZOS)
        img.save(webp_path, 'WEBP', quality=85, method=6)
        png_path.unlink()
        print(f"   ✓ {webp_path.stat().st_size // 1024} KB")
        return True
    except Exception as e:
        print(f"   ✗ {type(e).__name__}: {str(e)[:150]}")
        return False


async def main():
    import sys
    names = sys.argv[1:] if len(sys.argv) > 1 else None
    items = [i for i in IMAGES if not names or i['name'] in names]
    print(f"🎨 Generating {len(items)} images (flat editorial style)...\n")
    for item in items:
        await generate_image(item)
        await asyncio.sleep(3)


if __name__ == '__main__':
    asyncio.run(main())
