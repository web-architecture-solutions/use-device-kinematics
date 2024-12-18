import * as THREE from 'three'

export default function Edge({ startVertex, endVertex, startColor, endColor }) {
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
