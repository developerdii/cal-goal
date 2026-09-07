<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDiaryStore } from '@/stores/diaryStore'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const settings = useSettingsStore()
const diary = useDiaryStore()
const { t } = useI18n()

const goalInput = ref(String(settings.calorieGoal))
const weightInput = ref(String(settings.currentWeight))
const saved = ref(false)
const resetOpen = ref(false)

let savedTimer = null

watch(
  () => settings.calorieGoal,
  (v) => {
    goalInput.value = String(v)
  },
)
watch(
  () => settings.currentWeight,
  (v) => {
    weightInput.value = String(v)
  },
)

function save() {
  const goal = Number(goalInput.value)
  const weight = Number(weightInput.value)

  if (Number.isFinite(goal) && goal > 0) settings.setCalorieGoal(goal)
  if (Number.isFinite(weight) && weight >= 0) settings.setCurrentWeight(weight)

  goalInput.value = String(settings.calorieGoal)
  weightInput.value = String(settings.currentWeight)

  saved.value = true
  clearTimeout(savedTimer)
  savedTimer = setTimeout(() => (saved.value = false), 1500)
}

function confirmReset() {
  settings.reset()
  diary.reset()
  resetOpen.value = false
  goalInput.value = String(settings.calorieGoal)
  weightInput.value = String(settings.currentWeight)
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold">{{ t('settings.heading') }}</h2>

    <form class="space-y-5" @submit.prevent="save">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('settings.goalLabel') }}
        </label>
        <div class="flex items-center gap-2">
          <input v-model="goalInput" type="number" inputmode="numeric" min="1" step="10" :class="inputClass" />
          <span class="shrink-0 text-sm text-slate-500 dark:text-slate-400">kcal</span>
        </div>
        <p class="mt-2 text-xs text-slate-400">{{ t('settings.goalHint') }}</p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('settings.weightLabel') }}
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="weightInput"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.1"
            :class="inputClass"
          />
          <span class="shrink-0 text-sm text-slate-500 dark:text-slate-400">
            {{ t('settings.weightUnit') }}
          </span>
        </div>
        <p class="mt-2 text-xs text-slate-400">{{ t('settings.weightHint') }}</p>
      </div>

      <button
        type="submit"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
      >
        {{ t('common.save') }}
      </button>
    </form>

    <Transition name="page">
      <p
        v-if="saved"
        class="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400"
      >
        ✓ {{ t('settings.saved') }}
      </p>
    </Transition>

    <section class="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800">
      <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {{ t('settings.dangerZone') }}
      </h3>
      <div
        class="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 dark:border-rose-900 dark:bg-slate-900"
      >
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
          {{ t('settings.resetTitle') }}
        </p>
        <button
          type="button"
          class="shrink-0 rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
          @click="resetOpen = true"
        >
          {{ t('settings.resetAction') }}
        </button>
      </div>
    </section>

    <ConfirmDialog
      :open="resetOpen"
      :title="t('settings.resetTitle')"
      :message="t('settings.resetConfirmMessage')"
      :confirm-label="t('settings.resetAction')"
      @confirm="confirmReset"
      @cancel="resetOpen = false"
    />
  </div>
</template>
