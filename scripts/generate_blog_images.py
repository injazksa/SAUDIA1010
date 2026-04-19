"""
Script لتوليد صور غلاف المدونات باستخدام Gemini Nano Banana.
تُشغَّل مرة واحدة لتوليد الصور ثم يتم حفظها كـ WebP.

الألوان: Navy (#1B2A41) + Gold (#C9A35E)
الأسلوب: احترافي، إسلامي/سعودي مناسب، عربي
"""

import asyncio
import base64
import os
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv('/app/backend/.env')

OUTPUT_DIR = Path('/app/frontend/public/images')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# قائمة الصور المطلوبة مع الـ prompts
IMAGES = [
    {
        'name': 'blog-umrah-hero',
        'prompt': (
            "Elegant wide banner illustration (16:9) for an Arabic travel blog about Umrah pilgrimage. "
            "Silhouette of the Kaaba and Grand Mosque of Mecca at golden hour, minarets of Masjid al-Haram, "
            "soft golden light, deep navy blue sky (#1B2A41) transitioning to warm gold (#C9A35E), "
            "subtle Islamic geometric patterns as frame decorations, professional editorial style, "
            "clean composition, no text, no people, respectful and serene atmosphere, "
            "ultra high quality, cinematic lighting, 4k detail."
        )
    },
    {
        'name': 'blog-work-visa-hero',
        'prompt': (
            "Professional wide banner illustration (16:9) for an Arabic business blog about Saudi work visa. "
            "Modern Riyadh skyline silhouette featuring Kingdom Tower at sunset, subtle Saudi architectural motifs, "
            "passport and official documents in foreground with golden accents, "
            "color palette: deep navy blue (#1B2A41) background with gold (#C9A35E) highlights, "
            "clean professional corporate style, Islamic geometric border patterns, "
            "no text, no faces, elegant and trustworthy atmosphere, "
            "ultra high quality 4k, cinematic composition."
        )
    },
    {
        'name': 'blog-umrah-steps',
        'prompt': (
            "Clean minimalist infographic-style illustration (16:9) showing Umrah pilgrimage steps: "
            "ihram garments, path to Mecca, Kaaba circumambulation (tawaf) abstract representation, "
            "Safa and Marwa hills silhouettes. Deep navy blue (#1B2A41) background, gold (#C9A35E) details. "
            "Professional vector-style flat design, Islamic geometric accents, no text, no people visible, "
            "respectful and reverent mood, editorial quality, 4k."
        )
    },
    {
        'name': 'blog-work-visa-documents',
        'prompt': (
            "Flat lay professional illustration (16:9) of Saudi work visa application documents: "
            "passport, employment contract, medical certificate, sealed official stamps, "
            "on a dark navy blue (#1B2A41) wooden desk background with gold (#C9A35E) accents on stamps and seals. "
            "Clean corporate editorial style, soft shadows, premium feel, no text, no hands, "
            "Islamic geometric pattern as subtle border, ultra high detail 4k."
        )
    }
]


async def generate_image(item):
    api_key = os.getenv('EMERGENT_LLM_KEY')
    if not api_key:
        print(f"❌ EMERGENT_LLM_KEY not found")
        return False

    print(f"🎨 Generating: {item['name']}...")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"blog-image-{item['name']}",
        system_message="You are an expert visual designer creating clean, professional editorial illustrations for an Arabic Saudi visa consulting website."
    )
    chat.with_model("gemini", "gemini-2.5-flash-image-preview").with_params(modalities=["image", "text"])

    try:
        msg = UserMessage(text=item['prompt'])
        text, images = await chat.send_message_multimodal_response(msg)

        if not images:
            print(f"   ⚠️  No image returned for {item['name']}")
            return False

        # حفظ كـ PNG أولاً، ثم تحويل لـ WebP
        png_path = OUTPUT_DIR / f"{item['name']}.png"
        webp_path = OUTPUT_DIR / f"{item['name']}.webp"

        image_bytes = base64.b64decode(images[0]['data'])
        png_path.write_bytes(image_bytes)
        print(f"   ✓ PNG saved: {png_path.name} ({len(image_bytes)//1024} KB)")

        # تحويل لـ WebP باستخدام Pillow
        try:
            from PIL import Image
            img = Image.open(png_path).convert('RGB')
            # تصغير أقصى عرض 1600 لتوفير الحجم
            if img.width > 1600:
                ratio = 1600 / img.width
                img = img.resize((1600, int(img.height * ratio)), Image.LANCZOS)
            img.save(webp_path, 'WEBP', quality=82, method=6)
            size_kb = webp_path.stat().st_size // 1024
            print(f"   ✓ WebP saved: {webp_path.name} ({size_kb} KB)")
            # احذف PNG الأصلي (احتفظ بـ WebP فقط)
            png_path.unlink()
        except ImportError:
            print(f"   ⚠️  Pillow not installed, keeping PNG only")

        return True
    except Exception as e:
        print(f"   ❌ Error for {item['name']}: {e}")
        return False


async def main():
    print(f"🎨 Generating {len(IMAGES)} blog images...")
    print(f"   Output: {OUTPUT_DIR}\n")

    results = []
    for item in IMAGES:
        ok = await generate_image(item)
        results.append((item['name'], ok))
        await asyncio.sleep(2)  # احترام rate-limits

    print(f"\n{'='*50}")
    print(f"📊 RESULTS:")
    for name, ok in results:
        print(f"  {'✓' if ok else '✗'} {name}")
    print(f"{'='*50}")


if __name__ == '__main__':
    asyncio.run(main())
