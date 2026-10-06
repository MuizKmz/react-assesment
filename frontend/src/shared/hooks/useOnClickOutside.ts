import { useEffect, useRef, type RefObject } from 'react'

/** Calls `handler` when the user presses outside `ref`. Used to close the suggestions dropdown. */
export function useOnClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  // Keep the latest handler without re-subscribing on every render.
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (event: PointerEvent) => {
      const el = ref.current
      if (el && !el.contains(event.target as Node)) handlerRef.current()
    }
    document.addEventListener('pointerdown', listener)
    return () => document.removeEventListener('pointerdown', listener)
  }, [ref])
}
