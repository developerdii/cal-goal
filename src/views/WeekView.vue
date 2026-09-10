<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiaryStore } from '@/stores/diaryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { addDays, startOfDay, toDateKey } from '@/utils/date'
import { buildWeekRows, realizedBalance, projectedWeightChange } from '@/utils/analysis'
import {
  formatKcal,
  formatSignedKcal,
  formatSignedWeight,
  formatDayMedium,
  formatWeekLabel,
} from '@/utils/format'
import Icon from '@/components/ui/Icon.vue'

const diary = useDiaryStore()
const settings = useSettingsStore()
const { t, locale } = useI18n()

const anchor = ref(startOfDay(new Date()))
const todayKey = toDateKey(new Date())

const rows = computed(() =>
  buildWeekRows((key) => diary.totalForDay(key), settings.dailyTarget, anchor.value, todayKey),
)

const totalBalance = computed(() => realizedBalance(rows.value))
const weightChange = computed(() =>
  projectedWeightChange(rows.value, settings.maintenanceCalories),
)
const anyData = computed(() => rows.value.some((r) => r.consumed > 0))

const weekLabel = computed(() => {
  const start = rows.value[0]?.date
  const end = rows.value[6]?.date
  return start && end ? formatWeekLabel(start, end, locale.value) : ''
})

function prevWeek() {
  anchor.value = addDays(anchor.value, -7)
}
function nextWeek() {
  anchor.value = addDays(anchor.value, 7)
}

function balanceClass(balance) {
  if (balance < 0) return 'text-emerald-600 dark:text-emerald-400'
  if (balance > 0) return 'text-amber-600 dark:text-amber-400'
  return 'text-slate-500 dark:text-slate-400'
}

const arrowClass =
  'flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
</script>

<template>
  <div class="space-y-4">
    <section class="flex items-center justify-between gap-2">
      <button type="button" :class="arrowClass" aria-label="Previous week" @click="prevWeek">
        <Icon name="chevronLeft" class="h-5 w-5" />
      </button>
      <div class="min-w-0 text-center">
        <h2 class="text-lg font-bold">{{ t('week.heading') }}</h2>
        <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ weekLabel }}</p>
      </div>
      <button type="button" :class="arrowClass" aria-label="Next week" @click="nextWeek">
        <Icon name="chevronRight" class="h-5 w-5" />
      </button>
    </section>

    <template v-if="anyData">
      <section class="grid grid-cols-2 gap-3">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('week.totalBalance') }}</p>
          <p class="mt-1 text-2xl font-bold" :class="balanceClass(totalBalance)">
            {{ formatSignedKcal(totalBalance, locale) }} kcal
          </p>
        </div>
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('week.weightChange') }}</p>
          <p class="mt-1 text-2xl font-bold" :class="balanceClass(totalBalance)">
            {{ formatSignedWeight(weightChange, locale) }} kg
          </p>
        </div>
      </section>

      <p class="text-xs text-slate-400">{{ t('week.estimatedWeightHint') }}</p>

      <section class="space-y-2">
        <div
          v-for="r in rows"
          :key="r.key"
          class="flex items-center justify-between rounded-xl border p-3"
          :class="
            r.isFuture
              ? 'border-slate-100 bg-slate-50/60 opacity-60 dark:border-slate-800/60 dark:bg-slate-900/40'
              : r.isToday
                ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-900/10'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          "
        >
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-medium">{{ formatDayMedium(r.date, locale) }}</p>
              <span
                v-if="r.isToday"
                class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                {{ t('common.today') }}
              </span>
            </div>
            <p class="text-xs text-slate-400">
              <template v-if="r.isFuture">{{ t('week.upcoming') }}</template>
              <template v-else-if="r.isToday">
                {{ formatKcal(r.consumed, locale) }} /
                {{ formatKcal(settings.dailyTarget, locale) }} kcal
              </template>
              <template v-else>{{ formatKcal(r.consumed, locale) }} kcal</template>
            </p>
          </div>
          <span
            v-if="r.isFuture"
            class="text-sm font-semibold text-slate-300 dark:text-slate-600"
          >
            —
          </span>
          <span
            v-else-if="r.isToday"
            class="text-xs font-medium text-amber-600 dark:text-amber-400"
          >
            {{ t('week.inProgress') }}
          </span>
          <span v-else class="text-sm font-semibold" :class="balanceClass(r.balance)">
            {{ formatSignedKcal(r.balance, locale) }}
          </span>
        </div>
      </section>
    </template>

    <div
      v-else
      class="rounded-2xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700"
    >
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        {{ t('week.noData') }}
      </p>
    </div>
  </div>
</template>
