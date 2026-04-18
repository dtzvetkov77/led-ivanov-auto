export function dispatchToast(message: string, type: 'success' | 'error' = 'success') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }))
}
