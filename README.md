# TomatoCare · Plant health, made simple

TomatoCare is a clean, responsive tomato plant disease dashboard for growers. Upload a plant photo, review the possible disease, and follow the prevention steps shown by the analyzer.

## Features

- Tomato disease photo upload with JPG, PNG, and WEBP validation
- Local preview and drag-and-drop upload
- Included local reference photos in `assets/disease-photos/` for early blight, late blight, leaf mold, and Septoria leaf spot
- Automatic analysis after upload, with disease-specific result cards and prevention steps
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

The analyzer automatically compares an uploaded photo with the bundled local reference images. It also recognizes filenames such as `early-blight.jpg` and `late-blight.jpg`. For production predictions on arbitrary photos, connect a trained CNN or inference API in `runAnalysis()` and return the disease key from the image bytes. Photos that do not match confidently are marked for expert review instead of being silently called healthy.

## Sample image attribution

The included reference images in `assets/disease-photos/` are downloaded from the PlantVillage Dataset repository for demonstration purposes:

- https://github.com/spMohanty/PlantVillage-Dataset
