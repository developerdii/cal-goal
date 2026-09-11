<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Icon from '@/components/ui/Icon.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
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
          class="modal-panel relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <div class="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-3">
            <div class="min-w-0 flex-1">
              <p
                v-if="eyebrow"
                class="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500"
              >
                {{ eyebrow }}
              </p>
              <slot name="title">
                <h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
              </slot>
            </div>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close"
              @click="emit('close')"
            >
              <Icon name="close" class="h-5 w-5" />
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="shrink-0 border-t border-slate-200 px-5 py-3 dark:border-slate-800"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
