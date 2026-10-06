import { useEffect, type RefObject } from 'react'

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/** "/" or Ctrl/⌘+K focuses the search box from anywhere on the page. */
export function useSearchShortcut(inputRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const slash = event.key === '/' && !isTypingTarget(event.target)
      const commandK = event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)
      if (!slash && !commandK) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inputRef])
}
