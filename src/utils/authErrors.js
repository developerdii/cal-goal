// Maps Supabase auth error messages to i18n keys so the UI can show
// localized messages.
export function authErrorKey(error) {
  const msg = String(error?.message || error?.msg || '').toLowerCase()

  if (msg.includes('not configured')) return 'auth.errors.notConfigured'
  if (msg.includes('invalid login credentials')) return 'auth.errors.invalidCredentials'
  if (msg.includes('email not confirmed')) return 'auth.errors.emailNotConfirmed'
  if (
    msg.includes('already registered') ||
    msg.includes('already been registered') ||
    msg.includes('already exists')
  ) {
    return 'auth.errors.alreadyRegistered'
  }
  if (
    msg.includes('password should be') ||
    msg.includes('at least') ||
    msg.includes('weak')
  ) {
    return 'auth.errors.weakPassword'
  }
  if (msg.includes('rate limit') || msg.includes('too many')) return 'auth.errors.rateLimit'

  return 'auth.errors.generic'
}
