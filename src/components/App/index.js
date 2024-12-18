import { Canvas } from '@react-three/fiber'

import { EffectComposer, SSAO, Bloom, Noise } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'

import { camera, rotationCallback, wienerProcessParameters, glitchParameters } from './constants'

import styles from './style.module.css'

export default function App() {
  const {
    delay,
    randomizeDelay,
    duration,
    randomizeDuration,
    pixelizationGranularity,
    randomizePixelizationGranularity,
    pixelizationIntensity
  } = glitchParameters

  return (
    <Canvas camera={camera} className={styles.Canvas}>
      <Rotate callback={rotationCallback}>
        <UnitCube />

        <WienerProcess parameters={wienerProcessParameters} />
      </Rotate>

      <EffectComposer smaa>
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} />

        <Bloom intensity={2} luminanceThreshold={0.0} luminanceSmoothing={1} mipmapBlur={true} />

        <GlitchComposer delay={delay} randomizeDelay={randomizeDelay} duration={duration} randomizeDuration={randomizeDuration}>
          <PixelationGlitch
            granularity={pixelizationGranularity}
            randomizeGranularity={randomizePixelizationGranularity}
            intensity={pixelizationIntensity}
          />
        </GlitchComposer>

        <SSAO />
      </EffectComposer>
    </Canvas>
  )
}
