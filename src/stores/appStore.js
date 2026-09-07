import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '@/services/storageService'

export const useAppStore = defineStore('app', () => {
  const locale = ref('en')
  const theme = ref('light') // 'light' | 'dark'

  function init() {
    const prefs = storageService.getPrefs()
    locale.value = prefs.locale
    theme.value = prefs.theme
  }

  function setLocale(value) {
    locale.value = value
    persistPrefs()
  }

  function setTheme(value) {
    theme.value = value
    persistPrefs()
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    persistPrefs()
  }

  function persistPrefs() {
    storageService.savePrefs({ locale: locale.value, theme: theme.value })
  }

  return { locale, theme, init, setLocale, setTheme, toggleTheme }
})
