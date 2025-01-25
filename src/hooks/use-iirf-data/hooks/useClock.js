import { useEffect, useRef } from 'react'

export default function useClock(delay, isClockRunning) {
  const timestampRef = useRef(null)
  const startTimeRef = useRef(null)
  const updateTimestamp = () => {
    timestampRef.current = performance.now() - startTimeRef.current
  }
  useEffect(() => {
    if (isClockRunning) {
      startTimeRef.current = performance.now()
      const intervalId = setInterval(updateTimestamp, delay)
      return () => clearInterval(intervalId)
    } else {
      timestampRef.current = null
      startTimeRef.current = null
    }
  }, [isClockRunning, delay])
  return timestampRef.current
}
