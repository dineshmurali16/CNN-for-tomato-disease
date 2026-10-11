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
const healthScore = document.getElementById("healthScore");
const viewReport = document.getElementById("viewReport");
const toast = document.getElementById("toast");
const reportModal = document.getElementById("reportModal");

let currentFile = null;
let pendingDiagnosis = null;
let activeDiagnosis = "healthy";

const diagnosisCatalog = {
  healthy: {
    isDisease: false,
    title: "Your plants are looking good",
    statusClass: "healthy",
    statusLabel: "Healthy",
    subtext: "Great work, Alex!",
    description: "21 of your 24 monitored plants show no signs of disease.",
    score: 87,
    toast: "Scan complete · No disease signs found",
    modalTitle: "Your tomato plant is healthy",
    confidence: "",
    actions: ["No visible leaf spots", "Strong leaf color", "Good plant vigor"]
  },
  earlyBlight: {
    isDisease: true,
    title: "Early blight may be present",
    statusClass: "review",
    statusLabel: "Review needed",
    subtext: "Let’s take action early.",
    description: "Brown target-like spots are common on older leaves.",
    score: 61,
    toast: "Scan complete · Possible early blight found",
    modalTitle: "Early blight action plan",
    name: "Early blight (Alternaria)",
    confidence: "Confidence 92% · Check lower leaves first",
    actions: ["Remove affected lower leaves", "Water at the soil line, not leaves", "Improve airflow between plants"]
  },
  lateBlight: {
    isDisease: true,
    title: "Late blight needs attention",
    statusClass: "review",
    statusLabel: "Urgent review",
    subtext: "Act quickly to limit spread.",
    description: "Dark, water-soaked lesions can spread quickly in wet weather.",
    score: 44,
    toast: "Scan complete · Possible late blight found",
    modalTitle: "Late blight action plan",
    name: "Late blight (Phytophthora)",
    confidence: "Confidence 90% · Separate this plant now",
    actions: ["Isolate the affected plant", "Remove and bag damaged leaves", "Avoid overhead watering and wet foliage"]
  },
  leafMold: {
    isDisease: true,
    title: "Tomato leaf mold may be present",
    statusClass: "review",
    statusLabel: "Review needed",
    subtext: "Improve airflow today.",
    description: "Yellow patches and olive growth often appear in humid spaces.",
    score: 55,
    toast: "Scan complete · Possible leaf mold found",
    modalTitle: "Leaf mold action plan",
    name: "Tomato leaf mold (Passalora)",
    confidence: "Confidence 89% · Inspect the leaf undersides",
    actions: ["Prune the most affected leaves", "Ventilate the greenhouse or rows", "Water at the base in the morning"]
  },
  septoria: {
    isDisease: true,
    title: "Septoria leaf spot may be present",
    statusClass: "review",
    statusLabel: "Review needed",
    subtext: "Protect new growth.",
    description: "Small spots with pale centers usually begin on lower leaves.",
    score: 58,
    toast: "Scan complete · Possible Septoria spot found",
    modalTitle: "Septoria leaf spot action plan",
    name: "Septoria leaf spot",
    confidence: "Confidence 88% · Inspect lower foliage",
    actions: ["Remove spotted leaves from the soil", "Mulch to reduce splashback", "Disinfect pruners between plants"]
  }
};

function showToast(message) {
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function prettySize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB · Ready to scan`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB · Ready to scan`;
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
  });
  reader.readAsDataURL(file);
  showToast("Photo added successfully");
}

function selectSample(card) {
  const diagnosis = card.dataset.sample;
  currentFile = { name: card.dataset.name, size: 0, type: "image/jpeg", isSample: true };
  pendingDiagnosis = diagnosis;
  filePreview.src = card.dataset.image;
  fileName.textContent = card.dataset.name;
  fileSize.textContent = "Local reference photo · Ready to scan";
  uploadVisual.hidden = true;
  uploadCopy.hidden = true;
  uploadZone.classList.add("has-file");
  selectedFile.hidden = false;
  analyzeButton.disabled = false;
  document.querySelectorAll(".sample-card").forEach((sample) => sample.classList.toggle("selected", sample === card));
  showToast(`${diagnosisCatalog[diagnosis].name || diagnosisCatalog[diagnosis].title} selected`);
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
  currentFile = null;
  pendingDiagnosis = null;
  fileInput.value = "";
  selectedFile.hidden = true;
  uploadVisual.hidden = false;
  uploadCopy.hidden = false;
  uploadZone.classList.remove("has-file");
  analyzeButton.disabled = true;
});

function setHealthResult(diagnosisKey = "healthy") {
  const result = diagnosisCatalog[diagnosisKey] || diagnosisCatalog.healthy;
  activeDiagnosis = diagnosisKey;
  resultTitle.textContent = result.title;
  resultStatus.className = `status-pill ${result.statusClass}`;
  resultStatus.innerHTML = `<i></i> ${result.statusLabel}`;
  resultSubtext.textContent = result.subtext;
  document.getElementById("resultDescription").textContent = result.description;
  healthScore.innerHTML = `${result.score}<span>%</span>`;
  document.querySelector(".ring-value").style.stroke = result.isDisease ? "#e58a4c" : "";
  document.querySelector(".ring-value").style.strokeDashoffset = result.isDisease ? `${264 - (264 * result.score) / 100}` : "33";
  resultDetails.hidden = !result.isDisease;
  if (result.isDisease) {
    document.getElementById("detectedName").textContent = result.name;
    document.getElementById("confidenceText").textContent = result.confidence;
  }
  viewReport.innerHTML = result.isDisease ? 'View treatment plan <span>→</span>' : 'View health report <span>→</span>';
}

function inferUploadedDiagnosis(file) {
  const name = file.name.toLowerCase();
  if (name.includes("late") && name.includes("blight")) return "lateBlight";
  if (name.includes("early") && name.includes("blight")) return "earlyBlight";
  if (name.includes("mold") || name.includes("mildew")) return "leafMold";
  if (name.includes("septoria") || name.includes("spot")) return "septoria";
  return "healthy";
}

document.querySelectorAll(".sample-card").forEach((card) => card.addEventListener("click", () => selectSample(card)));
document.querySelectorAll("[data-library-sample]").forEach((link) => link.addEventListener("click", () => {
  const card = document.querySelector(`[data-sample="${link.dataset.librarySample}"]`);
  if (card) selectSample(card);
}));

analyzeButton.addEventListener("click", () => {
  if (!currentFile) return;
  analyzeButton.disabled = true;
  analyzeButton.innerHTML = '<span class="button-icon">✦</span> Analyzing photo…';
  window.setTimeout(() => {
    // Sample photos map to their documented disease. For new photos, the filename
    // fallback is only a demo; replace this block with a real model API in production.
    const diagnosisKey = pendingDiagnosis || inferUploadedDiagnosis(currentFile);
    const result = diagnosisCatalog[diagnosisKey] || diagnosisCatalog.healthy;
    setHealthResult(diagnosisKey);
    analyzeButton.disabled = false;
    analyzeButton.innerHTML = '<span class="button-icon">✦</span> Analyze again <span class="button-arrow">→</span>';
    resultCard.classList.remove("result-pulse");
    void resultCard.offsetWidth;
    resultCard.classList.add("result-pulse");
    showToast(result.toast);
  }, 1250);
});

viewReport.addEventListener("click", () => {
  const result = diagnosisCatalog[activeDiagnosis] || diagnosisCatalog.healthy;
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
