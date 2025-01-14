import { useEffect, useRef, useState } from 'react'

import usePrevious from '../../hooks/usePrevious'

export default function useClock(startCondition, updateFrequency = 100) {
  const startTime = useRef(null)
  const [timestamp, setTimestamp] = useState(null)
  const previousTimestamp = usePrevious(timestamp)
  useEffect(() => {
    if (startCondition) {
      startTime.current = performance.now()
      const intervalId = setInterval(() => {
        setTimestamp(performance.now() - startTime.current)
      }, updateFrequency)
      return () => clearInterval(intervalId)
    }
  }, [startCondition])
  return { timestamp, previousTimestamp }
}
