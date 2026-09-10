<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { authErrorKey } from '@/utils/authErrors'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorKey = ref('')

async function submit() {
  errorKey.value = ''
  if (!name.value.trim()) {
    errorKey.value = 'auth.errors.nameRequired'
    return
  }
  if (!email.value.trim() || !password.value) {
    errorKey.value = 'auth.errors.invalidCredentials'
    return
  }
  if (password.value.length < 6) {
    errorKey.value = 'auth.errors.weakPassword'
    return
  }
  loading.value = true
  try {
    const res = await auth.signUp({
      email: email.value.trim(),
      password: password.value,
      name: name.value.trim(),
    })
    if (res?.session) {
      // Email confirmation disabled → signed in immediately.
      router.replace('/')
    } else {
      // Email confirmation enabled → send them to sign-in with a notice.
      router.replace({ path: '/login', query: { signup: 'success' } })
    }
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
      <h2 class="text-lg font-bold">{{ t('auth.signUpTitle') }}</h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ t('auth.signUpSubtitle') }}
      </p>
    </div>

    <form
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      @submit.prevent="submit"
    >
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('auth.name') }}
        </label>
        <input
          v-model="name"
          type="text"
          autocomplete="name"
          :placeholder="t('auth.namePlaceholder')"
          :class="inputClass"
        />
      </div>
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
          autocomplete="new-password"
          :placeholder="t('auth.passwordPlaceholder')"
          :class="inputClass"
        />
        <p class="mt-1 text-xs text-slate-400">{{ t('auth.passwordMin') }}</p>
      </div>

      <p v-if="errorKey" class="text-sm font-medium text-rose-600 dark:text-rose-400">
        {{ t(errorKey) }}
      </p>
      <button
        type="submit"
        :disabled="loading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60"
      >
        {{ loading ? '…' : t('auth.submitSignUp') }}
      </button>
    </form>

    <p class="text-center text-sm text-slate-500 dark:text-slate-400">
      {{ t('auth.haveAccount') }}
      <RouterLink
        to="/login"
        class="font-semibold text-emerald-600 dark:text-emerald-400"
      >
        {{ t('auth.signInLink') }}
      </RouterLink>
    </p>
  </div>
</template>
