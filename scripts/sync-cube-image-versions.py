"""Refresh cache versions after regenerating or replacing tutorial images."""
from pathlib import Path
import hashlib
import json
catalog_path = Path('src/config/cube-tutorial-images.json')
catalog = json.loads(catalog_path.read_text())
for image in catalog.values():
    data = (Path('public/images/rubiks-cube') / image['file']).read_bytes()
    image['version'] = hashlib.sha256(data).hexdigest()[:12]
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
