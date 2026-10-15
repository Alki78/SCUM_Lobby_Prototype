"""Assemblages de captures à l'échelle réelle, sans redimensionnement."""
from pathlib import Path
import json
import math
from PIL import Image, ImageDraw, ImageFont

folder = Path(__file__).resolve().parent
measurements = json.loads((folder / "verification.json").read_text())[0]
panel = measurements["v1"]["panel"]
box = (
    math.floor(panel["x"]), math.floor(panel["y"]),
    math.ceil(panel["x"] + panel["width"]),
    math.ceil(panel["bottom"]),
)
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 17)
for filename, crop in (
    ("comparaison-panneaux-v1-v2.png", box),
    ("comparaison-v1-v2-1837x856.png", None),
):
    images = [Image.open(folder / name).convert("RGB") for name in
              ("v1-1837x856.png", "tutoriel-1837x856.png")]
    if crop:
        images = [im.crop(crop) for im in images]
    width, height = images[0].size
    sheet = Image.new("RGB", (width * 2, height + 44), "#17191c")
    draw = ImageDraw.Draw(sheet)
    for i, (im, label) in enumerate(zip(images, (
        "TUTORIEL v1 — composition validée",
        "TUTORIEL v2 — largage, cadrage proposé",
    ))):
        sheet.paste(im, (i * width, 44))
        draw.text((i * width + 12, 12), label, font=font, fill="white")
    sheet.save(folder / filename)
    print(filename, sheet.size)
