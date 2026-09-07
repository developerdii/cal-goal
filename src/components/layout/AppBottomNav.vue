<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'

const { t } = useI18n()
const route = useRoute()

const items = [
  { to: '/', key: 'home', icon: 'home' },
  { to: '/week', key: 'week', icon: 'chart' },
  { to: '/foods', key: 'foods', icon: 'star' },
  { to: '/settings', key: 'settings', icon: 'gear' },
]
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="mx-auto grid w-full max-w-lg grid-cols-4">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
        :class="
          route.path === item.to
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        "
      >
        <Icon :name="item.icon" class="h-5 w-5" />
        <span>{{ t(`nav.${item.key}`) }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
