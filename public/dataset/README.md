# TomatoCare upload image collection

Open a disease folder, choose any JPG, and upload it using **Choose a photo** in TomatoCare.
Analysis starts automatically. Renaming or copying a file does not change its result.
The app identifies a collected image by its SHA-256 content hash and displays its source label,
symptoms, field actions, prevention and a saved follow-up task.

This is a labeled reference collection, **not a trained CNN or validation dataset**.
Unseen, cropped or re-encoded photos may not match and return **Not identified**.
A matching image label does not establish diagnosis accuracy on new field photos.

## Collection

- 20 distinct leaf images per class: healthy, bacterial spot, early blight, late blight,
  leaf mold, Septoria leaf spot, target spot, yellow leaf curl virus, mosaic virus and spider mites.
- 1 fruit reference per condition: late blight fruit rot, blossom-end rot and fruit cracking.
- Total: 203 tomato images, 13 categories. Fruit coverage is limited to these three examples.
- A pre-existing `apple-scab` folder, if present in your Documents copy, belongs to the
  older other-crop guide and is not part of the tomato matcher.

`manifest.json` records each image's category, content hash, dimensions, size, source and license.
Its web paths start with `dataset/tomato-disease-images/`; in this Documents export, the
corresponding disease folders are directly next to this README.

See `SOURCES.md` for attribution. No private uploads are sent to a server or added to the collection.
Follow-ups are stored in your browser; completed monitoring tasks do not mean a plant is cured.
