<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import { formatKcal } from '@/utils/format'

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: null },
  fillOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['quickAdd', 'fill', 'seeAll'])

const { t, locale } = useI18n()

const hasMore = computed(() => {
  const total = props.total ?? props.items.length
  return total > props.items.length
})

function summary(item) {
  if (item.type === 'group') {
    const total = (item.items || []).reduce(
      (s, it) => s + (it.unit ? Number(it.perKcal) : Number(it.calories)),
      0,
    )
    return `${formatKcal(total, locale)} kcal · ${(item.items || []).length} ${t('foods.itemCount')}`
  }
  if (item.unit) {
    return `${item.amount} ${t(`units.${item.unit}`)} · ${formatKcal(item.perKcal, locale)} kcal`
  }
  return `${formatKcal(item.calories, locale)} kcal`
}
</script>

<template>
  <div class="space-y-1.5">
    <div
      v-if="!items.length"
      class="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center dark:border-slate-700"
    >
      <p class="text-xs text-slate-400">{{ t('foods.emptyTitle') }}</p>
    </div>

    <div
      v-for="item in items"
      :key="item.id"
      class="flex items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
    >
      <Icon
        :name="item.type === 'group' ? 'folder' : 'star'"
        class="h-4 w-4 shrink-0 text-slate-400"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">{{ item.name }}</p>
        <p class="truncate text-xs text-slate-400">{{ summary(item) }}</p>
      </div>
      <button
        v-if="!fillOnly"
        type="button"
        :title="t('foods.quickAdd')"
        :aria-label="t('foods.quickAdd')"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
        @click="emit('quickAdd', item)"
      >
        <Icon name="plus" class="h-4 w-4" />
      </button>
      <button
        type="button"
        :title="t('common.edit')"
        :aria-label="t('common.edit')"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        @click="emit('fill', item)"
      >
        <Icon name="pencil" class="h-4 w-4" />
      </button>
    </div>

    <button
      v-if="hasMore"
      type="button"
      class="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-slate-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      @click="emit('seeAll')"
    >
      <Icon name="chevronRight" class="h-3.5 w-3.5" />
      {{ t('foods.seeAll') }}
    </button>
  </div>
</template>
