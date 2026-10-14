"""Découpes lossless et planche de revue. Exécution : python prepare.py (Pillow)."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parents[1] / 'references/Lobby_Accueil_Illustrations_Proposition_v1.png'
source = Image.open(SOURCE).convert('RGB')
assert source.size == (2129, 738)
# Coordonnées Pillow : bornes droite/basse exclues. Les traits et leur
# frange anticrénelée sont exclus ; aucune scène n'est rééchantillonnée.
scenes = [
    ('communication-officielle', 'Communication officielle', (0, 0, 2129, 405), (732, 252.375)),
    ('battleground', 'Battleground', (3, 414, 697, 734), (236, 148.234)),
    ('dlc', 'DLC', (717, 414, 1412, 734), (236, 148.234)),
    ('communaute', 'Communauté', (1433, 414, 2126, 734), (236, 148.234)),
]
manifest = {'source': str(SOURCE.relative_to(HERE.parents[2])),
            'source_dimensions': list(source.size),
            'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'coordinate_convention': '[left, top, right_exclusive, bottom_exclusive]',
            'viewport_for_panel_measurements': [1837, 856], 'images': []}
sheet = Image.new('RGB', (1837, 856), '#11171d')
draw = ImageDraw.Draw(sheet)
font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font = ImageFont.truetype(font_path, 17)
small = ImageFont.truetype(font_path, 15)
title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
draw.text((24, 18), 'Accueil — quatre découpes indépendantes pour validation', font=title, fill='white')
draw.text((24, 60), 'En haut : compositions conservées. En bas : simulation du cover actuel, sans intégration.', font=font, fill='#c0ceda')
for index, (slug, label, box, panel) in enumerate(scenes):
    crop = source.crop(box)
    destination = HERE / f'{slug}.png'
    crop.save(destination, optimize=True)
    # Vérification de chaque pixel après encodage/décodage PNG.
    with Image.open(destination) as saved:
        assert saved.size == crop.size and saved.tobytes() == crop.tobytes()
    target_ratio = panel[0] / panel[1]
    retained_width = min(1.0, target_ratio / (crop.width / crop.height))
    manifest['images'].append({'file': destination.name, 'crop': list(box),
        'dimensions': list(crop.size), 'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(),
        'panel_background_dimensions': list(panel),
        'horizontal_extent_visible_with_current_cover_percent': round(retained_width * 100, 2)})
    left = 24 + index * 453
    draw.text((left, 106), label, font=font, fill='white')
    draw.text((left, 134), f'{crop.width} × {crop.height} px — PNG natif', font=small, fill='#c0ceda')
    # Aperçu entier, adaptation proportionnelle uniquement pour cette planche.
    preview = ImageOps.contain(crop, (429, 204), Image.Resampling.LANCZOS)
    sheet.paste(preview, (left + (429 - preview.width)//2, 169 + (204 - preview.height)//2))
    draw.rectangle((left, 168, left + 428, 373), outline='#586774')
    draw.text((left, 405), 'Cadrage avec le cover actuel', font=font, fill='white')
    draw.text((left, 433), f'Largeur source visible : {retained_width*100:.1f} %', font=small, fill='#c0ceda')
    size = (429, round(429 / target_ratio))
    covered = ImageOps.fit(crop, size, Image.Resampling.LANCZOS, centering=(0.5, 1.0 if index == 0 else 0.5))
    sheet.paste(covered, (left, 470))
    draw.rectangle((left, 470, left + size[0] - 1, 470 + size[1] - 1), outline='#586774')
draw.text((24, 772), 'Le cover actuel rogne environ 45 % de la largeur du panorama et 27 % de celle des scènes inférieures.', font=font, fill='white')
draw.text((24, 805), 'Planche de revue uniquement : aucun composant, style, asset de production ou comportement modifié.', font=small, fill='#c0ceda')
sheet.save(HERE / 'comparaison-1837x856.png', optimize=True)
(HERE / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(manifest, ensure_ascii=False, indent=2))
