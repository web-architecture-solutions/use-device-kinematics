import { Canvas } from '@react-three/fiber'

import { EffectComposer, SSAO, Bloom, Noise } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'

import { camera, wienerProcessParameters, rotationCallback } from './constants'

import styles from './style.module.css'

export default function App() {
  return (
    <Canvas camera={camera} className={styles.Canvas}>
      <Rotate callback={rotationCallback}>
        <UnitCube />

        <WienerProcess parameters={wienerProcessParameters} />
      </Rotate>

      <EffectComposer smaa>
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} />

        <Bloom intensity={2} luminanceThreshold={0.0} luminanceSmoothing={1} mipmapBlur={true} />

        <GlitchComposer duration={30} delay={240} randomizeDuration={true} randomizeDelay={true}>
          <PixelationGlitch granularity={100} randomizeGranularity={true} intensity={0.2} />
        </GlitchComposer>

        <SSAO />
      </EffectComposer>
    </Canvas>
  )
}
