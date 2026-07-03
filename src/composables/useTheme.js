import { ref } from 'vue'

const THEME_STORAGE_KEY = 'koch-codes-theme'

const isDarkPreferred = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return isDarkPreferred() ? 'dark' : 'light'
}

function applyTheme(value) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', value === 'dark')
}

const theme = ref(getInitialTheme())
applyTheme(theme.value)

function setTheme(value) {
  theme.value = value
  applyTheme(value)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, value)
  }
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
