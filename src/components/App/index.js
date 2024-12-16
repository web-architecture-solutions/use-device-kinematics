import { useReducer, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, SSAO, Bloom, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'

import { parameterReducer } from './reducers'
import { useGUI } from './hooks'

import { initialMaxPoints, initialStepSize } from '../../constants'

import PixelationGlitch from '../PixelationGlitch/PixelationGlitch'

const initialParameters = {
  maxPoints: initialMaxPoints,
  stepSize: initialStepSize
}

function RotatingGroup({ children }) {
  const [rotation, setRotation] = useState([0, 0, 0])

  useFrame(() => {
    setRotation((prevRotation) => [prevRotation[0] - 0.01, prevRotation[1] - 0.01, prevRotation[2] + 0.01])
  })

  return <group rotation={rotation}>{children}</group>
}

export default function App() {
  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)
  useGUI({ parameters, dispatch })

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 50 }} style={{ background: 'black' }}>
      <RotatingGroup>
        <UnitCube />
        <WienerProcess parameters={parameters} />
      </RotatingGroup>
      <EffectComposer smaa>
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} />
        <Bloom intensity={2} luminanceThreshold={0.0} luminanceSmoothing={1} mipmapBlur={true} />

        {/*<Glitch delay={[1, 10]} duration={[0.1, 1.0]} strength={[0.01, 0.2]} mode={GlitchMode.SPORADIC} active ratio={0.8} />
         */}
        <PixelationGlitch maxGranularity={100} intensity={1} duration={30} delay={120} />
        <SSAO />
      </EffectComposer>
    </Canvas>
  )
}
