<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import { UNIT_CODES, DEFAULT_UNIT } from '@/utils/units'
import { resolveKcal } from '@/utils/nutrition'
import { formatKcal } from '@/utils/format'

const props = defineProps({
  open: { type: Boolean, default: false },
  entry: { type: Object, default: null }, // diary item (edit, log context)
  food: { type: Object, default: null }, // library food (edit, library context)
  context: { type: String, default: 'log' }, // 'log' | 'library'
})

const emit = defineEmits(['close', 'save', 'delete'])

const { t, locale } = useI18n()

const isLibrary = computed(() => props.context === 'library')

const form = reactive({
  name: '',
  mode: 'kcal', // 'kcal' | 'amount'
  calories: '',
  unit: DEFAULT_UNIT,
  amount: '',
  perKcal: '',
  quantity: '',
})
const saveToFoods = ref(false)
const errors = reactive({ name: '', calories: '', amount: '', perKcal: '', quantity: '' })

const title = computed(() => {
  if (isLibrary.value) return props.food ? t('foods.editFoodTitle') : t('foods.addFoodTitle')
  return props.entry ? t('entry.editTitle') : t('entry.addTitle')
})

const total = computed(() => {
  if (form.mode === 'amount') {
    return resolveKcal(form.amount, form.perKcal, form.quantity || form.amount)
  }
  return Number(form.calories) || 0
})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    resetForm()
    const src = isLibrary.value ? props.food : props.entry
    if (!src) return

    form.name = src.name ?? ''
    if (src.unit) {
      form.mode = 'amount'
      form.unit = src.unit
      form.amount = src.amount != null ? String(src.amount) : ''
      form.perKcal = src.perKcal != null ? String(src.perKcal) : ''
      form.quantity = src.quantity != null ? String(src.quantity) : ''
    } else {
      form.mode = 'kcal'
      form.calories = src.calories != null ? String(src.calories) : ''
    }
  },
)

function resetForm() {
  form.name = ''
  form.mode = 'kcal'
  form.calories = ''
  form.unit = DEFAULT_UNIT
  form.amount = ''
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

    if (!isLibrary.value) {
      if (String(form.quantity).trim() === '') {
        errors.quantity = t('form.validation.quantityRequired')
        ok = false
      } else if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.quantity = t('form.validation.quantityPositive')
        ok = false
      }
    }
  }

  return ok
}

function submit() {
  if (!validate()) return

  const name = form.name.trim()

  if (form.mode === 'amount') {
    const unit = form.unit
    const amount = Number(form.amount)
    const perKcal = Number(form.perKcal)
    const quantity = Number(form.quantity)
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
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('entry.name') }}
        </label>
        <input
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
          {{ t('form.modeAmount') }}
        </button>
      </div>

      <div v-if="form.mode === 'kcal'">
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('entry.calories') }}
        </label>
        <input
          v-model="form.calories"
          type="number"
          inputmode="numeric"
          min="1"
          step="1"
          :placeholder="t('entry.caloriesPlaceholder')"
          :class="inputClass"
        />
        <p v-if="errors.calories" class="mt-1 text-xs text-rose-500">{{ errors.calories }}</p>
      </div>

      <template v-else>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            {{ t('form.unit') }}
          </label>
          <select v-model="form.unit" :class="inputClass">
            <option v-for="code in UNIT_CODES" :key="code" :value="code">
              {{ t(`units.${code}`) }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              {{ t('form.amount') }}
            </label>
            <input
              v-model="form.amount"
              type="number"
              inputmode="decimal"
              min="0.1"
              step="any"
              placeholder="100"
              :class="inputClass"
            />
            <p v-if="errors.amount" class="mt-1 text-xs text-rose-500">{{ errors.amount }}</p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              {{ t('form.perKcal') }}
            </label>
            <input
              v-model="form.perKcal"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              placeholder="110"
              :class="inputClass"
            />
            <p v-if="errors.perKcal" class="mt-1 text-xs text-rose-500">{{ errors.perKcal }}</p>
          </div>
        </div>

        <div v-if="!isLibrary">
          <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            {{ t('form.quantity') }}
          </label>
          <input
            v-model="form.quantity"
            type="number"
            inputmode="decimal"
            min="0.1"
            step="any"
            placeholder="250"
            :class="inputClass"
          />
          <p v-if="errors.quantity" class="mt-1 text-xs text-rose-500">{{ errors.quantity }}</p>
        </div>

        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('form.total') }}: {{ formatKcal(total, locale) }} kcal
        </p>
      </template>

      <label
        v-if="!isLibrary"
        class="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
      >
        <input
          v-model="saveToFoods"
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
        />
        <span>{{ t('form.saveToFoods') }}</span>
      </label>

      <div class="flex gap-2 pt-1">
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
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
