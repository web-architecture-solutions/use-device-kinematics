import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import RandomWalk from '../RandomWalk'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'
import CameraGlitch from '../CameraGlitch'
import ChromaticAberrationGlitch from '../ChromaticAberrationGlitch'

import UnitSphere from '../UnitSphere'
import UnitPolyhedron from '../UnitPolyhedron'

import { rotationCallback, randomWalkParameters as parameters, glitchParameters } from './constants'

const { delay, randomizeDelay, duration, intensity, randomizeDuration, pixelizationGranularity, randomizePixelizationGranularity } =
  glitchParameters

export default function Scene() {
  const renderConstraint = () => {
    switch (parameters.constraint) {
      case 'cubical':
        return <UnitCube />
      case 'spherical':
        return <UnitSphere />
      case 'tetrahedral':
      case 'octahedral':
        return <UnitPolyhedron type={parameters.constraint} />
      default:
        return null
    }
  }
  return (
    <>
      <Rotate callback={rotationCallback}>
        {renderConstraint()}
        <RandomWalk parameters={parameters} />
        <UnitSphere />
      </Rotate>

      <EffectComposer>
        <GlitchComposer delay={delay} randomizeDelay={randomizeDelay} duration={duration} randomizeDuration={randomizeDuration}>
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
