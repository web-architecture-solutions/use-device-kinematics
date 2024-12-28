import { useRef, useCallback } from 'react'

/**
 * Hook to manage debounced updates for a value or callback.
 * @param {Function} callback - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @param {Object} [options] - Options for leading/trailing execution.
 * @param {boolean} [options.leading=false] - Whether to execute the callback on the leading edge.
 * @param {boolean} [options.trailing=true] - Whether to execute the callback on the trailing edge.
 * @returns {Function} A debounced version of the callback.
 */
export default function useDebouncedCallback(callback, delay, options = {}) {
  const { leading = false, trailing = true } = options
  const timer = useRef(null)
  const isLeadingCalled = useRef(false)

  const debouncedCallback = useCallback(
    (...args) => {
      if (leading && !isLeadingCalled.current) {
        callback(...args) // Call immediately if leading is true
        isLeadingCalled.current = true
      }

      if (timer.current) {
        clearTimeout(timer.current)
      }

      timer.current = setTimeout(() => {
        if (trailing) {
          callback(...args) // Call on the trailing edge if enabled
        }
        isLeadingCalled.current = false // Reset leading flag after the delay
        timer.current = null
      }, delay)
    },
    [callback, delay, leading, trailing]
  )

  // Cleanup timer on unmount
  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    isLeadingCalled.current = false
  }, [])

  // Return the debounced function and a cancel function
  return [debouncedCallback, cancel]
}
