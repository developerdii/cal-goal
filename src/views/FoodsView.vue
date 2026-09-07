<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFoodsStore } from '@/stores/foodsStore'
import { formatKcal } from '@/utils/format'
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
    return `${food.amount} ${t(`units.${food.unit}`)} · ${formatKcal(food.perKcal, locale)} kcal`
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

    <ul v-if="foods.foods.length" class="space-y-2">
      <li
        v-for="food in foods.foods"
        :key="food.id"
        class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <Icon
              :name="food.type === 'group' ? 'folder' : 'star'"
              class="h-4 w-4 shrink-0 text-slate-400"
            />
            <p class="truncate text-sm font-medium">{{ food.name }}</p>
          </div>
          <p class="text-xs text-slate-400">{{ summary(food) }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Edit"
            @click="openEdit(food)"
          >
            <Icon name="pencil" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
            aria-label="Delete"
            @click="askDelete(food)"
          >
            <Icon name="trash" class="h-4 w-4" />
          </button>
        </div>
      </li>
    </ul>

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
  </div>
</template>
