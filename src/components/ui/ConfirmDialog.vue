<script setup>
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'cancel'])

const { t } = useI18n()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('cancel')">
    <p class="text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
    <div class="mt-5 flex justify-end gap-2">
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="button"
        class="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
        @click="emit('confirm')"
      >
        {{ confirmLabel || t('common.delete') }}
      </button>
    </div>
  </BaseModal>
</template>
