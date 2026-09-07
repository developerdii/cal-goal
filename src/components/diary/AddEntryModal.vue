<script setup>
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import Icon from '@/components/ui/Icon.vue'

defineProps({ open: { type: Boolean, default: false } })

const emit = defineEmits(['close', 'select'])

const { t } = useI18n()

const optionClass =
  'flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30'
</script>

<template>
  <BaseModal :open="open" :title="t('home.addEntryTitle')" @close="emit('close')">
    <div class="space-y-3">
      <button type="button" :class="optionClass" @click="emit('select', 'food')">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
        >
          <Icon name="plus" class="h-5 w-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold">{{ t('home.addFood') }}</span>
          <span class="block text-xs text-slate-400">{{ t('home.foodOptionHint') }}</span>
        </span>
      </button>

      <button type="button" :class="optionClass" @click="emit('select', 'group')">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300"
        >
          <Icon name="folder" class="h-5 w-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold">{{ t('home.addGroup') }}</span>
          <span class="block text-xs text-slate-400">{{ t('home.groupOptionHint') }}</span>
        </span>
      </button>
    </div>
  </BaseModal>
</template>


