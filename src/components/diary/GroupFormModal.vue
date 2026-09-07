<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import Icon from '@/components/ui/Icon.vue'
import { UNIT_CODES, DEFAULT_UNIT } from '@/utils/units'
import { resolveKcal } from '@/utils/nutrition'
import { createId } from '@/utils/id'

const props = defineProps({
  open: { type: Boolean, default: false },
  group: { type: Object, default: null }, // diary group (edit)
  food: { type: Object, default: null }, // library group (edit)
  context: { type: String, default: 'log' }, // 'log' | 'library'
})

const emit = defineEmits(['close', 'save', 'delete'])

const { t } = useI18n()

const isLibrary = computed(() => props.context === 'library')

const form = reactive({ name: '', items: [] })
const saveToFoods = ref(false)
const errors = reactive({ name: '', items: '' })

function emptyItem() {
  return {
    id: createId(),
    name: '',
    mode: 'kcal',
    calories: '',
    unit: DEFAULT_UNIT,
    amount: '',
    perKcal: '',
    quantity: '',
  }
}

function fromSource(item) {
  if (item.unit) {
    return {
      id: item.id || createId(),
      name: item.name ?? '',
      mode: 'amount',
      calories: '',
      unit: item.unit,
      amount: item.amount != null ? String(item.amount) : '',
      perKcal: item.perKcal != null ? String(item.perKcal) : '',
      quantity: item.quantity != null ? String(item.quantity) : '',
    }
  }
  return {
    id: item.id || createId(),
    name: item.name ?? '',
    mode: 'kcal',
    calories: item.calories != null ? String(item.calories) : '',
    unit: DEFAULT_UNIT,
    amount: '',
    perKcal: '',
    quantity: '',
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const src = isLibrary.value ? props.food : props.group
    form.name = src?.name ?? ''
    form.items = (src?.items || []).map(fromSource)
    if (form.items.length === 0) form.items.push(emptyItem())
    saveToFoods.value = false
    errors.name = ''
    errors.items = ''
  },
)

const title = computed(() => {
  if (isLibrary.value) return props.food ? t('foods.editGroupTitle') : t('foods.addGroupTitle')
  return props.group ? t('group.editTitle') : t('group.addTitle')
})

function addItem() {
  form.items.push(emptyItem())
}

function removeItem(id) {
  form.items = form.items.filter((it) => it.id !== id)
  if (form.items.length === 0) form.items.push(emptyItem())
}

function isFilled(it) {
  return (
    it.name.trim() !== '' ||
    String(it.calories).trim() !== '' ||
    String(it.amount).trim() !== '' ||
    String(it.perKcal).trim() !== '' ||
    String(it.quantity).trim() !== ''
  )
}

function itemValid(it) {
  if (!it.name.trim()) return false
  if (it.mode === 'kcal') {
    const cal = Number(it.calories)
    return String(it.calories).trim() !== '' && Number.isFinite(cal) && cal > 0
  }
  const amount = Number(it.amount)
  const perKcal = Number(it.perKcal)
  if (String(it.amount).trim() === '' || !Number.isFinite(amount) || amount <= 0) return false
  if (String(it.perKcal).trim() === '' || !Number.isFinite(perKcal) || perKcal <= 0) return false
  if (!isLibrary.value) {
    const q = Number(it.quantity)
    if (String(it.quantity).trim() === '' || !Number.isFinite(q) || q <= 0) return false
  }
  return true
}

function validate() {
  errors.name = ''
  errors.items = ''

  if (!form.name.trim()) {
    errors.name = t('group.validation.nameRequired')
    return false
  }

  const filled = form.items.filter(isFilled)
  if (filled.length === 0) {
    errors.items = t('group.validation.noItems')
    return false
  }

  if (filled.some((it) => !itemValid(it))) {
    errors.items = t('group.validation.itemInvalid')
    return false
  }

  return true
}

function submit() {
  if (!validate()) return

  const items = form.items.filter(isFilled).map((it) => {
    if (it.mode === 'amount') {
      const amount = Number(it.amount)
      const perKcal = Number(it.perKcal)
      const quantity = Number(it.quantity)
      return {
        id: it.id,
        name: it.name.trim(),
        calories: resolveKcal(amount, perKcal, quantity),
        unit: it.unit,
        amount,
        perKcal,
        quantity: isLibrary.value ? null : quantity,
      }
    }
    return {
      id: it.id,
      name: it.name.trim(),
      calories: Number(it.calories),
      unit: null,
      amount: null,
      perKcal: null,
      quantity: null,
    }
  })

  emit('save', {
    name: form.name.trim(),
    items,
    saveToFoods: isLibrary.value ? false : saveToFoods.value,
  })
}

const inputClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('group.name') }}
        </label>
        <input
          v-model="form.name"
          type="text"
          :placeholder="t('group.namePlaceholder')"
          class="w-full"
          :class="inputClass"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-rose-500">{{ errors.name }}</p>
      </div>

      <div>
        <div class="mb-1 flex items-center justify-between">
          <label class="text-sm font-medium text-slate-600 dark:text-slate-300">
            {{ t('group.items') }}
          </label>
          <button
            type="button"
            class="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            @click="addItem"
          >
            <Icon name="plus" class="h-3.5 w-3.5" />
            {{ t('group.addItem') }}
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="it in form.items"
            :key="it.id"
            class="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
          >
            <div class="flex items-center gap-2">
              <input
                v-model="it.name"
                type="text"
                :placeholder="t('entry.namePlaceholder')"
                class="w-full"
                :class="inputClass"
              />
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                aria-label="Remove item"
                @click="removeItem(it.id)"
              >
                <Icon name="close" class="h-4 w-4" />
              </button>
            </div>

            <div class="flex overflow-hidden rounded-lg border border-slate-300 text-xs dark:border-slate-700">
              <button
                type="button"
                class="flex-1 px-2 py-1.5 font-medium transition-colors"
                :class="it.mode === 'kcal' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300'"
                @click="it.mode = 'kcal'"
              >
                {{ t('form.modeKcal') }}
              </button>
              <button
                type="button"
                class="flex-1 px-2 py-1.5 font-medium transition-colors"
                :class="it.mode === 'amount' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300'"
                @click="it.mode = 'amount'"
              >
                {{ t('form.modeAmount') }}
              </button>
            </div>

            <input
              v-if="it.mode === 'kcal'"
              v-model="it.calories"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              :placeholder="t('entry.caloriesPlaceholder')"
              class="w-full"
              :class="inputClass"
            />

            <template v-else>
              <div class="grid grid-cols-3 gap-2">
                <select v-model="it.unit" :class="inputClass">
                  <option v-for="code in UNIT_CODES" :key="code" :value="code">
                    {{ t(`units.${code}`) }}
                  </option>
                </select>
                <input
                  v-model="it.amount"
                  type="number"
                  inputmode="decimal"
                  min="0.1"
                  step="any"
                  placeholder="100"
                  :class="inputClass"
                />
                <input
                  v-model="it.perKcal"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  step="1"
                  placeholder="110"
                  :class="inputClass"
                />
              </div>
              <input
                v-if="!isLibrary"
                v-model="it.quantity"
                type="number"
                inputmode="decimal"
                min="0.1"
                step="any"
                :placeholder="t('form.quantity')"
                class="w-full"
                :class="inputClass"
              />
            </template>
          </div>
        </div>
        <p v-if="errors.items" class="mt-1 text-xs text-rose-500">{{ errors.items }}</p>
      </div>

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
          v-if="group || food"
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
