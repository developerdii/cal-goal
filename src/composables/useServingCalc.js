import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultServingAmount, unitLabelKey } from '@/utils/units'
import { resolveKcal, resolveQuantity } from '@/utils/nutrition'

// Shared serving-calculation logic for the "This food" / "How much you ate"
// fields. Accepts refs for the four serving values and returns derived
// values plus a unit-change handler that enforces the no-conversion rule.
export function useServingCalc(unit, amount, perKcal, quantity) {
  const { t } = useI18n()

  const referenceAmountText = computed(
    () => String(amount.value ?? '').trim() || String(defaultServingAmount(unit.value)),
  )
  const effectiveQuantity = computed(() =>
    resolveQuantity(amount.value, quantity.value, unit.value),
  )
  const quantityUnitLabel = computed(() => t(unitLabelKey(unit.value, effectiveQuantity.value)))
  const total = computed(() => resolveKcal(amount.value, perKcal.value, effectiveQuantity.value))
  const hasValidTotal = computed(() => {
    const v = total.value
    return Number.isFinite(v) && v > 0
  })

  function changeUnit(nextUnit) {
    unit.value = nextUnit
    amount.value = String(defaultServingAmount(nextUnit))
    quantity.value = ''
    if (String(perKcal.value ?? '').trim() !== '') perKcal.value = ''
  }

  return {
    referenceAmountText,
    effectiveQuantity,
    quantityUnitLabel,
    total,
    hasValidTotal,
    changeUnit,
  }
}