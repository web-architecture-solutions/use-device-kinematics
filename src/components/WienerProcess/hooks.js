import { useState, useEffect } from 'react'

import GeometryBuffer from './GeometryBuffer'

export function useGeometryBuffer(lineRef, parameters) {
  const initialGeometryBuffer = new GeometryBuffer(lineRef, parameters).initialize()

  const [geometryBuffer, setGeometryBuffer] = useState(initialGeometryBuffer)

  useEffect(() => {
    const geometryBuffer = new GeometryBuffer(lineRef, parameters).initialize()
    setGeometryBuffer(geometryBuffer)
  }, [parameters])

  return geometryBuffer
}
