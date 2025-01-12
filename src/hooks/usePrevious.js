import { useRef, useEffect } from 'react'

function usePrevious(value, isEqualFunc) {
  const ref = useRef({ value: value, prev: null })

  useEffect(() => {
    const current = ref.current.value

    if (isEqualFunc ? !isEqualFunc(current, value) : value !== current) {
      ref.current = {
        value: value,
        prev: current
      }
    }
  }, [value, isEqualFunc])

  return ref.current.prev
}

export default usePrevious
