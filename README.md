# TomatoCare · Plant health, made simple

TomatoCare is a clean, responsive tomato plant disease dashboard for growers. Upload a plant photo, review the possible disease, and follow the prevention steps shown by the analyzer.

## Features

- Tomato disease photo upload with JPG, PNG, and WEBP validation
- Local preview and drag-and-drop upload
- Included local reference photos in one upload folder, `assets/disease-photos/`, covering leaf diseases, fruit rot, blossom-end rot, fruit cracking, and healthy fruit/leaf examples
- Automatic analysis after upload, with disease-specific result cards and prevention steps
- Structured disease knowledge in `public/data/disease-catalog.json` with symptoms, affected plant part, actions, and prevention guidance
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

## Sample image attribution

The included reference images in `assets/disease-photos/` are downloaded from the PlantVillage Dataset repository for demonstration purposes:

- https://github.com/spMohanty/PlantVillage-Dataset
