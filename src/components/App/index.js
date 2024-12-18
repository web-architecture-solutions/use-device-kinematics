import { useReducer } from 'react'

import { Canvas } from '@react-three/fiber'

import { EffectComposer, SSAO, Bloom, Noise } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

import { initialMaxPoints, initialStepSize } from '../../constants'

import { parameterReducer } from './reducers'

import { useGUI } from './hooks'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'
import GlitchComposer from '../GlitchComposer'
import PixelationGlitch from '../PixelationGlitch'

const rotationCallback = ({ x, y, z }) => ({ x: x - 0.01, y: y - 0.01, z: z + 0.01 })

const initialParameters = {
  maxPoints: initialMaxPoints,
  stepSize: initialStepSize
}

export default function App() {
  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)

  useGUI({ parameters, dispatch })

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 50 }} style={{ background: 'black' }}>
      <Rotate callback={rotationCallback}>
        <UnitCube />

        <WienerProcess parameters={parameters} />
      </Rotate>

      <EffectComposer smaa>
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} />

        <Bloom intensity={2} luminanceThreshold={0.0} luminanceSmoothing={1} mipmapBlur={true} />

        <GlitchComposer duration={30} delay={240} randomizeDuration={true} randomizeDelay={true}>
          <PixelationGlitch maxGranularity={100} intensity={0.2} />
        </GlitchComposer>

        <SSAO />
      </EffectComposer>
    </Canvas>
  )
}
