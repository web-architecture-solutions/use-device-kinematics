import * as THREE from 'three'

import { initialConstraint, initialStepSize } from '../../constants'

export default class Point {
  static constraint = initialConstraint
  static stepSize = initialStepSize

  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  get coords() {
    return [this.x, this.y, this.z]
  }

  get normalized() {
    return new Point(...this.coords.map((value) => (value + 1) / 2))
  }

  get color() {
    const { r, g, b } = new THREE.Color(this.normalized.x, this.normalized.y, this.normalized.z)
    return [r, g, b]
  }

  get magnitude() {
    return Math.sqrt(this.coords.reduce((sum, coord) => sum + coord * coord, 0))
  }

  get nextPoint() {
    return {
      cubical: () => {
        const newCoords = this.coords.map((coord) => {
          const newCoord = this.randomStep(coord)
          if (newCoord > 1) return 2 - newCoord
          if (newCoord < -1) return -2 - newCoord
          return newCoord
        })
        return new Point(...newCoords)
      },
      spherical: () => {
        const newPoint = new Point(...this.coords.map((coord) => this.randomStep(coord)))

        return newPoint.magnitude > 1 ? new Point(...newPoint.coords.map((coord) => coord / newPoint.magnitude)) : newPoint
      }
    }[this.constructor.constraint]()
  }

  randomStep(coord) {
    const randomStep = (Math.random() - 0.5) * this.constructor.stepSize
    return coord + randomStep
  }
}
