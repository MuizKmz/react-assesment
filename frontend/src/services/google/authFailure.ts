declare global {
  interface Window {
    /** Google calls this global when the Maps API key is rejected. */
    gm_authFailure?: () => void
  }
}

/**
 * Subscribes to Google's key-rejected callback. Returns an unsubscribe function.
 * Any handler that was already installed still runs.
 */
export function onGoogleAuthFailure(callback: () => void): () => void {
  const previous = window.gm_authFailure
  const handler = () => {
    previous?.()
    callback()
  }
  window.gm_authFailure = handler
  return () => {
    if (window.gm_authFailure === handler) window.gm_authFailure = previous
  }
}
