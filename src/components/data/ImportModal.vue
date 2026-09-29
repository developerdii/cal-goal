<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useDiaryStore } from '@/stores/diaryStore'
import { parseImportText, countEntries } from '@/utils/dataTransfer'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const diary = useDiaryStore()

const text = ref('')
const mode = ref('merge') // 'merge' | 'replace'
const errorMessage = ref('')
const success = ref(null) // { dayCount, entryCount }

const ERROR_KEYS = {
  empty: 'data.errors.empty',
  invalidJson: 'data.errors.invalidJson',
  invalidFormat: 'data.errors.invalidFormat',
  noDays: 'data.errors.noDays',
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    text.value = ''
    mode.value = 'merge'
    errorMessage.value = ''
    success.value = null
  },
)

const dayCountText = computed(() => {
  const n = success.value?.dayCount ?? 0
  return n === 1 ? t('data.dayCountOne', { count: n }) : t('data.dayCount', { count: n })
})
const entryCountText = computed(() => {
  const n = success.value?.entryCount ?? 0
  return n === 1 ? t('data.entryCountOne', { count: n }) : t('data.entryCount', { count: n })
})

function doImport() {
  errorMessage.value = ''
  success.value = null

  let days
  try {
    days = parseImportText(text.value)
  } catch (e) {
    errorMessage.value = t(ERROR_KEYS[e.code] || 'data.errors.invalidJson')
    return
  }

  diary.importDays(days, { replace: mode.value === 'replace' })
  success.value = { dayCount: Object.keys(days).length, entryCount: countEntries(days) }
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

      <div>
        <div class="flex overflow-hidden rounded-lg border border-slate-300 text-xs dark:border-slate-700">
          <button
            type="button"
            class="flex-1 px-2 py-2 font-medium transition-colors"
            :class="
              mode === 'merge'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-600 dark:text-slate-300'
            "
            @click="mode = 'merge'"
          >
            {{ t('data.modeMerge') }}
          </button>
          <button
            type="button"
            class="flex-1 px-2 py-2 font-medium transition-colors"
            :class="
              mode === 'replace'
                ? 'bg-rose-500 text-white'
                : 'text-slate-600 dark:text-slate-300'
            "
            @click="mode = 'replace'"
          >
            {{ t('data.modeReplace') }}
          </button>
        </div>
        <p v-if="mode === 'replace'" class="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
          {{ t('data.modeReplaceHint') }}
        </p>
      </div>

      <p v-if="errorMessage" class="text-xs text-rose-600 dark:text-rose-400">
        {{ errorMessage }}
      </p>

      <p v-if="success" class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        ✓ {{ t('data.imported') }} {{ dayCountText }} · {{ entryCountText }}
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
