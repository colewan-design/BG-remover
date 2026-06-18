<script setup>
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

useHead({
  script: [
    {
      src: 'https://accounts.google.com/gsi/client',
      async: true,
      defer: true,
    },
  ],
})

const config = useRuntimeConfig()
const authStorageKey = 'bg-remover-auth'
const maxBatchFiles = 20

const fileInput = ref(null)
const batchItems = ref([])
const activeBatchId = ref(null)
const pendingGoogleAuth = ref(false)
const pendingDownloadAction = ref(null)
const isGoogleReady = ref(false)
const isAuthenticating = ref(false)
const authState = ref(null)
const googleTokenClient = shallowRef(null)
const removeBackgroundPromise = shallowRef(null)
const { isDark, toggle: toggleTheme, init: initTheme } = useTheme()

const backendApiBase = computed(() => config.public.backendApiBase.replace(/\/+$/, ''))
const googleClientId = computed(() => config.public.googleClientId.trim())
const hasGoogleClientId = computed(() => Boolean(googleClientId.value))
const isSignedIn = computed(() => Boolean(authState.value?.token))
const signedInLabel = computed(() => authState.value?.user?.name || authState.value?.user?.email || 'Google user')
const currentItem = computed(() => {
  if (!batchItems.value.length) {
    return null
  }

  return batchItems.value.find((item) => item.id === activeBatchId.value) || batchItems.value[0]
})
const isLoading = computed(() => currentItem.value?.status === 'processing')
const hasResult = computed(() => currentItem.value?.status === 'done')
const progress = computed(() => currentItem.value?.progress ?? 0)
const loadingMessage = computed(() => currentItem.value?.loadingMessage || 'Loading AI model (one-time download)')
const originalImageUrl = computed(() => currentItem.value?.originalUrl || '')
const resultImageUrl = computed(() => currentItem.value?.resultUrl || '')
const completedItems = computed(() => batchItems.value.filter((item) => item.status === 'done'))
const failedItems = computed(() => batchItems.value.filter((item) => item.status === 'error'))
const queuedItems = computed(() => batchItems.value.filter((item) => item.status === 'queued'))
const isBatchProcessing = computed(() => batchItems.value.some((item) => item.status === 'processing'))
const hasBatchResults = computed(() => completedItems.value.length > 1)

function persistAuth(state) {
  authState.value = state
  localStorage.setItem(authStorageKey, JSON.stringify(state))
}

function clearAuth() {
  authState.value = null
  localStorage.removeItem(authStorageKey)
}

function hydrateStoredAuth() {
  const raw = localStorage.getItem(authStorageKey)

  if (!raw) {
    return
  }

  try {
    authState.value = JSON.parse(raw)
  } catch {
    localStorage.removeItem(authStorageKey)
  }
}

async function apiRequest(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  if (authState.value?.token) {
    headers.Authorization = `Bearer ${authState.value.token}`
  }

  const response = await fetch(`${backendApiBase.value}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'The request could not be completed.')
  }

  return data
}

async function signOut() {
  try {
    if (authState.value?.token) {
      await apiRequest('/auth/logout', {
        method: 'POST',
      })
    }
  } catch (error) {
    console.error('Sign out failed:', error)
  } finally {
    clearAuth()
  }
}

function runPendingDownloadAction() {
  if (pendingDownloadAction.value === 'all') {
    pendingDownloadAction.value = null
    downloadAllResults(true)
    return
  }

  if (pendingDownloadAction.value === 'single') {
    pendingDownloadAction.value = null
    downloadResult(true)
  }
}

async function handleGoogleAccessTokenResponse(response) {
  try {
    const data = await apiRequest('/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: response.access_token,
      }),
    })

    persistAuth({
      token: data.token,
      user: data.user,
    })

    isAuthenticating.value = false
    runPendingDownloadAction()
  } catch (error) {
    console.error('Backend Google authentication failed:', error)
    isAuthenticating.value = false
    pendingDownloadAction.value = null
    window.alert(error.message || 'Could not sign in with Google.')
  }
}

function initializeGoogleAuth() {
  if (!import.meta.client || !window.google?.accounts?.oauth2 || !hasGoogleClientId.value) {
    return
  }

  googleTokenClient.value = markRaw(window.google.accounts.oauth2.initTokenClient({
    client_id: googleClientId.value,
    scope: 'openid email profile',
    prompt: 'select_account',
    callback: handleGoogleAccessTokenResponse,
    error_callback: (error) => {
      isAuthenticating.value = false
      pendingDownloadAction.value = null
      console.error('Google OAuth failed:', error)
      window.alert('Google sign-in was cancelled or blocked. Please try again.')
    },
  }))

  isGoogleReady.value = true

  if (pendingGoogleAuth.value) {
    pendingGoogleAuth.value = false
    triggerGoogleAuth()
  }
}

function waitForGoogleScript() {
  if (!import.meta.client) {
    return
  }

  let attempts = 0

  const timer = window.setInterval(() => {
    attempts += 1

    if (window.google?.accounts?.oauth2) {
      window.clearInterval(timer)
      initializeGoogleAuth()
    } else if (attempts >= 50) {
      window.clearInterval(timer)
    }
  }, 200)
}

function triggerGoogleAuth() {
  if (!isGoogleReady.value || !googleTokenClient.value) {
    pendingGoogleAuth.value = true
    waitForGoogleScript()
    return
  }

  isAuthenticating.value = true
  googleTokenClient.value.requestAccessToken({
    prompt: 'select_account',
  })
}

function openGoogleSignIn() {
  if (!hasGoogleClientId.value) {
    window.alert('Google sign-in is not configured yet. Add NUXT_PUBLIC_GOOGLE_CLIENT_ID before deploying this flow.')
    return
  }

  if (!isGoogleReady.value) {
    pendingGoogleAuth.value = true
    waitForGoogleScript()
    return
  }

  triggerGoogleAuth()
}

function openFilePicker() {
  fileInput.value?.click()
}

function revokeUrl(url) {
  if (url) {
    URL.revokeObjectURL(url)
  }
}

function revokeItemUrls(item) {
  stopProgressSimulation(item)
  revokeUrl(item.originalUrl)
  revokeUrl(item.resultUrl)
}

function resetState() {
  batchItems.value.forEach(revokeItemUrls)
  batchItems.value = []
  activeBatchId.value = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function getStatusLabel(item) {
  if (item.status === 'done') {
    return 'Ready'
  }

  if (item.status === 'processing') {
    return `${item.progress}%`
  }

  if (item.status === 'error') {
    return 'Retry'
  }

  return 'Queued'
}

function getItemClasses(item) {
  return {
    'batch-list__item--active': item.id === currentItem.value?.id,
    'batch-list__item--error': item.status === 'error',
    'batch-list__item--done': item.status === 'done',
  }
}

function getRemoveBackground() {
  if (!removeBackgroundPromise.value) {
    removeBackgroundPromise.value = import('@imgly/background-removal').then((module) => module.removeBackground)
  }

  return removeBackgroundPromise.value
}

function validateFiles(files) {
  const acceptedFiles = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      window.alert(`${file.name} is not a supported image file.`)
      continue
    }

    if (file.size > 20 * 1024 * 1024) {
      window.alert(`${file.name} is larger than 20 MB.`)
      continue
    }

    acceptedFiles.push(file)
  }

  return acceptedFiles
}

function createBatchItem(file) {
  const id = `${Date.now()}-${crypto.randomUUID()}`

  return {
    id,
    file,
    name: file.name,
    status: 'queued',
    progress: 0,
    reportedProgress: 0,
    loadingMessage: 'Waiting in queue',
    originalUrl: URL.createObjectURL(file),
    resultUrl: '',
    resultBlob: null,
    errorMessage: '',
    progressTimerId: null,
  }
}

function stopProgressSimulation(item) {
  if (item.progressTimerId) {
    window.clearInterval(item.progressTimerId)
    item.progressTimerId = null
  }
}

function startProgressSimulation(item) {
  stopProgressSimulation(item)

  item.progressTimerId = window.setInterval(() => {
    if (item.status !== 'processing') {
      stopProgressSimulation(item)
      return
    }

    const floor = item.reportedProgress || 0
    const cap = item.loadingMessage.startsWith('Downloading model') ? 88 : 94
    const nextProgress = Math.max(item.progress + 1, floor)
    item.progress = Math.min(nextProgress, cap)
  }, 120)
}

async function processBatchItem(item) {
  item.status = 'processing'
  item.progress = 0
  item.reportedProgress = 0
  item.loadingMessage = 'Loading AI model (one-time download)'
  item.errorMessage = ''
  startProgressSimulation(item)

  try {
    const removeBackground = await getRemoveBackground()

    const blob = await removeBackground(item.file, {
      progress: (key, current, total) => {
        if (!total) {
          return
        }

        const percent = Math.round((current / total) * 100)
        item.reportedProgress = percent
        item.progress = Math.max(item.progress, percent)
        item.loadingMessage = key.startsWith('fetch:')
          ? `Downloading model... ${percent}%`
          : `Processing image... ${percent}%`
      },
    })

    stopProgressSimulation(item)
    item.resultBlob = blob
    item.resultUrl = URL.createObjectURL(blob)
    item.status = 'done'
    item.progress = 100
    item.reportedProgress = 100
    item.loadingMessage = 'Background removed successfully'
  } catch (error) {
    console.error(`Background removal failed for ${item.name}:`, error)
    stopProgressSimulation(item)
    revokeUrl(item.resultUrl)
    item.resultUrl = ''
    item.resultBlob = null
    item.status = 'error'
    item.progress = 0
    item.reportedProgress = 0
    item.errorMessage = 'Could not remove the background for this image.'
    item.loadingMessage = 'Processing failed'
  }
}

async function processSelectedFiles(rawFiles) {
  const incomingFiles = Array.from(rawFiles || [])

  if (!incomingFiles.length) {
    return
  }

  const availableSlots = maxBatchFiles - batchItems.value.length

  if (availableSlots <= 0) {
    window.alert(`You can batch edit up to ${maxBatchFiles} images at a time.`)
    return
  }

  const validFiles = validateFiles(incomingFiles).slice(0, availableSlots)

  if (!validFiles.length) {
    return
  }

  if (validFiles.length < incomingFiles.length) {
    window.alert(`Only the first ${availableSlots} valid images were added to this batch.`)
  }

  const newItems = validFiles.map(createBatchItem)
  batchItems.value = [...batchItems.value, ...newItems]
  const reactiveItems = newItems
    .map((newItem) => batchItems.value.find((item) => item.id === newItem.id))
    .filter(Boolean)

  if (!currentItem.value) {
    activeBatchId.value = reactiveItems[0]?.id || null
  }

  for (const item of reactiveItems) {
    if (!activeBatchId.value) {
      activeBatchId.value = item.id
    }

    await processBatchItem(item)

    if (item.status === 'done' && currentItem.value?.status !== 'processing') {
      activeBatchId.value = item.id
    }
  }
}

function handleFileChange(event) {
  processSelectedFiles(event.target.files)
}

function handleDrop(event) {
  processSelectedFiles(event.dataTransfer?.files)
}

function setActiveItem(id) {
  activeBatchId.value = id
}

function removeItem(id) {
  const item = batchItems.value.find((entry) => entry.id === id)

  if (!item) {
    return
  }

  revokeItemUrls(item)
  batchItems.value = batchItems.value.filter((entry) => entry.id !== id)

  if (activeBatchId.value === id) {
    activeBatchId.value = batchItems.value[0]?.id || null
  }

  if (fileInput.value && !batchItems.value.length) {
    fileInput.value.value = ''
  }
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function buildDownloadName(fileName) {
  const dotIndex = fileName.lastIndexOf('.')
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName
  return `${baseName}-bg-removed.png`
}

async function downloadResult(skipAuthCheck = false) {
  if (!currentItem.value?.resultBlob) {
    return
  }

  if (!skipAuthCheck && !isSignedIn.value) {
    pendingDownloadAction.value = 'single'
    openGoogleSignIn()
    return
  }

  downloadBlob(currentItem.value.resultBlob, buildDownloadName(currentItem.value.name))
}

async function downloadAllResults(skipAuthCheck = false) {
  if (!completedItems.value.length) {
    return
  }

  if (!skipAuthCheck && !isSignedIn.value) {
    pendingDownloadAction.value = 'all'
    openGoogleSignIn()
    return
  }

  completedItems.value.forEach((item, index) => {
    window.setTimeout(() => {
      downloadBlob(item.resultBlob, buildDownloadName(item.name))
    }, index * 220)
  })
}

async function retryItem(id) {
  const item = batchItems.value.find((entry) => entry.id === id)

  if (!item || isBatchProcessing.value) {
    return
  }

  activeBatchId.value = id
  await processBatchItem(item)
}

onMounted(async () => {
  initTheme()
  hydrateStoredAuth()
  waitForGoogleScript()

  if (authState.value?.token) {
    try {
      const data = await apiRequest('/auth/me')
      persistAuth({
        token: authState.value.token,
        user: data.user,
      })
    } catch (error) {
      console.error('Stored auth token is no longer valid:', error)
      clearAuth()
    }
  }
})

onBeforeUnmount(() => {
  batchItems.value.forEach(revokeItemUrls)
})
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <div class="container topbar__inner">
        <div class="brand">
          <div class="brand__logo">
            <img src="/favicon.png" alt="" aria-hidden="true">
          </div>
          <span>BG Remover</span>
        </div>

        <nav class="topbar__nav" aria-label="Main navigation">
          <NuxtLink to="/features" class="topbar__link">Features</NuxtLink>
          <NuxtLink to="/pricing" class="topbar__link">Pricing</NuxtLink>
          <NuxtLink to="/api" class="topbar__link">API</NuxtLink>
          <NuxtLink to="/docs" class="topbar__link">Docs</NuxtLink>
        </nav>

        <div class="topbar__auth">
          <div v-if="isSignedIn" class="topbar__user">
            <img
              v-if="authState?.user?.avatar"
              class="topbar__avatar"
              :src="authState.user.avatar"
              :alt="signedInLabel"
              referrerpolicy="no-referrer"
            >
            <span v-else class="topbar__avatar-fallback" aria-hidden="true">{{ signedInLabel.charAt(0).toUpperCase() }}</span>
            <span class="topbar__user-name">{{ signedInLabel }}</span>
          </div>
          <button
            v-if="isSignedIn"
            class="btn btn--dark btn--auth"
            type="button"
            @click="signOut"
          >
            Sign Out
          </button>
          <button
            v-else
            class="btn btn--dark btn--auth"
            type="button"
            @click="openGoogleSignIn"
          >
            Sign in with Google
          </button>
        </div>

        <button class="btn btn--theme" type="button" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span class="btn--theme-label">{{ isDark ? 'Light' : 'Dark' }}</span>
        </button>

        <button class="btn btn--cta" type="button" @click="openFilePicker">
          <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"/>
          </svg>
          Start Free
        </button>
      </div>
    </header>

    <main>
      <section class="workspace">
        <div class="container workspace__grid">
          <div
            class="upload-card"
            :class="{ 'upload-card--loading': isBatchProcessing }"
            role="button"
            tabindex="0"
            aria-label="Upload images to remove their backgrounds"
            @click="openFilePicker"
            @keydown.enter.prevent="openFilePicker"
            @keydown.space.prevent="openFilePicker"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <span class="upload-card__spark upload-card__spark--tl" aria-hidden="true">+</span>
            <span class="upload-card__spark upload-card__spark--tr" aria-hidden="true">*</span>
            <span class="upload-card__spark upload-card__spark--br" aria-hidden="true">+</span>

            <div class="upload-card__circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>

            <p class="upload-card__title">{{ batchItems.length ? 'Add more images' : 'Drop your images here' }}</p>
            <p class="upload-card__hint">
              or <span class="upload-card__link">browse</span> from your device
            </p>
            <p class="upload-card__meta">Batch edit up to {{ maxBatchFiles }} JPG, PNG, or WEBP images at once</p>

            <div v-if="batchItems.length" class="upload-card__stats">
              <span>{{ completedItems.length }} ready</span>
              <span>{{ queuedItems.length }} queued</span>
              <span>{{ failedItems.length }} failed</span>
            </div>

            <button
              class="btn btn--browse"
              type="button"
              tabindex="-1"
              @click.stop="openFilePicker"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Browse Files
            </button>

            <input
              ref="fileInput"
              class="sr-only"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileChange"
            >
          </div>

          <div class="preview-card">
            <div v-if="batchItems.length > 1" class="batch-toolbar">
              <div>
                <p class="batch-toolbar__eyebrow">Bulk Edit</p>
                <p class="batch-toolbar__title">{{ completedItems.length }} of {{ batchItems.length }} images ready</p>
              </div>
              <div class="batch-toolbar__actions">
                <button
                  class="btn btn--dark"
                  type="button"
                  :disabled="!completedItems.length"
                  @click="downloadAllResults()"
                >
                  {{ isSignedIn ? 'Download All' : 'Sign in to Download All' }}
                </button>
                <button class="btn btn--dark" type="button" @click="resetState">
                  Clear Batch
                </button>
              </div>
            </div>

            <div v-if="batchItems.length > 1" class="batch-list">
              <div
                v-for="item in batchItems"
                :key="item.id"
                class="batch-list__item"
                :class="getItemClasses(item)"
                role="button"
                tabindex="0"
                @click="setActiveItem(item.id)"
                @keydown.enter.prevent="setActiveItem(item.id)"
                @keydown.space.prevent="setActiveItem(item.id)"
              >
                <img class="batch-list__thumb" :src="item.resultUrl || item.originalUrl" :alt="item.name">
                <div class="batch-list__copy">
                  <span class="batch-list__name">{{ item.name }}</span>
                  <span class="batch-list__status">{{ getStatusLabel(item) }}</span>
                </div>
                <button
                  v-if="item.status === 'error'"
                  class="batch-list__retry"
                  type="button"
                  @click.stop="retryItem(item.id)"
                >
                  Retry
                </button>
                <button
                  class="batch-list__remove"
                  type="button"
                  aria-label="Remove image from batch"
                  @click.stop="removeItem(item.id)"
                >
                  ×
                </button>
              </div>
            </div>

            <div v-if="isLoading" class="preview-card__loading" aria-live="polite">
              <div class="spinner" aria-hidden="true"/>
              <p class="preview-card__loading-title">Removing background for {{ currentItem?.name }}</p>
              <p class="preview-card__loading-sub">{{ loadingMessage }}</p>
              <div class="progress-track" aria-hidden="true">
                <div class="progress-fill" :style="{ width: `${progress}%` }"/>
              </div>
            </div>

            <template v-else-if="currentItem && hasResult">
              <div class="before-after">
                <div class="ba-col">
                  <span class="ba-label">Before</span>
                  <img class="ba-img" :src="originalImageUrl" alt="Original image">
                </div>
                <div class="ba-col ba-col--checker">
                  <span class="ba-label">After</span>
                  <img class="ba-img" :src="resultImageUrl" alt="Background removed result">
                </div>
              </div>

              <div class="action-row">
                <button class="btn btn--primary" type="button" @click="openFilePicker">
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"/>
                  </svg>
                  Add Images
                </button>
                <button class="btn btn--dark" type="button" @click="downloadResult()">
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {{ isSignedIn ? 'Download PNG' : 'Sign in to Download' }}
                </button>
                <button v-if="hasBatchResults" class="btn btn--dark" type="button" @click="downloadAllResults()">
                  Download All
                </button>
                <button class="btn btn--dark" type="button" @click="resetState">
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Reset
                </button>
              </div>
              <p class="download-note">Google sign-in is required before downloading the finished PNG files.</p>
            </template>

            <template v-else-if="currentItem && currentItem.status === 'error'">
              <div class="preview-card__empty">
                <p class="preview-card__loading-title">{{ currentItem.name }}</p>
                <p class="preview-card__loading-sub">{{ currentItem.errorMessage }}</p>
              </div>

              <div class="action-row">
                <button class="btn btn--primary" type="button" @click="retryItem(currentItem.id)">
                  Retry Image
                </button>
                <button class="btn btn--dark" type="button" @click="removeItem(currentItem.id)">
                  Remove
                </button>
                <button class="btn btn--dark" type="button" @click="openFilePicker">
                  Add More
                </button>
              </div>
            </template>

            <template v-else>
              <div class="before-after before-after--empty">
                <div class="ba-col">
                  <span class="ba-label">Before</span>
                  <div class="ba-placeholder"/>
                </div>
                <div class="ba-col ba-col--checker">
                  <span class="ba-label">After</span>
                  <div class="ba-placeholder"/>
                </div>
              </div>

              <div class="action-row">
                <button class="btn btn--primary" type="button" @click="openFilePicker">
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"/>
                  </svg>
                  Start Batch
                </button>
                <button class="btn btn--dark" type="button" disabled>
                  Download PNG
                </button>
                <button class="btn btn--dark" type="button" disabled>
                  Download All
                </button>
              </div>
            </template>
          </div>
        </div>
      </section>
    </main>

    <div class="features-bar">
      <div class="container features-bar__grid">
        <div class="feature-item">
          <div class="feature-item__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <p class="feature-item__title">AI Powered</p>
            <p class="feature-item__sub">Smart &amp; Accurate</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-item__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <p class="feature-item__title">100% Secure</p>
            <p class="feature-item__sub">Your images are private</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-item__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/>
              <rect x="15" y="15" width="7" height="7"/><rect x="2" y="15" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <p class="feature-item__title">Bulk Ready</p>
            <p class="feature-item__sub">Process multiple images in one queue</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
