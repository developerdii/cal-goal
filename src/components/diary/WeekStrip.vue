<script setup>
import { useI18n } from 'vue-i18n'
import { toDateKey } from '@/utils/date'
import { formatWeekdayShort } from '@/utils/format'

const props = defineProps({
  days: { type: Array, required: true }, // 7 Date objects (Mon..Sun)
  selectedKey: { type: String, required: true },
  todayKey: { type: String, required: true },
})

const emit = defineEmits(['select'])

const { locale } = useI18n()

function key(d) {
  return toDateKey(d)
}
</script>

<template>
  <div class="mt-3 grid grid-cols-7 gap-1.5">
    <button
      v-for="d in props.days"
      :key="key(d)"
      type="button"
      class="flex flex-col items-center rounded-xl border py-2 text-xs transition-colors"
      :class="
        key(d) === selectedKey
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700'
      "
      @click="emit('select', d)"
    >
      <span class="font-medium">{{ formatWeekdayShort(d, locale) }}</span>
      <span class="text-sm font-bold">{{ d.getDate() }}</span>
      <span
        class="mt-0.5 h-1 w-1 rounded-full"
        :class="key(d) === todayKey ? 'bg-current' : 'bg-transparent'"
      ></span>
    </button>
  </div>
</template>
