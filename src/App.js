import { useReducer } from 'react'

import { Canvas } from '@react-three/fiber'

import { OrbitControls } from '@react-three/drei'

import { GUI } from 'dat.gui'

import WienerProcess from './components/WienerProcess'

import { parameterReducer } from './reducers'

import { useGUI } from './hooks'

import { initialConstraint, initialMaxPoints, initialStepSize } from './constants'

const initialParameters = {
  constraint: initialConstraint,
  maxPoints: initialMaxPoints,
  stepSize: initialStepSize
}

export default function App() {
  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)

  const gui = new GUI()

  useGUI({ gui, parameters, dispatch })

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 75 }} style={{ background: 'black' }}>
      <ambientLight intensity={0.5} />

      <WienerProcess parameters={parameters} />

      <OrbitControls />
    </Canvas>
  )
}
