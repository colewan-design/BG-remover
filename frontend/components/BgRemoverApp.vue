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

const fileInput = ref(null)
const isLoading = ref(false)
const hasResult = ref(false)
const progress = ref(0)
const loadingMessage = ref('Loading AI model (one-time download)')

const resultBlob = ref(null)
const originalImageUrl = ref('')
const resultImageUrl = ref('')

const isGoogleReady = ref(false)
const isAuthenticating = ref(false)
const downloadAfterLogin = ref(false)
const pendingGoogleAuth = ref(false)
const authState = ref(null)
const googleTokenClient = shallowRef(null)
const { isDark, toggle: toggleTheme, init: initTheme } = useTheme()

const backendApiBase = computed(() => config.public.backendApiBase.replace(/\/+$/, ''))
const googleClientId = computed(() => config.public.googleClientId.trim())
const hasGoogleClientId = computed(() => Boolean(googleClientId.value))
const isSignedIn = computed(() => Boolean(authState.value?.token))
const signedInLabel = computed(() => authState.value?.user?.name || authState.value?.user?.email || 'Google user')

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

    if (downloadAfterLogin.value) {
      downloadAfterLogin.value = false
      downloadResult(true)
    }
  } catch (error) {
    console.error('Backend Google authentication failed:', error)
    isAuthenticating.value = false
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
  if (url) URL.revokeObjectURL(url)
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

  if (fileInput.value) fileInput.value.value = ''
}

async function processSelectedFile(file) {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    window.alert('Please upload an image file in JPG, PNG, or WEBP format.')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    const ok = window.confirm('This image is larger than 10 MB and may take longer to process. Continue?')
    if (!ok) return
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
        if (!total) return
        const percent = Math.round((current / total) * 100)
        progress.value = percent
        loadingMessage.value = key.startsWith('fetch:')
          ? `Downloading model... ${percent}%`
          : `Processing image... ${percent}%`
      },
    })

    resultBlob.value = blob
    resultImageUrl.value = URL.createObjectURL(blob)
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

async function downloadResult(skipAuthCheck = false) {
  if (!resultBlob.value) return

  if (!skipAuthCheck && !isSignedIn.value) {
    downloadAfterLogin.value = true
    openGoogleSignIn()
    return
  }

  const url = URL.createObjectURL(resultBlob.value)
  const link = document.createElement('a')
  link.href = url
  link.download = 'bg-removed.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
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
  revokeUrl(originalImageUrl.value)
  revokeUrl(resultImageUrl.value)
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
          <span v-if="isSignedIn" class="topbar__user">Signed in as {{ signedInLabel }}</span>
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
          <!-- Sun icon (shown in dark mode to switch to light) -->
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon icon (shown in light mode to switch to dark) -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
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
            :class="{ 'upload-card--loading': isLoading }"
            role="button"
            tabindex="0"
            aria-label="Upload an image to remove its background"
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

            <p class="upload-card__title">Drop your image here</p>
            <p class="upload-card__hint">
              or <span class="upload-card__link">browse</span> from your device
            </p>
            <p class="upload-card__meta">PNG, JPG, WEBP up to 20MB</p>

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
              @change="handleFileChange"
            >
          </div>

          <div class="preview-card">
            <div v-if="isLoading" class="preview-card__loading" aria-live="polite">
              <div class="spinner" aria-hidden="true"/>
              <p class="preview-card__loading-title">Removing background...</p>
              <p class="preview-card__loading-sub">{{ loadingMessage }}</p>
              <div class="progress-track" aria-hidden="true">
                <div class="progress-fill" :style="{ width: `${progress}%` }"/>
              </div>
            </div>

            <template v-else-if="hasResult">
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
                  Remove Background
                </button>
                <button class="btn btn--dark" type="button" @click="downloadResult()">
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {{ isSignedIn ? 'Download PNG' : 'Sign in to Download' }}
                </button>
                <button class="btn btn--dark" type="button" @click="resetState">
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Try Another
                </button>
              </div>
              <p class="download-note">Google sign-in is required before downloading the final PNG.</p>
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
                  Remove Background
                </button>
                <button class="btn btn--dark" type="button" disabled>
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PNG
                </button>
                <button class="btn btn--dark" type="button" disabled>
                  <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Try Another
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
            <p class="feature-item__title">Google Sign-in</p>
            <p class="feature-item__sub">Required for download</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
