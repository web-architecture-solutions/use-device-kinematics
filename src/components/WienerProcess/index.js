import { useRef, useReducer } from 'react'

import { useFrame } from '@react-three/fiber'

import { GUI } from 'dat.gui'

import { parameterReducer } from './reducers'

import GeometryBuffer from './GeometryBuffer'

import { useGUI } from './hooks'

import UnitCube from '../UnitCube'

const initialParameters = {
  constraint: 'cubical',
  maxPoints: 20000,
  stepSize: 0.1
}

export default function WienerProcess() {
  const lineRef = useRef()

  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)

  const geometryBuffer = new GeometryBuffer(lineRef, parameters).initialize()

  const gui = new GUI()

  useFrame(() => geometryBuffer.update())

  useGUI({ gui, parameters, dispatch })

  return (
    <>
      <UnitCube />

      <line ref={lineRef}>
        <bufferGeometry />

        <lineBasicMaterial vertexColors />
      </line>
    </>
  )
}
