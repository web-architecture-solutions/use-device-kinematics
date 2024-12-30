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
}
