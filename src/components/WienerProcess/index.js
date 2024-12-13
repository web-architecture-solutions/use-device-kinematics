import { useRef, useReducer } from 'react'

import { useFrame } from '@react-three/fiber'

import { parameterReducer } from './reducers'

import GeometryBuffer from './GeometryBuffer'

import { useGUI } from './hooks'

import UnitCube from '../UnitCube'

const initialParameters = {
  stepSize: 0.1,
  maxPoints: 20000
}

export default function WienerProcess() {
  const lineRef = useRef()

  const [parameters, dispatch] = useReducer(parameterReducer, initialParameters)

  const geometryBuffer = new GeometryBuffer(lineRef, parameters).initialize()

  useFrame(() => geometryBuffer.update())

  useGUI({ parameters, dispatch })

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
