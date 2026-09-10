<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import { useAppStore } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useFoodsStore } from '@/stores/foodsStore'
import { useAuthStore } from '@/stores/authStore'
import { storageService } from '@/services/storageService'
import { applyTheme } from '@/composables/useTheme'

const { locale } = useI18n()

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const diaryStore = useDiaryStore()
const foodsStore = useFoodsStore()
const authStore = useAuthStore()

const ready = ref(false)

function applyAppPrefs() {
  locale.value = appStore.locale
  document.documentElement.lang = appStore.locale
  applyTheme(appStore.theme)
}

// Loads the persisted document (local for guests, cloud for signed-in users)
// and refreshes every store from it.
async function reloadData(user) {
  await storageService.init(user)
  appStore.init()
  settingsStore.init()
  diaryStore.init()
  foodsStore.init()
  applyAppPrefs()
}

let currentUserId = null
let unsubscribeAuth = null

function onVisibilityChange() {
  if (document.visibilityState === 'hidden') storageService.flush()
}

onMounted(async () => {
  document.addEventListener('visibilitychange', onVisibilityChange)

  await authStore.init()
  currentUserId = authStore.user?.id ?? null
  await reloadData(authStore.user)
  ready.value = true

  unsubscribeAuth = authStore.onAuthStateChange(async (_event, user) => {
    const nextId = user?.id ?? null
    if (nextId === currentUserId) return
    currentUserId = nextId
    ready.value = false
    try {
      await reloadData(user)
    } finally {
      ready.value = true
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  unsubscribeAuth?.()
})

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
      <template v-if="ready">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </template>
      <div v-else class="flex min-h-[50vh] items-center justify-center">
        <span
          class="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"
        ></span>
      </div>
    </main>
    <AppBottomNav />
  </div>
</template>
