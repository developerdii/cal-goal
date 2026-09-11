<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFoodsStore } from '@/stores/foodsStore'
import { formatKcal } from '@/utils/format'
import { unitLabelKey } from '@/utils/units'
import EntryFormModal from '@/components/diary/EntryFormModal.vue'
import GroupFormModal from '@/components/diary/GroupFormModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Icon from '@/components/ui/Icon.vue'

const foods = useFoodsStore()
const { t, locale } = useI18n()

const foodOpen = ref(false)
const groupOpen = ref(false)
const editingFood = ref(null)
const pendingDelete = ref(null)

// Search + pagination for large libraries.
const query = ref('')
const page = ref(1)
const PAGE_SIZE = 10

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const sortedFoods = computed(() => foods.sorted())
const filteredFoods = computed(() => {
  const q = normalize(query.value.trim())
  if (!q) return sortedFoods.value
  return sortedFoods.value.filter((f) => normalize(f.name).includes(q))
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredFoods.value.length / PAGE_SIZE)))
const pagedFoods = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredFoods.value.slice(start, start + PAGE_SIZE)
})

watch(query, () => {
  page.value = 1
})
watch(totalPages, (n) => {
  if (page.value > n) page.value = n
})

const toast = ref('')
let toastTimer = null

function showToast(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 1800)
}

function onToggleFavorite(food) {
  const nowFavorite = foods.toggleFavorite(food.id)
  showToast(nowFavorite ? t('foods.favorited') : t('foods.unfavorited'))
}

function openAddFood() {
  editingFood.value = null
  foodOpen.value = true
}
function openAddGroup() {
  editingFood.value = null
  groupOpen.value = true
}
function openEdit(food) {
  editingFood.value = food
  if (food.type === 'group') groupOpen.value = true
  else foodOpen.value = true
}

function onSaveFood(payload) {
  if (payload.unit) {
    foods.upsert({
      id: editingFood.value?.id,
      type: 'food',
      name: payload.name,
      unit: payload.unit,
      amount: payload.amount,
      perKcal: payload.perKcal,
    })
  } else {
    foods.upsert({ id: editingFood.value?.id, type: 'food', name: payload.name, calories: payload.calories })
  }
  foodOpen.value = false
}

function onSaveGroup(payload) {
  foods.upsert({
    id: editingFood.value?.id,
    type: 'group',
    name: payload.name,
    items: payload.items.map((it) =>
      it.unit
        ? { name: it.name, unit: it.unit, amount: it.amount, perKcal: it.perKcal }
        : { name: it.name, calories: it.calories },
    ),
  })
  groupOpen.value = false
}

function onDeleteFromModal() {
  if (editingFood.value) foods.remove(editingFood.value.id)
  foodOpen.value = false
  groupOpen.value = false
}

function askDelete(food) {
  pendingDelete.value = food
}
function confirmDelete() {
  if (pendingDelete.value) foods.remove(pendingDelete.value.id)
  pendingDelete.value = null
}

function summary(food) {
  if (food.type === 'group') {
    const total = (food.items || []).reduce(
      (s, it) => s + (it.unit ? Number(it.perKcal) : Number(it.calories)),
      0,
    )
    return `${formatKcal(total, locale)} kcal · ${(food.items || []).length} ${t('foods.itemCount')}`
  }
  if (food.unit) {
    return `${food.amount} ${t(unitLabelKey(food.unit, food.amount))} · ${formatKcal(food.perKcal, locale)} kcal`
  }
  return `${formatKcal(food.calories, locale)} kcal`
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-lg font-bold">{{ t('nav.foods') }}</h2>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          @click="openAddFood"
        >
          <Icon name="plus" class="h-4 w-4" />
          {{ t('foods.addFood') }}
        </button>
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
          @click="openAddGroup"
        >
          <Icon name="folder" class="h-4 w-4" />
          {{ t('foods.addGroup') }}
        </button>
      </div>
    </div>

    <div v-if="foods.foods.length" class="space-y-3">
      <input
        v-model="query"
        type="search"
        :placeholder="t('foods.searchPlaceholder')"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
      />

      <ul v-if="filteredFoods.length" class="space-y-2">
        <li
          v-for="food in pagedFoods"
          :key="food.id"
          class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <Icon
                v-if="food.type === 'group'"
                name="folder"
                class="h-4 w-4 shrink-0 text-slate-400"
              />
              <p class="truncate text-sm font-medium">{{ food.name }}</p>
            </div>
            <p class="text-xs text-slate-400">{{ summary(food) }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              :class="food.favorite
                ? 'text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200'"
              :title="food.favorite ? t('foods.removeFavorite') : t('foods.addFavorite')"
              :aria-label="food.favorite ? t('foods.removeFavorite') : t('foods.addFavorite')"
              @click="onToggleFavorite(food)"
            >
              <Icon
                :name="food.favorite ? 'starSolid' : 'star'"
                :solid="food.favorite"
                class="h-4 w-4"
              />
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              :aria-label="t('common.edit')"
              @click="openEdit(food)"
            >
              <Icon name="pencil" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
              :aria-label="t('common.delete')"
              @click="askDelete(food)"
            >
              <Icon name="trash" class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ul>

      <div
        v-else
        class="rounded-2xl border border-dashed border-slate-300 py-10 text-center dark:border-slate-700"
      >
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ t('foods.noResults') }}</p>
      </div>

      <div
        v-if="filteredFoods.length && totalPages > 1"
        class="flex items-center justify-center gap-3"
      >
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="page <= 1"
          :aria-label="t('common.previous')"
          @click="page--"
        >
          <Icon name="chevronLeft" class="h-4 w-4" />
        </button>
        <span class="w-14 text-center text-sm text-slate-500 dark:text-slate-400">
          {{ page }} / {{ totalPages }}
        </span>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="page >= totalPages"
          :aria-label="t('common.next')"
          @click="page++"
        >
          <Icon name="chevronRight" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700"
    >
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ t('foods.emptyTitle') }}</p>
      <p class="mt-1 text-xs text-slate-400">{{ t('foods.emptyHint') }}</p>
    </div>

    <EntryFormModal
      :open="foodOpen"
      context="library"
      :food="editingFood"
      @close="foodOpen = false"
      @save="onSaveFood"
      @delete="onDeleteFromModal"
    />

    <GroupFormModal
      :open="groupOpen"
      context="library"
      :food="editingFood"
      @close="groupOpen = false"
      @save="onSaveGroup"
      @delete="onDeleteFromModal"
    />

    <ConfirmDialog
      :open="!!pendingDelete"
      :title="t('foods.deleteTitle')"
      :message="t('foods.deleteConfirm')"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />

    <Transition name="toast">
      <div
        v-if="toast"
        class="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4"
      >
        <div
          class="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
        >
          {{ toast }}
        </div>
      </div>
    </Transition>
  </div>
</template>
