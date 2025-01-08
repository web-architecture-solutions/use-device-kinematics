import { useEffect, useState, useRef } from 'react'

export default function useClock(updateFrequency = 100) {
  const startTime = useRef(null)
  const [timestamps, setTimestamps] = useState([0, 0])

  useEffect(() => {
    startTime.current = performance.now()

    const intervalId = setInterval(() => {
      const newTimestamp = performance.now() - startTime.current
      setTimestamps(([oldTimestamp]) => [newTimestamp, oldTimestamp])
    }, updateFrequency)

    return () => clearInterval(intervalId)
  }, [])

  return timestamps
}
