<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()

const open = ref(false)
const triggerRef = ref(null)
const panelRef = ref(null)
const signingOut = ref(false)
const signOutError = ref('')

const initials = computed(() => {
  const name = (auth.displayName || '').trim()
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const themeOptions = [
  { value: 'auto', key: 'menu.themeAuto' },
  { value: 'light', key: 'menu.themeLight' },
  { value: 'dark', key: 'menu.themeDark' },
]
const localeOptions = [
  { value: 'tr', label: 'TR' },
  { value: 'en', label: 'EN' },
]

function items() {
  return Array.from(
    panelRef.value?.querySelectorAll('[role="menuitem"], [role="menuitemradio"]') || [],
  )
}

function openMenu() {
  open.value = true
  nextTick(() => items()[0]?.focus())
}

function closeMenu(focusTrigger = true) {
  open.value = false
  if (focusTrigger) triggerRef.value?.focus()
}

function toggle() {
  open.value ? closeMenu() : openMenu()
}

function setTheme(value) {
  app.setTheme(value)
  closeMenu()
}

function setLocale(value) {
  app.setLocale(value)
  closeMenu()
}

async function signOut() {
  if (signingOut.value) return
  signingOut.value = true
  signOutError.value = ''
  try {
    await auth.signOut()
    closeMenu(false)
    router.replace('/')
  } catch (err) {
    console.error('authStore: sign out failed', err)
    signOutError.value = 'auth.errors.signOutFailed'
    signingOut.value = false
  }
}

function onKeydown(e) {
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeMenu()
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const list = items()
    if (!list.length) return
    const idx = list.indexOf(document.activeElement)
    const delta = e.key === 'ArrowDown' ? 1 : -1
    list[(idx + delta + list.length) % list.length]?.focus()
  } else if (e.key === 'Tab') {
    closeMenu(false)
  }
}

function onDocumentClick(e) {
  if (!open.value) return
  if (!panelRef.value?.contains(e.target) && !triggerRef.value?.contains(e.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      type="button"
      :aria-label="t('menu.open')"
      :aria-expanded="open"
      aria-haspopup="menu"
      class="flex items-center gap-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      :class="auth.isAuthenticated ? 'py-1 pl-1 pr-2' : 'h-9 w-9 justify-center'"
      @click="toggle"
    >
      <span
        v-if="auth.isAuthenticated"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white"
      >
        {{ initials }}
      </span>
      <Icon v-else name="sliders" class="h-5 w-5 text-slate-500 dark:text-slate-400" />
      <span
        v-if="auth.isAuthenticated"
        class="hidden max-w-[9rem] truncate text-sm font-medium sm:inline"
      >
        {{ auth.displayName }}
      </span>
    </button>

    <Transition name="menu">
      <div
        v-if="open"
        ref="panelRef"
        role="menu"
        class="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      >
        <div
          v-if="auth.isAuthenticated"
          class="border-b border-slate-100 px-4 py-3 dark:border-slate-800"
        >
          <p class="truncate text-sm font-semibold">{{ auth.displayName }}</p>
          <p
            v-if="auth.email && auth.email !== auth.displayName"
            class="truncate text-xs text-slate-400"
          >
            {{ auth.email }}
          </p>
        </div>

        <div class="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            {{ t('menu.theme') }}
          </p>
          <div class="flex gap-1">
            <button
              v-for="opt in themeOptions"
              :key="opt.value"
              type="button"
              role="menuitemradio"
              :aria-checked="app.theme === opt.value"
              class="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
              :class="
                app.theme === opt.value
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              "
              @click="setTheme(opt.value)"
            >
              {{ t(opt.key) }}
            </button>
          </div>
        </div>

        <div class="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            {{ t('menu.language') }}
          </p>
          <div class="flex gap-1">
            <button
              v-for="opt in localeOptions"
              :key="opt.value"
              type="button"
              role="menuitemradio"
              :aria-checked="app.locale === opt.value"
              class="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
              :class="
                app.locale === opt.value
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              "
              @click="setLocale(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div v-if="auth.isAuthenticated" class="py-1">
          <p v-if="signOutError" class="px-4 py-1.5 text-xs text-rose-600 dark:text-rose-400">
            {{ t(signOutError) }}
          </p>
          <RouterLink
            to="/settings"
            role="menuitem"
            class="flex items-center justify-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="closeMenu()"
          >
            {{ t('nav.settings') }}
          </RouterLink>
          <button
            type="button"
            role="menuitem"
            :disabled="signingOut"
            class="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-950"
            @click="signOut"
          >
            <span
              v-if="signingOut"
              class="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent"
            ></span>
            {{ signingOut ? t('menu.signingOut') : t('auth.signOut') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

