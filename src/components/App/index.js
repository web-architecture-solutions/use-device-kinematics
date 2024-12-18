import { Canvas } from '@react-three/fiber'

import { EffectComposer, SSAO, Bloom, Noise } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'
import CameraGlitch from '../CameraGlitch'
import ChromaticAberrationGlitch from '../ChromaticAberrationGlitch'

import { camera, rotationCallback, wienerProcessParameters, glitchParameters } from './constants'

import styles from './style.module.css'

export default function App() {
  const { delay, randomizeDelay, duration, intensity, randomizeDuration, pixelizationGranularity, randomizePixelizationGranularity } =
    glitchParameters

  return (
    <Canvas camera={camera} className={styles.Canvas}>
      <Rotate callback={rotationCallback}>
        <UnitCube />

        <WienerProcess parameters={wienerProcessParameters} />
      </Rotate>

      <EffectComposer smaa>
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

        <SSAO />
      </EffectComposer>
    </Canvas>
  )
}
