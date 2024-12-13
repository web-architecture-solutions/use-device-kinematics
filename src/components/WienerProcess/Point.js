import * as THREE from 'three'

export default class Point {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  get coords() {
    return [this.x, this.y, this.z]
  }

  get normalize() {
    return new Point(...this.coords.map((value) => (value + 1) / 2))
  }

  get toColor() {
    return new THREE.Color(this.normalize.x, this.normalize.y, this.normalize.z)
  }

  takeRandomStep(stepSize, constraint = 'cubical') {
    return {
      cubical: () => {
        const newCoords = this.coords.map((coord) => {
          const randomStep = (Math.random() - 0.5) * stepSize
          const newCoord = coord + randomStep
          if (newCoord > 1) return 2 - newCoord
          if (newCoord < -1) return -2 - newCoord
          return newCoord
        })
        return new Point(...newCoords)
      },
      spherical: () => {
        const newCoords = this.coords.map((coord) => {
          const randomStep = (Math.random() - 0.5) * stepSize
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
    }[constraint]()
  }

  /*
  takeRandomStep(stepSize) {
    
  }
  */
}
