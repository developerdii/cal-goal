<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import { DEFAULT_UNIT, defaultServingAmount, unitLabelKey } from '@/utils/units'
import { resolveKcal, resolveQuantity } from '@/utils/nutrition'
import { formatKcal } from '@/utils/format'
import { useFoodsStore } from '@/stores/foodsStore'
import ItemEditor from '@/components/diary/ItemEditor.vue'
import SavedItemsDropdown from '@/components/diary/SavedItemsDropdown.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  entry: { type: Object, default: null },
  food: { type: Object, default: null },
  context: { type: String, default: 'log' },
})

const emit = defineEmits(['close', 'save', 'delete', 'quick-add'])

const { t, locale } = useI18n()

const isLibrary = computed(() => props.context === 'library')
const foodsStore = useFoodsStore()
const allFoods = computed(() => foodsStore.all('food'))
const nameInput = ref(null)

const form = reactive({
  name: '',
  mode: 'amount',
  calories: '',
  unit: DEFAULT_UNIT,
  amount: String(defaultServingAmount(DEFAULT_UNIT)),
  perKcal: '',
  quantity: '',
})
const saveToFoods = ref(false)
const errors = reactive({ name: '', calories: '', amount: '', perKcal: '', quantity: '' })

const eyebrow = computed(() => {
  if (isLibrary.value) return props.food ? t('foods.editFoodTitle') : t('foods.addFoodTitle')
  return props.entry ? t('entry.editTitle') : t('foods.addFoodTitle')
})

function foodMeta(food) {
  if (food.unit) {
    return `${food.amount} ${t(unitLabelKey(food.unit, food.amount))} · ${formatKcal(food.perKcal, locale.value)} kcal`
  }
  return `${formatKcal(food.calories, locale.value)} kcal`
}

// Live total shown at the top-right of the title, mirroring the group modal's
// per-item header total.
const total = computed(() => {
  if (form.mode === 'kcal') return Number(form.calories) || 0
  return resolveKcal(
    form.amount,
    form.perKcal,
    resolveQuantity(form.amount, form.quantity, form.unit),
  )
})
const totalLabel = computed(() =>
  total.value > 0 ? `${formatKcal(total.value, locale.value)} kcal` : `— kcal`,
)
const totalColor = computed(() =>
  total.value > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500',
)

function clearErrors() {
  errors.name = ''
  errors.calories = ''
  errors.amount = ''
  errors.perKcal = ''
  errors.quantity = ''
}

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

function onQuickAdd(food) {
  emit('quick-add', food)
}

function fillFromSaved(food) {
  form.name = food.name
  if (food.unit) {
    form.mode = 'amount'
    form.unit = food.unit
    form.amount = String(food.amount)
    form.perKcal = String(food.perKcal)
    form.quantity = String(food.amount)
  } else {
    form.mode = 'kcal'
    form.calories = String(food.calories)
  }
}

function onCreateFood(query) {
  form.name = query
  nameInput.value?.focus()
}

watch(
  () => props.open,
  (open) => {
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
    const quantity = Number(resolveQuantity(form.amount, form.quantity, form.unit))
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
</script>

<template>
  <BaseModal :open="open" :eyebrow="eyebrow" @close="emit('close')">
    <template #title>
      <div class="flex items-center gap-2">
        <input
          ref="nameInput"
          v-model="form.name"
          type="text"
          :placeholder="t('entry.namePlaceholder')"
          class="min-w-0 flex-1 border-b border-transparent bg-transparent pb-1.5 text-[22px] font-bold text-slate-900 outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 dark:text-slate-50 dark:hover:border-slate-700"
        />
        <span class="shrink-0 font-mono text-[15px] tabular-nums" :class="totalColor">{{ totalLabel }}</span>
      </div>
      <p v-if="errors.name" class="mt-1 text-xs text-rose-500">{{ errors.name }}</p>
    </template>

    <form id="food-form" class="space-y-3" @submit.prevent="submit">
      <ItemEditor
        :show-name="false"
        :show-amount-eaten="!isLibrary"
        :removable="false"
        :errors="errors"
        v-model:name="form.name"
        v-model:mode="form.mode"
        v-model:calories="form.calories"
        v-model:unit="form.unit"
        v-model:amount="form.amount"
        v-model:per-kcal="form.perKcal"
        v-model:quantity="form.quantity"
      />
    </form>

    <template #footer>
      <div v-if="!isLibrary && !entry">
        <SavedItemsDropdown
          :items="allFoods"
          :meta="foodMeta"
          :create-label="(q) => t('foods.createFood', { query: q })"
          selectable
          @quick-add="onQuickAdd"
          @select="fillFromSaved"
          @create="onCreateFood"
        />
      </div>

      <label v-if="!isLibrary" class="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input v-model="saveToFoods" type="checkbox" class="custom-checkbox" />
        <span>{{ t('form.saveToFoods') }}</span>
      </label>

      <div class="mt-2 flex items-center gap-2">
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
</template>
