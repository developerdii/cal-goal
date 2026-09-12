<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import Icon from '@/components/ui/Icon.vue'
import { DEFAULT_UNIT, defaultServingAmount, unitLabelKey } from '@/utils/units'
import { resolveKcal, resolveQuantity, resolveItemKcal } from '@/utils/nutrition'
import { formatKcal } from '@/utils/format'
import { createId } from '@/utils/id'
import { useFoodsStore } from '@/stores/foodsStore'
import ItemEditor from '@/components/diary/ItemEditor.vue'
import SavedItemsDropdown from '@/components/diary/SavedItemsDropdown.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  group: { type: Object, default: null },
  food: { type: Object, default: null },
  context: { type: String, default: 'log' },
})

const emit = defineEmits(['close', 'save', 'delete', 'quick-add-group'])

const { t, locale } = useI18n()

const isLibrary = computed(() => props.context === 'library')
const foodsStore = useFoodsStore()
const allFoods = computed(() => foodsStore.all('food'))
const allGroups = computed(() => foodsStore.all('group'))
const nameInput = ref(null)

const form = reactive({ name: '', items: [] })
const saveToFoods = ref(false)
const errors = reactive({ name: '', items: '' })
const openId = ref(null)

function emptyItem() {
  return {
    id: createId(),
    name: '',
    mode: 'amount',
    calories: '',
    unit: DEFAULT_UNIT,
    amount: String(defaultServingAmount(DEFAULT_UNIT)),
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
    openId.value = form.items[0]?.id ?? null
    saveToFoods.value = false
    errors.name = ''
    errors.items = ''
  },
)

watch(
  () => form.name,
  () => {
    if (errors.name) errors.name = ''
  },
)

const eyebrow = computed(() => {
  if (isLibrary.value) return props.food ? t('foods.editGroupTitle') : t('foods.addGroupTitle')
  return props.group ? t('group.editTitle') : t('group.addTitle')
})

function addItem() {
  const it = emptyItem()
  form.items.push(it)
  openId.value = it.id
}

function toggleItem(id) {
  openId.value = openId.value === id ? null : id
}

function removeItem(id) {
  form.items = form.items.filter((it) => it.id !== id)
  if (openId.value === id) openId.value = null
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

function foodMeta(food) {
  if (food.unit) {
    return `${food.amount} ${t(unitLabelKey(food.unit, food.amount))} · ${formatKcal(food.perKcal, locale.value)} kcal`
  }
  return `${formatKcal(food.calories, locale.value)} kcal`
}

// Inserts a prepared item, filling the single still-empty placeholder row
// (which the modal opens with) instead of appending another row the user
// would then have to delete.
function insertItem(it) {
  if (form.items.length === 1 && !isFilled(form.items[0])) {
    form.items = [it]
  } else {
    form.items.push(it)
  }
  openId.value = it.id
}

function addFoodFromSaved(food) {
  const it = emptyItem()
  applyFoodToItem(it, food)
  insertItem(it)
}

function onCreateFood(query) {
  const it = emptyItem()
  it.name = query
  insertItem(it)
}

function groupMeta(food) {
  const items = food.items || []
  const total = items.reduce((sum, it) => sum + resolveItemKcal(it), 0)
  const n = items.length
  return `${n} ${n === 1 ? t('foods.itemCountOne') : t('foods.itemCount')} · ${formatKcal(total, locale.value)} kcal`
}

function fillFromSavedGroup(food) {
  form.name = food.name
  form.items = (food.items || []).map(fromSource)
  if (form.items.length === 0) form.items.push(emptyItem())
  openId.value = form.items[0]?.id ?? null
}

function onQuickAddGroup(food) {
  emit('quick-add-group', food)
}

function onCreateGroup(query) {
  form.name = query
  nameInput.value?.focus()
}

function itemTotal(it) {
  if (it.mode === 'amount') {
    return resolveKcal(it.amount, it.perKcal, resolveQuantity(it.amount, it.quantity, it.unit))
  }
  return Number(it.calories) || 0
}

const groupTotal = computed(() => form.items.reduce((sum, it) => sum + itemTotal(it), 0))
const hasUsableTotal = computed(() => groupTotal.value > 0)

function isFilled(it) {
  return (
    it.name.trim() !== '' ||
    String(it.calories).trim() !== '' ||
    String(it.perKcal).trim() !== ''
  )
}

const filledItems = computed(() => form.items.filter(isFilled))
const itemCountText = computed(() => {
  const n = filledItems.value.length
  return `${n} ${n === 1 ? t('foods.itemCountOne') : t('foods.itemCount')}`
})

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
  if (String(it.quantity).trim() !== '') {
    const q = Number(it.quantity)
    if (!Number.isFinite(q) || q <= 0) return false
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
  if (!form.name.trim()) {
    errors.name = t('group.validation.nameRequired')
    nameInput.value?.focus()
    return
  }
  if (!validate()) return

  const items = form.items.filter(isFilled).map((it) => {
    if (it.mode === 'amount') {
      const amount = Number(it.amount)
      const perKcal = Number(it.perKcal)
      const quantity = Number(resolveQuantity(it.amount, it.quantity, it.unit))
      return {
        id: it.id,
        name: it.name.trim(),
        calories: resolveKcal(amount, perKcal, quantity),
        unit: it.unit,
        amount,
        perKcal,
        quantity,
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
</script>

<template>
  <BaseModal :open="open" :eyebrow="eyebrow" @close="emit('close')">
    <template #title>
      <input
        ref="nameInput"
        v-model="form.name"
        type="text"
        :placeholder="t('group.namePlaceholder')"
        class="w-full border-b border-transparent bg-transparent pb-1.5 text-[22px] font-bold text-slate-900 outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 dark:text-slate-50 dark:hover:border-slate-700"
      />
      <p v-if="errors.name" class="mt-1 text-xs text-rose-500">{{ errors.name }}</p>
    </template>

    <template #actions>
      <SavedItemsDropdown
        v-if="!isLibrary && !group && allGroups.length"
        :label="t('foods.savedGroups')"
        :items="allGroups"
        :meta="groupMeta"
        :create-label="(q) => t('foods.createGroup', { query: q })"
        selectable
        placement="down"
        :full-width="false"
        @quick-add="onQuickAddGroup"
        @select="fillFromSavedGroup"
        @create="onCreateGroup"
      />
    </template>

    <div class="-mx-5 mb-3 flex items-baseline justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
      <span class="text-[13px] text-slate-500 dark:text-slate-400">{{ itemCountText }}</span>
      <span class="flex items-baseline gap-1.5">
        <span class="font-mono text-lg font-medium tabular-nums" :class="hasUsableTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'">
          {{ formatKcal(groupTotal, locale) }}
        </span>
        <span class="text-[13px] text-slate-500 dark:text-slate-400">{{ t('form.kcalTotal') }}</span>
      </span>
    </div>

    <form id="group-form" class="space-y-2" @submit.prevent="submit">
      <div class="space-y-2">
        <ItemEditor
          v-for="it in form.items"
          :key="it.id"
          collapsible
          :open="openId === it.id"
          :name-placeholder="t('entry.namePlaceholder')"
          v-model:name="it.name"
          v-model:mode="it.mode"
          v-model:calories="it.calories"
          v-model:unit="it.unit"
          v-model:amount="it.amount"
          v-model:per-kcal="it.perKcal"
          v-model:quantity="it.quantity"
          @toggle="toggleItem(it.id)"
          @remove="removeItem(it.id)"
        />
      </div>
      <p v-if="errors.items" class="mt-1 text-xs text-rose-500">{{ errors.items }}</p>
    </form>

    <div class="mt-3 grid grid-cols-2 gap-2">
      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
        @click="addItem"
      >
        <Icon name="plus" class="h-4 w-4" />
        {{ t('form.newFood') }}
      </button>
      <SavedItemsDropdown
        :items="allFoods"
        :meta="foodMeta"
        :create-label="(q) => t('foods.createFood', { query: q })"
        @quick-add="addFoodFromSaved"
        @create="onCreateFood"
      />
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <label v-if="!isLibrary" class="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input v-model="saveToFoods" type="checkbox" class="custom-checkbox" />
          <span>{{ t('form.saveToFoods') }}</span>
        </label>
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
</template>
