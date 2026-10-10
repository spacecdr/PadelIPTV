#!/usr/bin/env python3
"""Package the assembled app without personal signing material."""
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parent.parent
source = root / 'dist' / 'tizen'
version = ET.parse(source / 'config.xml').getroot().attrib['version']
assert (source / 'remote_arm.nexe').is_file(), 'Build the native ARM transport first'
output = root / 'dist' / ('PadelIPTV-' + version + '-tizen-arm-unsigned.wgt')
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(source.rglob('*')):
        relative = file.relative_to(source)
        if not file.is_file() or any(part.startswith('.') for part in relative.parts):
            continue
        if file.name in ('author-signature.xml', 'signature1.xml'):
            continue
        assert file.suffix.lower() not in ('.p12', '.pfx', '.pem', '.key'), file
        archive.write(file, relative.as_posix())
print(output)
