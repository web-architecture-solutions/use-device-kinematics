import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import RandomWalk from '../RandomWalk'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'
import CameraGlitch from '../CameraGlitch'
import ChromaticAberrationGlitch from '../ChromaticAberrationGlitch'

import { rotationCallback, randomWalkParameters, glitchParameters } from './constants'

import { useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import { useGeometryBuffer } from '../RandomWalk/hooks'

const { delay, randomizeDelay, duration, intensity, randomizeDuration, pixelizationGranularity, randomizePixelizationGranularity } =
  glitchParameters

export default function Scene({ mouseVelocity, trapTriggered, setTrapTriggered }) {
  const lineRef = useRef()
  const geometryBuffer = useGeometryBuffer(lineRef, { mouseVelocity, ...randomWalkParameters })

  useFrame(() => geometryBuffer.update())

  return (
    <>
      <Rotate callback={rotationCallback}>
        <UnitCube />

        <line ref={lineRef}>
          <bufferGeometry />

          <lineBasicMaterial vertexColors />
        </line>
      </Rotate>

      <EffectComposer>
        <GlitchComposer
          isGlitched={trapTriggered}
          delay={delay}
          randomizeDelay={randomizeDelay}
          duration={duration}
          randomizeDuration={randomizeDuration}
          setTrapTriggered={setTrapTriggered}>
          <CameraGlitch intensity={intensity} />

          <ChromaticAberrationGlitch offset={[0, 0]} intensity={intensity} />

          <PixelationGlitch
            granularity={pixelizationGranularity}
            randomizeGranularity={randomizePixelizationGranularity}
            intensity={intensity}
          />
        </GlitchComposer>

        <Noise blendFunction={BlendFunction.SOFT_LIGHT} />

        <Bloom intensity={2} luminanceThreshold={0.0} luminanceSmoothing={1} mipmapBlur={true} />
      </EffectComposer>
    </>
  )
}
