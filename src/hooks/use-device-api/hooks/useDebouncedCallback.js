import { useRef, useCallback } from 'react'

export default function useDebouncedCallback(callback, delay, options = {}) {
  const { leading = false, trailing = true } = options

  const timer = useRef(null)
  const isLeadingCalled = useRef(false)

  const debouncedCallback = useCallback(
    (...args) => {
      if (leading && !isLeadingCalled.current) {
        callback(...args)
        isLeadingCalled.current = true
      }

      if (timer.current) {
        clearTimeout(timer.current)
      }

      timer.current = setTimeout(() => {
        if (trailing) {
          callback(...args)
        }
        isLeadingCalled.current = false
        timer.current = null
      }, delay)
    },
    [callback, delay, leading, trailing]
  )

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    isLeadingCalled.current = false
  }, [])

  return [debouncedCallback, cancel]
}
