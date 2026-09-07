import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '@/services/storageService'
import { createId } from '@/utils/id'

// Library of saved foods/groups ("favorites"). Each food stores a definition:
//   - food:  { id, type: 'food',  name, unit, amount, kcal, createdAt }
//   - group: { id, type: 'group', name, items: [{ id, name, unit, amount, kcal }], createdAt }
export const useFoodsStore = defineStore('foods', () => {
  const foods = ref([])

  function init() {
    foods.value = storageService.getFoods()
  }

  function getById(id) {
    return foods.value.find((f) => f.id === id) ?? null
  }

  // Upsert by id when present, otherwise by name (case-insensitive, same type).
  function upsert(food) {
    const list = [...foods.value]
    const idx = food.id
      ? list.findIndex((f) => f.id === food.id)
      : list.findIndex(
          (f) =>
            f.type === food.type &&
            String(f.name || '').trim().toLowerCase() === String(food.name || '').trim().toLowerCase(),
        )

    const base = idx >= 0 ? list[idx] : {}
    const item = {
      ...base,
      ...food,
      id: idx >= 0 ? base.id : food.id || createId(),
      createdAt: base.createdAt || food.createdAt || new Date().toISOString(),
    }

    if (idx >= 0) list[idx] = item
    else list.push(item)

    foods.value = list
    storageService.saveFood(item)
    return item
  }

  function remove(id) {
    foods.value = foods.value.filter((f) => f.id !== id)
    storageService.removeFood(id)
  }

  return { foods, init, getById, upsert, remove }
})
