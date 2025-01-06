import { useCallback, useRef, useLayoutEffect } from 'react'

export default function useEvent(handler) {
  const handlerRef = useRef(null)

  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback((...args) => {
    const fn = handlerRef.current
    return fn(...args)
  }, [])
}
