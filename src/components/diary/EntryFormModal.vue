<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import { REFERENCE_UNITS, DEFAULT_UNIT, defaultServingAmount, unitLabelKey } from '@/utils/units'
import { resolveKcal } from '@/utils/nutrition'
import { formatKcal } from '@/utils/format'
import { useFoodsStore } from '@/stores/foodsStore'
import SavedFoodsPicker from '@/components/diary/SavedFoodsPicker.vue'
import SavedFoodsModal from '@/components/diary/SavedFoodsModal.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  entry: { type: Object, default: null }, // diary item (edit, log context)
  food: { type: Object, default: null }, // library food (edit, library context)
  context: { type: String, default: 'log' }, // 'log' | 'library'
})

const emit = defineEmits(['close', 'save', 'delete', 'quickAdd'])

const { t, locale } = useI18n()

const isLibrary = computed(() => props.context === 'library')
const foodsStore = useFoodsStore()
const savedFoods = computed(() => foodsStore.recent('food', 5))
const allFoods = computed(() => foodsStore.all('food'))
const foodsPickerOpen = ref(false)
const nameInput = ref(null)

const form = reactive({
  name: '',
  mode: 'amount', // 'kcal' (total) | 'amount' (serving)
  calories: '',
  unit: DEFAULT_UNIT,
  amount: String(defaultServingAmount(DEFAULT_UNIT)),
  perKcal: '',
  quantity: '',
})
const saveToFoods = ref(false)
const errors = reactive({ name: '', calories: '', amount: '', perKcal: '', quantity: '' })

const title = computed(() => {
  if (isLibrary.value) return props.food ? t('foods.editFoodTitle') : t('foods.addFoodTitle')
  return props.entry ? t('entry.editTitle') : t('entry.addTitle')
})

const referenceAmountText = computed(
  () => String(form.amount).trim() || String(defaultServingAmount(form.unit)),
)
const effectiveQuantity = computed(
  () => String(form.quantity).trim() || referenceAmountText.value,
)

const total = computed(() => {
  if (form.mode === 'amount') {
    if (isLibrary.value) return Number(form.perKcal) || 0
    return resolveKcal(form.amount, form.perKcal, effectiveQuantity.value)
  }
  return Number(form.calories) || 0
})

const quantityUnitLabel = computed(() => t(unitLabelKey(form.unit, effectiveQuantity.value)))
const amountSummary = computed(() => {
  const value = form.mode === 'amount'
    ? (isLibrary.value ? referenceAmountText.value : effectiveQuantity.value)
    : ''
  const v = String(value).trim()
  if (v === '') return '—'
  return `${v} ${t(unitLabelKey(form.unit, v))}`
})
const hasValidTotal = computed(() => {
  const v = total.value
  return Number.isFinite(v) && v > 0
})
const totalText = computed(() =>
  hasValidTotal.value ? `${formatKcal(total.value, locale)} kcal` : t('form.totalHint'),
)

function onUnitChange() {
  form.amount = String(defaultServingAmount(form.unit))
  form.quantity = ''
  if (String(form.perKcal).trim() !== '') form.perKcal = ''
}

watch(
  () => props.open,
  (open) => {
    foodsPickerOpen.value = false
    if (!open) return
    resetForm()
    const src = isLibrary.value ? props.food : props.entry
    if (!src) return

    form.name = src.name ?? ''
    if (src.amount != null && src.perKcal != null) {
      form.mode = 'amount'
      form.unit = src.unit || DEFAULT_UNIT
      form.amount = String(src.amount)
      form.perKcal = String(src.perKcal)
      if (src.quantity != null) form.quantity = String(src.quantity)
    } else {
      form.mode = 'kcal'
      form.calories = src.calories != null ? String(src.calories) : ''
      if (src.unit) form.unit = src.unit
      if (src.quantity != null) form.quantity = String(src.quantity)
    }
  },
)

watch(
  () => form.name,
  () => {
    if (errors.name) errors.name = ''
  },
)

function resetForm() {
  form.name = ''
  form.mode = 'amount'
  form.calories = ''
  form.unit = DEFAULT_UNIT
  form.amount = String(defaultServingAmount(DEFAULT_UNIT))
  form.perKcal = ''
  form.quantity = ''
  saveToFoods.value = false
  clearErrors()
}

function clearErrors() {
  errors.name = ''
  errors.calories = ''
  errors.amount = ''
  errors.perKcal = ''
  errors.quantity = ''
}

function fillFromSaved(food) {
  form.name = food.name
  if (food.amount != null && food.perKcal != null) {
    form.mode = 'amount'
    form.unit = food.unit
    form.amount = String(food.amount)
    form.perKcal = String(food.perKcal)
    form.quantity = String(food.amount)
  } else {
    form.mode = 'kcal'
    form.calories = food.calories != null ? String(food.calories) : ''
  }
}

function onQuickAdd(food) {
  foodsPickerOpen.value = false
  emit('quickAdd', food)
}

function fillFromSavedModal(food) {
  foodsPickerOpen.value = false
  fillFromSaved(food)
}

function validate() {
  clearErrors()
  let ok = true

  if (!form.name.trim()) {
    errors.name = t('entry.validation.nameRequired')
    ok = false
  }

  if (form.mode === 'kcal') {
    const raw = String(form.calories).trim()
    const cal = Number(raw)
    if (raw === '') {
      errors.calories = t('entry.validation.caloriesRequired')
      ok = false
    } else if (!Number.isFinite(cal) || cal <= 0) {
      errors.calories = t('entry.validation.caloriesPositive')
      ok = false
    }
  } else {
    const amount = Number(form.amount)
    const perKcal = Number(form.perKcal)
    const quantity = Number(form.quantity)

    if (String(form.amount).trim() === '') {
      errors.amount = t('form.validation.amountRequired')
      ok = false
    } else if (!Number.isFinite(amount) || amount <= 0) {
      errors.amount = t('form.validation.amountPositive')
      ok = false
    }

    if (String(form.perKcal).trim() === '') {
      errors.perKcal = t('form.validation.perKcalRequired')
      ok = false
    } else if (!Number.isFinite(perKcal) || perKcal <= 0) {
      errors.perKcal = t('form.validation.perKcalPositive')
      ok = false
    }

    if (!isLibrary.value && String(form.quantity).trim() !== '') {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.quantity = t('form.validation.quantityPositive')
        ok = false
      }
    }
  }

  return ok
}

function submit() {
  if (!form.name.trim()) {
    errors.name = t('entry.validation.nameRequired')
    nameInput.value?.focus()
    return
  }
  if (!validate()) return

  const name = form.name.trim()

  if (form.mode === 'amount') {
    const unit = form.unit
    const amount = Number(form.amount)
    const perKcal = Number(form.perKcal)
    const quantity = Number(effectiveQuantity.value)
    const calories = resolveKcal(amount, perKcal, quantity)

    emit('save', {
      name,
      calories,
      unit,
      amount,
      perKcal,
      quantity: isLibrary.value ? null : quantity,
      saveToFoods: isLibrary.value ? false : saveToFoods.value,
    })
  } else {
    emit('save', {
      name,
      calories: Number(form.calories),
      unit: null,
      amount: null,
      perKcal: null,
      quantity: null,
      saveToFoods: isLibrary.value ? false : saveToFoods.value,
    })
  }
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
const numInputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-right text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
const unitSelectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
const cardClass =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50'
const cardHeadingClass = 'text-[13px] font-medium text-slate-500 dark:text-slate-400'
const fieldGridClass = 'grid grid-cols-[minmax(0,1fr)_108px] items-center gap-2'
const unitSuffixClass = 'pl-3 text-sm text-slate-500 dark:text-slate-400'
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <form id="food-form" class="space-y-3" @submit.prevent="submit">
      <div v-if="!isLibrary && !entry">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {{ t('foods.heading') }}
        </p>
        <SavedFoodsPicker
          :items="savedFoods"
          :total="allFoods.length"
          @quickAdd="onQuickAdd"
          @fill="fillFromSaved"
          @seeAll="foodsPickerOpen = true"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('entry.name') }}
        </label>
        <input
          ref="nameInput"
          v-model="form.name"
          type="text"
          :placeholder="t('entry.namePlaceholder')"
          :class="inputClass"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-rose-500">{{ errors.name }}</p>
      </div>

      <div class="flex overflow-hidden rounded-lg border border-slate-300 text-sm dark:border-slate-700">
        <button
          type="button"
          class="flex-1 px-3 py-2 font-medium transition-colors"
          :class="form.mode === 'kcal' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="form.mode = 'kcal'"
        >
          {{ t('form.modeKcal') }}
        </button>
        <button
          type="button"
          class="flex-1 px-3 py-2 font-medium transition-colors"
          :class="form.mode === 'amount' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="form.mode = 'amount'"
        >
          {{ t('form.modeServing') }}
        </button>
      </div>

      <!-- Card A: this food (serving mode) -->
      <div v-if="form.mode === 'amount'" class="space-y-2" :class="cardClass">
        <p :class="cardHeadingClass">{{ t('form.thisFood') }}</p>

        <div>
          <div :class="fieldGridClass">
            <input
              v-model="form.amount"
              type="number"
              inputmode="decimal"
              min="0.1"
              step="any"
              :placeholder="String(defaultServingAmount(form.unit))"
              :class="numInputClass"
            />
            <select v-model="form.unit" :class="unitSelectClass" @change="onUnitChange">
              <option v-for="code in REFERENCE_UNITS" :key="code" :value="code">
                {{ t(`units.${code}`) }}
              </option>
            </select>
          </div>
          <p v-if="errors.amount" class="mt-1 text-xs text-rose-500">{{ errors.amount }}</p>
        </div>

        <div>
          <div :class="fieldGridClass">
            <input
              v-model="form.perKcal"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              :placeholder="t('form.perKcalPlaceholder')"
              :class="numInputClass"
            />
            <span :class="unitSuffixClass">kcal</span>
          </div>
          <p v-if="errors.perKcal" class="mt-1 text-xs text-rose-500">{{ errors.perKcal }}</p>
        </div>
      </div>

      <!-- Single calories field (total mode) -->
      <div v-else class="space-y-2" :class="cardClass">
        <p :class="cardHeadingClass">{{ t('form.calories') }}</p>

        <div>
          <div :class="fieldGridClass">
            <input
              v-model="form.calories"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              :placeholder="t('entry.caloriesPlaceholder')"
              :class="numInputClass"
            />
            <span :class="unitSuffixClass">kcal</span>
          </div>
          <p v-if="errors.calories" class="mt-1 text-xs text-rose-500">{{ errors.calories }}</p>
        </div>
      </div>

      <!-- Card B: how much you ate -->
      <div v-if="form.mode === 'amount' && !isLibrary" class="space-y-2" :class="cardClass">
        <p :class="cardHeadingClass">{{ t('form.howMuchAte') }}</p>

        <div>
          <div :class="fieldGridClass">
            <input
              v-model="form.quantity"
              type="number"
              inputmode="decimal"
              min="0.1"
              step="any"
              :placeholder="referenceAmountText"
              :class="numInputClass"
            />
            <span :class="unitSuffixClass">{{ quantityUnitLabel }}</span>
          </div>
          <p v-if="errors.quantity" class="mt-1 text-xs text-rose-500">{{ errors.quantity }}</p>
        </div>
      </div>

      <!-- Total sentence -->
      <div v-if="form.mode === 'amount'" class="border-t border-slate-200 pt-3 dark:border-slate-800">
        <div class="flex items-baseline justify-between gap-2">
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ amountSummary }}</span>
          <span
            :class="hasValidTotal
              ? 'text-[18px] font-medium leading-none text-slate-800 dark:text-slate-100'
              : 'text-sm text-slate-500 dark:text-slate-400'"
          >
            {{ totalText }}
          </span>
        </div>
      </div>
    </form>

    <template #footer>
      <label
        v-if="!isLibrary"
        class="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
      >
        <input
          v-model="saveToFoods"
          type="checkbox"
          class="custom-checkbox"
        />
        <span>{{ t('form.saveToFoods') }}</span>
      </label>
      <div class="flex gap-2 pt-2">
        <button
          v-if="entry || food"
          type="button"
          class="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
          @click="emit('delete')"
        >
          {{ t('common.delete') }}
        </button>
        <div class="flex-1"></div>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="food-form"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </template>
  </BaseModal>

  <SavedFoodsModal
    :open="foodsPickerOpen"
    :title="t('foods.heading')"
    :items="allFoods"
    @close="foodsPickerOpen = false"
    @select="fillFromSavedModal"
    @quickAdd="onQuickAdd"
  />
</template>
