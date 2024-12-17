import { forwardRef, useMemo, useContext } from 'react'

import { useFrame, useThree } from '@react-three/fiber'

import PixelationGlitchEffect from './PixelationGlitchEffect'

import { GlitchContext } from '../../context'

export const PixelationGlitch = forwardRef(({ maxGranularity = 30, intensity = 1 }, ref) => {
  const { camera } = useThree()

  const isGlitched = useContext(GlitchContext)

  const effect = useMemo(() => new PixelationGlitchEffect(maxGranularity, intensity, false, camera), [maxGranularity, intensity, camera])

  useFrame(() => (effect.isGlitched = isGlitched), [isGlitched])

  return <primitive ref={ref} object={effect} dispose={null} />
})

export default PixelationGlitch
