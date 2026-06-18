<script setup>
useHead({ title: 'API Reference — BG Remover' })

const { init } = useTheme()
onMounted(init)

const baseUrl = 'https://bgremover-api.salidumay.com/api'

const endpoints = [
  {
    method: 'POST',
    path: '/remove-background',
    desc: 'Remove the background from an uploaded image. Returns a URL to the transparent PNG result.',
    auth: true,
    body: `Content-Type: multipart/form-data

image    File     required   JPG, PNG, or WEBP — max 20 MB`,
    response: `{
  "success": true,
  "url": "https://bgremover-api.salidumay.com/results/abc123.png",
  "expires_at": "2025-07-01T12:00:00Z"
}`,
    curl: `curl -X POST ${baseUrl}/remove-background \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -F "image=@photo.jpg"`,
    js: `const form = new FormData()
form.append('image', fileInput.files[0])

const res = await fetch('${baseUrl}/remove-background', {
  method: 'POST',
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
  body: form,
})

const { url } = await res.json()
console.log('Result:', url)`,
    python: `import requests

with open('photo.jpg', 'rb') as f:
    res = requests.post(
        '${baseUrl}/remove-background',
        headers={'Authorization': 'Bearer YOUR_API_TOKEN'},
        files={'image': f},
    )

print(res.json()['url'])`,
  },
  {
    method: 'GET',
    path: '/status',
    desc: 'Check API health and your current rate-limit usage.',
    auth: false,
    body: null,
    response: `{
  "status": "ok",
  "version": "1.0.0",
  "rate_limit": {
    "limit": 100,
    "remaining": 87,
    "reset_at": "2025-07-01T13:00:00Z"
  }
}`,
    curl: `curl ${baseUrl}/status \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`,
    js: `const res = await fetch('${baseUrl}/status', {
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
})
console.log(await res.json())`,
    python: `import requests
res = requests.get(
    '${baseUrl}/status',
    headers={'Authorization': 'Bearer YOUR_API_TOKEN'},
)
print(res.json())`,
  },
]

const activeTab = ref({})
function setTab(endpoint, lang) {
  activeTab.value = { ...activeTab.value, [endpoint]: lang }
}
function getTab(endpoint) {
  return activeTab.value[endpoint] || 'curl'
}
</script>

<template>
  <div class="shell">
    <AppNav />

    <main class="page-main">

      <!-- Hero -->
      <section class="hero-section">
        <div class="container hero-inner">
          <span class="pill">API Reference</span>
          <h1>Integrate BG Remover into your apps</h1>
          <p class="hero-sub">A simple REST API to remove image backgrounds programmatically. Authenticate with a Bearer token and POST your image.</p>
          <div class="hero-meta">
            <span class="meta-chip">Base URL</span>
            <code class="meta-url">{{ baseUrl }}</code>
          </div>
        </div>
      </section>

      <div class="container api-layout">

        <!-- Authentication -->
        <section class="api-section">
          <h2 class="api-section-title">Authentication</h2>
          <p class="api-section-desc">All API requests (except <code>/status</code>) require a Bearer token in the <code>Authorization</code> header. Get your token from your account settings after signing up.</p>
          <div class="code-block">
            <div class="code-block__header">
              <span>Request header</span>
            </div>
            <pre class="code-block__body"><code>Authorization: Bearer YOUR_API_TOKEN</code></pre>
          </div>
        </section>

        <!-- Endpoints -->
        <section v-for="ep in endpoints" :key="ep.path" class="api-section endpoint-card">
          <div class="endpoint-header">
            <span class="method-badge" :class="`method-badge--${ep.method.toLowerCase()}`">{{ ep.method }}</span>
            <code class="endpoint-path">{{ ep.path }}</code>
            <span v-if="ep.auth" class="auth-chip">Requires auth</span>
          </div>
          <p class="api-section-desc">{{ ep.desc }}</p>

          <!-- Request body -->
          <div v-if="ep.body" class="param-table">
            <div class="param-table__head">Request body — <code>multipart/form-data</code></div>
            <pre class="param-table__body"><code>{{ ep.body }}</code></pre>
          </div>

          <!-- Response -->
          <div class="code-block">
            <div class="code-block__header"><span>Response 200</span></div>
            <pre class="code-block__body"><code>{{ ep.response }}</code></pre>
          </div>

          <!-- Code examples -->
          <div class="example-block">
            <div class="tab-bar">
              <button
                v-for="lang in ['curl', 'js', 'python']"
                :key="lang"
                class="tab-btn"
                :class="{ 'tab-btn--active': getTab(ep.path) === lang }"
                type="button"
                @click="setTab(ep.path, lang)"
              >
                {{ lang === 'js' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL' }}
              </button>
            </div>
            <div class="code-block__header" style="border-top: 0; border-radius: 0;">
              <span>Example</span>
            </div>
            <pre class="code-block__body code-block__body--example">
              <code v-if="getTab(ep.path) === 'curl'">{{ ep.curl }}</code>
              <code v-else-if="getTab(ep.path) === 'js'">{{ ep.js }}</code>
              <code v-else>{{ ep.python }}</code>
            </pre>
          </div>
        </section>

        <!-- Rate limits -->
        <section class="api-section">
          <h2 class="api-section-title">Rate limits</h2>
          <p class="api-section-desc">Limits reset every hour. The <code>X-RateLimit-*</code> response headers tell you your current usage.</p>
          <table class="rate-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Requests / hour</th>
                <th>Max file size</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Free (browser)</td>
                <td>—</td>
                <td>20 MB</td>
              </tr>
              <tr>
                <td>Pro</td>
                <td>100</td>
                <td>20 MB</td>
              </tr>
              <tr>
                <td>Enterprise</td>
                <td>Custom</td>
                <td>Custom</td>
              </tr>
            </tbody>
          </table>
        </section>

      </div>
    </main>

    <footer class="page-footer">
      <div class="container footer-inner">
        <span>© 2025 BG Remover</span>
        <nav class="footer-nav">
          <NuxtLink to="/features">Features</NuxtLink>
          <NuxtLink to="/pricing">Pricing</NuxtLink>
          <NuxtLink to="/api">API</NuxtLink>
          <NuxtLink to="/docs">Docs</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.page-main { flex: 1; padding-bottom: 80px; }

/* Hero */
.hero-section { padding: 100px 0 64px; text-align: center; }
.hero-inner { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.pill {
  display: inline-block; padding: 5px 16px;
  background: rgba(124, 58, 237, 0.1); color: var(--primary);
  border: 1px solid rgba(124, 58, 237, 0.25); border-radius: 999px;
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
}
h1 { margin: 0; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; }
.hero-sub { margin: 0; max-width: 560px; color: var(--muted-2); font-size: 1rem; line-height: 1.7; }

.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 16px;
  box-shadow: var(--shadow);
}

.meta-chip {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.meta-url {
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.9rem;
  color: var(--primary);
}

/* Layout */
.api-layout { max-width: 780px; display: flex; flex-direction: column; gap: 32px; padding-top: 8px; }

/* Sections */
.api-section { display: flex; flex-direction: column; gap: 16px; }
.api-section-title { margin: 0; font-size: 1.3rem; font-weight: 700; }
.api-section-desc { margin: 0; font-size: 0.92rem; color: var(--muted-2); line-height: 1.7; }
.api-section-desc code {
  font-family: monospace;
  background: rgba(124, 58, 237, 0.08);
  color: var(--primary);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.88em;
}

/* Endpoint card */
.endpoint-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  gap: 20px;
  box-shadow: var(--shadow);
}

.endpoint-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.method-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
}

.method-badge--post { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
[data-theme="dark"] .method-badge--post { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.method-badge--get { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
[data-theme="dark"] .method-badge--get { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }

.endpoint-path { font-family: monospace; font-size: 1rem; color: var(--text); }

.auth-chip {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted-2);
  background: var(--card-2);
  border: 1px solid var(--border);
  padding: 3px 10px;
  border-radius: 999px;
}

/* Code blocks */
.code-block {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.code-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--card-2);
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-2);
  letter-spacing: 0.04em;
}

.code-block__body {
  margin: 0;
  padding: 16px;
  background: var(--card);
  overflow-x: auto;
  font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.83rem;
  line-height: 1.65;
  color: var(--text);
  white-space: pre;
}

.code-block__body--example { border-radius: 0 0 10px 10px; }

/* Param table */
.param-table { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.param-table__head {
  padding: 8px 14px;
  background: var(--card-2);
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-2);
}
.param-table__head code { font-family: monospace; color: var(--primary); }
.param-table__body {
  margin: 0;
  padding: 14px 16px;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.83rem;
  line-height: 1.8;
  white-space: pre;
  color: var(--text);
}

/* Tab bar */
.example-block { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.tab-bar { display: flex; border-bottom: 1px solid var(--border); background: var(--card-2); }
.tab-btn {
  padding: 8px 16px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted-2);
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn--active { color: var(--primary); border-bottom-color: var(--primary); }

/* Rate table */
.rate-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.rate-table th, .rate-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.rate-table th {
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-2);
  background: var(--card-2);
}
.rate-table td { color: var(--text); }
.rate-table tr:last-child td { border-bottom: 0; }

/* Footer */
.page-footer { padding: 28px 0; border-top: 1px solid var(--border); }
.footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 0.85rem; color: var(--muted-2); }
.footer-nav { display: flex; gap: 20px; }
.footer-nav a { color: var(--muted-2); transition: color 0.15s; }
.footer-nav a:hover { color: var(--text); }

@media (max-width: 600px) {
  .hero-section { padding: 64px 0 48px; }
  .hero-meta { flex-direction: column; text-align: center; }
  .endpoint-header { gap: 8px; }
  .auth-chip { margin-left: 0; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
