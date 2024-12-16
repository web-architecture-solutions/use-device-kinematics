import { useReducer, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Glitch, SSAO, Bloom, Noise } from '@react-three/postprocessing'
import { GlitchMode } from 'postprocessing'
import { BlendFunction } from 'postprocessing'

import UnitCube from '../UnitCube'
import WienerProcess from '../WienerProcess'

import { parameterReducer } from './reducers'
import { useGUI } from './hooks'

import { initialMaxPoints, initialStepSize } from '../../constants'

const initialParameters = {
  maxPoints: initialMaxPoints,
  stepSize: initialStepSize
}

function GlitchyCamera({ glitchProbability }) {
  const { camera } = useThree()
  const [initialPosition] = useState(camera.position.clone())

  useFrame(() => {
    const shouldGlitch = Math.random() < glitchProbability

    if (shouldGlitch) {
      const newPosition = initialPosition.clone()

      const intensityX = (Math.random() - 0.5) * 50
      const intensityY = (Math.random() - 0.5) * 50
      const intensityZ = (Math.random() - 0.5) * 50

      newPosition.x += intensityX
      newPosition.y += intensityY
      newPosition.z += intensityZ

      camera.position.lerp(newPosition, 0.1)
    }

    camera.lookAt(0, 0, 0)
  })

  return null
}

function RotatingGroup({ children }) {
  const [rotation, setRotation] = useState([0, 0, 0])

  useFrame(() => {
    setRotation((prevRotation) => [prevRotation[0] - 0.01, prevRotation[1] - 0.01, prevRotation[2] - 0.01])
  })

  return <group rotation={rotation}>{children}</group>
}

export default function App() {
  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)
  useGUI({ parameters, dispatch })

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 60 }} style={{ background: 'black' }}>
      <RotatingGroup>
        <UnitCube />
        <WienerProcess parameters={parameters} />
      </RotatingGroup>

      <EffectComposer smaa>
        <SSAO />
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} />

        <Bloom intensity={2} luminanceThreshold={0.1} luminanceSmoothing={0.1} mipmapBlur={true} />
        <Glitch delay={[1, 10]} duration={[0.1, 1.0]} strength={[0.01, 0.2]} mode={GlitchMode.SPORADIC} active ratio={0.8} />
      </EffectComposer>

      <GlitchyCamera glitchProbability={0.005} />
    </Canvas>
  )
}
