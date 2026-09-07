// Applies the active theme by toggling the `dark` class on <html>.
export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
