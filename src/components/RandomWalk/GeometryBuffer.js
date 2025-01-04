import * as THREE from 'three'

import Point from './Point'

export default class GeometryBuffer {
  constructor(lineRef, parameters) {
    this.lineRef = lineRef
    this.parameters = parameters
    this.coords = new Float32Array(parameters.maxPoints * 3)
    this.colors = new Float32Array(parameters.maxPoints * 3)
    this.bufferIndex = 1
    this.isFull = false
  }

  get geometry() {
    return this.lineRef.current.geometry
  }

  get currentPointIndex() {
    return (this.bufferIndex - 1 + this.parameters.maxPoints) % this.parameters.maxPoints
  }

  get currentPoint() {
    return new Point(
      this.coords[this.currentPointIndex * 3],
      this.coords[this.currentPointIndex * 3 + 1],
      this.coords[this.currentPointIndex * 3 + 2]
    )
  }

  get nextPoint() {
    const newCoords = this.currentPoint.coords.map((coord) => {
      const newCoord = this.randomStep(coord)
      if (newCoord > 1) return 2 - newCoord
      if (newCoord < -1) return -2 - newCoord
      return newCoord
    })
    return new Point(...newCoords)
  }

  initialize() {
    this.coords.set([0, 0, 0], 0)
    this.colors.set([0.5, 0.5, 0.5], 0)
    return this
  }

  randomStep(coord) {
    const randomStep = 2 * (Math.random() - 0.5) * this.parameters.stepSize
    return coord + randomStep
  }

  reorderArray(array) {
    const reorderedArray = new Float32Array(this.parameters.maxPoints * 3)
    const splitIndex = this.bufferIndex * 3
    reorderedArray.set(array.subarray(splitIndex), 0)
    reorderedArray.set(array.subarray(0, splitIndex), array.length - splitIndex)
    return reorderedArray
  }

  addNextPoint() {
    const nextPoint = this.nextPoint
    this.coords.set(nextPoint.coords, this.bufferIndex * 3)
    this.colors.set(nextPoint.color, this.bufferIndex * 3)
    this.bufferIndex = (this.bufferIndex + 1) % this.parameters.maxPoints
    if (this.bufferIndex === 0) this.isFull = true
  }

  updatePartialBuffer() {
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.coords, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setDrawRange(0, this.bufferIndex)
  }

  updateFullBuffer() {
    const reorderedPoints = this.reorderArray(this.coords)
    const reorderedColors = this.reorderArray(this.colors)
    this.geometry.setAttribute('position', new THREE.BufferAttribute(reorderedPoints, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(reorderedColors, 3))
    this.geometry.setDrawRange(0, this.parameters.maxPoints - 1)
  }

  update() {
    this.addNextPoint()
    this.isFull ? this.updateFullBuffer() : this.updatePartialBuffer()
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
  }
}
