<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import Icon from '@/components/ui/Icon.vue'
import { formatKcal } from '@/utils/format'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  fillOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'select', 'quickAdd'])

const { t, locale } = useI18n()
const query = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) query.value = ''
  },
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.items
  return props.items.filter((it) => String(it.name || '').toLowerCase().includes(q))
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
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <div class="space-y-3">
      <input
        v-model="query"
        type="search"
        :placeholder="t('foods.searchPlaceholder')"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
      />

      <div
        v-if="!items.length"
        class="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center dark:border-slate-700"
      >
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ t('foods.emptyTitle') }}</p>
      </div>

      <div
        v-else-if="!filtered.length"
        class="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center dark:border-slate-700"
      >
        <p class="text-sm text-slate-400">{{ t('foods.noResults') }}</p>
      </div>

      <div v-else class="space-y-1.5">
        <div
          v-for="item in filtered"
          :key="item.id"
          class="flex items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
          :class="
            fillOnly
              ? 'cursor-pointer transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30'
              : ''
          "
          @click="fillOnly && emit('select', item)"
        >
          <Icon
            :name="item.type === 'group' ? 'folder' : 'star'"
            class="h-4 w-4 shrink-0 text-slate-400"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ item.name }}</p>
            <p class="truncate text-xs text-slate-400">{{ summary(item) }}</p>
          </div>
          <template v-if="!fillOnly">
            <button
              type="button"
              :title="t('foods.quickAdd')"
              :aria-label="t('foods.quickAdd')"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
              @click.stop="emit('quickAdd', item)"
            >
              <Icon name="plus" class="h-4 w-4" />
            </button>
            <button
              type="button"
              :title="t('common.edit')"
              :aria-label="t('common.edit')"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              @click.stop="emit('select', item)"
            >
              <Icon name="pencil" class="h-4 w-4" />
            </button>
          </template>
          <Icon v-else name="plus" class="h-4 w-4 shrink-0 text-emerald-500" />
        </div>
      </div>
    </div>
  </BaseModal>
</template>
