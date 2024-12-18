import { forwardRef, useMemo, useContext } from 'react'

import { useFrame, useThree } from '@react-three/fiber'

import CameraGlitchEffect from './CameraGlitchEffect'

import { GlitchContext } from '../../context'

export const CameraGlitch = forwardRef(({ intensity = 1 }, ref) => {
  const { camera } = useThree()

  const isGlitched = useContext(GlitchContext)

  const effect = useMemo(() => new CameraGlitchEffect(camera, intensity), [camera, intensity])

  useFrame(() => (effect.isGlitched = isGlitched), [isGlitched])

  return <primitive ref={ref} object={effect} dispose={null} />
})

export default CameraGlitch
