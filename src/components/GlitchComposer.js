import { useState } from 'react'

import { useFrame } from '@react-three/fiber'

import { GlitchContext } from '../context'

const decrement = (current) => current - 1

export default function GlitchComposer({ children, delay: initialDelay, duration: initialDuration }) {
  const [isGlitched, setIsGlitched] = useState(false)
  const [delay, setDelay] = useState(initialDelay)
  const [duration, setDuration] = useState(initialDuration)

  useFrame(() => {
    if (delay > 0) {
      setDelay(decrement)
    } else if (duration > 0) {
      setIsGlitched(true)
      setDuration(decrement)
    } else {
      setIsGlitched(false)
      setDelay(initialDelay)
      setDuration(initialDuration)
    }
  })

  return <GlitchContext.Provider value={isGlitched}>{children}</GlitchContext.Provider>
}
