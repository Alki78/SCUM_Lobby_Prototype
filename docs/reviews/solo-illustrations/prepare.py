"""Découpes sans redimensionnement, retouche, texte ajouté ni génération."""
from pathlib import Path
import hashlib
import json
from PIL import Image

folder = Path(__file__).resolve().parent
root = folder.parents[2]
source = root / 'docs/references/Lobby_Solo_Illustrations_Proposition_v1.png'
boxes = {
    'nouvelle-partie.png': (405, 432, 669, 550),
    'tutoriel.png': (405, 569, 669, 690),
    'derniere-session.png': (708, 224, 1152, 383),
}
manifest = {'source': str(source.relative_to(root)),
            'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'coordinates': '[left, top, right exclusive, bottom exclusive]', 'crops': []}
with Image.open(source) as image:
    for name, box in boxes.items():
        crop = image.crop(box)
        target = folder / name
        crop.save(target)
        manifest['crops'].append({'file': name, 'box': box, 'dimensions': crop.size,
                                 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
(folder / 'crops.json').write_text(json.dumps(manifest, indent=2) + '\n')
