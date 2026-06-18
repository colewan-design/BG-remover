<script setup>
useHead({ title: 'Documentation — BG Remover' })

const { init } = useTheme()
onMounted(init)

const sections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'formats', label: 'Supported Formats' },
  { id: 'privacy', label: 'Privacy & Security' },
  { id: 'browser-support', label: 'Browser Support' },
  { id: 'api-quickstart', label: 'API Quick Start' },
  { id: 'faq', label: 'FAQ' },
]

const activeSection = ref('getting-started')
function scrollTo(id) {
  activeSection.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="shell">
    <AppNav />

    <main class="page-main">

      <!-- Hero -->
      <div class="docs-hero">
        <div class="container">
          <span class="pill">Docs</span>
          <h1>Documentation</h1>
          <p class="hero-sub">Everything you need to use BG Remover in the browser or via API.</p>
        </div>
      </div>

      <div class="container docs-layout">

        <!-- Sidebar -->
        <aside class="docs-sidebar">
          <nav>
            <p class="sidebar-label">On this page</p>
            <ul class="sidebar-list">
              <li v-for="s in sections" :key="s.id">
                <button
                  class="sidebar-link"
                  :class="{ 'sidebar-link--active': activeSection === s.id }"
                  type="button"
                  @click="scrollTo(s.id)"
                >
                  {{ s.label }}
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Content -->
        <article class="docs-content">

          <section :id="sections[0].id" class="doc-section">
            <h2>Getting Started</h2>
            <p>BG Remover is a free, browser-based background removal tool. No installation, no account, and no uploads to any server.</p>
            <ol class="doc-ol">
              <li>Open <NuxtLink to="/">bgremover.app</NuxtLink> in any modern browser.</li>
              <li>Drop an image into the upload zone, or click <strong>Browse Files</strong> to pick one from your device.</li>
              <li>The AI model downloads once (~30 MB) and caches for future use. This only happens on your first visit.</li>
              <li>Wait 2–10 seconds while the background is removed.</li>
              <li>Click <strong>Download PNG</strong> to save the transparent result.</li>
            </ol>
            <div class="callout callout--info">
              <strong>Tip:</strong> Drag and drop multiple images in sequence — the app processes them one at a time without reloading.
            </div>
          </section>

          <section :id="sections[1].id" class="doc-section">
            <h2>How It Works</h2>
            <p>Background removal runs entirely on your device using a neural network compiled to <strong>WebAssembly</strong> via the ONNX runtime. Here's the pipeline:</p>
            <div class="steps-list">
              <div class="step-item">
                <span class="step-num">1</span>
                <div>
                  <strong>Model download</strong>
                  <p>On first use, the segmentation model (~30 MB) is downloaded from a CDN and cached in your browser's cache storage. Subsequent visits skip this step.</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-num">2</span>
                <div>
                  <strong>Preprocessing</strong>
                  <p>Your image is decoded and resized to the model's input resolution using an HTML Canvas element — all in memory, no disk writes.</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-num">3</span>
                <div>
                  <strong>Inference</strong>
                  <p>The ONNX model runs inference in a Web Worker to keep the UI responsive. It outputs an alpha mask at the original image resolution.</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-num">4</span>
                <div>
                  <strong>Compositing</strong>
                  <p>The alpha mask is applied to the original image pixels on a Canvas. The result is exported as a transparent PNG Blob for download.</p>
                </div>
              </div>
            </div>
          </section>

          <section :id="sections[2].id" class="doc-section">
            <h2>Supported Formats</h2>
            <table class="doc-table">
              <thead>
                <tr><th>Format</th><th>Input</th><th>Output</th><th>Max size</th></tr>
              </thead>
              <tbody>
                <tr><td>JPEG / JPG</td><td>✓</td><td>—</td><td>20 MB</td></tr>
                <tr><td>PNG</td><td>✓</td><td>✓ (transparent)</td><td>20 MB</td></tr>
                <tr><td>WEBP</td><td>✓</td><td>—</td><td>20 MB</td></tr>
                <tr><td>GIF</td><td>—</td><td>—</td><td>—</td></tr>
                <tr><td>SVG</td><td>—</td><td>—</td><td>—</td></tr>
              </tbody>
            </table>
            <p class="doc-note">Output is always a <strong>transparent PNG</strong>, regardless of input format. Use the background color option in the app to export with a solid color instead.</p>
          </section>

          <section :id="sections[3].id" class="doc-section">
            <h2>Privacy &amp; Security</h2>
            <p>Privacy is a core design principle, not an afterthought:</p>
            <ul class="doc-ul">
              <li><strong>No uploads.</strong> Your images are processed in your browser using WebAssembly. They are never sent to any server.</li>
              <li><strong>No tracking.</strong> We do not use analytics cookies or fingerprinting scripts on the main tool page.</li>
              <li><strong>No storage.</strong> Images are held in memory only for the duration of the session and released when you reset or close the tab.</li>
              <li><strong>Open model.</strong> The background removal model is the publicly available <code>@imgly/background-removal</code> package.</li>
            </ul>
            <div class="callout callout--warn">
              <strong>API users:</strong> When using the REST API, your images are transmitted to our servers for processing. Results are stored for 24 hours on our infrastructure before automatic deletion.
            </div>
          </section>

          <section :id="sections[4].id" class="doc-section">
            <h2>Browser Support</h2>
            <table class="doc-table">
              <thead>
                <tr><th>Browser</th><th>Version</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>Chrome / Edge</td><td>92+</td><td>✓ Full support</td></tr>
                <tr><td>Firefox</td><td>90+</td><td>✓ Full support</td></tr>
                <tr><td>Safari</td><td>15.4+</td><td>✓ Full support</td></tr>
                <tr><td>Mobile Chrome (Android)</td><td>92+</td><td>✓ Full support</td></tr>
                <tr><td>Mobile Safari (iOS)</td><td>15.4+</td><td>✓ Full support</td></tr>
                <tr><td>Internet Explorer</td><td>Any</td><td>✗ Not supported</td></tr>
              </tbody>
            </table>
            <p class="doc-note">WebAssembly and Web Workers are required. If your browser is listed above and the tool does not work, try disabling browser extensions that block scripts.</p>
          </section>

          <section :id="sections[5].id" class="doc-section">
            <h2>API Quick Start</h2>
            <p>Get your API token from your <NuxtLink to="/">account settings</NuxtLink>, then make a POST request with your image:</p>
            <div class="code-block">
              <div class="code-block__header"><span>cURL</span></div>
              <pre class="code-block__body"><code>curl -X POST https://bgremover-api.salidumay.com/api/remove-background \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@photo.jpg"</code></pre>
            </div>
            <p>The response contains a <code>url</code> pointing to your transparent PNG, valid for 24 hours. See the full <NuxtLink to="/api">API Reference</NuxtLink> for all endpoints, parameters, and language examples.</p>
          </section>

          <section :id="sections[6].id" class="doc-section">
            <h2>FAQ</h2>

            <div class="faq-item">
              <h3>Why does the first run take longer?</h3>
              <p>The AI model (~30 MB) is downloaded and cached on first use. Subsequent runs skip this step and are much faster.</p>
            </div>

            <div class="faq-item">
              <h3>Can I process images offline?</h3>
              <p>Yes — once the model is cached, the tool works offline. You only need internet access on the very first visit.</p>
            </div>

            <div class="faq-item">
              <h3>The background wasn't removed cleanly. What can I do?</h3>
              <p>Results are best on high-contrast images where the subject is clearly distinct from the background. Try cropping the image tighter around the subject, or using a photo with a simpler background.</p>
            </div>

            <div class="faq-item">
              <h3>Is there a size limit?</h3>
              <p>The browser tool supports images up to 20 MB. Very large images may be slow to process on low-memory devices. The API also supports up to 20 MB per image.</p>
            </div>

            <div class="faq-item">
              <h3>Can I use this commercially?</h3>
              <p>Yes. Output images are yours to use for any purpose, commercial or personal.</p>
            </div>
          </section>

        </article>
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
.page-main { flex: 1; }

/* Hero */
.docs-hero { padding: 80px 0 48px; }
.pill {
  display: inline-block; padding: 5px 16px; margin-bottom: 16px;
  background: rgba(124, 58, 237, 0.1); color: var(--primary);
  border: 1px solid rgba(124, 58, 237, 0.25); border-radius: 999px;
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
}
h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; letter-spacing: -0.03em; }
.hero-sub { margin: 0; color: var(--muted-2); font-size: 1rem; line-height: 1.7; }

/* Docs layout */
.docs-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 48px;
  align-items: start;
  padding-bottom: 80px;
}

/* Sidebar */
.docs-sidebar {
  position: sticky;
  top: 80px;
}

.sidebar-label {
  margin: 0 0 12px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-link {
  display: block;
  width: 100%;
  padding: 7px 12px;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-size: 0.88rem;
  color: var(--muted-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.sidebar-link:hover { background: var(--card); color: var(--text); }
.sidebar-link--active { background: rgba(124, 58, 237, 0.1); color: var(--primary); font-weight: 600; }

/* Content */
.docs-content { min-width: 0; }

.doc-section {
  padding: 48px 0;
  border-bottom: 1px solid var(--border);
}
.doc-section:last-child { border-bottom: 0; }

.doc-section h2 {
  margin: 0 0 16px;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.doc-section h3 {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 700;
}

.doc-section p {
  margin: 0 0 16px;
  color: var(--muted-2);
  font-size: 0.92rem;
  line-height: 1.75;
}

.doc-section p:last-child { margin-bottom: 0; }

.doc-section a { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }

.doc-ol, .doc-ul {
  margin: 0 0 16px;
  padding-left: 20px;
  color: var(--muted-2);
  font-size: 0.92rem;
  line-height: 2;
}

.doc-ol li::marker, .doc-ul li::marker { color: var(--primary); }

code {
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.85em;
  background: rgba(124, 58, 237, 0.08);
  color: var(--primary);
  padding: 1px 5px;
  border-radius: 4px;
}

/* Callout */
.callout {
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 0.88rem;
  line-height: 1.65;
}
.callout--info { background: rgba(59, 130, 246, 0.08); border-left: 3px solid #3B82F6; color: var(--text); }
.callout--warn { background: rgba(234, 179, 8, 0.08); border-left: 3px solid #EAB308; color: var(--text); }

/* Steps list */
.steps-list { display: flex; flex-direction: column; gap: 20px; }
.step-item { display: flex; gap: 16px; }
.step-num {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.25);
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.step-item p { margin: 4px 0 0; }

/* Table */
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  margin-bottom: 16px;
}
.doc-table th, .doc-table td {
  padding: 11px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.doc-table th {
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-2);
  background: var(--card-2);
}
.doc-table td { color: var(--text); }
.doc-table tr:last-child td { border-bottom: 0; }

.doc-note { font-size: 0.85rem; color: var(--muted-2); font-style: italic; }

/* Code block */
.code-block { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: 16px 0; }
.code-block__header {
  padding: 8px 14px;
  background: var(--card-2);
  border-bottom: 1px solid var(--border);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted-2);
  letter-spacing: 0.04em;
}
.code-block__body {
  margin: 0; padding: 16px;
  background: var(--card); overflow-x: auto;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.82rem; line-height: 1.65;
  color: var(--text); white-space: pre;
}

/* FAQ */
.faq-item { margin-bottom: 28px; }

/* Footer */
.page-footer { padding: 28px 0; border-top: 1px solid var(--border); }
.footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 0.85rem; color: var(--muted-2); }
.footer-nav { display: flex; gap: 20px; }
.footer-nav a { color: var(--muted-2); transition: color 0.15s; }
.footer-nav a:hover { color: var(--text); }

@media (max-width: 760px) {
  .docs-layout { grid-template-columns: 1fr; }
  .docs-sidebar { position: static; }
  .docs-hero { padding: 60px 0 32px; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
