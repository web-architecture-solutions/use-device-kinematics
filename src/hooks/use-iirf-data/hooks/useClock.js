import { useEffect, useRef, useState } from 'react'

export default function useClock(delay, startCondition) {
  const [timestamps, setTimestamps] = useState({ current: null, previous: null })

  const startTime = useRef(null)

  useEffect(() => {
    if (startCondition) {
      startTime.current = performance.now()
      const intervalId = setInterval(() => {
        setTimestamps((previousTimestamp) => {
          const newTimestamp = performance.now() - startTime.current
          return { current: newTimestamp, previous: previousTimestamp.current }
        })
      }, delay)
      return () => clearInterval(intervalId)
    }
  }, [startCondition])

  return { timestamp: timestamps.current, previousTimestamp: timestamps.previous }
}
