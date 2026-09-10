<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { authErrorKey } from '@/utils/authErrors'

const { t } = useI18n()
const auth = useAuthStore()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorKey = ref('')

async function submit() {
  errorKey.value = ''
  if (!email.value.trim()) {
    errorKey.value = 'auth.errors.generic'
    return
  }
  loading.value = true
  try {
    await auth.resetPassword(email.value.trim())
    sent.value = true
  } catch (err) {
    errorKey.value = authErrorKey(err)
  } finally {
    loading.value = false
  }
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <div class="mx-auto max-w-sm space-y-4">
    <div class="text-center">
      <h2 class="text-lg font-bold">{{ t('auth.forgotPasswordTitle') }}</h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ t('auth.forgotPasswordSubtitle') }}
      </p>
    </div>

    <form
      v-if="!sent"
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      @submit.prevent="submit"
    >
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('auth.email') }}
        </label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          :placeholder="t('auth.emailPlaceholder')"
          :class="inputClass"
        />
      </div>

      <p v-if="errorKey" class="text-sm font-medium text-rose-600 dark:text-rose-400">
        {{ t(errorKey) }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60"
      >
        {{ loading ? '…' : t('auth.sendResetLink') }}
      </button>
    </form>

    <div
      v-else
      class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
    >
      {{ t('auth.resetLinkSent') }}
    </div>

    <p class="text-center text-sm">
      <RouterLink
        to="/login"
        class="font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        {{ t('auth.backToSignIn') }}
      </RouterLink>
    </p>
  </div>
</template>
