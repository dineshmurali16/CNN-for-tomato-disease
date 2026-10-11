# Leela · Plant health, made simple

Leela is a clean, responsive plant-disease dashboard for growers. Upload a plant photo, try one of the included reference scans, review the possible disease, and follow the field-care actions.

## Features

- Tomato disease photo upload with JPG, PNG, and WEBP validation
- Local preview and drag-and-drop upload
- Included local reference photos for early blight, late blight, leaf mold, and Septoria leaf spot
- Disease-specific result cards with confidence text and practical care actions
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

The included reference scans demonstrate the user experience with local, known sample mappings. For arbitrary uploaded photos, `app.js` currently uses a filename-based demo fallback. Connect a trained CNN or inference API in the `analyzeButton` handler to return a production prediction from the image bytes.

## Sample image attribution

The included reference images are downloaded from the PlantVillage Dataset repository for demonstration purposes:

- https://github.com/spMohanty/PlantVillage-Dataset
