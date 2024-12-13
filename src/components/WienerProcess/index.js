import { useRef, useState, useEffect } from 'react'

import { useFrame } from '@react-three/fiber'

import GeometryBuffer from './GeometryBuffer'

import UnitCube from '../UnitCube'

export default function WienerProcess({ parameters }) {
  const lineRef = useRef()

  const initialGeometryBuffer = new GeometryBuffer(lineRef, parameters).initialize()

  const [geometryBuffer, setGeometryBuffer] = useState(initialGeometryBuffer)

  useEffect(() => {
    const geometryBuffer = new GeometryBuffer(lineRef, parameters).initialize()
    setGeometryBuffer(geometryBuffer)
  }, [parameters])

  useFrame(() => geometryBuffer.update())

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
