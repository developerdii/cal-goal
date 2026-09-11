<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import { useFoodsStore } from '@/stores/foodsStore'

const props = defineProps({
  label: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  meta: { type: Function, required: true },
  createLabel: { type: Function, required: true },
  selectable: { type: Boolean, default: false },
  placement: { type: String, default: 'up' },
})

const emit = defineEmits(['quick-add', 'select', 'create'])

const { t } = useI18n()
const foods = useFoodsStore()

const open = ref(false)
const query = ref('')
const searchInput = ref(null)
const rootRef = ref(null)
const popupRef = ref(null)
const popupStyle = ref({})

const buttonLabel = computed(() => props.label || t('form.savedFoods'))

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const sorted = computed(() =>
  [...props.items].sort((a, b) => {
    const fa = a.favorite ? 1 : 0
    const fb = b.favorite ? 1 : 0
    if (fa !== fb) return fb - fa
    return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' })
  }),
)

const filtered = computed(() => {
  const q = normalize(query.value.trim())
  if (!q) return sorted.value
  return sorted.value.filter((it) => normalize(it.name).includes(q))
})

function computePosition() {
  const el = rootRef.value
  if (!el) return
  const btn = el.getBoundingClientRect()
  const panel = el.closest('.modal-panel')
  const pr = panel ? panel.getBoundingClientRect() : null
  const pad = 20
  const style = {
    left: pr ? `${pr.left + pad}px` : `${btn.left}px`,
    width: pr ? `${pr.width - pad * 2}px` : `${btn.width}px`,
  }
  if (props.placement === 'down') {
    style.top = `${btn.bottom + 8}px`
  } else {
    style.bottom = `${window.innerHeight - btn.top + 8}px`
  }
  popupStyle.value = style
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  computePosition()
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) searchInput.value?.focus()
})

function close() {
  open.value = false
  query.value = ''
}

function onToggle() {
  open.value = !open.value
  query.value = ''
}

function onQuickAdd(item) {
  close()
  emit('quick-add', item)
}

function onSelect(item) {
  close()
  emit('select', item)
}

function onCreate() {
  const q = query.value.trim()
  close()
  emit('create', q)
}

function onToggleFavorite(item) {
  foods.toggleFavorite(item.id)
}

function onDocumentMousedown(e) {
  if (!open.value) return
  if (rootRef.value?.contains(e.target)) return
  if (popupRef.value?.contains(e.target)) return
  close()
}

function onDocumentKeydown(e) {
  if (e.key === 'Escape' && open.value) close()
}

function onResize() {
  if (open.value) computePosition()
}

function onScroll() {
  if (open.value) computePosition()
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown)
  document.addEventListener('keydown', onDocumentKeydown)
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMousedown)
  document.removeEventListener('keydown', onDocumentKeydown)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll, true)
})
</script>

<template>
  <div ref="rootRef">
    <button
      type="button"
      class="flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors"
      :class="open
        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
        : 'border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400'"
      @click="onToggle"
    >
      {{ buttonLabel }}
      <span class="rounded-full bg-slate-200 px-1.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{{ items.length }}</span>
      <Icon name="chevronDown" class="h-3.5 w-3.5 transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="popupRef"
        class="fixed z-[60] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        :style="popupStyle"
      >
        <div class="p-2.5">
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            :placeholder="t('foods.searchPlaceholder')"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div class="max-h-56 overflow-y-auto px-1.5 pb-2">
          <div
            v-for="item in filtered"
            :key="item.id"
            class="flex items-center gap-2 rounded-lg px-1.5 py-2"
          >
            <button
              type="button"
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:text-amber-400"
              :title="item.favorite ? t('foods.removeFavorite') : t('foods.addFavorite')"
              :aria-label="item.favorite ? t('foods.removeFavorite') : t('foods.addFavorite')"
              @click="onToggleFavorite(item)"
            >
              <Icon
                :name="item.favorite ? 'starSolid' : 'star'"
                :solid="item.favorite"
                class="h-4 w-4"
                :class="item.favorite ? 'text-amber-400' : ''"
              />
            </button>
            <button type="button" class="min-w-0 flex-1 text-left" @click="selectable ? onSelect(item) : onQuickAdd(item)">
              <span class="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ item.name }}</span>
              <span class="block text-[12px] text-slate-500 dark:text-slate-400">{{ meta(item) }}</span>
            </button>
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
              :title="t('foods.quickAdd')"
              :aria-label="t('foods.quickAdd')"
              @click="onQuickAdd(item)"
            >
              <Icon name="plus" class="h-4 w-4" />
            </button>
            <button
              v-if="selectable"
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              :title="t('common.edit')"
              :aria-label="t('common.edit')"
              @click="onSelect(item)"
            >
              <Icon name="pencil" class="h-4 w-4" />
            </button>
          </div>

          <div v-if="!filtered.length" class="flex flex-col items-center gap-2 py-6 text-center">
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('foods.noMatches') }}</p>
            <button
              type="button"
              class="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              @click="onCreate"
            >
              {{ createLabel(query.trim()) }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
