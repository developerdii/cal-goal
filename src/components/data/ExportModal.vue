<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useDiaryStore } from '@/stores/diaryStore'
import { buildExportDoc, countEntries } from '@/utils/dataTransfer'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const diary = useDiaryStore()

const copied = ref(false)
let copiedTimer = null

const hasData = computed(() => Object.keys(diary.days).length > 0)
const exportDoc = computed(() => buildExportDoc(diary.days))

const exportText = computed(() => JSON.stringify(exportDoc.value, null, 2))
const dayCount = computed(() => Object.keys(exportDoc.value.days).length)
const entryCount = computed(() => countEntries(exportDoc.value.days))

const dayCountText = computed(() =>
  dayCount.value === 1
    ? t('data.dayCountOne', { count: dayCount.value })
    : t('data.dayCount', { count: dayCount.value }),
)
const entryCountText = computed(() =>
  entryCount.value === 1
    ? t('data.entryCountOne', { count: entryCount.value })
    : t('data.entryCount', { count: entryCount.value }),
)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    copied.value = false
  },
)

async function copy() {
  const text = exportText.value
  let ok = false
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      ok = false
    }
  }
  if (!ok) {
    const el = document.getElementById('export-json')
    el?.focus()
    el?.select()
    return
  }
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <BaseModal :open="open" :title="t('data.exportTitle')" @close="emit('close')">
    <p v-if="!hasData" class="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('data.noData') }}
    </p>

    <div v-else class="space-y-4">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ dayCountText }} · {{ entryCountText }}
      </p>

      <textarea
        id="export-json"
        readonly
        :value="exportText"
        class="h-44 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        @focus="$event.target.select()"
      ></textarea>
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
          :disabled="dayCount === 0"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          @click="copy"
        >
          {{ copied ? t('data.copied') : t('data.copy') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
