import { useEffect, useRef, useState } from 'react'

import usePrevious from './usePrevious'

export default function useClock(updateFrequency = 100) {
  const startTime = useRef(null)
  const [time, setTime] = useState(null)
  const previousTime = usePrevious(null, time)

  useEffect(() => {
    startTime.current = performance.now()
    const intervalId = setInterval(() => {
      setTime(performance.now() - startTime.current)
    }, updateFrequency)
    return () => clearInterval(intervalId)
  }, [])

  return [time, previousTime]
}

export function usePrevious2(initialValue, current) {
  const previousRef = useRef(initialValue)
  useEffect(() => {
    previousRef.current = current
  }, [current])
  return previousRef.current
}
