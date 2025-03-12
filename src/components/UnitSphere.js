import * as THREE from 'three'

import EmbeddedLine from './EmbeddedLine'

const createCircle = (axis, radius = 1, segments = 64, rotationAxis = null, rotationAngle = 0) => {
  const positions = []
  const rotationMatrix = new THREE.Matrix4()
  if (rotationAxis && rotationAngle) {
    rotationMatrix.makeRotationAxis(rotationAxis.normalize(), rotationAngle)
  }
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const theta = t * Math.PI * 2
    let position
    if (axis === 'xy') {
      position = new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0)
    } else if (axis === 'yz') {
      position = new THREE.Vector3(0, Math.cos(theta) * radius, Math.sin(theta) * radius)
    } else if (axis === 'xz') {
      position = new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
    }
    if (rotationAxis && rotationAngle) {
      position.applyMatrix4(rotationMatrix)
    }
    positions.push(position.x, position.y, position.z)
  }
  return positions
}

export default function UnitSphere() {
  const equatorPositions = createCircle('xy', 1, 64, new THREE.Vector3(0, 0, 1), -Math.PI / 2)
  const meridianPositions = createCircle('yz', 1, 64, new THREE.Vector3(1, 0, 0))
  const thirdCirclePositions = createCircle('xz', 1, 64, new THREE.Vector3(0, 1, 0), -Math.PI)

  return (
    <>
      <EmbeddedLine positions={equatorPositions} />
      <EmbeddedLine positions={meridianPositions} />
      <EmbeddedLine positions={thirdCirclePositions} />
    </>
  )
}
