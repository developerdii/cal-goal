<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useDiaryStore } from '@/stores/diaryStore'
import { parseDayImport } from '@/utils/dataTransfer'

const props = defineProps({
  open: { type: Boolean, default: false },
  dateKey: { type: String, required: true },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const diary = useDiaryStore()

const text = ref('')
const errorMessage = ref('')
const success = ref(null) // { entryCount }

const ERROR_KEYS = {
  empty: 'data.errors.empty',
  invalidJson: 'data.errors.invalidJson',
  invalidFormat: 'data.errors.invalidFormat',
  noEntries: 'data.errors.noEntries',
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    text.value = ''
    errorMessage.value = ''
    success.value = null
  },
)

const entryCountText = computed(() => {
  const n = success.value?.entryCount ?? 0
  return n === 1 ? t('data.entryCountOne', { count: n }) : t('data.entryCount', { count: n })
})

function doImport() {
  errorMessage.value = ''
  success.value = null

  let entries
  try {
    entries = parseDayImport(text.value)
  } catch (e) {
    errorMessage.value = t(ERROR_KEYS[e.code] || 'data.errors.invalidJson')
    return
  }

  diary.setEntries(props.dateKey, entries)
  success.value = { entryCount: entries.length }
  text.value = ''
}
</script>

<template>
  <BaseModal :open="open" :title="t('data.importTitle')" @close="emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('data.importHint') }}</p>

      <textarea
        v-model="text"
        :placeholder="t('data.importPlaceholder')"
        class="h-44 w-full resize-none rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      ></textarea>

      <p v-if="errorMessage" class="text-xs text-rose-600 dark:text-rose-400">
        {{ errorMessage }}
      </p>

      <p v-if="success" class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        ✓ {{ t('data.imported') }} {{ entryCountText }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          @click="doImport"
        >
          {{ t('data.importAction') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
