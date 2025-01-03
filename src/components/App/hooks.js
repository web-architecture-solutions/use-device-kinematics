import { useEffect, useState } from 'react'

export function useTheta() {
  const [theta, setTheta] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTheta((oldTheta) => (oldTheta + 1) % 360)
    }, 20)
    return () => clearTimeout(interval)
  }, [])

  return theta
}
