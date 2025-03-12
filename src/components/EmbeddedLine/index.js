import * as THREE from 'three'

import { embedColors } from '../../ColorEmbedding'

export default function EmbeddedLine({ positions, mapping, ...props }) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const colors = embedColors(positions, mapping)
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  return (
    <line geometry={geometry} {...props}>
      <lineBasicMaterial vertexColors />
    </line>
  )
}
