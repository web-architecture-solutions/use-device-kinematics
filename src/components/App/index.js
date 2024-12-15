import { useReducer } from 'react'

import { Canvas } from '@react-three/fiber'

import { OrbitControls } from '@react-three/drei'

import { EffectComposer, Glitch, SSAO } from '@react-three/postprocessing'

import { GlitchMode } from 'postprocessing'

import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'
import { Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

import { parameterReducer } from './reducers'

import { useGUI } from './hooks'

import { initialMaxPoints, initialStepSize } from '../../constants'

import { Bloom } from '@react-three/postprocessing'

const initialParameters = {
  maxPoints: initialMaxPoints,
  stepSize: initialStepSize
}

export default function App() {
  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)

  useGUI({ parameters, dispatch })

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 60 }} style={{ background: 'black' }}>
      <UnitCube />

      <WienerProcess parameters={parameters} />

      <EffectComposer smaa>
        <SSAO />

        <Bloom intensity={2} luminanceThreshold={0.3} luminanceSmoothing={0.1} mipmapBlur={true} />
        <Noise premultiply blendFunction={BlendFunction.AVERAGE} />

        <Glitch delay={[1, 10]} duration={[0.1, 1.0]} strength={[0.01, 0.2]} mode={GlitchMode.SPORADIC} active ratio={0.8} />
      </EffectComposer>

      <OrbitControls />
    </Canvas>
  )
}
