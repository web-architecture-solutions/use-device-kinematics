import * as THREE from 'three'

import { vertices, vertexColors } from '../constants'

export default function Edge({ start, end }) {
  const startVertex = vertices[start]
  const endVertex = vertices[end]
  const startColor = vertexColors[start]
  const endColor = vertexColors[end]
  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute('position', new THREE.Float32BufferAttribute([...startVertex, ...endVertex], 3))

  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute([startColor.r, startColor.g, startColor.b, endColor.r, endColor.g, endColor.b], 3)
  )

  return (
    <line geometry={geometry}>
      <lineBasicMaterial vertexColors />
    </line>
  )
}
