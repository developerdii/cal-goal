<script setup>
import { useI18n } from 'vue-i18n'
import UserMenu from '@/components/layout/UserMenu.vue'
import Icon from '@/components/ui/Icon.vue'
import { useAuthStore } from '@/stores/authStore'

const { t } = useI18n()
const auth = useAuthStore()
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
        <UserMenu />
      </div>
    </div>
  </header>
</template>
