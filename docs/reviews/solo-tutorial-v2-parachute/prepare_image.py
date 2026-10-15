"""Découpe de pixels uniquement : aucune interpolation, retouche ou génération."""
from pathlib import Path
import hashlib
import json
from PIL import Image

folder = Path(__file__).resolve().parent
root = folder.parents[2]
source = root / "docs/references/SCUM_Tutoriel_Largage_Reference.png"
target = folder / "tutoriel-largage-banniere.png"
box = (131, 140, 1519, 780)  # x0, y0 inclus ; x1, y1 exclus
with Image.open(source) as original:
    assert original.size == (1650, 928)
    crop = original.crop(box)
    assert crop.size == (1388, 640)
    crop.save(target)
    with Image.open(target) as saved:
        assert saved.tobytes() == original.crop(box).tobytes()

metadata = {
    "source": str(source.relative_to(root)),
    "source_dimensions": [1650, 928],
    "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "crop_box_exclusive": list(box),
    "output": target.name,
    "output_dimensions": [1388, 640],
    "output_sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
    "aspect_ratio": "694:320, identique à la composition v1",
    "pixel_crop_identical": True,
    "processing": "Découpe rectangulaire seule ; ni redimensionnement, ni retouche, ni génération.",
    "hud": "Barre d'inventaire au bas de la source, vers y=867 et au-delà ; découpe arrêtée à y=780. Aucun HUD visible dans la découpe inspectée.",
}
(folder / "illustration.json").write_text(
    json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print("Bannière : 1388 × 640 px, pixels identiques à la zone source.")
