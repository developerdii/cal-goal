<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import Icon from '@/components/ui/Icon.vue'
import { useFoodsStore } from '@/stores/foodsStore'
import { formatKcal } from '@/utils/format'

const props = defineProps({ open: { type: Boolean, default: false } })

const emit = defineEmits(['close', 'select', 'quickAddFood', 'quickAddGroup'])

const { t, locale } = useI18n()
const foodsStore = useFoodsStore()

// quantity input per saved measured food (defaults to the reference amount)
const quantities = reactive({})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    for (const key of Object.keys(quantities)) delete quantities[key]
    for (const f of foodsStore.foods) {
      if (f.type === 'food' && f.unit) quantities[f.id] = String(f.amount ?? '')
    }
  },
)

function foodSummary(food) {
  if (food.unit) {
    return `${food.amount} ${t(`units.${food.unit}`)} · ${formatKcal(food.perKcal, locale)} kcal`
  }
  return `${formatKcal(food.calories, locale)} kcal`
}

function groupSummary(food) {
  const total = (food.items || []).reduce(
    (s, it) => s + (it.unit ? Number(it.perKcal) : Number(it.calories)),
    0,
  )
  return `${formatKcal(total, locale)} kcal · ${(food.items || []).length} ${t('foods.itemCount')}`
}

function addFood(food) {
  if (food.unit) {
    emit('quickAddFood', food, Number(quantities[food.id]) || 0)
  } else {
    emit('quickAddFood', food, null)
  }
}

const optionClass =
  'flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30'
</script>

<template>
  <BaseModal :open="open" :title="t('home.addEntryTitle')" @close="emit('close')">
    <div class="space-y-3">
      <button type="button" :class="optionClass" @click="emit('select', 'food')">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
        >
          <Icon name="plus" class="h-5 w-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold">{{ t('home.addFood') }}</span>
          <span class="block text-xs text-slate-400">{{ t('home.foodOptionHint') }}</span>
        </span>
      </button>

      <button type="button" :class="optionClass" @click="emit('select', 'group')">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300"
        >
          <Icon name="folder" class="h-5 w-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold">{{ t('home.addGroup') }}</span>
          <span class="block text-xs text-slate-400">{{ t('home.groupOptionHint') }}</span>
        </span>
      </button>

      <template v-if="foodsStore.foods.length">
        <div class="pt-1">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {{ t('foods.heading') }}
          </p>
          <div class="space-y-2">
            <div
              v-for="food in foodsStore.foods"
              :key="food.id"
              class="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800"
            >
              <Icon
                :name="food.type === 'group' ? 'folder' : 'plus'"
                class="h-4 w-4 shrink-0 text-slate-400"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ food.name }}</p>
                <p class="truncate text-xs text-slate-400">
                  {{ food.type === 'group' ? groupSummary(food) : foodSummary(food) }}
                </p>
              </div>

              <input
                v-if="food.type === 'food' && food.unit"
                v-model="quantities[food.id]"
                type="number"
                inputmode="decimal"
                min="0.1"
                step="any"
                class="w-20 shrink-0 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />

              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
                aria-label="Add"
                @click="food.type === 'group' ? emit('quickAddGroup', food) : addFood(food)"
              >
                <Icon name="plus" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </BaseModal>
</template>

