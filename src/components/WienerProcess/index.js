import { useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import { useGeometryBuffer } from './hooks'

import UnitCube from '../UnitCube'
import UnitSphere from '../UnitSphere'

export default function WienerProcess({ parameters }) {
  const lineRef = useRef()
  const geometryBuffer = useGeometryBuffer(lineRef, parameters)

  useFrame(() => geometryBuffer.update())

  return (
    <>
      {parameters.constraint === 'cubical' ? <UnitCube /> : <UnitSphere />}

      <line ref={lineRef}>
        <bufferGeometry />

        <lineBasicMaterial vertexColors />
      </line>
    </>
  )
}
