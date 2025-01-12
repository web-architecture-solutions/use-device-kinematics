import { useRef, useEffect } from 'react'

export default function usePrevious(value, isEqualFunc = null) {
  const ref = useRef({ value: value, prev: null })
  useEffect(() => {
    const current = ref.current.value
    if (isEqualFunc ? !isEqualFunc(current, value) : value !== current) {
      ref.current = { value: value, prev: current }
    }
  }, [value, isEqualFunc])
  return ref.current.prev
}
