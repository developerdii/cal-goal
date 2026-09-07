<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { dailyBalance } from '@/utils/analysis'
import { formatKcal } from '@/utils/format'

const props = defineProps({
  consumed: { type: Number, default: 0 },
  goal: { type: Number, default: 2000 },
})

const { t, locale } = useI18n()

const balance = computed(() => dailyBalance(props.consumed, props.goal))
const pct = computed(() =>
  Math.min(100, Math.round((props.consumed / props.goal) * 100)),
)

const status = computed(() =>
  balance.value < 0 ? 'under' : balance.value > 0 ? 'over' : 'equal',
)

const statusText = computed(() => {
  if (status.value === 'under') {
    return t('home.under', { amount: formatKcal(Math.abs(balance.value), locale.value) })
  }
  if (status.value === 'over') {
    return t('home.over', { amount: formatKcal(balance.value, locale.value) })
  }
  return t('home.onTrack')
})

const statusClass = computed(() => ({
  'text-emerald-600 dark:text-emerald-400': status.value === 'under',
  'text-amber-600 dark:text-amber-400': status.value === 'over',
  'text-slate-500 dark:text-slate-400': status.value === 'equal',
}))

const barClass = computed(() => ({
  'bg-emerald-500': status.value === 'under' || status.value === 'equal',
  'bg-amber-500': status.value === 'over',
}))
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex items-baseline justify-between">
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('home.consumed') }}</span>
      <span class="text-2xl font-bold">
        {{ formatKcal(consumed, locale) }}
        <span class="text-sm font-normal text-slate-400">
          / {{ formatKcal(goal, locale) }} kcal
        </span>
      </span>
    </div>

    <div class="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="barClass"
        :style="{ width: pct + '%' }"
      ></div>
    </div>

    <p class="mt-3 text-sm font-medium" :class="statusClass">{{ statusText }}</p>
  </div>
</template>
