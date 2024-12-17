import { useReducer } from 'react'

import { Canvas } from '@react-three/fiber'

import { BlendFunction } from 'postprocessing'

import { EffectComposer, SSAO, Bloom, Noise } from '@react-three/postprocessing'

import { parameterReducer } from './reducers'

import { useGUI } from './hooks'

import { initialMaxPoints, initialStepSize } from '../../constants'

import Rotate from '../Rotate'
import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'
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

        {/*
        <Glitch delay={[1, 10]} duration={[0.1, 1.0]} strength={[0.01, 0.2]} mode={GlitchMode.SPORADIC} active ratio={0.8} />
        */}

        <PixelationGlitch maxGranularity={100} intensity={1} duration={30} delay={240} />

        <SSAO />
      </EffectComposer>
    </Canvas>
  )
}
