import * as THREE from 'three'

export default class Point {
  static constraint = 'cubical'
  static stepSize = 0.1

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

  get nextPoint() {
    return {
      cubical: () => {
        const newCoords = this.coords.map((coord) => {
          const randomStep = (Math.random() - 0.5) * this.constructor.stepSize
          const newCoord = coord + randomStep
          if (newCoord > 1) return 2 - newCoord
          if (newCoord < -1) return -2 - newCoord
          return newCoord
        })
        return new Point(...newCoords)
      },
      spherical: () => {
        const newCoords = this.coords.map((coord) => {
          const randomStep = (Math.random() - 0.5) * this.constructor.stepSize
          return coord + randomStep
        })

        const magnitude = Math.sqrt(newCoords.reduce((sum, coord) => sum + coord * coord, 0))

        if (magnitude > 1) {
          newCoords.forEach((coord, index) => {
            newCoords[index] = coord / magnitude
          })
        }

        return new Point(...newCoords)
      }
    }[this.constructor.constraint]()
  }
}
