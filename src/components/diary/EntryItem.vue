<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import { formatKcal } from '@/utils/format'
import { unitLabelKey } from '@/utils/units'

const props = defineProps({
  entry: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete'])

const { t, locale } = useI18n()

const isGroup = computed(() => props.entry.type === 'group')
const expanded = ref(false)

const total = computed(() =>
  isGroup.value
    ? (props.entry.items || []).reduce((s, it) => s + (Number(it.calories) || 0), 0)
    : Number(props.entry.calories) || 0,
)

const itemCountText = computed(() => {
  const n = (props.entry.items || []).length
  return n === 1 ? `1 ${t('group.itemCountOne')}` : `${n} ${t('group.itemCount')}`
})

function servingText(it) {
  return it.unit ? `${it.quantity} ${t(unitLabelKey(it.unit, it.quantity))}` : ''
}

function amountText(it) {
  const s = servingText(it)
  return s ? `${s} · ` : ''
}

function toggleExpand() {
  if (isGroup.value) expanded.value = !expanded.value
}
</script>

<template>
  <div
    class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex items-center justify-between gap-2">
      <div
        class="min-w-0 flex-1"
        :class="isGroup ? 'cursor-pointer' : ''"
        @click="toggleExpand"
      >
        <div class="flex items-center gap-1.5">
          <Icon v-if="isGroup" name="folder" class="h-4 w-4 shrink-0 text-slate-400" />
          <p class="truncate text-sm font-medium">{{ entry.name }}</p>
          <Icon
            v-if="isGroup"
            name="chevronDown"
            class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
            :class="expanded ? 'rotate-180' : ''"
          />
        </div>
        <p v-if="isGroup" class="mt-0.5 text-xs text-slate-400">{{ itemCountText }}</p>
        <p v-else-if="servingText(entry)" class="text-xs text-slate-400">
          {{ servingText(entry) }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <span class="mr-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {{ formatKcal(total, locale) }}
        </span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          :aria-label="t('common.edit')"
          @click="emit('edit')"
        >
          <Icon name="pencil" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
          :aria-label="t('common.delete')"
          @click="emit('delete')"
        >
          <Icon name="trash" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <ul
      v-if="isGroup && expanded"
      class="mt-2 space-y-1 border-t border-slate-100 pt-2 dark:border-slate-800"
    >
      <li
        v-for="it in entry.items"
        :key="it.id"
        class="flex items-center justify-between gap-2 text-xs text-slate-400"
      >
        <span class="truncate">{{ it.name }}</span>
        <span class="shrink-0">{{ amountText(it) }}{{ formatKcal(it.calories, locale) }}</span>
      </li>
    </ul>
  </div>
</template>

