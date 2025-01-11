import { useEffect, useRef } from 'react'

import usePrevious from './usePrevious'

export default function useClock(updateFrequency = 100) {
  const startTime = useRef(null)

  const { current, previous, update } = usePrevious()

  useEffect(() => {
    startTime.current = performance.now()
    const intervalId = setInterval(() => {
      update(performance.now() - startTime.current)
    }, updateFrequency)
    return () => clearInterval(intervalId)
  }, [])

  return [current, previous]
}
