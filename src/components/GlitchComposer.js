import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { GlitchContext } from '../context'

export default function GlitchComposer({
  children,
  duration: initialDuration = 30,
  disabled = false,
  randomizeDuration = false,
  isGlitched = false,
  setTrapTriggered
}) {
  const durationRef = useRef(initialDuration)

  useFrame(() => {
    if (disabled) return
    if (durationRef.current > 0) {
      durationRef.current -= 1
    } else {
      setTrapTriggered(false)
      durationRef.current = randomizeDuration ? Math.random() * initialDuration : initialDuration
    }
  })

  return <GlitchContext.Provider value={isGlitched}>{children}</GlitchContext.Provider>
}
