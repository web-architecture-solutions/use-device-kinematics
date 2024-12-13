import * as THREE from 'three'

import Point from './Point'

export default class GeometryBuffer {
  constructor(lineRef, parameters) {
    this.lineRef = lineRef
    this.parameters = parameters
    this.points = new Float32Array(parameters.maxPoints * 3)
    this.colors = new Float32Array(parameters.maxPoints * 3)
    this.currentIndex = 1
    this.isFull = false
  }

  initialize() {
    this.points.set([0, 0, 0], 0)
    this.colors.set([0.5, 0.5, 0.5], 0)

    Point.constraint = this.parameters.constraint
    Point.stepSize = this.parameters.stepSize

    return this
  }

  update() {
    const lastIndex = (this.currentIndex - 1 + this.parameters.maxPoints) % this.parameters.maxPoints
    const lastPoint = new Point(this.points[lastIndex * 3], this.points[lastIndex * 3 + 1], this.points[lastIndex * 3 + 2])

    let nextPoint = lastPoint.nextPoint

    this.points.set(nextPoint.coords, this.currentIndex * 3)
    this.colors.set(nextPoint.color, this.currentIndex * 3)

    this.currentIndex = (this.currentIndex + 1) % this.parameters.maxPoints
    if (this.currentIndex === 0) this.isFull = true

    const geometry = this.lineRef.current.geometry

    if (!this.isFull) {
      geometry.setAttribute('position', new THREE.BufferAttribute(this.points, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
      geometry.setDrawRange(0, this.currentIndex)
    } else {
      const reorderedPoints = new Float32Array(this.parameters.maxPoints * 3)
      const reorderedColors = new Float32Array(this.parameters.maxPoints * 3)

      reorderedPoints.set(this.points.subarray(this.currentIndex * 3), 0)
      reorderedPoints.set(this.points.subarray(0, this.currentIndex * 3), this.points.length - this.currentIndex * 3)

      reorderedColors.set(this.colors.subarray(this.currentIndex * 3), 0)
      reorderedColors.set(this.colors.subarray(0, this.currentIndex * 3), this.colors.length - this.currentIndex * 3)

      geometry.setAttribute('position', new THREE.BufferAttribute(reorderedPoints, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(reorderedColors, 3))
      geometry.setDrawRange(0, this.parameters.maxPoints - 1)
    }

    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
  }
}
