import { useEffect, useRef, useState } from 'react'

export default function useClock(deltaT, startCondition) {
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
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [startCondition])

  return { timestamp: timestamps.current, previousTimestamp: timestamps.previous }
}
