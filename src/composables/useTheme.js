// Resolves 'auto' to the current system preference, otherwise returns the
// explicit 'light' / 'dark' value.
function systemPrefersDark() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function resolveTheme(theme) {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return systemPrefersDark() ? 'dark' : 'light'
}

// Applies the active theme by toggling the `dark` class on <html>.
export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
}
