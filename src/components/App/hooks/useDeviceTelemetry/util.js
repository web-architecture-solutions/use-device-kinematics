import { useState, useRef, useCallback, useMemo } from 'react'

/**
 * Hook to manage debounced updates for a value or callback.
 * @param {Function} callback - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} A debounced version of the callback.
 */
export function useDebouncedCallback(callback, delay) {
  const timer = useRef(null)
  return useCallback(
    (...args) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  )
}

/**
 * Hook to handle and aggregate errors.
 * @returns {[Object, Function]} An array containing the current errors and a function to update errors.
 */
export function useErrorHandling() {
  const [errors, setErrors] = useState({})
  const handler = useMemo(() => {
    return {
      get(target, prop) {
        if (prop === Symbol.toPrimitive || prop === 'toString') {
          return () => JSON.stringify(target)
        }
        return target[prop]
      },
      add: (type, message) => {
        setErrors((prev) => ({ ...prev, [type]: message }))
      },
      clear: (type) => {
        setErrors((prev) => {
          const { [type]: _, ...rest } = prev
          return rest
        })
      }
    }
  }, [setErrors])
  const proxy = useMemo(() => new Proxy(errors, handler), [errors, handler])
  return proxy
}
