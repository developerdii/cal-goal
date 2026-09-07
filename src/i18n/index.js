import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import tr from './locales/tr.json'
import { storageService } from '@/services/storageService'

function initialLocale() {
  try {
    return storageService.getPrefs().locale
  } catch {
    return 'en'
  }
}

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages: { en, tr },
})
