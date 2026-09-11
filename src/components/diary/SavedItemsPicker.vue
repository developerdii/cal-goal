<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps({
  label: { type: String, required: true },
  items: { type: Array, default: () => [] },
  meta: { type: Function, required: true },
  createLabel: { type: Function, required: true },
  showSelect: { type: Boolean, default: true },
})

const emit = defineEmits(['quick-add', 'select', 'create'])

const { t } = useI18n()

const open = ref(false)
const query = ref('')
const searchInput = ref(null)

const showSearch = computed(() => props.items.length >= 9)

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

const rowGridClass = computed(() =>
  props.showSelect
    ? 'grid h-10 grid-cols-[20px_minmax(0,1fr)_auto_30px_30px] items-center gap-2'
    : 'grid h-10 grid-cols-[20px_minmax(0,1fr)_auto_30px] items-center gap-2',
)

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    e.stopPropagation()
    open.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown, { capture: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown, { capture: true })
})

watch(open, async (isOpen) => {
  if (!isOpen || !showSearch.value) return
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    await nextTick()
    searchInput.value?.focus()
  }
})

function reset() {
  open.value = false
  query.value = ''
}

function onSelect(item) {
  reset()
  emit('select', item)
}

function onQuickAdd(item) {
  reset()
  emit('quick-add', item)
}

function onCreate() {
  const q = query.value.trim()
  reset()
  emit('create', q)
}
</script>

<template>
  <div
    v-if="items.length"
    class="overflow-hidden rounded-lg border transition-colors"
    :class="open ? 'border-emerald-500 dark:border-emerald-500' : 'border-slate-300 dark:border-slate-700'"
  >
    <button
      type="button"
      class="flex h-10 w-full items-center gap-2 px-3 text-sm transition-colors"
      :class="open ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-white dark:bg-slate-900'"
      @click="open = !open"
    >
      <Icon
        name="bookmark"
        class="h-4 w-4 shrink-0"
        :class="open ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
      />
      <span
        class="min-w-0 flex-1 truncate text-left font-medium"
        :class="open ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'"
      >
        {{ label }}
      </span>
      <span
        class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="open
          ? 'bg-emerald-500 text-white'
          : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'"
      >
        {{ items.length }}
      </span>
      <Icon
        name="chevronDown"
        class="h-4 w-4 shrink-0 transition-transform"
        :class="open ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
      />
    </button>

    <div
      v-if="open"
      class="border-t-[0.5px] border-slate-200 p-2.5 dark:border-slate-800"
    >
      <input
        v-if="showSearch"
        ref="searchInput"
        v-model="query"
        type="search"
        :placeholder="t('foods.searchPlaceholder')"
        class="mb-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
      />

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

      <div v-else class="max-h-[180px] overflow-y-auto">
        <div
          v-for="item in filtered"
          :key="item.id"
          class="border-b-[0.5px] border-slate-200 last:border-b-0 dark:border-slate-800"
          :class="rowGridClass"
        >
          <Icon
            :name="item.favorite ? 'starSolid' : 'star'"
            :solid="item.favorite"
            class="h-4 w-4"
            :class="item.favorite ? 'text-amber-400' : 'text-slate-400'"
          />
          <span class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ item.name }}</span>
          <span class="whitespace-nowrap text-[13px] text-slate-500 dark:text-slate-400">{{ meta(item) }}</span>
          <button
            type="button"
            class="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
            :title="t('foods.quickAdd')"
            :aria-label="t('foods.quickAdd')"
            @click="onQuickAdd(item)"
          >
            <Icon name="plus" class="h-4 w-4" />
          </button>
          <button
            v-if="showSelect"
            type="button"
            class="flex h-[30px] w-[30px] items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            :title="t('common.edit')"
            :aria-label="t('common.edit')"
            @click="onSelect(item)"
          >
            <Icon name="pencil" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
