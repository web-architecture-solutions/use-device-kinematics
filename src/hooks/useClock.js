import { useEffect, useState, useRef } from 'react'

export default function useClock(updateFrequency = 10) {
  const startTime = useRef(null)
  const [globalTimestamp, setGlobalTimestamp] = useState(0)

  useEffect(() => {
    startTime.current = performance.now()

    const intervalId = setInterval(() => {
      setGlobalTimestamp(performance.now() - startTime.current)
    }, updateFrequency)

    return () => clearInterval(intervalId)
  }, [])

  return globalTimestamp
}
