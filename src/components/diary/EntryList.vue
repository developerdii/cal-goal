<script setup>
import { useI18n } from 'vue-i18n'
import EntryItem from '@/components/diary/EntryItem.vue'

defineProps({
  entries: { type: Array, default: () => [] },
})

const emit = defineEmits(['edit', 'delete'])

const { t } = useI18n()
</script>

<template>
  <div>
    <ul v-if="entries.length" class="space-y-2">
      <li v-for="entry in entries" :key="entry.id">
        <EntryItem
          :entry="entry"
          @edit="emit('edit', entry)"
          @delete="emit('delete', entry)"
        />
      </li>
    </ul>
    <div
      v-else
      class="rounded-2xl border border-dashed border-slate-300 py-10 text-center dark:border-slate-700"
    >
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
        {{ t('home.emptyTitle') }}
      </p>
      <p class="mt-1 text-xs text-slate-400">{{ t('home.emptyHint') }}</p>
    </div>
  </div>
</template>
