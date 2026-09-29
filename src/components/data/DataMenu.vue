<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import ExportModal from '@/components/data/ExportModal.vue'
import ImportModal from '@/components/data/ImportModal.vue'

defineProps({
  dateKey: { type: String, required: true },
})

const { t } = useI18n()

const open = ref(false)
const exportOpen = ref(false)
const importOpen = ref(false)
const triggerRef = ref(null)
const panelRef = ref(null)

function onDocumentClick(e) {
  if (!open.value) return
  if (!panelRef.value?.contains(e.target) && !triggerRef.value?.contains(e.target)) {
    open.value = false
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

function openExport() {
  open.value = false
  exportOpen.value = true
}
function openImport() {
  open.value = false
  importOpen.value = true
}
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      type="button"
      :aria-label="t('data.menuLabel')"
      :aria-expanded="open"
      aria-haspopup="menu"
      class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      @click="open = !open"
    >
      <Icon name="dotsHorizontal" class="h-5 w-5" />
    </button>

    <Transition name="menu">
      <div
        v-if="open"
        ref="panelRef"
        role="menu"
        class="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="openExport"
        >
          {{ t('data.exportAction') }}
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="openImport"
        >
          {{ t('data.importAction') }}
        </button>
      </div>
    </Transition>

    <ExportModal :open="exportOpen" :date-key="dateKey" @close="exportOpen = false" />
    <ImportModal :open="importOpen" :date-key="dateKey" @close="importOpen = false" />
  </div>
</template>
