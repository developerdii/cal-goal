<script setup>
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const locales = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
]
</script>

<template>
  <div
    class="flex overflow-hidden rounded-full border border-slate-300 dark:border-slate-700"
  >
    <button
      v-for="l in locales"
      :key="l.code"
      type="button"
      :title="l.name"
      :aria-label="l.name"
      class="px-2 py-1 text-base leading-none transition-colors"
      :class="
        appStore.locale === l.code
          ? 'bg-emerald-500'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
      "
      @click="appStore.setLocale(l.code)"
    >
      {{ l.flag }}
    </button>
  </div>
</template>
