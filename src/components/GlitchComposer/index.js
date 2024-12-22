import { useState } from 'react'

import { useFrame } from '@react-three/fiber'

import { GlitchContext } from '../../context'

export default function GlitchComposer({
  children,
  duration: intitalDuration = 30,
  disabled = false,
  randomizeDuration = false,
  isGlitched = false,
  setTrapTriggered
}) {
  const [duration, setDuration] = useState(intitalDuration)

  useFrame(() => {
    if (disabled) return
    if (duration > 0) {
      setDuration((currentDuration) => currentDuration - 1)
    } else {
      setTrapTriggered(false)
      setDuration(randomizeDuration ? Math.random() * intitalDuration : intitalDuration)
    }
  })

  return <GlitchContext.Provider value={isGlitched}>{children}</GlitchContext.Provider>
}
