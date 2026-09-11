<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import { DEFAULT_UNIT, REFERENCE_UNITS, defaultServingAmount } from '@/utils/units'
import { formatKcal } from '@/utils/format'
import { useServingCalc } from '@/composables/useServingCalc'

const props = defineProps({
  collapsible: { type: Boolean, default: false },
  open: { type: Boolean, default: false },
  showName: { type: Boolean, default: true },
  showAmountEaten: { type: Boolean, default: true },
  removable: { type: Boolean, default: true },
  errors: { type: Object, default: () => ({}) },
  namePlaceholder: { type: String, default: '' },
})

const emit = defineEmits(['toggle', 'remove'])

const name = defineModel('name', { type: String, default: '' })
const mode = defineModel('mode', { type: String, default: 'kcal' })
const calories = defineModel('calories', { type: [String, Number], default: '' })
const unit = defineModel('unit', { type: String, default: DEFAULT_UNIT })
const amount = defineModel('amount', { type: [String, Number], default: '' })
const perKcal = defineModel('perKcal', { type: [String, Number], default: '' })
const quantity = defineModel('quantity', { type: [String, Number], default: '' })

const { t, locale } = useI18n()

const { referenceAmountText, quantityUnitLabel, total, changeUnit } = useServingCalc(
  unit,
  amount,
  perKcal,
  quantity,
)

const kcal = computed(() => (mode.value === 'amount' ? total.value : Number(calories.value) || 0))
const kcalLabel = computed(() =>
  kcal.value > 0 ? `${formatKcal(kcal.value, locale.value)} kcal` : `— kcal`,
)
const kcalColor = computed(() =>
  props.open && kcal.value > 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-slate-400 dark:text-slate-500',
)
const nameColor = computed(() =>
  props.open ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100',
)

const nameInput = ref(null)
watch(
  () => props.open,
  async (open) => {
    if (!open || !props.showName) return
    if (String(name.value ?? '').trim()) return
    await nextTick()
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) nameInput.value?.focus()
  },
)

function setAmount() {
  mode.value = 'amount'
  if (String(amount.value ?? '').trim() === '') {
    amount.value = String(defaultServingAmount(unit.value))
  }
}
function setDirect() {
  mode.value = 'kcal'
}
function onUnitChange(e) {
  changeUnit(e.target.value)
}

const labelClass = 'w-12 shrink-0 text-[13px] text-slate-500 dark:text-slate-400'
const numClass =
  'w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right text-sm tabular-nums outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
const selectClass =
  'rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <div :class="showName ? 'rounded-xl border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900' : ''">
    <div v-if="showName" class="flex items-center gap-2 px-3 py-2">
      <input
        ref="nameInput"
        v-model="name"
        type="text"
        :placeholder="namePlaceholder"
        class="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-[15px] font-medium outline-none placeholder:text-slate-400"
        :class="nameColor"
      />
      <span class="shrink-0 font-mono text-[15px] tabular-nums" :class="kcalColor">{{ kcalLabel }}</span>
      <button
        v-if="collapsible"
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        :aria-label="t('form.details')"
        @click="emit('toggle')"
      >
        <Icon name="chevronDown" class="h-4 w-4 transition-transform" :class="open ? 'rotate-180' : ''" />
      </button>
    </div>

    <div
      v-if="!collapsible || open"
      :class="showName ? 'border-t border-slate-100 px-3 pb-3 pt-2.5 dark:border-slate-800' : ''"
    >
      <div class="flex items-center gap-2">
        <div class="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
            :class="mode === 'amount' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
            @click="setAmount"
          >
            {{ t('form.perServing') }}
          </button>
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
            :class="mode === 'kcal' ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
            @click="setDirect"
          >
            {{ t('form.directKcal') }}
          </button>
        </div>
        <button
          v-if="removable"
          type="button"
          class="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:border-rose-800 dark:hover:bg-rose-950 dark:hover:text-rose-400"
          :aria-label="t('form.removeItem')"
          @click="emit('remove')"
        >
          <Icon name="trash" class="h-4 w-4" />
        </button>
      </div>

      <div v-if="mode === 'amount'" class="mt-3 space-y-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <span :class="labelClass">{{ t('form.per') }}</span>
          <input
            v-model="amount"
            type="number"
            inputmode="decimal"
            min="0.1"
            step="any"
            :placeholder="String(defaultServingAmount(unit))"
            :class="numClass"
          />
          <select v-model="unit" :class="selectClass" @change="onUnitChange">
            <option v-for="code in REFERENCE_UNITS" :key="code" :value="code">
              {{ t(`units.${code}`) }}
            </option>
          </select>
          <span class="text-[13px] text-slate-500 dark:text-slate-400">=</span>
          <input
            v-model="perKcal"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            :placeholder="t('form.perKcalPlaceholder')"
            :class="numClass"
          />
          <span class="text-[13px] text-slate-500 dark:text-slate-400">kcal</span>
        </div>
        <p v-if="errors.amount" class="text-xs text-rose-500">{{ errors.amount }}</p>
        <p v-if="errors.perKcal" class="text-xs text-rose-500">{{ errors.perKcal }}</p>

        <div v-if="showAmountEaten" class="flex flex-wrap items-center gap-2">
          <span :class="labelClass">{{ t('form.iAte') }}</span>
          <input
            v-model="quantity"
            type="number"
            inputmode="decimal"
            min="0.1"
            step="any"
            :placeholder="referenceAmountText"
            :class="numClass"
          />
          <span class="text-[13px] text-slate-500 dark:text-slate-400">{{ quantityUnitLabel }}</span>
        </div>
        <p v-if="errors.quantity" class="text-xs text-rose-500">{{ errors.quantity }}</p>
      </div>

      <div v-else class="mt-3">
        <div class="flex flex-wrap items-center gap-2">
          <span :class="labelClass">{{ t('form.calories') }}</span>
          <input
            v-model="calories"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            placeholder="0"
            :class="numClass"
          />
          <span class="text-[13px] text-slate-500 dark:text-slate-400">kcal</span>
        </div>
        <p v-if="errors.calories" class="text-xs text-rose-500">{{ errors.calories }}</p>
      </div>
    </div>
  </div>
</template>
