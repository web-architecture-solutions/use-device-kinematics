import { useRef, useEffect } from 'react'

import GeometryBuffer from './GeometryBuffer'

export const useGeometryBuffer = (lineRef, parameters) => {
  const bufferRef = useRef(null)

  if (!bufferRef.current) {
    bufferRef.current = new GeometryBuffer(lineRef, parameters)
    bufferRef.current.initialize()
  }

  useEffect(() => {
    bufferRef.current.parameters = parameters
  }, [parameters])

  return bufferRef.current
}
