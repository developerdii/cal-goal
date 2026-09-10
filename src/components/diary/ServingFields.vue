<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { REFERENCE_UNITS, defaultServingAmount } from '@/utils/units'
import { formatKcal } from '@/utils/format'
import { useServingCalc } from '@/composables/useServingCalc'

const props = defineProps({
  density: { type: String, default: 'comfortable' }, // 'comfortable' | 'compact'
  units: { type: Array, default: () => REFERENCE_UNITS },
  showAmountEaten: { type: Boolean, default: true },
  errors: { type: Object, default: () => ({}) },
})

const unit = defineModel('unit', { type: String, required: true })
const amount = defineModel('amount', { type: [String, Number], default: '' })
const perKcal = defineModel('perKcal', { type: [String, Number], default: '' })
const quantity = defineModel('quantity', { type: [String, Number], default: '' })

const { t, locale } = useI18n()
const isCompact = computed(() => props.density === 'compact')

const {
  referenceAmountText,
  effectiveQuantity,
  quantityUnitLabel,
  total,
  hasValidTotal,
  changeUnit,
} = useServingCalc(unit, amount, perKcal, quantity)

const totalText = computed(() =>
  hasValidTotal.value ? `= ${formatKcal(total.value, locale)} kcal` : t('form.totalHint'),
)

function onUnitChange(e) {
  changeUnit(e.target.value)
}

const cardClass =
  'space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50'
const headingClass = 'text-[13px] font-medium text-slate-500 dark:text-slate-400'
const fieldGridClass = computed(() =>
  isCompact.value
    ? 'grid grid-cols-[minmax(0,1fr)_96px] items-center gap-2'
    : 'grid grid-cols-[minmax(0,1fr)_108px] items-center gap-2',
)
const inputClass = computed(() =>
  isCompact.value
    ? 'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
    : 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-right text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800',
)
const selectClass = computed(() =>
  isCompact.value
    ? 'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
    : 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800',
)
const suffixClass = computed(() =>
  isCompact.value
    ? 'whitespace-nowrap pl-1 text-sm text-slate-500 dark:text-slate-400'
    : 'pl-3 text-sm text-slate-500 dark:text-slate-400',
)
</script>

<template>
  <!-- Comfortable: two cards (single-entry modal) -->
  <div v-if="!isCompact" class="space-y-3">
    <div :class="cardClass">
      <p :class="headingClass">{{ t('form.thisFood') }}</p>

      <div>
        <div :class="fieldGridClass">
          <input
            v-model="amount"
            type="number"
            inputmode="decimal"
            min="0.1"
            step="any"
            :placeholder="String(defaultServingAmount(unit))"
            :class="inputClass"
          />
          <select v-model="unit" :class="selectClass" @change="onUnitChange">
            <option v-for="code in units" :key="code" :value="code">
              {{ t(`units.${code}`) }}
            </option>
          </select>
        </div>
        <p v-if="errors.amount" class="mt-1 text-xs text-rose-500">{{ errors.amount }}</p>
      </div>

      <div>
        <div :class="fieldGridClass">
          <input
            v-model="perKcal"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            :placeholder="t('form.perKcalPlaceholder')"
            :class="inputClass"
          />
          <span :class="suffixClass">kcal</span>
        </div>
        <p v-if="errors.perKcal" class="mt-1 text-xs text-rose-500">{{ errors.perKcal }}</p>
      </div>
    </div>

    <div v-if="showAmountEaten" :class="cardClass">
      <p :class="headingClass">{{ t('form.howMuchAte') }}</p>

      <div>
        <div :class="fieldGridClass">
          <input
            v-model="quantity"
            type="number"
            inputmode="decimal"
            min="0.1"
            step="any"
            :placeholder="referenceAmountText"
            :class="inputClass"
          />
          <span :class="suffixClass">{{ quantityUnitLabel }}</span>
        </div>
        <p v-if="errors.quantity" class="mt-1 text-xs text-rose-500">{{ errors.quantity }}</p>
      </div>
    </div>
  </div>

  <!-- Compact: indented borderless panel (group list) -->
  <div v-else class="mt-2.5 space-y-2 border-l-2 border-emerald-500/40 pl-3">
    <p :class="headingClass">{{ t('form.thisFood') }}</p>

    <div :class="fieldGridClass">
      <input
        v-model="amount"
        type="number"
        inputmode="decimal"
        min="0.1"
        step="any"
        :placeholder="String(defaultServingAmount(unit))"
        :class="inputClass"
      />
      <select v-model="unit" :class="selectClass" @change="onUnitChange">
        <option v-for="code in units" :key="code" :value="code">
          {{ t(`units.${code}`) }}
        </option>
      </select>
    </div>

    <div :class="fieldGridClass">
      <input
        v-model="perKcal"
        type="number"
        inputmode="numeric"
        min="1"
        step="1"
        :placeholder="t('form.perKcalPlaceholder')"
        :class="inputClass"
      />
      <span :class="suffixClass">kcal</span>
    </div>

    <template v-if="showAmountEaten">
      <p :class="headingClass">{{ t('form.howMuchAte') }}</p>

      <div class="grid grid-cols-[1fr_1fr] items-center gap-3">
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <input
            v-model="quantity"
            type="number"
            inputmode="decimal"
            min="0.1"
            step="any"
            :placeholder="referenceAmountText"
            :class="inputClass"
          />
          <span :class="suffixClass">{{ quantityUnitLabel }}</span>
        </div>
        <span class="text-right text-sm text-slate-500 dark:text-slate-400">
          {{ totalText }}
        </span>
      </div>
    </template>
  </div>
</template>
