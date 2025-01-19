import { useEffect, useRef, useState } from 'react'

export default function useClock(startCondition, updateFrequency = 1) {
  const [timestamps, setTimestamps] = useState({ current: null, previous: null })

  const startTime = useRef(null)

  useEffect(() => {
    if (startCondition) {
      startTime.current = performance.now()
      const intervalId = setInterval(() => {
        setTimestamps((prev) => {
          const newTimestamp = performance.now() - startTime.current
          return { current: newTimestamp, previous: prev.current }
        })
      }, updateFrequency)
      return () => clearInterval(intervalId)
    }
  }, [startCondition, updateFrequency])

  return { timestamp: timestamps.current, previousTimestamp: timestamps.previous }
}
