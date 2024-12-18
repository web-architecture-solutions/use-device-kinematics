import { useState } from 'react'

import { useFrame } from '@react-three/fiber'

import { GlitchContext } from '../context'

const decrement = (current) => current - 1

export default function GlitchComposer({
  children,
  delay: initialDelay = 240,
  duration: initialDuration = 30,
  disabled = false,
  randomizeDelay = false,
  randomizeDuration = false
}) {
  const [isGlitched, setIsGlitched] = useState(false)
  const [delay, setDelay] = useState(initialDelay)
  const [duration, setDuration] = useState(initialDuration)

  useFrame(() => {
    if (disabled) return null
    if (delay > 0) {
      setDelay(decrement)
    } else if (duration > 0) {
      setIsGlitched(true)
      setDuration(decrement)
    } else {
      setIsGlitched(false)
      setDelay(randomizeDelay ? Math.random() * initialDelay : initialDelay)
      setDuration(randomizeDuration ? Math.random() * initialDuration : initialDuration)
    }
  })

  return <GlitchContext.Provider value={isGlitched}>{children}</GlitchContext.Provider>
}
