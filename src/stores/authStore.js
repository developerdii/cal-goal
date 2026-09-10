import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))
  const email = computed(() => user.value?.email ?? null)
  const displayName = computed(
    () => user.value?.user_metadata?.name || user.value?.email || null,
  )

  async function init() {
    loading.value = true
    try {
      if (!isSupabaseConfigured) {
        user.value = null
        session.value = null
        return
      }
      const { data } = await supabase.auth.getSession()
      session.value = data.session ?? null
      user.value = data.session?.user ?? null
    } finally {
      loading.value = false
    }
  }

  // Registers a listener and returns an unsubscribe function.
  function onAuthStateChange(callback) {
    if (!isSupabaseConfigured) return () => {}
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      session.value = currentSession ?? null
      user.value = currentSession?.user ?? null
      callback?.(event, user.value)
    })
    return () => data?.subscription?.unsubscribe?.()
  }

  async function signUp({ email, password, name }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    return data
  }

  async function signIn({ email, password }) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    session.value = null
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    email,
    displayName,
    init,
    onAuthStateChange,
    signUp,
    signIn,
    signOut,
  }
})
