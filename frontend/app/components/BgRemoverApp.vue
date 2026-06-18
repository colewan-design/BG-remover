<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const config = useRuntimeConfig()
const fileInput = ref(null)

const isLoading = ref(false)
const hasResult = ref(false)
const progress = ref(0)
const loadingMessage = ref('Loading AI model (one-time download)')

const isTransparent = ref(true)
const selectedColor = ref('#ffffff')
const resultBlob = ref(null)

const originalImageUrl = ref('')
const resultImageUrl = ref('')
const sliderValue = ref(50)

const featureCards = [
  {
    eyebrow: 'Private',
    title: '100% local processing',
    description:
      'Your images stay in your browser while the model runs on your device.',
  },
  {
    eyebrow: 'Precise',
    title: 'AI-powered cutouts',
    description:
      'The app uses modern segmentation to handle edges like hair, fur, and soft shadows.',
  },
  {
    eyebrow: 'Free',
    title: 'No signup required',
    description:
      'Upload, process, compare, and download without creating an account.',
  },
]

const comparisonStyle = computed(() => ({
  clipPath: `inset(0 ${100 - sliderValue.value}% 0 0)`,
}))

const sliderLineStyle = computed(() => ({
  left: `${sliderValue.value}%`,
}))

const colorHexLabel = computed(() => selectedColor.value.toLowerCase())
const backendApiHealthUrl = computed(() => `${config.public.backendApiBase}/health`)

function openFilePicker() {
  fileInput.value?.click()
}

function revokeUrl(url) {
  if (url) {
    URL.revokeObjectURL(url)
  }
}

function resetState() {
  hasResult.value = false
  isLoading.value = false
  progress.value = 0
  loadingMessage.value = 'Loading AI model (one-time download)'
  resultBlob.value = null

  revokeUrl(originalImageUrl.value)
  revokeUrl(resultImageUrl.value)

  originalImageUrl.value = ''
  resultImageUrl.value = ''
  sliderValue.value = 50

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function processSelectedFile(file) {
  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    window.alert('Please upload an image file in JPG, PNG, or WEBP format.')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    const shouldContinue = window.confirm(
      'This image is larger than 10 MB and may take longer to process. Continue?'
    )

    if (!shouldContinue) {
      return
    }
  }

  revokeUrl(originalImageUrl.value)
  revokeUrl(resultImageUrl.value)

  originalImageUrl.value = URL.createObjectURL(file)
  resultImageUrl.value = ''
  resultBlob.value = null
  hasResult.value = false
  isLoading.value = true
  progress.value = 0
  loadingMessage.value = 'Loading AI model (one-time download)'

  try {
    const { removeBackground } = await import('@imgly/background-removal')

    const blob = await removeBackground(file, {
      progress: (key, current, total) => {
        if (!total) {
          return
        }

        const percent = Math.round((current / total) * 100)
        progress.value = percent
        loadingMessage.value = key.startsWith('fetch:')
          ? `Downloading model... ${percent}%`
          : `Processing image... ${percent}%`
      },
    })

    resultBlob.value = blob
    resultImageUrl.value = URL.createObjectURL(blob)
    sliderValue.value = 50
    hasResult.value = true
  } catch (error) {
    console.error('Background removal failed:', error)
    revokeUrl(resultImageUrl.value)
    resultImageUrl.value = ''
    resultBlob.value = null
    window.alert('Could not remove the background. Please try a different image.')
  } finally {
    isLoading.value = false
  }
}

function handleFileChange(event) {
  const [file] = event.target.files || []
  processSelectedFile(file)
}

function handleDrop(event) {
  const [file] = event.dataTransfer?.files || []
  processSelectedFile(file)
}

async function compositeWithColor(blob, hex) {
  const sourceUrl = URL.createObjectURL(blob)
  const image = new Image()
  image.src = sourceUrl

  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const context = canvas.getContext('2d')

  if (!context) {
    URL.revokeObjectURL(sourceUrl)
    throw new Error('Canvas is not available in this browser.')
  }

  context.fillStyle = hex
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0)

  URL.revokeObjectURL(sourceUrl)

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blobResult) => {
      if (!blobResult) {
        reject(new Error('Could not prepare the PNG download.'))
        return
      }

      resolve(URL.createObjectURL(blobResult))
    }, 'image/png')
  })
}

async function downloadResult() {
  if (!resultBlob.value) {
    return
  }

  let downloadUrl = ''

  try {
    downloadUrl = isTransparent.value
      ? URL.createObjectURL(resultBlob.value)
      : await compositeWithColor(resultBlob.value, selectedColor.value)

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'bg-removed.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    if (downloadUrl) {
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000)
    }
  }
}

onBeforeUnmount(() => {
  revokeUrl(originalImageUrl.value)
  revokeUrl(resultImageUrl.value)
})
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <div class="container topbar__inner">
        <div class="brand">
          <span class="brand__mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </span>
          <span>BG Remover</span>
        </div>
        <a class="topbar__link" :href="backendApiHealthUrl" target="_blank" rel="noreferrer">
          Laravel API
        </a>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <p class="hero__eyebrow">Laravel + Nuxt Migration</p>
          <h1>Remove Image Backgrounds <span>Instantly</span></h1>
          <p class="hero__subtitle">
            Free to use, privacy-friendly, and processed directly in the browser with no signup required.
          </p>
        </div>
      </section>

      <section class="workspace container">
        <section
          v-if="!hasResult && !isLoading"
          class="upload-panel"
        >
          <div
            class="upload-zone"
            role="button"
            tabindex="0"
            aria-label="Upload an image to remove its background"
            @click="openFilePicker"
            @keydown.enter.prevent="openFilePicker"
            @keydown.space.prevent="openFilePicker"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div class="upload-zone__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
            </div>
            <p class="upload-zone__title">Drop your image here</p>
            <p class="upload-zone__hint">or click to browse</p>
            <p class="upload-zone__meta">JPG, PNG, WEBP and up to 10 MB</p>
            <input
              ref="fileInput"
              class="sr-only"
              type="file"
              accept="image/*"
              @change="handleFileChange"
            >
          </div>
        </section>

        <section v-if="isLoading" class="loading-card" aria-live="polite">
          <div class="spinner" aria-hidden="true" />
          <p class="loading-card__title">Removing background...</p>
          <p class="loading-card__text">{{ loadingMessage }}</p>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill" :style="{ width: `${progress}%` }" />
          </div>
        </section>

        <section v-if="hasResult" class="result-grid">
          <article class="panel">
            <div class="panel__header">
              <div>
                <p class="panel__eyebrow">Preview</p>
                <h2>Before and after</h2>
              </div>
              <button class="button button--ghost" type="button" @click="resetState">
                Try another image
              </button>
            </div>

            <div class="comparison">
              <img class="comparison__image" :src="originalImageUrl" alt="Original upload">
              <div class="comparison__after" :style="comparisonStyle">
                <img class="comparison__image" :src="resultImageUrl" alt="Background removed result">
              </div>
              <div class="comparison__labels">
                <span>Original</span>
                <span>Result</span>
              </div>
              <div class="comparison__line" :style="sliderLineStyle">
                <div class="comparison__handle" />
              </div>
              <input
                v-model="sliderValue"
                class="comparison__range"
                type="range"
                min="0"
                max="100"
                aria-label="Comparison slider"
              >
            </div>
          </article>

          <aside class="panel panel--controls">
            <div class="panel__header panel__header--stacked">
              <div>
                <p class="panel__eyebrow">Download</p>
                <h2>Background options</h2>
              </div>
              <p class="panel__copy">
                Keep the PNG transparent or add a solid background color before downloading.
              </p>
            </div>

            <label class="toggle">
              <input v-model="isTransparent" type="checkbox">
              <span class="toggle__track" />
              <span class="toggle__label">Transparent background</span>
            </label>

            <div class="color-control" :class="{ 'color-control--disabled': isTransparent }">
              <div>
                <p class="field-label">Background color</p>
                <p class="field-value">{{ colorHexLabel }}</p>
              </div>
              <input v-model="selectedColor" type="color" aria-label="Background color">
            </div>

            <button class="button button--primary" type="button" @click="downloadResult">
              Download PNG
            </button>
          </aside>
        </section>
      </section>

      <section class="features">
        <div class="container features__grid">
          <article v-for="feature in featureCards" :key="feature.title" class="feature-card">
            <p class="feature-card__eyebrow">{{ feature.eyebrow }}</p>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
