<script setup>
useHead({ title: 'Pricing — BG Remover' })

const { init } = useTheme()
onMounted(init)

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for personal use and trying out the tool.',
    cta: 'Get started',
    ctaTo: '/',
    highlight: false,
    features: [
      'Up to 20 images per day',
      'Browser-based processing',
      'Transparent PNG download',
      'Standard quality output',
      'No account required',
      'No watermarks',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    desc: 'For creators, designers, and teams who need more volume and API access.',
    cta: 'Start Pro trial',
    ctaTo: '/',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Unlimited images',
      'API access with full documentation',
      'Priority processing queue',
      'Batch upload (up to 50 images)',
      'High-quality HD output',
      'Custom background colors via API',
      'Email support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    desc: 'Dedicated infrastructure and custom integrations for high-volume workloads.',
    cta: 'Contact sales',
    ctaTo: '/docs',
    highlight: false,
    features: [
      'Unlimited API calls',
      'Dedicated processing infrastructure',
      'SLA with uptime guarantee',
      'Custom on-premise deployment',
      'Priority 24/7 support',
      'SSO / SAML integration',
      'Usage analytics dashboard',
    ],
  },
]

const faqs = [
  {
    q: 'Is the free tier really unlimited quality?',
    a: 'The free tier uses the same AI model as paid plans. The only difference is the 20-image daily limit and the lack of API access.',
  },
  {
    q: 'Do I need to enter a credit card for the free plan?',
    a: 'No. The free plan requires no account and no payment details. Just open the app and start removing backgrounds.',
  },
  {
    q: 'What image formats are supported?',
    a: 'JPG, PNG, and WEBP files up to 20 MB are supported. Output is always a transparent PNG.',
  },
  {
    q: 'Can I cancel my Pro subscription at any time?',
    a: 'Yes. Cancel any time from your account settings. You keep Pro access until the end of your billing period.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'New accounts get a 7-day free Pro trial with no credit card required.',
  },
]

const openFaq = ref(null)
function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? null : i
}
</script>

<template>
  <div class="shell">
    <AppNav />

    <main class="page-main">

      <!-- Hero -->
      <section class="hero-section">
        <div class="container hero-inner">
          <span class="pill">Pricing</span>
          <h1>Simple, transparent pricing</h1>
          <p class="hero-sub">Start free. Upgrade when you need more. No hidden fees, no lock-in.</p>
        </div>
      </section>

      <!-- Plans -->
      <section class="section">
        <div class="container">
          <div class="plans-grid">
            <div
              v-for="plan in plans"
              :key="plan.name"
              class="plan-card"
              :class="{ 'plan-card--highlight': plan.highlight }"
            >
              <div v-if="plan.badge" class="plan-badge">{{ plan.badge }}</div>

              <div class="plan-header">
                <h2 class="plan-name">{{ plan.name }}</h2>
                <div class="plan-price">
                  <span class="plan-amount">{{ plan.price }}</span>
                  <span class="plan-period">{{ plan.period }}</span>
                </div>
                <p class="plan-desc">{{ plan.desc }}</p>
              </div>

              <NuxtLink
                :to="plan.ctaTo"
                class="btn plan-cta"
                :class="plan.highlight ? 'btn--primary' : 'btn--dark'"
              >
                {{ plan.cta }}
              </NuxtLink>

              <ul class="plan-features">
                <li v-for="feat in plan.features" :key="feat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ feat }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="section faq-section">
        <div class="container faq-inner">
          <div class="section-label">FAQ</div>
          <h2 class="section-heading">Common questions</h2>

          <div class="faq-list">
            <div v-for="(item, i) in faqs" :key="i" class="faq-item">
              <button class="faq-q" type="button" @click="toggleFaq(i)">
                <span>{{ item.q }}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  :class="{ 'faq-chevron--open': openFaq === i }"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div v-show="openFaq === i" class="faq-a">{{ item.a }}</div>
            </div>
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
.section { padding: 64px 0; }

/* Hero */
.hero-section { padding: 100px 0 64px; text-align: center; }
.hero-inner { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.pill {
  display: inline-block; padding: 5px 16px;
  background: rgba(124, 58, 237, 0.1); color: var(--primary);
  border: 1px solid rgba(124, 58, 237, 0.25); border-radius: 999px;
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
}
h1 { margin: 0; font-size: clamp(2.2rem, 6vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; }
.hero-sub { margin: 0; max-width: 500px; color: var(--muted-2); font-size: 1.05rem; line-height: 1.7; }

/* Plans */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;
}

.plan-card {
  position: relative;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow);
}

.plan-card--highlight {
  border-color: rgba(124, 58, 237, 0.4);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.2), var(--shadow);
}

.plan-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
}

.plan-header { margin-bottom: 24px; }

.plan-name { margin: 0 0 12px; font-size: 1.05rem; font-weight: 700; color: var(--muted-2); }

.plan-price { display: flex; align-items: baseline; gap: 6px; margin-bottom: 12px; }

.plan-amount { font-size: 2.6rem; font-weight: 800; letter-spacing: -0.04em; color: var(--text); }

.plan-period { font-size: 0.88rem; color: var(--muted-2); }

.plan-desc { margin: 0; font-size: 0.88rem; color: var(--muted-2); line-height: 1.6; }

.plan-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 24px;
  text-decoration: none;
  cursor: pointer;
}

.plan-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.5;
}

.plan-features svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--primary);
}

/* FAQ */
.faq-section { background: var(--card-2); }
.faq-inner { max-width: 680px; }
.section-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary); margin-bottom: 12px; }
.section-heading { margin: 0 0 40px; font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 800; letter-spacing: -0.02em; }

.faq-list { display: flex; flex-direction: column; gap: 2px; }

.faq-item {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: transparent;
  border: 0;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.faq-q svg { width: 18px; height: 18px; flex-shrink: 0; color: var(--muted-2); transition: transform 0.2s; }
.faq-chevron--open { transform: rotate(180deg); }

.faq-a {
  padding: 0 20px 16px;
  font-size: 0.9rem;
  color: var(--muted-2);
  line-height: 1.7;
}

/* Footer */
.page-footer { padding: 28px 0; border-top: 1px solid var(--border); }
.footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 0.85rem; color: var(--muted-2); }
.footer-nav { display: flex; gap: 20px; }
.footer-nav a { color: var(--muted-2); transition: color 0.15s; }
.footer-nav a:hover { color: var(--text); }

@media (max-width: 860px) {
  .plans-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
  .hero-section { padding: 64px 0 48px; }
}
@media (max-width: 480px) {
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
