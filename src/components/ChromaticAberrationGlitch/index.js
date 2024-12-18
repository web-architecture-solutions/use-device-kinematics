import { forwardRef, useMemo, useContext } from 'react'

import { Vector2 } from 'three'

import { useFrame } from '@react-three/fiber'

import ChromaticAberrationEffect from './ChromaticAberrationEffect'

import { GlitchContext } from '../../context'

const ChromaticAberrationGlitch = forwardRef(
  ({ offset = new Vector2(1e-3, 5e-4), radialModulation = false, modulationOffset = 0.15, intensity = 1 } = {}, ref) => {
    const isGlitched = useContext(GlitchContext)

    const effect = useMemo(
      () => new ChromaticAberrationEffect({ offset, radialModulation, modulationOffset, intensity }),
      [offset, radialModulation, modulationOffset, intensity]
    )

    useFrame(() => {
      effect.isGlitched = isGlitched
    }, [isGlitched])

    return <primitive ref={ref} object={effect} dispose={null} />
  }
)

export default ChromaticAberrationGlitch
