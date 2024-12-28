import { useState, useEffect, useRef } from 'react'

export function useMouseVelocity() {
  const [velocity, setVelocity] = useState(0)
  const lastPosition = useRef({ x: 0, y: 0 })
  const lastTimestamp = useRef(0)

  useEffect(() => {
    const handleMouseMove = (event) => {
      const now = Date.now()
      const deltaTime = now - lastTimestamp.current

      if (deltaTime > 0) {
        const deltaX = event.clientX - lastPosition.current.x
        const deltaY = event.clientY - lastPosition.current.y

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        const newVelocity = distance / deltaTime

        setVelocity(newVelocity)
      }

      lastPosition.current = { x: event.clientX, y: event.clientY }
      lastTimestamp.current = now
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return velocity
}

export default useMouseVelocity
