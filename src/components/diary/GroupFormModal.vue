<script setup>
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/ui/BaseModal.vue'
import Icon from '@/components/ui/Icon.vue'
import { createId } from '@/utils/id'

const props = defineProps({
  open: { type: Boolean, default: false },
  group: { type: Object, default: null }, // null = create, object = edit
})

const emit = defineEmits(['close', 'save', 'delete'])

const { t } = useI18n()

const form = reactive({ name: '', items: [] })
const errors = reactive({ name: '', items: '' })

function emptyItem() {
  return { id: createId(), name: '', calories: '' }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.name = props.group?.name ?? ''
      form.items = (props.group?.items || []).map((it) => ({
        id: it.id,
        name: it.name,
        calories: String(it.calories),
      }))
      if (form.items.length === 0) form.items.push(emptyItem())
      errors.name = ''
      errors.items = ''
    }
  },
)

const title = computed(() => (props.group ? t('group.editTitle') : t('group.addTitle')))

function addItem() {
  form.items.push(emptyItem())
}

function removeItem(id) {
  form.items = form.items.filter((it) => it.id !== id)
  if (form.items.length === 0) form.items.push(emptyItem())
}

function validate() {
  errors.name = ''
  errors.items = ''

  if (!form.name.trim()) errors.name = t('group.validation.nameRequired')

  const filled = form.items.filter(
    (it) => it.name.trim() !== '' || String(it.calories).trim() !== '',
  )
  if (filled.length === 0) {
    errors.items = t('group.validation.noItems')
    return !errors.name
  }

  const invalid = filled.some((it) => {
    const cal = Number(it.calories)
    return it.name.trim() === '' || !Number.isFinite(cal) || cal <= 0
  })
  if (invalid) errors.items = t('group.validation.itemInvalid')

  return !errors.name && !errors.items
}

function submit() {
  if (!validate()) return
  const items = form.items
    .filter((it) => it.name.trim() !== '' || String(it.calories).trim() !== '')
    .map((it) => ({ id: it.id, name: it.name.trim(), calories: Number(it.calories) }))
  emit('save', { name: form.name.trim(), items })
}

const inputClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('group.name') }}
        </label>
        <input
          v-model="form.name"
          type="text"
          :placeholder="t('group.namePlaceholder')"
          class="w-full"
          :class="inputClass"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-rose-500">{{ errors.name }}</p>
      </div>

      <div>
        <div class="mb-1 flex items-center justify-between">
          <label class="text-sm font-medium text-slate-600 dark:text-slate-300">
            {{ t('group.items') }}
          </label>
          <button
            type="button"
            class="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            @click="addItem"
          >
            <Icon name="plus" class="h-3.5 w-3.5" />
            {{ t('group.addItem') }}
          </button>
        </div>

        <div class="space-y-2">
          <div v-for="it in form.items" :key="it.id" class="flex items-center gap-2">
            <input
              v-model="it.name"
              type="text"
              :placeholder="t('entry.namePlaceholder')"
              class="w-full"
              :class="inputClass"
            />
            <input
              v-model="it.calories"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              :placeholder="t('entry.caloriesPlaceholder')"
              class="w-28 shrink-0"
              :class="inputClass"
            />
            <button
              type="button"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
              aria-label="Remove item"
              @click="removeItem(it.id)"
            >
              <Icon name="close" class="h-4 w-4" />
            </button>
          </div>
        </div>
        <p v-if="errors.items" class="mt-1 text-xs text-rose-500">{{ errors.items }}</p>
      </div>

      <div class="flex gap-2 pt-1">
        <button
          v-if="group"
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
