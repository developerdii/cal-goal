<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { authErrorKey } from '@/utils/authErrors'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorKey = ref('')
const infoKey = ref(route.query.signup === 'success' ? 'auth.confirmationSent' : '')

async function submit() {
  errorKey.value = ''
  if (!email.value.trim() || !password.value) {
    errorKey.value = 'auth.errors.invalidCredentials'
    return
  }
  loading.value = true
  try {
    await auth.signIn({ email: email.value.trim(), password: password.value })
    router.replace('/')
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
      <h2 class="text-lg font-bold">{{ t('auth.signInTitle') }}</h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ t('auth.signInSubtitle') }}
      </p>
    </div>

    <form
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
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('auth.password') }}
        </label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          :placeholder="t('auth.passwordPlaceholder')"
          :class="inputClass"
        />
      </div>

      <p v-if="errorKey" class="text-sm font-medium text-rose-600 dark:text-rose-400">
        {{ t(errorKey) }}
      </p>
      <p v-if="infoKey" class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {{ t(infoKey) }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60"
      >
        {{ loading ? '…' : t('auth.submitSignIn') }}
      </button>
    </form>

    <p class="text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('auth.noAccount') }}
      <RouterLink
        to="/signup"
        class="font-semibold text-emerald-600 dark:text-emerald-400"
      >
        {{ t('auth.signUpLink') }}
      </RouterLink>
    </p>
  </div>
</template>
