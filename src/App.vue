<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import { useAppStore } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useFoodsStore } from '@/stores/foodsStore'
import { applyTheme } from '@/composables/useTheme'

const { locale } = useI18n()

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const diaryStore = useDiaryStore()
const foodsStore = useFoodsStore()

// Load persisted state once at startup.
appStore.init()
settingsStore.init()
diaryStore.init()
foodsStore.init()

// Apply initial prefs.
locale.value = appStore.locale
document.documentElement.lang = appStore.locale
applyTheme(appStore.theme)

// Keep DOM in sync with preference changes.
watch(
  () => appStore.locale,
  (l) => {
    locale.value = l
    document.documentElement.lang = l
  },
)

watch(
  () => appStore.theme,
  (t) => applyTheme(t),
)
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100"
  >
    <AppHeader />
    <main class="mx-auto w-full max-w-lg px-4 pb-28 pt-5">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppBottomNav />
  </div>
</template>
