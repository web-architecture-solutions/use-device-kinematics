import { useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import { useGeometryBuffer } from './hooks'

export default function WienerProcess({ parameters }) {
  const lineRef = useRef()
  const geometryBuffer = useGeometryBuffer(lineRef, parameters)

  useFrame(() => geometryBuffer.update())

  return (
    <>
      <line ref={lineRef}>
        <bufferGeometry />

        <lineBasicMaterial vertexColors />
      </line>
    </>
  )
}
