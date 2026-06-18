export const useTheme = () => {
  const isDark = useState('bgr-dark', () => false)

  function apply(dark) {
    isDark.value = dark
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
      localStorage.setItem('bg-remover-theme', dark ? 'dark' : 'light')
    }
  }

  return {
    isDark,
    toggle: () => apply(!isDark.value),
    init: () => {
      if (import.meta.client) {
        apply(localStorage.getItem('bg-remover-theme') === 'dark')
      }
    },
  }
}
