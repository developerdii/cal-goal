<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import { formatKcal } from '@/utils/format'

const props = defineProps({
  entry: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete'])

const { t, locale } = useI18n()

const isGroup = computed(() => props.entry.type === 'group')
const groupTotal = computed(() =>
  (props.entry.items || []).reduce((s, it) => s + (Number(it.calories) || 0), 0),
)

function amountText(it) {
  return it.unit ? `${it.quantity} ${t(`units.${it.unit}`)} · ` : ''
}
</script>

<template>
  <div
    class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <Icon v-if="isGroup" name="folder" class="h-4 w-4 shrink-0 text-slate-400" />
          <p class="truncate text-sm font-medium">{{ entry.name }}</p>
        </div>

        <ul v-if="isGroup" class="mt-1.5 space-y-1">
          <li
            v-for="it in entry.items"
            :key="it.id"
            class="flex items-center justify-between gap-2 text-xs text-slate-400"
          >
            <span class="truncate">{{ it.name }}</span>
            <span class="shrink-0">{{ amountText(it) }}{{ formatKcal(it.calories, locale) }} kcal</span>
          </li>
        </ul>
        <p v-else class="text-xs text-slate-400">
          {{ amountText(entry) }}{{ formatKcal(entry.calories, locale) }} kcal
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <span
          v-if="isGroup"
          class="mr-1 text-sm font-semibold text-slate-600 dark:text-slate-300"
        >
          {{ formatKcal(groupTotal, locale) }} kcal
        </span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Edit"
          @click="emit('edit')"
        >
          <Icon name="pencil" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
          aria-label="Delete"
          @click="emit('delete')"
        >
          <Icon name="trash" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

