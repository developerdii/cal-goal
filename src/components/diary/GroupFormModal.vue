<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import Icon from '@/components/ui/Icon.vue'
import { UNIT_CODES, DEFAULT_UNIT } from '@/utils/units'
import { resolveKcal } from '@/utils/nutrition'
import { formatKcal } from '@/utils/format'
import { createId } from '@/utils/id'
import { useFoodsStore } from '@/stores/foodsStore'
import SavedFoodsPicker from '@/components/diary/SavedFoodsPicker.vue'
import SavedFoodsModal from '@/components/diary/SavedFoodsModal.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  group: { type: Object, default: null }, // diary group (edit)
  food: { type: Object, default: null }, // library group (edit)
  context: { type: String, default: 'log' }, // 'log' | 'library'
})

const emit = defineEmits(['close', 'save', 'delete', 'quickAddGroup'])

const { t, locale } = useI18n()

const isLibrary = computed(() => props.context === 'library')
const foodsStore = useFoodsStore()
const savedGroups = computed(() => foodsStore.recent('group', 5))
const allGroups = computed(() => foodsStore.all('group'))
const allFoods = computed(() => foodsStore.all('food'))
const groupsPickerOpen = ref(false)
const foodsPickerOpen = ref(false)

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
    groupsPickerOpen.value = false
    foodsPickerOpen.value = false
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

function fillFromSavedGroup(food) {
  form.name = food.name
  form.items = (food.items || []).map(fromSource)
  if (form.items.length === 0) form.items.push(emptyItem())
}

function applyFoodToItem(it, food) {
  it.name = food.name
  if (food.unit) {
    it.mode = 'amount'
    it.unit = food.unit
    it.amount = food.amount != null ? String(food.amount) : ''
    it.perKcal = food.perKcal != null ? String(food.perKcal) : ''
    it.quantity = String(food.amount ?? '')
  } else {
    it.mode = 'kcal'
    it.calories = food.calories != null ? String(food.calories) : ''
  }
}

function addFoodFromSaved(food) {
  const it = emptyItem()
  applyFoodToItem(it, food)
  form.items.push(it)
  foodsPickerOpen.value = false
}

function fillGroupFromSavedModal(food) {
  groupsPickerOpen.value = false
  fillFromSavedGroup(food)
}

function onQuickAddGroup(food) {
  groupsPickerOpen.value = false
  emit('quickAddGroup', food)
}

function itemTotal(it) {
  if (it.mode === 'amount') {
    return resolveKcal(it.amount, it.perKcal, it.quantity || it.amount)
  }
  return Number(it.calories) || 0
}

const groupTotal = computed(() => form.items.reduce((sum, it) => sum + itemTotal(it), 0))

function refText(it) {
  if (it.amount && it.perKcal) {
    return `${it.amount} ${t(`units.${it.unit}`)} = ${it.perKcal} kcal`
  }
  return t('form.perKcal')
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
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
const compactInputClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <form id="group-form" class="space-y-3" @submit.prevent="submit">
      <div v-if="!isLibrary && !group">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {{ t('foods.heading') }}
        </p>
        <SavedFoodsPicker
          :items="savedGroups"
          :total="allGroups.length"
          @quickAdd="onQuickAddGroup"
          @fill="fillFromSavedGroup"
          @seeAll="groupsPickerOpen = true"
        />
      </div>

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
        <label class="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('group.items') }}
        </label>

        <div class="divide-y divide-slate-200 dark:divide-slate-800">
          <div
            v-for="it in form.items"
            :key="it.id"
            class="py-2.5 first:pt-0"
          >
            <div class="flex items-center gap-1.5">
              <input
                v-model="it.name"
                type="text"
                :placeholder="t('entry.namePlaceholder')"
                class="min-w-0 flex-1"
                :class="compactInputClass"
              />
              <input
                v-if="it.mode === 'kcal'"
                v-model="it.calories"
                type="number"
                inputmode="numeric"
                min="1"
                step="1"
                placeholder="kcal"
                class="w-24 shrink-0 text-right"
                :class="compactInputClass"
              />
              <div class="flex shrink-0 overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  class="px-1.5 py-1.5 text-[11px] leading-5 font-semibold transition-colors"
                  :class="it.mode === 'kcal' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-300'"
                  @click="it.mode = 'kcal'"
                >
                  kcal
                </button>
                <button
                  type="button"
                  class="px-1.5 py-1.5 text-[11px] leading-5 font-semibold transition-colors"
                  :class="it.mode === 'amount' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-300'"
                  @click="it.mode = 'amount'"
                >
                  {{ t('form.modeAmount') }}
                </button>
              </div>
              <button
                type="button"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                aria-label="Remove item"
                @click="removeItem(it.id)"
              >
                <Icon name="close" class="h-4 w-4" />
              </button>
            </div>

            <div v-if="it.mode === 'amount'" class="mt-1.5 rounded-md bg-slate-50 p-2 dark:bg-slate-800/50">
              <div class="grid grid-cols-3 gap-1.5">
                <select v-model="it.unit" :class="compactInputClass">
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
                  :class="compactInputClass"
                />
                <input
                  v-model="it.perKcal"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  step="1"
                  placeholder="kcal"
                  :class="compactInputClass"
                />
              </div>
              <p class="mt-1 text-[11px] text-slate-400">{{ refText(it) }}</p>
              <div v-if="!isLibrary" class="mt-1.5 flex items-center gap-2">
                <input
                  v-model="it.quantity"
                  type="number"
                  inputmode="decimal"
                  min="0.1"
                  step="any"
                  :placeholder="t('form.quantity')"
                  class="min-w-0 flex-1"
                  :class="compactInputClass"
                />
                <span class="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {{ itemTotal(it) }} kcal
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-2 flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {{ t('form.total') }}: {{ formatKcal(groupTotal, locale) }} kcal
          </span>
          <div class="flex items-center gap-1.5">
            <button
              v-if="allFoods.length"
              type="button"
              class="flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-slate-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              @click="foodsPickerOpen = true"
            >
              <Icon name="star" class="h-3.5 w-3.5" />
              {{ t('foods.addFromSaved') }}
            </button>
            <button
              type="button"
              class="flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
              @click="addItem"
            >
              <Icon name="plus" class="h-3.5 w-3.5" />
              {{ t('group.addItem') }}
            </button>
          </div>
        </div>
        <p v-if="errors.items" class="mt-1 text-xs text-rose-500">{{ errors.items }}</p>
      </div>
    </form>

    <template #footer>
      <label
        v-if="!isLibrary"
        class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300"
      >
        <input
          v-model="saveToFoods"
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
        />
        <span>{{ t('form.saveToFoods') }}</span>
      </label>
      <div class="flex gap-2 pt-2">
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
          form="group-form"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </template>
  </BaseModal>

  <SavedFoodsModal
    :open="groupsPickerOpen"
    :title="t('foods.savedGroups')"
    :items="allGroups"
    @close="groupsPickerOpen = false"
    @select="fillGroupFromSavedModal"
    @quickAdd="onQuickAddGroup"
  />

  <SavedFoodsModal
    :open="foodsPickerOpen"
    :title="t('foods.heading')"
    :items="allFoods"
    fill-only
    @close="foodsPickerOpen = false"
    @select="addFoodFromSaved"
  />
</template>
