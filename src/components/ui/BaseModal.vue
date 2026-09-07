<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Icon from '@/components/ui/Icon.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const emit = defineEmits(['close'])

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
        <div
          class="modal-panel relative w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl dark:bg-slate-900 dark:text-slate-100"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close"
              @click="emit('close')"
            >
              <Icon name="close" class="h-5 w-5" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
