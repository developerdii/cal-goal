<script setup>
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import { formatKcal } from '@/utils/format'

const props = defineProps({
  items: { type: Array, default: () => [] },
  fillOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['quickAdd', 'fill'])

const { t, locale } = useI18n()

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
  </div>
</template>
