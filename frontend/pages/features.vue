<script setup>
useHead({ title: 'Features — BG Remover' })

const { init } = useTheme()
onMounted(init)

const features = [
  {
    title: 'AI-Powered Segmentation',
    desc: 'A neural network trained on millions of images handles hair, fur, transparent objects, and complex backgrounds with pixel-level precision.',
    svg: '<path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"/>',
    fill: true,
  },
  {
    title: '100% Private',
    desc: 'Your images never leave your device. The AI model downloads once and runs entirely via WebAssembly — no server, no cloud, no tracking.',
    svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    fill: false,
  },
  {
    title: 'Lightning Fast',
    desc: 'Background removal completes in 2–10 seconds on most modern devices, including low-end laptops and phones.',
    svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    fill: false,
  },
  {
    title: 'Pixel-Perfect Quality',
    desc: 'Crisp, clean edges with no halos or rough cuts. Fine details like flyaway hair and semi-transparent shadows are preserved.',
    svg: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>',
    fill: false,
  },
  {
    title: 'Transparent PNG Output',
    desc: 'Download results with full alpha-channel transparency, ready to drop into Figma, Photoshop, Canva, or any design tool.',
    svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    fill: false,
  },
  {
    title: 'No Account Required',
    desc: 'No sign-up, no email, no watermarks. Open the page, upload an image, and download the result — completely free.',
    svg: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="23" y1="1" x2="1" y2="23"/>',
    fill: false,
  },
]

const steps = [
  {
    num: '01',
    title: 'Upload',
    desc: 'Drop any JPG, PNG, or WEBP image into the upload zone, or click to browse. Up to 20 MB supported.',
  },
  {
    num: '02',
    title: 'Process',
    desc: 'The AI model runs locally on your device and removes the background in seconds — no internet required after the first load.',
  },
  {
    num: '03',
    title: 'Download',
    desc: 'Save the result as a transparent PNG or set a solid background color before downloading.',
  },
]
</script>

<template>
  <div class="shell">
    <AppNav />

    <main class="page-main">

      <!-- Hero -->
      <section class="hero-section">
        <div class="container hero-inner">
          <span class="pill">Features</span>
          <h1>Background removal<br>that just works</h1>
          <p class="hero-sub">AI-powered, fully private, completely free — all running inside your browser with no uploads and no accounts.</p>
          <NuxtLink to="/" class="btn btn--primary hero-cta">
            <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"/>
            </svg>
            Try it free
          </NuxtLink>
        </div>
      </section>

      <!-- Feature cards -->
      <section class="section">
        <div class="container">
          <div class="feat-grid">
            <div v-for="f in features" :key="f.title" class="feat-card">
              <div class="feat-icon">
                <svg viewBox="0 0 24 24" :fill="f.fill ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="f.svg" />
              </div>
              <h3 class="feat-title">{{ f.title }}</h3>
              <p class="feat-desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="section hiw-section">
        <div class="container">
          <div class="section-label">How it works</div>
          <h2 class="section-heading">Three steps, zero friction</h2>
          <div class="steps-row">
            <div v-for="step in steps" :key="step.num" class="step-card">
              <span class="step-num">{{ step.num }}</span>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA banner -->
      <section class="section">
        <div class="container">
          <div class="cta-banner">
            <h2>Ready to remove a background?</h2>
            <p>No account needed. Works on any modern browser.</p>
            <NuxtLink to="/" class="btn btn--primary">Start for free →</NuxtLink>
          </div>
        </div>
      </section>

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
.shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); }
.page-main { flex: 1; }

/* Hero */
.hero-section {
  padding: 100px 0 80px;
  text-align: center;
}
.hero-inner { display: flex; flex-direction: column; align-items: center; gap: 24px; }

.pill {
  display: inline-block;
  padding: 5px 16px;
  background: rgba(124, 58, 237, 0.1);
  color: var(--primary);
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.hero-sub {
  margin: 0;
  max-width: 560px;
  color: var(--muted-2);
  font-size: 1.05rem;
  line-height: 1.7;
}

.hero-cta { font-size: 1rem; padding: 13px 28px; }

/* Feature grid */
.section { padding: 64px 0; }

.feat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feat-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.feat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: 16px;
}

.feat-icon svg { width: 20px; height: 20px; }

.feat-title {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 700;
}

.feat-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted-2);
  line-height: 1.65;
}

/* How it works */
.hiw-section { background: var(--card-2); }

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 12px;
}

.section-heading {
  margin: 0 0 48px;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.step-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.step-num {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: rgba(124, 58, 237, 0.25);
  letter-spacing: -0.04em;
  margin-bottom: 12px;
}

.step-title {
  margin: 0 0 10px;
  font-size: 1.1rem;
  font-weight: 700;
}

.step-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted-2);
  line-height: 1.65;
}

/* CTA banner */
.cta-banner {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  border-radius: 20px;
  padding: 56px 48px;
  text-align: center;
  color: #fff;
}

.cta-banner h2 {
  margin: 0 0 12px;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
}

.cta-banner p {
  margin: 0 0 28px;
  opacity: 0.85;
  font-size: 1rem;
}

.cta-banner .btn--primary {
  background: #fff;
  color: var(--primary);
  font-weight: 700;
  padding: 12px 28px;
}

/* Footer */
.page-footer {
  padding: 28px 0;
  border-top: 1px solid var(--border);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--muted-2);
}

.footer-nav {
  display: flex;
  gap: 20px;
}

.footer-nav a { color: var(--muted-2); transition: color 0.15s; }
.footer-nav a:hover { color: var(--text); }

@media (max-width: 860px) {
  .feat-grid, .steps-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 560px) {
  .feat-grid, .steps-row { grid-template-columns: 1fr; }
  .hero-section { padding: 64px 0 48px; }
  .cta-banner { padding: 40px 24px; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
