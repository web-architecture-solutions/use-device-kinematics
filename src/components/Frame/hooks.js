import { useState, useEffect } from 'react'

export function useRadialMousePosition() {
  const [position, setPosition] = useState({ r: 0, theta: 0 })

  useEffect(() => {
    const handleMouseMove = (event) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const deltaX = event.clientX - centerX
      const deltaY = centerY - event.clientY

      const r = Math.sqrt(deltaX ** 2 + deltaY ** 2)
      const theta = Math.round((Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 360) % 360)

      setPosition({ r, theta })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return position
}
