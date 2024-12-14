import React from 'react'
import * as THREE from 'three'

const createGradientCircle = (axis, radius = 1, segments = 64, colorStops, rotationAxis = null, rotationAngle = 0) => {
  const positions = []
  const colors = []
  const rotationMatrix = new THREE.Matrix4()

  if (rotationAxis && rotationAngle) {
    rotationMatrix.makeRotationAxis(rotationAxis.normalize(), rotationAngle)
  }

  // Ensure smooth wrapping by adding the first color stop at the end
  const wrappedColorStops = [...colorStops, colorStops[0]]

  for (let i = 0; i <= segments; i++) {
    const t = i / segments // Normalized value (0 to 1)
    const theta = t * Math.PI * 2 // Angle around the circle

    let position
    // Compute positions based on the axis
    if (axis === 'xy') {
      position = new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0)
    } else if (axis === 'yz') {
      position = new THREE.Vector3(0, Math.cos(theta) * radius, Math.sin(theta) * radius)
    } else if (axis === 'xz') {
      position = new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
    }

    // Apply rotation if specified
    if (rotationAxis && rotationAngle) {
      position.applyMatrix4(rotationMatrix)
    }

    positions.push(position.x, position.y, position.z)

    // Generate colors based on colorStops
    const segmentT = t * (wrappedColorStops.length - 1) // Map to color stop range
    const startIndex = Math.floor(segmentT)
    const endIndex = Math.min(startIndex + 1, wrappedColorStops.length - 1)
    const localT = segmentT - startIndex // Local interpolation factor

    const startColor = wrappedColorStops[startIndex]
    const endColor = wrappedColorStops[endIndex]
    const r = THREE.MathUtils.lerp(startColor[0], endColor[0], localT)
    const g = THREE.MathUtils.lerp(startColor[1], endColor[1], localT)
    const b = THREE.MathUtils.lerp(startColor[2], endColor[2], localT)

    colors.push(r / 255, g / 255, b / 255) // Normalize to 0-1
  }

  return { positions, colors }
}

export default function UnitSphere() {
  const equatorColors = [
    [128, 0, 128],
    [255, 128, 128],
    [128, 255, 128],
    [0, 128, 128]
  ]

  const meridianColors = [
    [128, 128, 255],
    [128, 255, 128],
    [128, 0, 128],
    [128, 128, 0]
  ]

  const thirdCircleColors = [
    [0, 128, 128],
    [128, 128, 0],
    [255, 128, 128],
    [128, 128, 255]
  ]

  const equator = createGradientCircle('xy', 1, 64, equatorColors, new THREE.Vector3(0, 0, 1), -Math.PI / 2)

  const meridian = createGradientCircle('yz', 1, 64, meridianColors, new THREE.Vector3(1, 0, 0))

  const thirdCircle = createGradientCircle('xz', 1, 64, thirdCircleColors, new THREE.Vector3(0, 1, 0), -Math.PI)

  const createLine = ({ positions, colors }) => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    return (
      <line geometry={geometry}>
        <lineBasicMaterial vertexColors />
      </line>
    )
  }

  return (
    <>
      {createLine(equator)}
      {createLine(meridian)}
      {createLine(thirdCircle)} {/* Render the new third circle */}
    </>
  )
}
