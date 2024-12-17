import { forwardRef, useMemo } from 'react'

import { useThree } from '@react-three/fiber'

import PixelationGlitchEffect from './PixelationGlitchEffect'

export const PixelationGlitch = forwardRef(({ maxGranularity = 30, intensity = 1, duration = 30, delay = 30 }, ref) => {
  const { camera } = useThree()
  const effect = useMemo(() => new PixelationGlitchEffect(maxGranularity, intensity, duration, delay, camera), [maxGranularity])
  return <primitive ref={ref} object={effect} dispose={null} />
})

export default PixelationGlitch
