const fileInput = document.getElementById("fileInput");
const uploadZone = document.getElementById("uploadZone");
const uploadVisual = document.getElementById("uploadVisual");
const uploadCopy = document.querySelector(".upload-copy");
const selectedFile = document.getElementById("selectedFile");
const filePreview = document.getElementById("filePreview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const removeFile = document.getElementById("removeFile");
const analyzeButton = document.getElementById("analyzeButton");
const resultCard = document.getElementById("resultCard");
const resultTitle = document.getElementById("resultTitle");
const resultStatus = document.getElementById("resultStatus");
const resultSubtext = document.getElementById("resultSubtext");
const resultDetails = document.getElementById("resultDetails");
const resultLabel = document.getElementById("resultLabel");
const resultDescription = document.getElementById("resultDescription");
const detectedName = document.getElementById("detectedName");
const confidenceText = document.getElementById("confidenceText");
const affectedPart = document.getElementById("affectedPart");
const preventionList = document.getElementById("preventionList");
const healthScore = document.getElementById("healthScore");
const viewReport = document.getElementById("viewReport");
const toast = document.getElementById("toast");
const reportModal = document.getElementById("reportModal");

let currentFile = null;
let pendingDiagnosis = null;
let activeDiagnosis = "healthy";
let analysisRun = 0;
let isAnalyzing = false;

let referencePhotos = {
  earlyBlight: "assets/disease-photos/tomato-early-blight.jpg",
  lateBlight: "assets/disease-photos/tomato-late-blight.jpg",
  leafMold: "assets/disease-photos/tomato-leaf-mold.jpg",
  septoria: "assets/disease-photos/tomato-septoria-leaf-spot.jpg"
};

const diagnosisCatalog = {
  healthy: {
    isDisease: false,
    title: "Your plants are looking good",
    statusClass: "healthy",
    statusLabel: "Healthy",
    subtext: "Great work, Alex!",
    description: "No visible disease pattern was found in this photo.",
    score: 87,
    toast: "Analysis complete · No disease signs found",
    modalTitle: "Your tomato plant looks healthy",
    name: "No disease signs detected",
    confidence: "Reference review complete",
    actions: ["Keep leaves dry and water at the soil line", "Give plants space for steady airflow", "Check new growth once a week"],
    prevention: ["Water at the base in the morning", "Remove fallen leaves from the soil", "Inspect the lower leaves weekly"]
  },
  earlyBlight: {
    isDisease: true,
    title: "Early blight may be present",
    statusClass: "review",
    statusLabel: "Review needed",
    subtext: "Let’s take action early.",
    description: "Brown target-like spots are common on older tomato leaves.",
    score: 61,
    toast: "Analysis complete · Possible early blight found",
    modalTitle: "Early blight action plan",
    name: "Early blight (Alternaria)",
    confidence: "Reference match · Check lower leaves first",
    actions: ["Remove affected lower leaves", "Water at the soil line, not leaves", "Improve airflow between plants"],
    prevention: ["Rotate tomatoes away from last season’s bed", "Mulch around the plant to stop soil splash", "Disinfect pruners after removing spotted leaves"]
  },
  lateBlight: {
    isDisease: true,
    title: "Late blight needs attention",
    statusClass: "review",
    statusLabel: "Urgent review",
    subtext: "Act quickly to limit spread.",
    description: "Dark, water-soaked lesions can spread quickly in wet weather.",
    score: 44,
    toast: "Analysis complete · Possible late blight found",
    modalTitle: "Late blight action plan",
    name: "Late blight (Phytophthora)",
    confidence: "Reference match · Separate this plant now",
    actions: ["Isolate the affected plant", "Remove and bag damaged leaves", "Avoid overhead watering and wet foliage"],
    prevention: ["Do not compost infected plant material", "Improve spacing and ventilation", "Check nearby plants every day during wet weather"]
  },
  leafMold: {
    isDisease: true,
    title: "Tomato leaf mold may be present",
    statusClass: "review",
    statusLabel: "Review needed",
    subtext: "Improve airflow today.",
    description: "Yellow patches and olive growth often appear in humid spaces.",
    score: 55,
    toast: "Analysis complete · Possible leaf mold found",
    modalTitle: "Leaf mold action plan",
    name: "Tomato leaf mold (Passalora)",
    confidence: "Reference match · Inspect the leaf undersides",
    actions: ["Prune the most affected leaves", "Ventilate the greenhouse or rows", "Water at the base in the morning"],
    prevention: ["Keep greenhouse humidity under control", "Leave space between plants for airflow", "Avoid wetting the leaves when watering"]
  },
  septoria: {
    isDisease: true,
    title: "Septoria leaf spot may be present",
    statusClass: "review",
    statusLabel: "Review needed",
    subtext: "Protect new growth.",
    description: "Small spots with pale centers usually begin on lower leaves.",
    score: 58,
    toast: "Analysis complete · Possible Septoria spot found",
    modalTitle: "Septoria leaf spot action plan",
    name: "Septoria leaf spot",
    confidence: "Reference match · Inspect lower foliage",
    actions: ["Remove spotted leaves from the soil", "Mulch to reduce splashback", "Disinfect pruners between plants"],
    prevention: ["Use clean seed and disease-free transplants", "Rotate the crop for at least two seasons", "Water at the base instead of using a sprinkler"]
  },
  uncertain: {
    isDisease: true,
    title: "This photo needs a closer look",
    statusClass: "review",
    statusLabel: "Expert review",
    subtext: "No confident disease match yet.",
    description: "The photo did not closely match the local reference disease set.",
    score: 50,
    toast: "Analysis complete · Expert review recommended",
    modalTitle: "Expert review recommended",
    name: "No confident disease match",
    confidence: "Low confidence · Add a clear close-up of the leaf",
    actions: ["Take another photo in natural light", "Capture both sides of the leaf", "Contact a crop specialist for confirmation"],
    prevention: ["Avoid overhead watering until identified", "Isolate a strongly affected plant", "Do not apply treatment until the disease is confirmed"]
  }
};

function showToast(message) {
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function prettySize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB · Analysis starting`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB · Analysis starting`;
}

function selectFile(file) {
  if (!file) return;
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    showToast("Please choose a JPG, PNG, or WEBP image");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast("That photo is larger than 10 MB");
    return;
  }

  currentFile = file;
  pendingDiagnosis = null;
  analysisRun += 1;
  document.querySelectorAll(".sample-card").forEach((card) => card.classList.remove("selected"));
  fileName.textContent = file.name;
  fileSize.textContent = prettySize(file.size);
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    filePreview.src = reader.result;
    uploadVisual.hidden = true;
    uploadCopy.hidden = true;
    uploadZone.classList.add("has-file");
    selectedFile.hidden = false;
    analyzeButton.disabled = false;
    showToast("Photo added · analyzing now");
    window.setTimeout(() => runAnalysis(), 350);
  });
  reader.readAsDataURL(file);
}

function selectSample(card) {
  const diagnosis = card.dataset.sample;
  currentFile = { name: card.dataset.name, size: 0, type: "image/jpeg", isSample: true };
  pendingDiagnosis = diagnosis;
  analysisRun += 1;
  filePreview.src = card.dataset.image;
  fileName.textContent = card.dataset.name;
  fileSize.textContent = "Reference photo · Analysis starting";
  uploadVisual.hidden = true;
  uploadCopy.hidden = true;
  uploadZone.classList.add("has-file");
  selectedFile.hidden = false;
  analyzeButton.disabled = false;
  document.querySelectorAll(".sample-card").forEach((sample) => sample.classList.toggle("selected", sample === card));
  showToast("Reference photo selected · analyzing now");
  window.setTimeout(() => runAnalysis(), 350);
}

fileInput.addEventListener("change", (event) => selectFile(event.target.files[0]));

["dragenter", "dragover"].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  uploadZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach((eventName) => uploadZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  uploadZone.classList.remove("dragover");
}));
uploadZone.addEventListener("drop", (event) => selectFile(event.dataTransfer.files[0]));

removeFile.addEventListener("click", () => {
  analysisRun += 1;
  currentFile = null;
  pendingDiagnosis = null;
  fileInput.value = "";
  selectedFile.hidden = true;
  uploadVisual.hidden = false;
  uploadCopy.hidden = false;
  uploadZone.classList.remove("has-file");
  analyzeButton.disabled = true;
  analyzeButton.innerHTML = '<span class="button-icon">✦</span> Analyze my plant <span class="button-arrow">→</span>';
});

function setHealthResult(diagnosisKey = "healthy", confidenceOverride = "") {
  const result = diagnosisCatalog[diagnosisKey] || diagnosisCatalog.uncertain;
  activeDiagnosis = diagnosisKey;
  resultTitle.textContent = result.title;
  resultStatus.className = `status-pill ${result.statusClass}`;
  resultStatus.innerHTML = `<i></i> ${result.statusLabel}`;
  resultSubtext.textContent = result.subtext;
  resultDescription.textContent = result.description;
  healthScore.innerHTML = `${result.score}<span>%</span>`;
  document.querySelector(".ring-value").style.stroke = result.isDisease ? "#e58a4c" : "";
  document.querySelector(".ring-value").style.strokeDashoffset = result.isDisease ? `${264 - (264 * result.score) / 100}` : "33";
  resultDetails.className = `result-details ${result.isDisease ? "" : "healthy-details"}`;
  resultLabel.innerHTML = result.isDisease
    ? '<span class="alert-dot"></span> Possible disease detected'
    : '<span class="healthy-dot"></span> Plant health check';
  detectedName.textContent = result.name;
  confidenceText.textContent = confidenceOverride || result.confidence;
  affectedPart.textContent = `Affected part: ${result.bodyPart || (result.isDisease ? "Leaf" : "Leaf or fruit")}`;
  preventionList.innerHTML = result.prevention.map((item) => `<li>${item}</li>`).join("");
  viewReport.innerHTML = result.isDisease ? 'View prevention plan <span>→</span>' : 'View health report <span>→</span>';
}

function inferUploadedDiagnosis(file) {
  const name = file.name.toLowerCase();
  const tokenMatches = Object.entries(diagnosisCatalog).flatMap(([key, data]) => (data.fileTokens || [])
    .filter((token) => name.includes(token))
    .map((token) => ({ key, token })));
  tokenMatches.sort((first, second) => second.token.length - first.token.length);
  if (tokenMatches[0]) return tokenMatches[0].key;
  if (name.includes("late") && name.includes("blight")) return "lateBlight";
  if (name.includes("early") && name.includes("blight")) return "earlyBlight";
  if (name.includes("mold") || name.includes("mildew")) return "leafMold";
  if (name.includes("septoria") || name.includes("spot")) return "septoria";
  return null;
}

async function loadDiseaseCatalog() {
  try {
    const response = await fetch("data/disease-catalog.json");
    if (!response.ok) throw new Error(`Disease catalog request failed: ${response.status}`);
    const data = await response.json();
    Object.entries(data).forEach(([key, details]) => {
      diagnosisCatalog[key] = { ...diagnosisCatalog[key], ...details };
      if (details.image) referencePhotos[key] = details.image;
    });
    setHealthResult(activeDiagnosis);
  } catch (error) {
    console.warn("Disease catalog could not be loaded; using built-in defaults", error);
  }
}

function imageSignature(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, 16, 16);
      const pixels = context.getImageData(0, 0, 16, 16).data;
      const signature = [];
      for (let index = 0; index < pixels.length; index += 4) {
        signature.push(pixels[index] / 255, pixels[index + 1] / 255, pixels[index + 2] / 255);
      }
      resolve(signature);
    };
    image.onerror = () => reject(new Error("Could not read image"));
    image.src = source;
  });
}

const referenceSignatures = new Map();
async function getReferenceSignature(key) {
  if (!referenceSignatures.has(key)) {
    referenceSignatures.set(key, imageSignature(referencePhotos[key]));
  }
  return referenceSignatures.get(key);
}

function signatureDistance(first, second) {
  if (!first || !second || first.length !== second.length) return 1;
  let total = 0;
  for (let index = 0; index < first.length; index += 1) total += Math.abs(first[index] - second[index]);
  return total / first.length;
}

async function classifyUploadedPhoto(file) {
  const filenameDiagnosis = inferUploadedDiagnosis(file);
  if (filenameDiagnosis) return { key: filenameDiagnosis, confidence: "Filename hint · Confirm with a clear leaf close-up" };
  if (file.isSample && pendingDiagnosis) return { key: pendingDiagnosis, confidence: "Bundled reference photo · Matched exactly" };

  const objectUrl = URL.createObjectURL(file);
  try {
    const uploadedSignature = await imageSignature(objectUrl);
    const candidates = await Promise.all(Object.keys(referencePhotos).map(async (key) => ({
      key,
      distance: signatureDistance(uploadedSignature, await getReferenceSignature(key))
    })));
    candidates.sort((first, second) => first.distance - second.distance);
    const closest = candidates[0];
    if (closest && closest.distance <= 0.08) {
      const confidence = `${Math.max(85, Math.round(100 - closest.distance * 100))}% visual match to local reference`;
      return { key: closest.key, confidence };
    }
  } catch (error) {
    console.warn("Local reference comparison failed", error);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  return { key: "uncertain", confidence: diagnosisCatalog.uncertain.confidence };
}

async function runAnalysis() {
  if (!currentFile || isAnalyzing) return;
  const fileAtStart = currentFile;
  const runAtStart = ++analysisRun;
  isAnalyzing = true;
  analyzeButton.disabled = true;
  analyzeButton.innerHTML = '<span class="button-icon">✦</span> Analyzing photo…';
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const match = pendingDiagnosis
      ? { key: pendingDiagnosis, confidence: "Bundled reference photo · Matched exactly" }
      : await classifyUploadedPhoto(fileAtStart);
    if (runAtStart !== analysisRun || fileAtStart !== currentFile) return;
    const result = diagnosisCatalog[match.key] || diagnosisCatalog.uncertain;
    setHealthResult(match.key, match.confidence);
    resultCard.classList.remove("result-pulse");
    void resultCard.offsetWidth;
    resultCard.classList.add("result-pulse");
    showToast(result.toast);
  } finally {
    isAnalyzing = false;
    if (runAtStart === analysisRun && fileAtStart === currentFile) {
      analyzeButton.disabled = false;
      analyzeButton.innerHTML = '<span class="button-icon">✦</span> Analyze again <span class="button-arrow">→</span>';
    }
  }
}

document.querySelectorAll(".sample-card").forEach((card) => card.addEventListener("click", () => selectSample(card)));
document.querySelectorAll("[data-library-sample]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  const card = document.querySelector(`[data-sample="${link.dataset.librarySample}"]`);
  if (card) {
    selectSample(card);
    document.getElementById("scan").scrollIntoView({ behavior: "smooth" });
  }
}));

analyzeButton.addEventListener("click", () => runAnalysis());

viewReport.addEventListener("click", () => {
  const result = diagnosisCatalog[activeDiagnosis] || diagnosisCatalog.uncertain;
  document.getElementById("modalTitle").textContent = result.modalTitle;
  document.getElementById("modalScore").textContent = `${result.score}%`;
  const checks = document.querySelector(".report-checks");
  checks.innerHTML = result.actions.map((action, index) => `<div><span>${result.isDisease ? index + 1 : "✓"}</span><strong>${action}</strong></div>`).join("");
  reportModal.hidden = false;
});

function closeModal() { reportModal.hidden = true; }
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalDone").addEventListener("click", closeModal);
reportModal.addEventListener("click", (event) => { if (event.target === reportModal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

const mobileMenu = document.getElementById("mobileMenu");
mobileMenu.addEventListener("click", () => document.getElementById("sidebar").classList.toggle("mobile-open"));

document.querySelectorAll(".nav-item, .sidebar-tip a, .view-all, .guide-link").forEach((link) => {
  link.addEventListener("click", () => document.getElementById("sidebar").classList.remove("mobile-open"));
});

setHealthResult("healthy");
loadDiseaseCatalog();
