<script setup>
import { useAppStore } from '@/stores/appStore'
import Icon from '@/components/ui/Icon.vue'

const appStore = useAppStore()
</script>

<template>
  <button
    type="button"
    :aria-label="appStore.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    @click="appStore.toggleTheme()"
  >
    <Icon :name="appStore.theme === 'dark' ? 'sun' : 'moon'" class="h-4 w-4" />
  </button>
</template>
