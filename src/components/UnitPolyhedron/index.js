// UnitPolyhedron.jsx
import React from 'react'
import EmbeddedLine from '../EmbeddedLine'
import { getTetrahedronEdgesPositions, getOctahedronEdgesPositions } from '../../CustomPlatonicSolids'

export default function UnitPolyhedron({ type }) {
  let positions = []
  switch (type) {
    case 'tetrahedral':
      positions = getTetrahedronEdgesPositions()
      break
    case 'octahedral':
      positions = getOctahedronEdgesPositions()
      break

    default:
      console.warn('Unknown polyhedral type:', type)
  }
  return <EmbeddedLine positions={positions} />
}
