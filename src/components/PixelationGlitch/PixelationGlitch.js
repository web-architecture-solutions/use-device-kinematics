import { forwardRef, useMemo } from 'react'

import PixelationGlitchEffect from './PixelationGlitchEffect'

const PixelationGlitch = forwardRef(function Pixelation({ maxGranularity = 30, intensity = 1, duration = 30, delay = 30 }, ref) {
  const effect = useMemo(() => new PixelationGlitchEffect(maxGranularity, intensity, duration, delay), [maxGranularity])
  return <primitive ref={ref} object={effect} dispose={null} />
})

export default PixelationGlitch
