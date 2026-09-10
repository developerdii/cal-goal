<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useAuthStore } from '@/stores/authStore'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { formatKcal } from '@/utils/format'

const settings = useSettingsStore()
const diary = useDiaryStore()
const auth = useAuthStore()
const { t, locale } = useI18n()

async function signOut() {
  await auth.signOut()
}

const maintenanceInput = ref(String(settings.maintenanceCalories))
const goalTypeInput = ref(settings.goalType)
const goalAmountInput = ref(String(settings.goalAmount))
const weightInput = ref(String(settings.currentWeight))
const saved = ref(false)
const resetOpen = ref(false)

let savedTimer = null

watch(
  () => settings.maintenanceCalories,
  (v) => { maintenanceInput.value = String(v) },
)
watch(
  () => settings.goalType,
  (v) => { goalTypeInput.value = v },
)
watch(
  () => settings.goalAmount,
  (v) => { goalAmountInput.value = String(v) },
)
watch(
  () => settings.currentWeight,
  (v) => { weightInput.value = String(v) },
)

const dailyTargetPreview = computed(() => {
  const m = Number(maintenanceInput.value) || 0
  const a = Number(goalAmountInput.value) || 0
  if (goalTypeInput.value === 'deficit') return Math.max(0, m - a)
  if (goalTypeInput.value === 'surplus') return m + a
  return m
})

function save() {
  const m = Number(maintenanceInput.value)
  if (Number.isFinite(m) && m > 0) settings.setMaintenanceCalories(m)

  settings.setGoalType(goalTypeInput.value)

  const a = Number(goalAmountInput.value)
  if (Number.isFinite(a) && a >= 0) settings.setGoalAmount(a)

  const w = Number(weightInput.value)
  if (Number.isFinite(w) && w >= 0) settings.setCurrentWeight(w)

  maintenanceInput.value = String(settings.maintenanceCalories)
  goalTypeInput.value = settings.goalType
  goalAmountInput.value = String(settings.goalAmount)
  weightInput.value = String(settings.currentWeight)

  saved.value = true
  clearTimeout(savedTimer)
  savedTimer = setTimeout(() => (saved.value = false), 1500)
}

function confirmReset() {
  settings.reset()
  diary.reset()
  resetOpen.value = false
  maintenanceInput.value = String(settings.maintenanceCalories)
  goalTypeInput.value = settings.goalType
  goalAmountInput.value = String(settings.goalAmount)
  weightInput.value = String(settings.currentWeight)
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold">{{ t('settings.heading') }}</h2>

    <section
      class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <template v-if="auth.isAuthenticated">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
              {{ t('auth.signedInAs') }}
            </p>
            <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ auth.displayName }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="signOut"
          >
            {{ t('auth.signOut') }}
          </button>
        </div>
      </template>
      <template v-else>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('auth.guestHint') }}</p>
        <RouterLink
          to="/login"
          class="mt-3 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          {{ t('auth.signIn') }}
        </RouterLink>
      </template>
    </section>

    <form class="space-y-4" @submit.prevent="save">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('settings.maintenanceLabel') }}
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="maintenanceInput"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            :class="inputClass"
          />
          <span class="shrink-0 text-sm text-slate-500 dark:text-slate-400">kcal</span>
        </div>
        <p class="mt-2 text-xs text-slate-400">{{ t('settings.maintenanceHint') }}</p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label class="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('settings.goalTypeLabel') }}
        </label>
        <div class="flex overflow-hidden rounded-lg border border-slate-300 text-xs dark:border-slate-700">
          <button
            type="button"
            class="flex-1 px-2 py-2 font-medium transition-colors"
            :class="goalTypeInput === 'maintain' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300'"
            @click="goalTypeInput = 'maintain'"
          >
            {{ t('settings.goalTypeMaintain') }}
          </button>
          <button
            type="button"
            class="flex-1 px-2 py-2 font-medium transition-colors"
            :class="goalTypeInput === 'deficit' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300'"
            @click="goalTypeInput = 'deficit'"
          >
            {{ t('settings.goalTypeDeficit') }}
          </button>
          <button
            type="button"
            class="flex-1 px-2 py-2 font-medium transition-colors"
            :class="goalTypeInput === 'surplus' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300'"
            @click="goalTypeInput = 'surplus'"
          >
            {{ t('settings.goalTypeSurplus') }}
          </button>
        </div>

        <div v-if="goalTypeInput !== 'maintain'" class="mt-3">
          <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            {{ goalTypeInput === 'deficit' ? t('settings.deficitLabel') : t('settings.surplusLabel') }}
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="goalAmountInput"
              type="number"
              inputmode="numeric"
              min="0"
              step="1"
              :class="inputClass"
            />
            <span class="shrink-0 text-sm text-slate-500 dark:text-slate-400">kcal</span>
          </div>
        </div>

        <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
          <span class="text-slate-500 dark:text-slate-400">{{ t('settings.dailyTargetLabel') }}:</span>
          <span class="ml-1 font-semibold text-slate-700 dark:text-slate-200">
            {{ formatKcal(dailyTargetPreview, locale) }} kcal
          </span>
        </div>
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
