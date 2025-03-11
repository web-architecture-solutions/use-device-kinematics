import { useReducer } from 'react'

import { Canvas } from '@react-three/fiber'

import { OrbitControls } from '@react-three/drei'

import UnitCube from '../UnitCube'
import UnitSphere from '../UnitSphere'
import WienerProcess from '../WienerProcess'

import { parameterReducer } from './reducers'

import { useGUI } from './hooks'

import { initialConstraint, initialMaxPoints, initialStepSize } from '../../constants'

const initialParameters = {
  constraint: initialConstraint,
  maxPoints: initialMaxPoints,
  stepSize: initialStepSize
}

export default function App() {
  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)

  useGUI({ parameters, dispatch })

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 60 }} style={{ background: 'black' }}>
      <UnitCube />
      {/*parameters.constraint === 'cubical' ? <UnitCube /> : <UnitSphere />*/}

      <WienerProcess parameters={parameters} />

      <OrbitControls />
    </Canvas>
  )
}
