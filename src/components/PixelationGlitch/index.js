import { forwardRef, useState, useMemo } from 'react'

import { useFrame, useThree } from '@react-three/fiber'

import PixelationGlitchEffect from './PixelationGlitchEffect'

const decrement = (current) => current - 1

export const PixelationGlitch = forwardRef(({ maxGranularity = 30, intensity = 1, duration = 30, delay = 30 }, ref) => {
  const { camera } = useThree()

  const effect = useMemo(
    () => new PixelationGlitchEffect(maxGranularity, intensity, false, camera),
    [maxGranularity, intensity, duration, delay, camera]
  )

  const [_duration, set_duration] = useState(duration)
  const [_delay, set_delay] = useState(delay)

  useFrame(() => {
    if (_delay > 0) {
      set_delay(decrement)
    } else if (_duration > 0) {
      effect.isGlitched = true
      set_duration(decrement)
    } else {
      effect.isGlitched = false
      set_delay(delay)
      set_duration(duration)
    }
  })

  return <primitive ref={ref} object={effect} dispose={null} />
})

export default PixelationGlitch
