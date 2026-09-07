<script setup>
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const locales = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
]
</script>

<template>
  <div
    class="flex overflow-hidden rounded-full border border-slate-300 text-xs font-semibold dark:border-slate-700"
  >
    <button
      v-for="l in locales"
      :key="l.code"
      type="button"
      class="px-2 py-1 transition-colors"
      :class="
        appStore.locale === l.code
          ? 'bg-emerald-500 text-white'
          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
      "
      @click="appStore.setLocale(l.code)"
    >
      {{ l.label }}
    </button>
  </div>
</template>
