"""Collect a labeled reference subset and export it for manual website uploads.

Run: python scripts/collect-dataset.py --per-class 20 --export <folder>
Requires Pillow for actual image decoding/validation. No model is trained here.
"""
import argparse
import hashlib
import io
import json
import shutil
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DEST = PUBLIC / "dataset" / "tomato-disease-images"
MANIFEST = PUBLIC / "dataset" / "manifest.json"
REPO = "https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/raw/color/"
CLASSES = {
    "healthy": ("healthy", "Tomato___healthy", "tomato-healthy.jpg"),
    "earlyBlight": ("early-blight", "Tomato___Early_blight", "tomato-early-blight.jpg"),
    "lateBlight": ("late-blight", "Tomato___Late_blight", "tomato-late-blight.jpg"),
    "leafMold": ("leaf-mold", "Tomato___Leaf_Mold", "tomato-leaf-mold.jpg"),
    "septoria": ("septoria-leaf-spot", "Tomato___Septoria_leaf_spot", "tomato-septoria-leaf-spot.jpg"),
    "bacterialSpot": ("bacterial-spot", "Tomato___Bacterial_spot", "tomato-bacterial-spot.jpg"),
    "targetSpot": ("target-spot", "Tomato___Target_Spot", "tomato-target-spot.jpg"),
    "yellowLeafCurl": ("yellow-leaf-curl-virus", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "tomato-yellow-leaf-curl-virus.jpg"),
    "mosaicVirus": ("mosaic-virus", "Tomato___Tomato_mosaic_virus", "tomato-mosaic-virus.jpg"),
    "spiderMites": ("spider-mites", "Tomato___Spider_mites Two-spotted_spider_mite", "tomato-spider-mites.jpg"),
}
FRUIT = {
    "fruitLateBlight": ("fruit-late-blight", "tomato-fruit-late-blight.jpg", "Tomato_late_blight_fruit_rot_(5816739820).jpg", "Scot Nelson"),
    "blossomEndRot": ("blossom-end-rot", "tomato-blossom-end-rot.jpg", "Blossom_end_rot_tomato_2017_A.jpg", "Fructibus"),
    "fruitCracking": ("fruit-cracking", "tomato-fruit-cracking.jpg", "2_x_Cracked_tomato_2017_A.jpg", "Fructibus"),
}


def fetch(url):
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "TomatoCare-dataset-collector/1.0"})
            with urllib.request.urlopen(request, timeout=45) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def record(key, path, source, author, license_name):
    data = path.read_bytes()
    with Image.open(io.BytesIO(data)) as image:
        image.verify()
    with Image.open(io.BytesIO(data)) as image:
        image.load()
        width, height = image.size
    return {"key": key, "path": path.relative_to(PUBLIC).as_posix(),
            "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data),
            "width": width, "height": height, "source": source,
            "author": author, "license": license_name}


def collect(count):
    records = []
    for key, (folder, source_class, seed) in CLASSES.items():
        listing = json.loads(fetch(REPO + urllib.parse.quote(source_class)))
        listing = sorted((item for item in listing if item["name"].lower().endswith(".jpg")), key=lambda item: item["name"])
        destination = DEST / folder
        destination.mkdir(parents=True, exist_ok=True)
        seed_path = ROOT / "assets" / "disease-photos" / seed
        data = seed_path.read_bytes()
        git_hash = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
        seed_entry = next(item for item in listing if item["sha"] == git_hash)
        seed_target = destination / "reference-01.jpg"
        shutil.copyfile(seed_path, seed_target)
        author = "PlantVillage; Mohanty, Hughes and Salathe (2016)"
        records.append(record(key, seed_target, seed_entry["download_url"], author, "CC-BY-SA-3.0"))
        remaining = [item for item in listing if item["sha"] != git_hash]
        # Spread samples across the available listing rather than downloading duplicates.
        picks = [remaining[round(i * (len(remaining) - 1) / max(1, count - 2))] for i in range(count - 1)]

        def download(job):
            number, item = job
            path = destination / f"reference-{number:02}.jpg"
            if path.exists():
                existing = path.read_bytes()
                existing_hash = hashlib.sha1(b"blob " + str(len(existing)).encode() + b"\0" + existing).hexdigest()
                if existing_hash != item["sha"]:
                    raise ValueError(f"Existing file differs from expected source: {path}")
            else:
                image_bytes = fetch(item["download_url"])
                with Image.open(io.BytesIO(image_bytes)) as image:
                    image.verify()
                path.write_bytes(image_bytes)
            return record(key, path, item["download_url"], author, "CC-BY-SA-3.0")

        with ThreadPoolExecutor(max_workers=4) as executor:
            records.extend(executor.map(download, enumerate(picks, start=2)))
        print(f"{folder}: {count} validated photographs", flush=True)

    for key, (folder, seed, title, author) in FRUIT.items():
        destination = DEST / folder
        destination.mkdir(parents=True, exist_ok=True)
        path = destination / "reference-01.jpg"
        shutil.copyfile(ROOT / "assets" / "disease-photos" / seed, path)
        source = "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(title)
        records.append(record(key, path, source, author, "CC0-1.0"))

    hashes = [item["sha256"] for item in records]
    if len(hashes) != len(set(hashes)):
        raise ValueError("Duplicate image bytes in the dataset")
    manifest = {"version": 1, "method": "sha256-reference-lookup", "imageCount": len(records),
                "classCount": len({item["key"] for item in records}), "images": records}
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest


def verify(manifest):
    for item in manifest["images"]:
        path = PUBLIC / item["path"]
        checked = record(item["key"], path, item["source"], item["author"], item["license"])
        if checked != item:
            raise ValueError(f"Manifest mismatch: {path}")
    print(f"Verified {len(manifest['images'])} image hashes, labels and dimensions.", flush=True)


def export_dataset(manifest, destination):
    destination.mkdir(parents=True, exist_ok=True)
    for item in manifest["images"]:
        source = PUBLIC / item["path"]
        target = destination / source.relative_to(DEST)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != item["sha256"]:
            raise ValueError(f"Refusing to overwrite a different file: {target}")
        shutil.copyfile(source, target)
    shutil.copyfile(MANIFEST, destination / "manifest.json")
    for name in ("README.md", "SOURCES.md"):
        shutil.copyfile(PUBLIC / "dataset" / name, destination / name)
    print(f"Upload folder: {destination}", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--per-class", type=int, default=20)
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--export", type=Path)
    args = parser.parse_args()
    if args.per_class < 2 or args.per_class > 50:
        parser.error("--per-class must be between 2 and 50")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if args.verify_only else collect(args.per_class)
    verify(manifest)
    if args.export:
        export_dataset(manifest, args.export)
