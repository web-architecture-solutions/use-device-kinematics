import { useState, useEffect, useRef } from 'react'

export default function useMouseVelocity({ accelerationTrapThreshold = 0.01 }) {
  const [velocity, setVelocity] = useState(0)
  const [acceleration, setAcceleration] = useState(0)
  const [trapTriggered, setTrapTriggered] = useState(false)
  const lastPosition = useRef({ x: 0, y: 0 })
  const lastTimestamp = useRef(0)
  const lastVelocity = useRef(0)

  useEffect(() => {
    const handleMouseMove = (event) => {
      const now = Date.now()
      const deltaTime = now - lastTimestamp.current
      if (deltaTime > 0) {
        const deltaX = event.clientX - lastPosition.current.x
        const deltaY = event.clientY - lastPosition.current.y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const currentVelocity = (distance / deltaTime) * Math.sign(deltaX)
        const currentAcceleration = (currentVelocity - lastVelocity.current) / deltaTime
        setAcceleration(currentAcceleration)
        setTrapTriggered(Math.abs(currentAcceleration) > accelerationTrapThreshold)
        setVelocity(currentVelocity)
        lastVelocity.current = currentVelocity
      }
      lastPosition.current = { x: event.clientX, y: event.clientY }
      lastTimestamp.current = now
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [accelerationTrapThreshold])

  return { velocity, setVelocity, acceleration, trapTriggered, setTrapTriggered }
}
