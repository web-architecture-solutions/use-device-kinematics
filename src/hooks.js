import { useState, useMemo } from 'react'

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
