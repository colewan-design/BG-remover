<script setup>
useHead({ title: 'About — BG Remover' })

const { init } = useTheme()
onMounted(init)
</script>

<template>
  <div class="shell">
    <AppNav />

    <main class="page-main">

      <!-- Hero -->
      <section class="hero-section">
        <div class="container hero-inner">
          <span class="pill">About</span>
          <h1>Built by <span class="gradient-text">Salidumay</span></h1>
          <p class="hero-sub">
            A passion project crafted in Baguio City — bringing fast, private, AI-powered background removal to everyone, for free.
          </p>
        </div>
      </section>

      <!-- Developer card -->
      <section class="section">
        <div class="container">
          <div class="dev-card">
            <div class="dev-avatar" aria-hidden="true">
              <span>CC</span>
            </div>
            <div class="dev-info">
              <p class="dev-label">Developer</p>
              <h2 class="dev-name">Christian F. Colewan</h2>
              <div class="dev-meta">
                <span class="dev-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Baguio City, Philippines
                </span>
                <span class="dev-chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                  Full-Stack Developer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Story -->
      <section class="section story-section">
        <div class="container story-inner">
          <div class="section-label">The Story</div>
          <h2 class="section-heading">Why BG Remover exists</h2>
          <div class="story-body">
            <p>
              Most background removal tools make you sign up, pay, or wait for a server to process your image.
              BG Remover was built to solve that — a tool that works instantly, keeps your images on your device, and costs nothing.
            </p>
            <p>
              Running entirely in the browser via WebAssembly, the AI model never sees a server. Your photos stay yours.
              It started as a personal experiment and turned into something worth sharing with the world.
            </p>
            <p>
              Developed and maintained by <strong>Christian F. Colewan</strong> under the <strong>Salidumay</strong> banner — a solo project born in the pine-covered hills of Baguio City.
            </p>
          </div>
        </div>
      </section>

      <!-- Stack -->
      <section class="section">
        <div class="container">
          <div class="section-label">Tech Stack</div>
          <h2 class="section-heading">Built with modern tools</h2>
          <div class="stack-grid">
            <div class="stack-card">
              <div class="stack-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 class="stack-name">Nuxt 3</h3>
              <p class="stack-desc">Vue-powered frontend framework for fast, modern web apps.</p>
            </div>
            <div class="stack-card">
              <div class="stack-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 class="stack-name">@imgly/background-removal</h3>
              <p class="stack-desc">ONNX-powered AI segmentation model compiled to WebAssembly.</p>
            </div>
            <div class="stack-card">
              <div class="stack-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 class="stack-name">Laravel + Sanctum</h3>
              <p class="stack-desc">PHP backend handling authentication and API token management.</p>
            </div>
            <div class="stack-card">
              <div class="stack-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
                </svg>
              </div>
              <h3 class="stack-name">Google OAuth</h3>
              <p class="stack-desc">Seamless sign-in flow for download access, no passwords needed.</p>
            </div>
            <div class="stack-card">
              <div class="stack-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/>
                  <rect x="15" y="15" width="7" height="7"/><rect x="2" y="15" width="7" height="7"/>
                </svg>
              </div>
              <h3 class="stack-name">XAMPP / Apache</h3>
              <p class="stack-desc">Local and production server environment powering the backend API.</p>
            </div>
            <div class="stack-card">
              <div class="stack-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                  <line x1="16" y1="8" x2="2" y2="22"/>
                  <line x1="17.5" y1="15" x2="9" y2="15"/>
                </svg>
              </div>
              <h3 class="stack-name">Vanilla CSS</h3>
              <p class="stack-desc">Hand-crafted styles with CSS custom properties — no framework overhead.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section">
        <div class="container">
          <div class="cta-banner">
            <div class="cta-badge">Open & Free</div>
            <h2>Try it yourself</h2>
            <p>No account, no watermarks, no limits on the core tool. Just drop your image and go.</p>
            <NuxtLink to="/" class="btn btn--cta-light">
              <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"/>
              </svg>
              Start for free
            </NuxtLink>
          </div>
        </div>
      </section>

    </main>

    <footer class="page-footer">
      <div class="container footer-inner">
        <span>© 2025 Salidumay · Christian F. Colewan · Baguio City</span>
        <nav class="footer-nav">
          <NuxtLink to="/features">Features</NuxtLink>
          <NuxtLink to="/pricing">Pricing</NuxtLink>
          <NuxtLink to="/api">API</NuxtLink>
          <NuxtLink to="/docs">Docs</NuxtLink>
          <NuxtLink to="/about">About</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); }
.page-main { flex: 1; }
.section { padding: 64px 0; }

/* Hero */
.hero-section { padding: 100px 0 80px; text-align: center; }
.hero-inner { display: flex; flex-direction: column; align-items: center; gap: 24px; }

.pill {
  display: inline-block; padding: 5px 16px;
  background: rgba(124, 58, 237, 0.1); color: var(--primary);
  border: 1px solid rgba(124, 58, 237, 0.25); border-radius: 999px;
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  margin: 0;
  max-width: 540px;
  color: var(--muted-2);
  font-size: 1.05rem;
  line-height: 1.7;
}

/* Developer card */
.dev-card {
  display: flex;
  align-items: center;
  gap: 28px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px;
  box-shadow: var(--shadow);
  max-width: 600px;
  margin: 0 auto;
}

.dev-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.dev-label {
  margin: 0 0 4px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary);
}

.dev-name {
  margin: 0 0 16px;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.dev-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dev-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--card-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--muted-2);
}

.dev-chip svg { width: 13px; height: 13px; flex-shrink: 0; }

/* Story */
.story-section { background: var(--card-2); }
.story-inner { max-width: 680px; }

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 12px;
}

.section-heading {
  margin: 0 0 36px;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.story-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.story-body p {
  margin: 0;
  font-size: 0.97rem;
  color: var(--muted-2);
  line-height: 1.8;
}

.story-body strong { color: var(--text); font-weight: 700; }

/* Stack */
.stack-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.stack-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.stack-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: 14px;
}

.stack-icon svg { width: 18px; height: 18px; }

.stack-name {
  margin: 0 0 8px;
  font-size: 0.95rem;
  font-weight: 700;
}

.stack-desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted-2);
  line-height: 1.6;
}

/* CTA banner */
.cta-banner {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  border-radius: 20px;
  padding: 64px 48px;
  text-align: center;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.cta-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cta-banner h2 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.cta-banner p {
  margin: 0;
  opacity: 0.85;
  font-size: 1rem;
  max-width: 420px;
  line-height: 1.65;
}

.btn--cta-light {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 12px 28px;
  background: #fff;
  color: var(--primary);
  border: 0;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s, transform 0.15s;
  margin-top: 8px;
}

.btn--cta-light:hover { opacity: 0.9; transform: translateY(-1px); }
.btn--cta-light .btn__icon { width: 14px; height: 14px; }

/* Footer */
.page-footer { padding: 28px 0; border-top: 1px solid var(--border); }
.footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 0.85rem; color: var(--muted-2); }
.footer-nav { display: flex; gap: 20px; }
.footer-nav a { color: var(--muted-2); transition: color 0.15s; }
.footer-nav a:hover { color: var(--text); }

@media (max-width: 860px) {
  .stack-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .dev-card { flex-direction: column; text-align: center; padding: 28px 20px; }
  .dev-meta { justify-content: center; }
  .stack-grid { grid-template-columns: 1fr; }
  .hero-section { padding: 64px 0 48px; }
  .cta-banner { padding: 40px 24px; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
