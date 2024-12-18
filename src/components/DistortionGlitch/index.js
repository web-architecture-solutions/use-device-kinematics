import { GlitchMode } from 'postprocessing'
import { forwardRef, useMemo, useLayoutEffect, useEffect, useContext } from 'react'
import { useThree } from '@react-three/fiber'

import { useFrame } from '@react-three/fiber'

import * as THREE from 'three'

import { GlitchContext } from '../../context'

import DistortionGlitchEffect from './DistortionGlitchEffect'

const useVector2 = (props, key) => {
  const value = props[key]
  return useMemo(() => {
    if (typeof value === 'number') {
      return new THREE.Vector2(value, value)
    } else if (value) {
      return new THREE.Vector2(...value)
    } else {
      return new THREE.Vector2()
    }
  }, [value])
}

const DistortionGlitch = forwardRef(({ active = true, ...props }, ref) => {
  const invalidate = useThree((state) => state.invalidate)
  const delay = useVector2(props, 'delay')
  const duration = useVector2(props, 'duration')
  const strength = useVector2(props, 'strength')
  const chromaticAberrationOffset = useVector2(props, 'chromaticAberrationOffset')

  const effect = useMemo(
    () => new DistortionGlitchEffect({ ...props, delay, duration, strength, chromaticAberrationOffset }),
    [delay, duration, props, strength, chromaticAberrationOffset]
  )

  const isGlitched = useContext(GlitchContext)

  useFrame(() => {
    effect.isGlitched = isGlitched
  }, [isGlitched])

  useEffect(() => {
    return () => {
      if (effect.dispose) {
        effect.dispose()
      }
    }
  }, [effect])

  return <primitive ref={ref} object={effect} dispose={null} />
})

export default DistortionGlitch
