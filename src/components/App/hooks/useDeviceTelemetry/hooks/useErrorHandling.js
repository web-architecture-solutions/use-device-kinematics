import { useState, useMemo, useCallback } from 'react'

function proxyFactory(add, clear, errors) {
  return () =>
    new Proxy(
      {},
      {
        get: (_, prop) => {
          if (prop === 'get') {
            return () => errors
          } else if (prop === 'add') {
            return add
          } else if (prop === 'clear') {
            return clear
          }
          return errors[prop]
        },
        ownKeys: () => Object.keys(errors),
        getOwnPropertyDescriptor: (_, prop) => {
          if (Object.hasOwn(errors, prop)) {
            return {
              enumerable: true,
              configurable: true
            }
          }
        }
      }
    )
}

export default function useErrorHandling() {
  const [errors, setErrors] = useState({})

  const add = useCallback((type, message) => {
    setErrors((prevErrors) => ({ ...prevErrors, [type]: message }))
  }, [])

  const clear = useCallback((type) => {
    setErrors((prevErrors) => {
      const { [type]: _, ...rest } = prevErrors
      return rest
    })
  }, [])

  const proxy = useMemo(proxyFactory(add, clear, errors), [errors, add, clear])

  return proxy
}
