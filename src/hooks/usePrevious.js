import { useRef, useEffect } from 'react'

export default function usePrevious(newValue, initialValue = null, isEqualFunc = null) {
  const ref = useRef({ value: newValue, previous: initialValue })
  useEffect(() => {
    if (isEqualFunc ? !isEqualFunc(ref.current.value, newValue) : ref.current.value !== newValue) {
      ref.current = { value: newValue, previous: ref.current.value }
    }
  }, [newValue, isEqualFunc])
  return ref.current.previous
}
