import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

import Rotate from '../Rotate'
import RandomWalk from '../RandomWalk'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'
import ChromaticAberrationGlitch from '../ChromaticAberrationGlitch'

import { rotationCallback, randomWalkParameters, glitchParameters } from './constants'

const { delay, randomizeDelay, duration, intensity, randomizeDuration, pixelizationGranularity, randomizePixelizationGranularity } =
  glitchParameters

export default function Scene({ mouseVelocity, trapTriggered, setTrapTriggered }) {
  return (
    <>
      <Rotate callback={rotationCallback}>
        <RandomWalk parameters={{ mouseVelocity, ...randomWalkParameters }} />
      </Rotate>

      <EffectComposer>
        <GlitchComposer
          isGlitched={trapTriggered}
          delay={delay}
          randomizeDelay={randomizeDelay}
          duration={duration}
          randomizeDuration={randomizeDuration}
          setTrapTriggered={setTrapTriggered}>
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
