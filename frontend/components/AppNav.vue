<script setup>
const { isDark, toggle, init } = useTheme()
onMounted(init)
</script>

<template>
  <header class="topbar">
    <div class="container topbar__inner">
      <NuxtLink to="/" class="brand">
        <div class="brand__logo">
          <img src="/favicon.png" alt="" aria-hidden="true">
        </div>
        <span>BG Remover</span>
      </NuxtLink>

      <nav class="topbar__nav" aria-label="Main navigation">
        <NuxtLink to="/features" class="topbar__link">Features</NuxtLink>
        <NuxtLink to="/pricing" class="topbar__link">Pricing</NuxtLink>
        <NuxtLink to="/api" class="topbar__link">API</NuxtLink>
        <NuxtLink to="/docs" class="topbar__link">Docs</NuxtLink>
        <NuxtLink to="/about" class="topbar__link">About</NuxtLink>
      </nav>

      <div class="topbar__end">
        <button
          class="btn btn--theme"
          type="button"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <NuxtLink to="/" class="btn btn--cta">
          <svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"/>
          </svg>
          Start Free
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar__end {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
</style>
