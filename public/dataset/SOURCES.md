# Image sources and attribution

## Tomato leaf photographs

PlantVillage, Mohanty, Hughes and Salathe (2016), *Using Deep Learning for Image-Based
Plant Disease Detection*, DOI: https://doi.org/10.3389/fpls.2016.01419

- Repository: https://github.com/spMohanty/PlantVillage-Dataset
- License stated by the authors' dataset card: **CC BY-SA 3.0**
- Dataset card: https://huggingface.co/datasets/mohanty/PlantVillage
- License: https://creativecommons.org/licenses/by-sa/3.0/
- Files are byte-for-byte copies of the source JPEGs, renamed and organized into class folders.
- Per-file original download URLs are recorded in `manifest.json`.
- This reference subset has no train/test split. Model evaluation requires the source
  dataset's leaf-group-aware split to avoid leakage between photos of the same leaf.

## Tomato fruit photographs

All three are **CC0 1.0**, according to their Wikimedia file pages:
https://creativecommons.org/publicdomain/zero/1.0/

| Condition | Author | Source | Copy used |
|---|---|---|---|
| Late blight fruit rot | Scot Nelson | https://commons.wikimedia.org/wiki/File:Tomato_late_blight_fruit_rot_(5816739820).jpg | Original JPEG |
| Blossom-end rot | Fructibus | https://commons.wikimedia.org/wiki/File:Blossom_end_rot_tomato_2017_A.jpg | Wikimedia 250px thumbnail |
| Fruit cracking | Fructibus | https://commons.wikimedia.org/wiki/File:2_x_Cracked_tomato_2017_A.jpg | Wikimedia 250px thumbnail |

## Crop-protection guide

Symptoms and non-chemical field-care guidance are educational summaries integrated into
the TomatoCare Reference Guide. The guide keeps the major/minor disease grouping and
tomato crop facts in-app so growers can read them without leaving TomatoCare.
