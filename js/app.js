import { removeBackground } from 'https://esm.sh/@imgly/background-removal';

// ─── State ────────────────────────────────────────────────
let resultBlob = null;
let originalObjectURL = null;
let resultObjectURL = null;

// ─── DOM references ───────────────────────────────────────
const uploadSection     = document.getElementById('upload-section');
const uploadZone        = document.getElementById('upload-zone');
const fileInput         = document.getElementById('file-input');
const loadingEl         = document.getElementById('loading');
const loadingSub        = document.getElementById('loading-sub');
const progressBar       = document.getElementById('progress-bar');
const resultSection     = document.getElementById('result-section');
const imgBefore         = document.getElementById('img-before');
const imgAfter          = document.getElementById('img-after');
const compAfter         = document.getElementById('comparison-after');
const compSlider        = document.getElementById('comparison-slider');
const sliderLine        = document.getElementById('slider-line');
const newImageBtn       = document.getElementById('new-image-btn');
const transparentToggle = document.getElementById('transparent-toggle');
const colorRow          = document.getElementById('color-row');
const colorPicker       = document.getElementById('color-picker');
const colorHex          = document.getElementById('color-hex');
const downloadBtn       = document.getElementById('download-btn');

// ─── Upload / Drag-Drop ───────────────────────────────────
uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('click', e => e.stopPropagation());

uploadZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) processFile(fileInput.files[0]);
});

uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', e => {
  if (!uploadZone.contains(e.relatedTarget)) uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});

// ─── Process Image ─────────────────────────────────────────
async function processFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (JPG, PNG, or WEBP).');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    const ok = confirm('This image is larger than 10 MB and may take a while. Continue?');
    if (!ok) return;
  }

  // Revoke previous object URLs
  if (originalObjectURL) URL.revokeObjectURL(originalObjectURL);
  if (resultObjectURL)   URL.revokeObjectURL(resultObjectURL);

  originalObjectURL = URL.createObjectURL(file);
  imgBefore.src = originalObjectURL;

  uploadSection.hidden = true;
  resultSection.hidden = true;
  loadingEl.hidden = false;
  progressBar.style.width = '0%';
  loadingSub.textContent = 'Loading AI model (one-time download)…';

  try {
    const blob = await removeBackground(file, {
      progress: (key, current, total) => {
        if (!total) return;
        const pct = Math.round((current / total) * 100);
        progressBar.style.width = pct + '%';
        if (key.startsWith('fetch:')) {
          loadingSub.textContent = `Downloading model… ${pct}%`;
        } else {
          loadingSub.textContent = `Processing image… ${pct}%`;
        }
      }
    });

    resultBlob = blob;
    resultObjectURL = URL.createObjectURL(blob);
    imgAfter.src = resultObjectURL;

    // Wait for result image to load so dimensions are ready
    await new Promise(resolve => {
      if (imgAfter.complete) { resolve(); return; }
      imgAfter.onload = resolve;
    });

    loadingEl.hidden = true;

    // Reset comparison slider to 50%
    compSlider.value = 50;
    updateSlider(50);

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    console.error('Background removal failed:', err);
    loadingEl.hidden = true;
    uploadSection.hidden = false;
    alert('Could not remove the background. Please try a different image.');
  }
}

// ─── Comparison Slider ────────────────────────────────────
compSlider.addEventListener('input', () => updateSlider(Number(compSlider.value)));

function updateSlider(val) {
  // clip-path: inset(top right bottom left)
  // Clip from right = (100 - val)% to reveal left portion of "after"
  const clipRight = 100 - val;
  compAfter.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
  sliderLine.style.left = val + '%';
}

// ─── "Try Another" button ─────────────────────────────────
newImageBtn.addEventListener('click', () => {
  resultSection.hidden = true;
  uploadSection.hidden = false;
  fileInput.value = '';
  uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ─── Background Controls ──────────────────────────────────
transparentToggle.addEventListener('change', () => {
  const isTransparent = transparentToggle.checked;
  colorRow.classList.toggle('disabled', isTransparent);
});

colorPicker.addEventListener('input', () => {
  colorHex.textContent = colorPicker.value;
});

// ─── Download ─────────────────────────────────────────────
downloadBtn.addEventListener('click', async () => {
  if (!resultBlob) return;

  downloadBtn.disabled = true;
  downloadBtn.textContent = 'Preparing…';

  try {
    let downloadURL;

    if (transparentToggle.checked) {
      downloadURL = URL.createObjectURL(resultBlob);
    } else {
      downloadURL = await compositeWithColor(resultBlob, colorPicker.value);
    }

    const a = document.createElement('a');
    a.href = downloadURL;
    a.download = 'bg-removed.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Small delay before revoking so the download can start
    setTimeout(() => URL.revokeObjectURL(downloadURL), 2000);

  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download PNG`;
  }
});

// ─── Helpers ──────────────────────────────────────────────

async function compositeWithColor(blob, hex) {
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await new Promise(resolve => { img.onload = resolve; });

  const canvas = document.createElement('canvas');
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(img.src);

  return new Promise(resolve => {
    canvas.toBlob(b => resolve(URL.createObjectURL(b)), 'image/png');
  });
}
