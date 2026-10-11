# TomatoCare · Plant health, made simple

TomatoCare is a clean, responsive tomato plant disease dashboard for growers. Upload a plant photo, review the possible disease, and follow the prevention steps shown by the analyzer.

## Features

- Tomato disease photo upload with JPG, PNG, and WEBP validation
- Local preview and drag-and-drop upload
- Included local reference photos in one upload folder, `assets/disease-photos/`, covering leaf diseases, fruit rot, blossom-end rot, fruit cracking, and healthy fruit/leaf examples
- A collected, labeled dataset at `public/dataset/tomato-disease-images/` with 203 verified images across 13 tomato categories
- A Documents export at `C:\Users\pasup\Documents\TomatoCare-Disease-Dataset` for uploading collected images manually
- Automatic analysis after upload, with disease-specific result cards and prevention steps
- Structured disease knowledge in `public/data/disease-catalog.json` with symptoms, affected plant part, actions, and prevention guidance
- A top Tomato Disease Guide organized into Major diseases, Minor diseases, Fruit disorders, and Pests & vectors
- Guide cards for TNAU-style crop-protection topics such as damping off, Fusarium wilt, bacterial wilt, bacterial canker, spotted wilt, powdery mildew, and whiteflies
- Plant disease library with tomato and apple examples
- Crop expert contact directory with phone and message actions
- Responsive desktop, tablet, and mobile interface
- Vite build setup for local development and deployment

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. To make a production build:

```bash
npm run build
npm run preview
```

## Disease detection note

The analyzer automatically compares an uploaded photo with the bundled local reference images. It recognizes leaf and fruit conditions including early blight, late blight fruit rot, bacterial spot, target spot, leaf mold, Septoria, yellow leaf curl virus, mosaic virus, spider mites, blossom-end rot, and fruit cracking. It also recognizes descriptive filenames such as `early-blight.jpg` and `tomato-fruit-late-blight.jpg`. For production predictions on arbitrary photos, connect a trained CNN or inference API in `runAnalysis()` and return the disease key from the image bytes. Photos that do not match confidently are marked for expert review instead of being silently called healthy.

## Using the collected photos

1. Open `C:\Users\pasup\Documents\TomatoCare-Disease-Dataset`.
2. Choose an image from a disease folder, or copy a personal photo into a separate folder.
3. Upload it in TomatoCare with **Choose a photo** or drag and drop it.
4. TomatoCare first checks the file's SHA-256 content against `public/dataset/manifest.json`.
5. An exact collected image shows the disease label immediately after analysis, then displays its symptoms, affected part, actions, prevention, and follow-up schedule.
6. A new photo is compared visually with the 200 leaf references. If there is not a confident match, the app shows **Expert review** instead of claiming a diagnosis.

To rebuild the collection from the public sources, install Pillow and run:

```bash
pip install Pillow
python scripts/collect-dataset.py --per-class 20 --export "C:\Users\pasup\Documents\TomatoCare-Disease-Dataset"
```

The local image matcher is a reference/demo workflow. It is not a replacement for a trained CNN and it should not be used as the only basis for pesticide or medical-style decisions. See `public/dataset/README.md` and `public/dataset/SOURCES.md` for collection details and attribution.

## Disease guide source

The guide grouping and terminology are based on the Tamil Nadu Agricultural University crop-protection reference:

- https://agritech.tnau.ac.in/crop_protection/crop_prot_crop%20diseases_veg_tomato.html

The guide is an educational reference. Confirm treatment choices with a local agriculture officer and follow product labels for any crop-protection input.

## Sample image attribution

The included reference images in `assets/disease-photos/` are downloaded from the PlantVillage Dataset repository for demonstration purposes:

- https://github.com/spMohanty/PlantVillage-Dataset
