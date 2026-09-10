<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
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
const router = useRouter()

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
  try {
    await storageService.init(user)
  } catch (err) {
    if (user?.id) {
      // A signed-in user whose cloud data can't be loaded is treated as a
      // failed session: sign out and fall back to guest (local) data.
      console.error('storageService: cloud load failed, signing out', err)
      await authStore.signOut()
      return
    }
  }
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

let mql = null
function onSystemThemeChange() {
  if (appStore.theme === 'auto') applyTheme('auto')
}

onMounted(async () => {
  document.addEventListener('visibilitychange', onVisibilityChange)

  if (window.matchMedia) {
    mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', onSystemThemeChange)
  }

  // Register the auth listener before the initial load so a forced sign-out
  // (e.g. a failed cloud load) is handled consistently from the very start.
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

  await authStore.init()

  // Supabase delivers password-recovery / email-confirmation tokens in the URL
  // hash. detectSessionInUrl already exchanged them for a session; clean the
  // hash so the hash router ignores it, then route to the right screen.
  const hash = window.location.hash || ''
  const isRecovery = hash.includes('type=recovery')
  if (isRecovery || hash.includes('access_token') || hash.includes('error=')) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  currentUserId = authStore.user?.id ?? null
  await reloadData(authStore.user)
  ready.value = true

  if (isRecovery) {
    await router.replace('/reset-password')
  }
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  mql?.removeEventListener('change', onSystemThemeChange)
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
