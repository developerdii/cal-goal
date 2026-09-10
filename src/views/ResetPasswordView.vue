<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { authErrorKey } from '@/utils/authErrors'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorKey = ref('')
const success = ref(false)

onMounted(() => {
  // Only reachable with an active (recovery) session; otherwise go to sign in.
  if (!auth.isAuthenticated) router.replace('/login')
})

async function submit() {
  errorKey.value = ''
  if (password.value.length < 6) {
    errorKey.value = 'auth.errors.weakPassword'
    return
  }
  if (password.value !== confirm.value) {
    errorKey.value = 'auth.errors.passwordsDoNotMatch'
    return
  }
  loading.value = true
  try {
    await auth.updatePassword(password.value)
    success.value = true
    setTimeout(() => router.replace('/'), 1000)
  } catch (err) {
    errorKey.value = authErrorKey(err)
    loading.value = false
  }
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800'
</script>

<template>
  <div class="mx-auto max-w-sm space-y-4">
    <div class="text-center">
      <h2 class="text-lg font-bold">{{ t('auth.resetPasswordTitle') }}</h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ t('auth.resetPasswordSubtitle') }}
      </p>
    </div>

    <form
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      @submit.prevent="submit"
    >
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('auth.newPassword') }}
        </label>
        <input
          v-model="password"
          type="password"
          autocomplete="new-password"
          :class="inputClass"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {{ t('auth.confirmPassword') }}
        </label>
        <input
          v-model="confirm"
          type="password"
          autocomplete="new-password"
          :class="inputClass"
        />
      </div>

      <p v-if="errorKey" class="text-sm font-medium text-rose-600 dark:text-rose-400">
        {{ t(errorKey) }}
      </p>
      <p v-if="success" class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {{ t('auth.passwordUpdated') }}
      </p>

      <button
        type="submit"
        :disabled="loading || success"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-60"
      >
        {{ loading ? '…' : t('auth.updatePassword') }}
      </button>
    </form>
  </div>
</template>
