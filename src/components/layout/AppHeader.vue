<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LocaleSwitch from '@/components/ui/LocaleSwitch.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import Icon from '@/components/ui/Icon.vue'
import { useAuthStore } from '@/stores/authStore'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

async function signOut() {
  await auth.signOut()
  router.replace('/')
}
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex w-full items-center justify-between gap-3 px-4 py-3">
      <div class="flex min-w-0 items-center gap-2.5">
        <span class="text-2xl leading-none">🔥</span>
        <div class="min-w-0">
          <h1 class="truncate text-base font-bold leading-tight">{{ t('app.title') }}</h1>
          <p class="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            {{ t('app.tagline') }}
          </p>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <RouterLink
          v-if="!auth.isAuthenticated"
          to="/login"
          class="flex items-center gap-1.5 rounded-full border border-emerald-500 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
        >
          <Icon name="user" class="h-4 w-4" />
          <span class="hidden sm:inline">{{ t('auth.signIn') }}</span>
        </RouterLink>
        <template v-else>
          <span
            class="hidden max-w-[10rem] truncate text-xs text-slate-500 dark:text-slate-400 md:inline"
          >
            {{ auth.displayName }}
          </span>
          <button
            type="button"
            :title="t('auth.signOut')"
            :aria-label="t('auth.signOut')"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="signOut"
          >
            <Icon name="logout" class="h-4 w-4" />
          </button>
        </template>
        <LocaleSwitch />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
