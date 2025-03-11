// App.jsx
import { useReducer } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import UnitCube from '../UnitCube'
import UnitSphere from '../UnitSphere'
import UnitPolyhedron from '../UnitPolyhedron'
import WienerProcess from '../WienerProcess'

import { parameterReducer } from './reducers'
import { useGUI } from './hooks'
import { initialConstraint, initialMaxPoints, initialStepSize } from '../../constants'

const initialParameters = {
  constraint: initialConstraint,
  maxPoints: initialMaxPoints,
  stepSize: initialStepSize
}

const randomHue = Math.random() * 360

export default function App() {
  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)
  useGUI({ parameters, dispatch })

  // Return the appropriate constraint component.
  const renderConstraint = () => {
    switch (parameters.constraint) {
      case 'cubical':
        return <UnitCube />
      case 'spherical':
        return <UnitSphere />
      case 'tetrahedral':
      case 'octahedral':
        return <UnitPolyhedron type={parameters.constraint} />
      default:
        return null
    }
  }

  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 60 }} style={{ background: 'black', filter: `hue-rotate(${randomHue}deg) saturate(2)` }}>
      {renderConstraint()}
      <WienerProcess parameters={parameters} />
      <OrbitControls />
    </Canvas>
  )
}
