<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: '' },
  confirmWord: { type: String, default: '' },
  confirmHint: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])

const { t } = useI18n()

const typed = ref('')

watch(
  () => props.open,
  (v) => {
    if (!v) typed.value = ''
  },
)

const canConfirm = computed(() => !props.confirmWord || typed.value === props.confirmWord)

function onConfirm() {
  if (!canConfirm.value || props.loading) return
  emit('confirm')
}
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('cancel')">
    <p class="text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>

    <div v-if="confirmWord" class="mt-4">
      <label
        v-if="confirmHint"
        class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
      >
        {{ confirmHint }}
      </label>
      <input
        v-model="typed"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :placeholder="confirmWord"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800"
      />
    </div>

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
        :disabled="!canConfirm || loading"
        class="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        @click="onConfirm"
      >
        <span
          v-if="loading"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        ></span>
        {{ confirmLabel || t('common.delete') }}
      </button>
    </div>
  </BaseModal>
</template>
