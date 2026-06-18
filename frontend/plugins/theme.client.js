export default defineNuxtPlugin(() => {
  const saved = localStorage.getItem('bg-remover-theme')
  document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light')
})
