import { useEffect, useRef } from 'react'

export default function usePrevious(initialValue, current) {
  const previousRef = useRef(initialValue)
  useEffect(() => {
    previousRef.current = current
  }, [current])
  return previousRef.current
}
