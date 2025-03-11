// UnitPolyhedron.jsx
import React from 'react'
import EmbeddedLine from '../EmbeddedLine'
import {
  getTetrahedronEdgesPositions,
  getOctahedronEdgesPositions,
  getIcosahedronEdgesPositions,
  getDodecahedronEdgesPositions
} from '../../CustomPlatonicSolids'

export default function UnitPolyhedron({ type }) {
  let positions = []
  switch (type) {
    case 'tetrahedral':
      positions = getTetrahedronEdgesPositions()
      break
    case 'octahedral':
      positions = getOctahedronEdgesPositions()
      break
    case 'icosahedral':
      positions = getIcosahedronEdgesPositions()
      break
    case 'dodecahedral':
      positions = getDodecahedronEdgesPositions()
      break
    default:
      console.warn('Unknown polyhedral type:', type)
  }
  return <EmbeddedLine positions={positions} />
}
