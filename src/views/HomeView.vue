<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiaryStore } from '@/stores/diaryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useFoodsStore } from '@/stores/foodsStore'
import { toDateKey, parseDateKey, addDays, getWeekDays } from '@/utils/date'
import { formatDayLong, formatKcal } from '@/utils/format'
import { createId } from '@/utils/id'
import WeekStrip from '@/components/diary/WeekStrip.vue'
import DaySummary from '@/components/diary/DaySummary.vue'
import EntryList from '@/components/diary/EntryList.vue'
import EntryFormModal from '@/components/diary/EntryFormModal.vue'
import GroupFormModal from '@/components/diary/GroupFormModal.vue'
import AddEntryModal from '@/components/diary/AddEntryModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Icon from '@/components/ui/Icon.vue'

const diary = useDiaryStore()
const settings = useSettingsStore()
const foods = useFoodsStore()
const { t, locale } = useI18n()

const todayKey = toDateKey(new Date())
const selectedKey = ref(todayKey)

const chooserOpen = ref(false)
const foodOpen = ref(false)
const groupOpen = ref(false)
const editingEntry = ref(null)
const pendingDelete = ref(null)

const selectedDate = computed(() => parseDateKey(selectedKey.value))
const weekDays = computed(() => getWeekDays(selectedDate.value))
const entries = computed(() => diary.getEntries(selectedKey.value))
const consumed = computed(() => diary.totalForDay(selectedKey.value))
const goal = computed(() => settings.dailyTarget)
const isToday = computed(() => selectedKey.value === todayKey)

const dayLabel = computed(() => formatDayLong(selectedDate.value, locale.value))

function selectDay(date) {
  selectedKey.value = toDateKey(date)
}
function previousDay() {
  selectedKey.value = toDateKey(addDays(selectedDate.value, -1))
}
function nextDay() {
  selectedKey.value = toDateKey(addDays(selectedDate.value, 1))
}

function openChooser() {
  chooserOpen.value = true
}
function onChooserSelect(type) {
  chooserOpen.value = false
  if (type === 'food') openFood(null)
  else openGroup(null)
}

function openFood(entry) {
  editingEntry.value = entry
  foodOpen.value = true
}
function openGroup(group) {
  editingEntry.value = group
  groupOpen.value = true
}
function openEdit(entry) {
  if (entry.type === 'group') openGroup(entry)
  else openFood(entry)
}

function toFoodDefinition(payload) {
  if (payload.unit) {
    return { type: 'food', name: payload.name, unit: payload.unit, amount: payload.amount, perKcal: payload.perKcal }
  }
  return { type: 'food', name: payload.name, calories: payload.calories }
}

function toGroupDefinition(payload) {
  return {
    type: 'group',
    name: payload.name,
    items: payload.items.map((it) =>
      it.unit
        ? { name: it.name, unit: it.unit, amount: it.amount, perKcal: it.perKcal }
        : { name: it.name, calories: it.calories },
    ),
  }
}

function onSaveFood(payload) {
  const { saveToFoods, ...diaryPayload } = payload
  if (editingEntry.value) diary.updateEntry(selectedKey.value, editingEntry.value.id, diaryPayload)
  else diary.addEntry(selectedKey.value, diaryPayload)
  if (saveToFoods) foods.upsert(toFoodDefinition(payload))
  foodOpen.value = false
}
function onSaveGroup(payload) {
  const { saveToFoods, ...diaryPayload } = payload
  if (editingEntry.value) diary.updateEntry(selectedKey.value, editingEntry.value.id, diaryPayload)
  else diary.addGroup(selectedKey.value, diaryPayload)
  if (saveToFoods) foods.upsert(toGroupDefinition(payload))
  groupOpen.value = false
}

function onQuickAddFood(food) {
  const measured = !!food.unit
  const quantity = measured ? food.amount : null
  diary.addEntry(selectedKey.value, {
    name: food.name,
    calories: measured ? Number(food.perKcal) : Number(food.calories),
    quantity,
    unit: food.unit ?? null,
    amount: measured ? food.amount : null,
    perKcal: measured ? food.perKcal : null,
    foodId: food.id,
  })
  foodOpen.value = false
}

function onQuickAddGroup(food) {
  diary.addGroup(selectedKey.value, {
    name: food.name,
    items: (food.items || []).map((it) => {
      const measured = !!it.unit
      return {
        id: createId(),
        name: it.name,
        calories: measured ? Number(it.perKcal) : Number(it.calories),
        quantity: measured ? it.amount : null,
        unit: it.unit ?? null,
        amount: measured ? it.amount : null,
        perKcal: measured ? it.perKcal : null,
      }
    }),
    foodId: food.id,
  })
  groupOpen.value = false
}

function onDeleteFromModal() {
  if (editingEntry.value) diary.removeEntry(selectedKey.value, editingEntry.value.id)
  foodOpen.value = false
  groupOpen.value = false
}

function askDelete(entry) {
  pendingDelete.value = entry
}
function confirmDelete() {
  if (pendingDelete.value) diary.removeEntry(selectedKey.value, pendingDelete.value.id)
  pendingDelete.value = null
}

const arrowClass =
  'flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
</script>

<template>
  <div class="space-y-4">
    <section>
      <div class="flex items-center justify-between gap-2">
        <button type="button" :class="arrowClass" aria-label="Previous day" @click="previousDay">
          <Icon name="chevronLeft" class="h-5 w-5" />
        </button>
        <div class="min-w-0 text-center">
          <h2 class="truncate text-lg font-bold">{{ dayLabel }}</h2>
          <p v-if="isToday" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {{ t('common.today') }}
          </p>
          <p v-else class="text-xs text-transparent">·</p>
        </div>
        <button type="button" :class="arrowClass" aria-label="Next day" @click="nextDay">
          <Icon name="chevronRight" class="h-5 w-5" />
        </button>
      </div>

      <WeekStrip
        :days="weekDays"
        :selected-key="selectedKey"
        :today-key="todayKey"
        @select="selectDay"
      />
    </section>

    <DaySummary :consumed="consumed" :goal="goal" />

    <section>
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {{ t('home.entriesTitle') }}
        </h3>
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ formatKcal(consumed, locale) }} kcal
        </span>
      </div>
      <EntryList :entries="entries" @edit="openEdit" @delete="askDelete" />
    </section>

    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
      @click="openChooser"
    >
      <Icon name="plus" class="h-5 w-5" />
      {{ t('home.addEntry') }}
    </button>

    <AddEntryModal
      :open="chooserOpen"
      @close="chooserOpen = false"
      @select="onChooserSelect"
    />

    <EntryFormModal
      :open="foodOpen"
      :entry="editingEntry"
      @close="foodOpen = false"
      @save="onSaveFood"
      @delete="onDeleteFromModal"
      @quick-add="onQuickAddFood"
    />

    <GroupFormModal
      :open="groupOpen"
      :group="editingEntry"
      @close="groupOpen = false"
      @save="onSaveGroup"
      @delete="onDeleteFromModal"
      @quick-add-group="onQuickAddGroup"
    />

    <ConfirmDialog
      :open="!!pendingDelete"
      :title="t('entry.deleteTitle')"
      :message="t('entry.deleteConfirm')"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>

