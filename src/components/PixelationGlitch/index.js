import { forwardRef, useMemo, useContext } from 'react'

import { useFrame } from '@react-three/fiber'

import PixelationGlitchEffect from './PixelationGlitchEffect'

import { GlitchContext } from '../../context'

const PixelationGlitch = forwardRef(({ granularity = 30, randomizeGranularity = false, intensity = 1 }, ref) => {
  const isGlitched = useContext(GlitchContext)

  const effect = useMemo(
    () => new PixelationGlitchEffect({ granularity, randomizeGranularity, intensity }),
    [granularity, randomizeGranularity, intensity]
  )

  useFrame(() => {
    effect.isGlitched = isGlitched
  }, [isGlitched])

  return <primitive ref={ref} object={effect} dispose={null} />
})

export default PixelationGlitch
