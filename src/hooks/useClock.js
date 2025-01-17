import { useEffect, useRef, useState } from 'react'

export default function useClock(startCondition, updateFrequency = 100) {
  const startTime = useRef(null)
  const [timestamp, setTimestamp] = useState(null)
  const previousTimestampRef = useRef(null)
  useEffect(() => {
    if (startCondition) {
      startTime.current = performance.now()
      const intervalId = setInterval(() => {
        const newTimestamp = performance.now() - startTime.current
        setTimestamp(newTimestamp)
        previousTimestampRef.current = timestamp
      }, updateFrequency)
      return () => clearInterval(intervalId)
    } else {
      startTime.current = null
      setTimestamp(null)
      previousTimestampRef.current = null
    }
  }, [startCondition, updateFrequency])
  const previousTimestamp = previousTimestampRef.current
  return { timestamp, previousTimestamp }
}
