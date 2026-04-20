"""
توليد صورة Hero لصفحة "خدمات أخرى" — السفارة الإماراتية + خدمة الاستلام/التسليم
بنفس هوية الموقع: Navy/Gold، flat editorial، بدون أشخاص/نصوص.
"""
import asyncio, os, sys
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

load_dotenv('/app/backend/.env')
OUTPUT_DIR = Path('/app/frontend/public/images')

BRAND_STYLE = (
    "\n\nSTYLE REQUIREMENTS (strict): "
    "flat 2D editorial illustration style (NOT 3D, NOT photorealistic render), "
    "solid deep navy blue background (#1B2A41) dominant and clean, "
    "gold (#C9A35E) as the only accent color, "
    "very subtle faded watermark in background (barely visible, 8% opacity), "
    "minimal composition with clear focal elements, "
    "thin gold geometric line frame on top-right and bottom-left corners, "
    "premium Arabic editorial magazine cover aesthetic, "
    "NO text, NO letters, NO writing, NO faces, NO people, "
    "clean, sophisticated, luxurious, minimalist, "
    "wide banner aspect ratio 16:9, high resolution."
)

PROMPT = (
    "Editorial banner for 'Other Services' page of a Saudi visa office in Jordan. "
    "Centered flat 2D composition with THREE clean gold line-art elements: "
    "(1) on the left: a simplified flat official document with a gold wax-seal circular stamp overlay (symbol of attestation/certification), "
    "(2) in the center: a clean gold line-art illustration of the UAE Burj Al Arab sail-shaped silhouette next to a minimal UAE flag shape (four simple stripes: black/green/white on left, red vertical band), represented as a tiny flat flag icon on a gold pole, "
    "(3) on the right: a flat gold delivery box/parcel icon with a subtle motion line and a small map-pin icon above it (representing pickup & delivery), "
    "these three elements connected by a thin subtle gold curved line flowing across the composition, "
    "in the faint background a very subtle arabesque geometric pattern watermark (8% opacity, deep navy tone), "
    "thin horizontal gold decorative line at the top connecting three tiny gold dots, "
    "no people, no crowd, only clean iconic silhouettes."
    + BRAND_STYLE
)

async def main():
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not found", file=sys.stderr)
        sys.exit(1)
    gen = OpenAIImageGeneration(api_key=api_key)
    print(">> Generating image for other-services hero ...")
    images = await gen.generate_images(
        prompt=PROMPT,
        model='gpt-image-1',
        number_of_images=1,
    )
    out = OUTPUT_DIR / 'other-services-hero.webp'
    # emergentintegrations returns image bytes directly
    import io
    from PIL import Image
    img_bytes = images[0] if isinstance(images[0], (bytes, bytearray)) else images[0]
    img = Image.open(io.BytesIO(img_bytes))
    img.save(out, 'WEBP', quality=82, method=6)
    print(f">> Saved: {out} ({out.stat().st_size//1024} KB)")

if __name__ == '__main__':
    asyncio.run(main())
