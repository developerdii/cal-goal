<script setup>
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  entry: { type: Object, default: null }, // null = create, object = edit
})

const emit = defineEmits(['close', 'save', 'delete'])

const { t } = useI18n()

const form = reactive({ name: '', calories: '' })
const errors = reactive({ name: '', calories: '' })

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.name = props.entry?.name ?? ''
      form.calories = props.entry ? String(props.entry.calories) : ''
      errors.name = ''
      errors.calories = ''
    }
  },
)

const title = computed(() => (props.entry ? t('entry.editTitle') : t('entry.addTitle')))

function validate() {
  errors.name = ''
  errors.calories = ''

  const name = form.name.trim()
  const raw = String(form.calories).trim()
  const calories = Number(raw)

  if (!name) errors.name = t('entry.validation.nameRequired')
  if (raw === '') errors.calories = t('entry.validation.caloriesRequired')
  else if (!Number.isFinite(calories) || calories <= 0) {
    errors.calories = t('entry.validation.caloriesPositive')
  }

  return !errors.name && !errors.calories
}

function submit() {
  if (!validate()) return
  emit('save', { name: form.name.trim(), calories: Number(form.calories) })
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('entry.name') }}
        </label>
        <input
          v-model="form.name"
          type="text"
          :placeholder="t('entry.namePlaceholder')"
          :class="inputClass"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-rose-500">{{ errors.name }}</p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('entry.calories') }}
        </label>
        <input
          v-model="form.calories"
          type="number"
          inputmode="numeric"
          min="1"
          step="1"
          :placeholder="t('entry.caloriesPlaceholder')"
          :class="inputClass"
        />
        <p v-if="errors.calories" class="mt-1 text-xs text-rose-500">{{ errors.calories }}</p>
      </div>

      <div class="flex gap-2 pt-1">
        <button
          v-if="entry"
          type="button"
          class="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
          @click="emit('delete')"
        >
          {{ t('common.delete') }}
        </button>
        <div class="flex-1"></div>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
